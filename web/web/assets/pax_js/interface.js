/*
 *  Contains all functions for the interface
 */

var interface = {};
var cookies
//Called on page load
interface.init = function(){
  //Code from stackoverflow which converts cookies to object as saves it in cookies
  cookies = (document.cookie || '').split(/;\s*/).reduce(function(re, c) {
    var tmp = c.match(/([^=]+)=(.*)/);
    if(tmp) re[tmp[1]] = unescape(tmp[2]);
    return re;
  }, {});

  //Only initialize tables that are there
  if(cookies.access_level == 9){
    interface.post.load();
  }
  if (cookies.access_level >= 7) {
    interface.application.load();
  }
};

//All application functions
interface.application = {};

//Loads the applications from the api and puts them into the table; bs is just some random variable because we get some shit from the onload
interface.application.load = function(filter){
  //Init table
  framework.table.init(document.getElementById('applications-table'), {api_path: 'application', data_mapping: function(input){
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
  }, api_method: 'GET', edit_bar: false, row_onclick: interface.application.open_popup});
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

interface.application.open_popup = function(row){
  let element = document.getElementById('application-popup').cloneNode(true);
  element.querySelector('#' + 'application_mc_ign').innerText = row.raw_data.mc_ign;
  element.querySelector('#' + 'application_discord_nick').innerText = row.raw_data.discord_nick;
  element.querySelector('#' + 'application_country').innerText = row.raw_data.country;
  element.querySelector('#' + 'application_age').innerText = row.raw_data.birth_month >= 1 ? '~' + row.raw_data.birth_month > new Date(Date.now()).getMonth() + 1 ? parseInt(new Date().getFullYear() - row.raw_data.birth_year) - 1 : parseInt(new Date().getFullYear() - row.raw_data.birth_year) : false;
  element.querySelector('#' + 'application_about_me').innerText = row.raw_data.about_me;
  element.querySelector('#' + 'application_motivation').innerText = row.raw_data.motivation;
  element.querySelector('#' + 'application_buildings').innerText = row.raw_data.build_images;
  element.querySelector('#' + 'application_publish_about_me').innerText = row.raw_data.publish_about_me ? 'Yes' : 'No';
  element.querySelector('#' + 'application_publish_age').innerText = row.raw_data.publish_age ? 'Yes' : 'No';
  element.querySelector('#' + 'application_publish_country').innerText = row.raw_data.publish_country ? 'Yes' : 'No';
  element.querySelector('#' + 'application_status').innerText = row.raw_data.status === 1 ? 'pending review' : row.raw_data.status === 2 ? 'denied' : row.raw_data.status === 3 ? 'accepted' : 'Some weird code';
  element.querySelector('#' + 'application_mc_skin').src = row.raw_data.mc_skin_url;
  element.querySelector('#' + 'application_discord_avatar').src = row.raw_data.discord_avatar_url;
  
  element.app_id = row.raw_data.id;

  framework.popup.create({div: element, title: 'Application'}, function(popup){
    popup.childNodes[1].childNodes[3].childNodes[1].hidden = false;
  });
};

//Gets executed when an application is accepted
interface.application.accept = function(id){
  
  _internal.send('application', false, 'PATCH', {}, {id: id, status: 3}, function(status, res){
    if(status == 200){
      framework.popup.create_info({title: 'Success!', text: 'Success!'});
    }else{
      framework.popup.create_info({title: 'Error!', text: 'Something went wrong!\n' + res.err});
    }
  });
};

//Gets executed when an application is denied
interface.application.deny = function(id, reason){
  _internal.send('application', false, 'PATCH', {}, {id: id, status: 2, reason: reason}, function(status, res){
    if(status == 200){
      framework.popup.create_info({title: 'Success!', text: 'Success!'});
    }else{
      framework.popup.create_info({title: 'Error!', text: 'Something went wrong!\n' + res.err});
    }
  });
};






//All post cms functions
interface.post = {};

//Loads the posts from the api and puts them into the table; bs is just some random variable because we get some shit from the onload
interface.post.load = function(filter) {
  framework.table.init(document.getElementById('post-table'), {api_path: 'blog', data_mapping: function(input){
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
  }, api_method: 'GET', edit_bar: false, row_onclick: interface.post.open_popup});
};

//Gets called whenever the user changes the status to filter the table
interface.post.filter = function(select, table) {
  let filter = false;
  let value = select.value;
  
  if(value == 0) filter = 'Private';
  if(value == 1) filter = 'Public';

  table.filter(4, filter, true);
};

interface.post.open_popup = function(row){
  let element = document.getElementById('post-popup').cloneNode(true);
  
  element.querySelector('#' + 'post-author').innerText = row.raw_data.author;
  element.querySelector('#' + 'post-date').innerText = new Date(row.raw_data.date).toISOString().substring(0, 10);
  element.querySelector('#' + 'post-title').innerText = row.raw_data.title;
  element.querySelector('#' + 'post-body').innerHTML = row.raw_data.body;

  framework.popup.create({div: element, title: 'Blog post'}, function(popup){
    popup.childNodes[1].childNodes[3].childNodes[1].hidden = false;
    popup.childNodes[1].childNodes[3].childNodes[1].raw_data = row.raw_data;
  });
};

interface.post.edit = function(btn){
  let editor = btn.parentNode.parentNode.childNodes[1];
  let raw_data = editor.parentNode.parentNode.raw_data
  
  editor.querySelector('#' + 'edit-author').value = raw_data.author;
  editor.querySelector('#' + 'edit-date').value = new Date(raw_data.date).toISOString().substring(0, 10);
  editor.querySelector('#' + 'edit-title').value = raw_data.title;
  editor.querySelector('#' + 'edit-body').value = raw_data.body;

  editor.hidden = false;
};

interface.post.send = function(form){
  let postData = {
    title: form.querySelector('#' + 'edit-title').value,
    author: form.querySelector('#' + 'edit-author').value,
    body: form.querySelector('#' + 'edit-body').value,
    date: form.querySelector('#' + 'edit-date').value,
    public: form.querySelector('#' + 'edit-public').checked
  };

  let method = 'POST';
  if(form.parentNode.parentNode.parentNode.hasOwnProperty('raw_data')){
    postData.id = form.parentNode.parentNode.parentNode.raw_data.id;
    method = 'PUT';
  }

  _internal.send('blog', false, method, false, postData, function(status, res){
    if(status != 200){
      framework.popup.create_info({title: 'An error occured', text: res});
    }
    else{
      framework.popup.create_info({title: 'Success', text: 'The post was saved successfully!'});
      if(typeof form.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.close == 'function'){
        form.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.close();
      }else{
        form.parentNode.parentNode.parentNode.parentNode.close();
      }
      document.getElementById('post-table').update();
    }
  });
};

interface.post.edit_cancel = function(btn){
  btn.parentNode.parentNode.hidden = true;
};

interface.post.new = function(){
  let editor = document.getElementById('post-editor').cloneNode(true);

  framework.popup.create({div: editor, title: 'New Blog post'}, function(popup){
    popup.childNodes[1].childNodes[3].childNodes[1].hidden = false;
  });
};