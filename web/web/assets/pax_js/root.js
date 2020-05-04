/*
 *
 *  This file contains all front-end javascript logic thats necessary to interface with the backend
 *
 */

//Holder for all functions
var root = {};

//Container for the all functions necessary for interface.html to work properly
root.interface = {};

//Called on page load
root.interface.init = function(){
  //Code from stackoverflow which converts to object as saves it in root.cookies
  root.cookies = (document.cookie || '').split(/;\s*/).reduce(function(re, c) {
    var tmp = c.match(/([^=]+)=(.*)/);
    if(tmp) re[tmp[1]] = unescape(tmp[2]);
    return re;
  }, {});

  //Only initialize tables that are there
  if(root.cookies.access_level == 9){
    root.interface.application.load();
    root.interface.post.load();
  }
  root.interface.bulletin.init();
};

//All application functions
root.interface.application = {};

//Loads the applications from the api and puts them into the table; bs is just some random variable because we get some shit from the onload
root.interface.application.load = function(filter){
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
  }, api_method: 'GET', edit_bar: false, row_onclick: root.interface.application.redirect});
};

//Gets called whenever the user changes the status to filter the table
root.interface.application.filter = function(select, table){
  let filter = false;
  let value = select.value;
  filter = value == 1 ? 'pending review' : filter;
  filter = value == 2 ? 'denied' : filter;
  filter = value == 3 ? 'accepted' : filter;

  table.filter(5, filter, true);
};

root.interface.application.redirect = function(row){
  window.location.href = `https://${window.location.host}/staff/application.html?id=${row.cells[0].innerText}`;
};

//All post cms functions
root.interface.post = {};

//Loads the posts from the api and puts them into the table; bs is just some random variable because we get some shit from the onload
root.interface.post.load = function(filter) {
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
  }, api_method: 'GET', edit_bar: false, row_onclick: root.interface.post.redirect});
};

//Gets called whenever the user changes the status to filter the table
root.interface.post.filter = function(select, table) {
  let filter = false;
  let value = select.value;
  
  if(value == 0) filter = 'Private';
  if(value == 1) filter = 'Public';

  table.filter(4, filter, true);
};

root.interface.post.redirect = function(row) {
  window.location.href = `https://${window.location.host}/staff/post.html?id=${row.cells[0].innerText}`;
};


//All bulletin board functions
root.interface.bulletin = {};

root.interface.bulletin.init = function(){
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

root.interface.bulletin_my_active = false;
root.interface.toggleMyBulletins = function(element){
  let table = element.parentNode.parentNode;
  
  if(!root.interface.bulletin_my_active){
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
    
    root.interface.bulletin_my_active = true;
    element.innerText = "all posts"
  }else{
    //Update table to show all bulletins
    for(let i = 2;i < table.rows.length;i++) table.rows[i].hidden = false;

    //Remove temp classes for fixed zebra effect
    for(let i = 2;i < table.rows.length;i++) if(!table.rows[i].hidden) for(let j = 0; j < table.rows[i].cells.length;j++) table.rows[i].cells[j].className = "";

    root.interface.bulletin_my_active = false;
    element.innerText = "my posts";
  }
};

root.interface.bulletin.new = function(table){
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

root.interface.bulletin.edit = function(row){
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

root.interface.bulletin.delete = function(row){
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

//Container for all functions necessary for post.html to work properly
root.post = {};

//Init for post.html
root.post.init = function(){
  if(_internal.getQueryValue('id') === 'new'){ 
    root.post.edit();
    document.getElementById('post-preview').hidden = true;
  }
};

//Changes the editing mode
root.post.edit = function(){
  if(_internal.getQueryValue('id') != 'new'){
    //Get the current data of the post if its not new
    _internal.send('post', false, 'GET', {id: _internal.getQueryValue('id')}, false, function(status, res) {
      if(status == 200){
        document.getElementById('edit-title').value = res[0].title;
        document.getElementById('edit-author').value = res[0].author;
        document.getElementById('edit-body').value = res[0].body;
        document.getElementById('edit-date').value = new Date(res[0].date).toISOString().substring(0, 10);
        document.getElementById('edit-public').checked = res[0].public;
      }else{
        window.alert('Couldnt load post ): ', res);
      }
    });
  }

  //Show the edit form
  document.getElementById("post-edit-form").hidden = false;
};

root.post.send = function(){
  //Build the object
  let postData = {
    title: document.getElementById('edit-title').value,
    author: document.getElementById('edit-author').value,
    body: document.getElementById('edit-body').value,
    date: document.getElementById('edit-date').value,
    public: document.getElementById('edit-public').checked
  };

  //Add the post id to the object, if its not new
  if(_internal.getQueryValue('id') !== 'new') postData.id = _internal.getQueryValue('id');

  _internal.send('post', false, 'POST', false, postData, function(status, res){
    if(status != 200) window.alert(res);
    else window.alert('Success!');
  });
};

//Container for all functions necessary for application.html to work properly
root.application = {};

//Gets executed when an application is accepted
root.application.accept = function(){
  _internal.send('application', false, 'PATCH', {}, {id: parseInt(_internal.getQueryValue('id')), status: 3}, function(status, res){
    if(status == 200){
      window.alert('success!');
      window.location.href = `https://${document.location.host}/staff/interface.html`;
    }else{
      window.alert('Something went wrong!\n' + res.err);
    }
  });
};

//Gets executed when an application is denied
root.application.deny = function(){
  _internal.send('application', false, 'PATCH', {}, {id: parseInt(_internal.getQueryValue('id')), status: 2, reason: document.getElementById('deny_reason').value}, function(status, res){
    if(status == 200){
      window.alert('success!');
      window.location.href = `https://${document.location.host}/staff/interface.html`;
    }else{
      window.alert('Something went wrong!\n' + res.err);
    }
  });
};

//Framework stuff to make my life easier
root.framework = {};

//Everything handling popups
root.framework.popup = {};

//Create a basic popup from a div
//options: div: the div to put into the popup; confirmClose: add confirmation before closing if true; closeCall: function to call before destroying giving back the popup and callback; title: the title lol
//callback: entire popup div
root.framework.popup.create = function(options, callback){
  if(options.hasOwnProperty('div')){
    //Clone template
    let popup = document.getElementById('popup').cloneNode(true);
    
    //Add title
    if(options.title) popup.childNodes[1].childNodes[1].childNodes[1].childNodes[1].innerText = options.title;
    else popup.childNodes[1].childNodes[1].childNodes[1].childNodes[1].innerText = "";

    //Add the given div as child
    popup.childNodes[1].childNodes[3].appendChild(options.div);
    
    //Attach popup to the DOM   
    document.body.appendChild(popup);

    //Make popup visible
    popup.hidden = false;

    //Add options to popup
    popup.options = options;

    //Add close function to popup
    popup.close = function(){
      //Check if we need to confirm the close
      if(popup.options.confirmClose){
        //Ask for confirmation
        root.framework.popup.create_confirmation({}, function(confirmed){
          if(confirmed){
            //Yes, close the popup please
            root.framework.popup.close_for_real(popup);
          }else{
            //Do nothing
          }
        });
      }else{
        //Dont ask for confirmation
        root.framework.popup.close_for_real(popup);
      }
    };

    //Callback the popup
    callback(popup);
  }else{
    callback(false);
  }
};

//Deletes the given popup, no confirmation, NEVER CALL THIS!! THIS IS ONLY TO BE CALLED FROM WITHING popup.close()
root.framework.popup.close_for_real = function(popup){
  //Execute the closeCall function if it got attached
  if(typeof popup.options.closeCall == 'function') {
    popup.options.closeCall(popup, function() {
      popup.parentNode.removeChild(popup);
    });
  } else {
    //No closeCall function given, just delete
    popup.parentNode.removeChild(popup);
  }
};

//Calls the close function of the popup
root.framework.popup.bg_click = function(popup) {
  popup.close();
};

//Calls the close function of the popup
root.framework.popup.cancel_click = function(popup) {
  popup.close();
};

//Uses root.framework.popup.create to create a textbox for inputing text
//options: maxlength, required, text; title: the title lol
//callback: user input, or false if there is no input given (was cancelled by user)
root.framework.popup.create_textbox = function(options, callback){
  //Clone textbox template
  let textbox = document.getElementById('textbox-popup').cloneNode(true);
  textbox.hidden = false;

  //Apply options
  if(options.maxLength) textbox.childNodes[1].maxLength = options.maxLength;
  if(options.required) textbox.childNodes[1].required = options.required;
  if(options.text) textbox.childNodes[1].innerText = options.text;

  let title = 'Sample textbox title';
  if(options.title) title = options.title;

  //Create the popup; confirmClose gets set to true once text gets entered
  root.framework.popup.create({div: textbox, confirmClose: false, title: title, closeCall: function(popup, _callback){
    //Stuff that should be done before closing
    //Check if we need to save
    if(popup.save){
      //Save input
      let input = textbox.childNodes[1].value;

      //Callback the user input
      callback(input);
    }else{
      callback(false);
    }
    //Callback to finally delete this
    _callback();
  }}, function(popup){
    //Callback of the create function
    
  });
};

//Saves the user input and closes the popup
root.framework.popup.textbox_save_click = function(popup){
  //Check if the user has entered any text, abort if not
  if(popup.childNodes[1].childNodes[3].childNodes[1].childNodes[1].value){
    //User entered text
    popup.save = true;
    popup.options.confirmClose = false;
    popup.close();
  }else{
    //User didnt enter text - show info popup
    root.framework.popup.create_info({text: 'Please enter some text before saving your new bulletin.'}, function(){});
  }
};

//Creates a confirmation popup
//options: text: text that is shown in the popup; title: the title lol
//Callback: true if user said yes, false if otherwise
root.framework.popup.create_confirmation = function(options, callback){
  //Clone the template
  let confirmation = document.getElementById('confirmation-popup').cloneNode(true);
  confirmation.hidden = false;

  let title = 'Confirmation';
  if(options.title) title = options.title;

  //Create the popup
  root.framework.popup.create({div: confirmation, confirmClose: false, title: title, closeCall: function(popup, _callback){
    //Stuff that should be done before closing
    callback(popup.confirmation);
    _callback();
  }}, function(popup){
    //Callback of the create function
    popup.options.confirmClose = false;
  });
};

//Gets executed when yes is clicked
root.framework.popup.confirmation_yes = function(popup){
  popup.confirmation = true;
  popup.close();
};

//Create a information popup
//options: text: text that is shown in the popup; title: the title lol
//callback: gets called once user closed it (no parameters)
root.framework.popup.create_info = function(options, callback){
  //Clone the template
  let info = document.getElementById('info-popup').cloneNode(true);
  info.hidden = false;

  //Apply the options
  if(options.text) info.childNodes[1].innerText = options.text;

  let title = 'Information';
  if(options.title) title = options.title;

  //Create the popup
  root.framework.popup.create({div: info, confirmClose: false, title: title}, function(){
    //Callback of the create function

  });
};


//everything handling tables
root.framework.table = {};

//Initialize a table; This sets up the DOM object with our custom functions
//options: required:api_path to get data, data_mapping: function that turns one object from the api into an array of values that can be put into a single row
//         optional: api_method, edit_bar id of the edit_bar, edit_bar_filter_column: set a column for filtering, edit_bar_filter_value: value for the filter, row_onclick: function, expand_row: (bool) when true it expands the clicked row
root.framework.table.init = function(table, options){
  if(!options.hasOwnProperty('api_method')) options.api_method = 'GET';
  if(!options.hasOwnProperty('edit_bar')) options.edit_bar = false;
  if(!options.hasOwnProperty('row_onclick')) options.row_onclick = false;

  //Attach all the neccessary things to the table
  table.options = options;
  table.update = root.framework.table.update;
  table.filter = root.framework.table.filter;
  table.data_mapping = options.data_mapping;
  table.add_row = root.framework.table.add_row;
  table.remove_row = root.framework.table.remove_row;
  table.remove_all_rows = root.framework.table.remove_all_rows;
  table.select_row = root.framework.table.select_row;

  //If we have an edit bar, remove it from the DOM and store in the table
  if(table.options.edit_bar){
    let edit_bar = document.getElementById(table.options.edit_bar);
    edit_bar.hidden = true;
    table.edit_bar = edit_bar.cloneNode(true);
    table.tBodies[0].removeChild(edit_bar);
  }

  //Update table, to fill it with data
  table.update();
};

//Update the data of the table, based on filter, if given
root.framework.table.update = function(filter){
  if(typeof filter == 'undefined') filter = false;
  if(!filter) filter = this.options.filter;

  //Set table to this, so we can use it later on
  let table = this;

  //Query the api for the data
  _internal.send(this.options.api_path, false, this.options.api_method, filter, false, function(status, res){
    if(status == 200 && res.length > 0){
      //Remove all existing rows including the edit row
      if(table.options.edit_bar && table.hasOwnProperty('last_expanded_row' && document.getElementById(table.options.edit_bar))) table.tBodies[0].removeChild(document.getElementById(table.options.edit_bar));
      table.remove_all_rows();

      //Add the data to the table
      res.forEach((_res) => {
        table.add_row(_res);
      });
    }else{
      window.alert('Failed to update table');
    }
  });
};

//Filters the table
//The id is the number of which td to filter after and the filter is the keyword that should be checked, include: include/exclude keyword
root.framework.table.filter = function(id, filter, include){
  let table = this;
  let rows = table.rows;

  if(!filter){
    //No filter given, show all rows again
    for(let i = 1;i < rows.length;i++) rows[i].hidden = false;
  }else{
    //Loop through all rows and test them against our filter, hide if neccessary
    for(let i = 1;i < rows.length;i++) {
      let match = rows[i].cells[id].innerText == filter;
      rows[i].hidden = ((include && !match) || (!include && match)) //Credit to Zyl 
    }
  }
};

//Add row to the table
//Values: either an array or an object of values, if its an object convert to an array using the data_mapping function
//raw_data: optional object containing the raw data for the row, useful for editing/removing it later on and passing that data to the api
root.framework.table.add_row = function(values, raw_data){
  //Check if we got an object and thus have to convert it first
  if(!Array.isArray(values)){
    //We gotta convert the object to an array using the data_mapping function
    this.add_row(this.data_mapping(values), values);
  }else{
    //We got an array, create the row and append to the table
    //Create row and append values in separate td's
    let row = document.createElement('tr');
    values.forEach((value) => {
      let temp_td = document.createElement('td');
      temp_td.innerText = value;
      row.appendChild(temp_td);
    });
    //Add the onclick event 
    row.onclick = this.select_row;
    row.table = this;

    //Add raw_data if neccessary
    if(typeof raw_data == 'object') row.raw_data = raw_data;

    //Append row to the table
    this.tBodies[0].appendChild(row);
  }
};

//Remove row from the table
//when index is given remove row at index, otherwise remove row this was called on
root.framework.table.remove_row = function(index){
  if(typeof index != 'undefined'){
    //Remove row at index
    this.deleteRow(index);
  }
};

//Cleares all rows from table                               @TODO removes one row too few when called from update
root.framework.table.remove_all_rows = function(){
  while(this.rows.length > 1) this.remove_row(-1);
};

//Select row; this is called to append the edit_row behind this one
//when index is given act on the row at the index, otherwise at the row this was called on; bs is the click event
root.framework.table.select_row = function(bs, index){
  if(typeof index == 'undefined') index = this.rowIndex;
  let table = this.table;
  let row = table.rows[index];
  
  //Check if we need to expand this row
  if(table.options.expand_row == true){
    //Check if there already is an expanded row
    if(table.hasOwnProperty('last_expanded_row') && index !== table.last_expanded_row){
      //There is already an expanded row, collapse it
      table.rows[table.last_expanded_row].style["white-space"] = "nowrap";
    }
    //Check if user clicked same row again
    if(index === table.last_expanded_row){
      //User clicked it again, collapse it
      row.style["white-space"] = "nowrap";
      delete table.last_expanded_row;

      //Remove the edit bar, if neccessary
      let edit_bar = document.getElementById(table.options.edit_bar);
      if(edit_bar) row.parentNode.removeChild(edit_bar);

    }else{
      //Expand current row
      table.last_expanded_row = index;
      row.style["white-space"] = "pre-line";

      //Check if we need to do something about the edit bar
      if(table.options.edit_bar) {
        //Check if we need to extra work with filtering
        if(table.options.edit_bar_filter_value){
          //Check if the filter applies here
          if(row.cells[table.options.edit_bar_filter_column].innerText == table.options.edit_bar_filter_value){
            let edit_bar = row.parentNode.insertBefore(table.edit_bar, row.nextSibling);
            edit_bar.hidden = false;
          }
        }else{
          let edit_bar = row.parentNode.insertBefore(table.edit_bar, row.nextSibling);
          edit_bar.hidden = false;
        }
      }
    }
  }

  //Execute the onclick function if neccessary
  if(table.options.row_onclick) this.onclick = table.options.row_onclick(this);

  //Set the onclick property to this function here again; no idea why, but the onclick event gets cleared once we execute it
  row.onclick = root.framework.table.select_row;
};
