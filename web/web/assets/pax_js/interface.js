/*
 *  Contains all functions for the interface
 */

var interface = {};

//Called on page load
interface.init = function(){
  //Code from stackoverflow which converts to object as saves it in root.cookies
  root.cookies = (document.cookie || '').split(/;\s*/).reduce(function(re, c) {
    var tmp = c.match(/([^=]+)=(.*)/);
    if(tmp) re[tmp[1]] = unescape(tmp[2]);
    return re;
  }, {});

  //Only initialize tables that are there
  if(root.cookies.access_level == 9){
    interface.application.load();
    interface.post.load();
  }
  interface.bulletin.init();
};

//All application functions
interface.application = {};

//Loads the applications from the api and puts them into the table; bs is just some random variable because we get some shit from the onload
interface.application.load = function(filter){
  //Init table
  root.framework.table.init(document.getElementById('applications-table'), {api_path: 'application', data_mapping: function(input){
    let statusString = 'invalid';
    statusString = input.status == 1 ? 'pending review' : statusString;
    statusString = input.status == 2 ? 'denied' : statusString;
    statusString = input.status == 3 ? 'accepted' : statusString;

    return [
      input.id,
      new Date(input.timestamp).toLocaleString('de'),
      input.discord_nick,
      input.mc_ign,
      input.about_me.substring(0, 50),
      statusString
    ];
  }, api_method: 'GET', edit_bar: false, row_onclick: interface.application.redirect});
};

//Gets called whenever the user changes the status to filter the table
interface.application.filter = function(select, table){
  let filter = false;
  let value = select.value;
  filter = value == 1 ? 'pending review' : filter;
  filter = value == 2 ? 'denied' : filter;
  filter = value == 3 ? 'accepted' : filter;

  table.filter(5, filter, true);
};

interface.application.redirect = function(row){
  window.location.href = `https://${window.location.host}/staff/application.html?id=${row.cells[0].innerText}`;
};

//All post cms functions
interface.post = {};

//Loads the posts from the api and puts them into the table; bs is just some random variable because we get some shit from the onload
interface.post.load = function(filter) {
  root.framework.table.init(document.getElementById('post-table'), {api_path: 'post', data_mapping: function(input){
    let visiblity;
    if(input.public) visiblity = 'Public';
      else visiblity = 'Private';
    return [
      input.id,
      new Date(input.date).toISOString().substring(0, 10),
      input.author,
      input.title,
      visiblity
    ];
  }, api_method: 'GET', edit_bar: false, row_onclick: interface.post.redirect});
};

//Gets called whenever the user changes the status to filter the table
interface.post.filter = function(select, table) {
  let filter = false;
  let value = select.value;
  
  if(value == 0) filter = 'Private';
  if(value == 1) filter = 'Public';

  table.filter(4, filter, true);
};

interface.post.redirect = function(row) {
  window.location.href = `https://${window.location.host}/staff/post.html?id=${row.cells[0].innerText}`;
};


//All bulletin board functions
interface.bulletin = {};

interface.bulletin.init = function(){
  //This enables admins to open the edit bar on all bulletins
  let edit_bar_filter_value = root.cookies.access_level >= 9 ? false : root.cookies.mc_ign;
  root.framework.table.init(document.getElementById('bulletin-table'), {api_path: 'bulletin', data_mapping: function(input){
    return [
      new Date(input.date).toISOString().substring(0, 10),
      input.author_name,
      input.message
    ]
  }, api_method: 'GET', edit_bar: 'bulletin_edit_bar', edit_bar_filter_column: 1, edit_bar_filter_value: edit_bar_filter_value, row_onclick: false, expand_row: true});
};

interface.bulletin_my_active = false;
interface.toggleMyBulletins = function(element){
  let table = element.parentNode.parentNode;
  
  if(!interface.bulletin_my_active){
    //Update table to only show bulletins of logged in user
    //Remove the edit row
    for(let i = 0;i < table.rows.length;i++) if(table.rows[i].firstElementChild.colSpan > 1 && table.rows[i].hidden == false) table.deleteRow(i);

    //Hide rows from other authors
    let j = 1;
    for(let i = 1;i < table.rows.length;i++) {
      //Hide row
      if(table.rows[i].cells[1].innerText != root.cookies.mc_ign) table.rows[i].hidden = true;

      //Reapply the zebra effect with temp classes
      if(!table.rows[i].hidden) {
        if(j % 2) for(let k = 0;k < 3;k++) table.rows[i].cells[k].className = 'temp_bright'
        else for(let k = 0;k < 3;k++) table.rows[i].cells[k].className = 'temp_dark'
        j++;
      } 
    }
    
    interface.bulletin_my_active = true;
    element.innerText = "all posts"
  }else{
    //Update table to show all bulletins
    for(let i = 2;i < table.rows.length;i++) table.rows[i].hidden = false;

    //Remove temp classes for fixed zebra effect
    for(let i = 2;i < table.rows.length;i++) if(!table.rows[i].hidden) for(let j = 0; j < table.rows[i].cells.length;j++) table.rows[i].cells[j].className = "";

    interface.bulletin_my_active = false;
    element.innerText = "my posts";
  }
};

interface.bulletin.new = function(table){
  //Summon the popup
  root.framework.popup.create_textbox({title: 'Create new bulletin', maxLength: 1000, required: true}, function(input) {
    if(input){
      //Send the message to the API
      _internal.send('bulletin', false, 'POST', false, {message: input}, function(status, res) {
        if(status === 200) {
          table.update();
        } else {
          root.framework.popup.create_info({title: 'Error', text: 'oops something bad happened, maybe this message helps someone figure it out\n' + res.err});
        }
      });
    }
  });
};

interface.bulletin.edit = function(row){
  //Summon the popup
  root.framework.popup.create_textbox({title: 'Edit existing bulletin', maxLength: 1000, required: true, text: row.raw_data.message}, function(input){
    if(input){
      let new_data = row.raw_data;
      new_data.message = input;
      _internal.send('bulletin', false, 'PUT', false, new_data, function(status, res) {
        if(status === 200) {
          row.table.update();
        } else {
          root.framework.popup.create_info({title: 'Error', text: 'oops something bad happened, maybe this message helps someone figure it out\n' + res.err});
        }
      });
    }
  });
};

interface.bulletin.delete = function(row){
  root.framework.popup.create_confirmation({text: 'Do you really want to delete this bulletin?'}, function(deleteConfirmed){
    if(deleteConfirmed){
      _internal.send('bulletin', false, 'DELETE', false, row.raw_data, function(status, res){
        if(status != 200){
          root.framework.popup.create_info({title: 'Error', text: 'oops something bad happened, maybe this message helps someone figure it out\n' + res.err});
        }else{
          row.table.update();
        }
      });
    }
  });
};