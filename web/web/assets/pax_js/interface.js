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
  element.querySelector('#' + 'application_discord_nick').innerText = row.raw_data.mc_ign;
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
  framework.table.init(document.getElementById('post-table'), {api_path: 'post', data_mapping: function(input){
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

  if(form.parentNode.parentNode.parentNode.hasOwnProperty('raw_data')) postData.id = form.parentNode.parentNode.parentNode.raw_data.id;

  _internal.send('post', false, 'POST', false, postData, function(status, res){
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

//All bulletin board functions
interface.bulletin = {};

interface.bulletin.init = function(){
  //Get all categories from API
  _internal.send('bulletincategory', false, 'GET', false, false, function(status, res){
    if(res != 200 && Array.isArray(res) && res.length < 1){
      framework.popup.create_info({title: "Error", text: "Error loading bulletin board categories: " + status + res});
      return;
    }

    //Create global categories object to hold all the categories for later use in data_mappings
    interface.bulletin.categories = {};

    //Create a div for each category, customize template and activate framework-list
    res.forEach((category) => {
      //Save in the global object for use in data_mappings
      interface.bulletin.categories[category.id] = category;

      //Create div and attach it to the container
      let container = document.getElementById('bulletin_category_container');
      let parent = document.createElement('div');
      parent.id = 'bulletin_category_' + category.id;
      container.appendChild(parent);
      
      //Clone template and customize it
      let template = document.getElementById('bulletin_card_template').cloneNode(true);
      if(!category.enable_coordinates){
        while(template.querySelector('.bulletin_coords')){
          template.querySelector('.bulletin_coords').parentNode.removeChild(template.querySelector('.bulletin_coords'));
        }
      }
      if(!category.enable_trading){
        while(template.querySelector('.bulletin_trading')){
          template.querySelector('.bulletin_trading').parentNode.removeChild(template.querySelector('.bulletin_trading'));
        }
      }
      if(!category.enable_event){
        while(template.querySelector('.bulletin_event')){
          template.querySelector('.bulletin_event').parentNode.removeChild(template.querySelector('.bulletin_event'));
        }
      }
      template.hidden = false;
      template.id = 'bulletin_card_' + category.id
      
      //Add header and description to div
      let header = document.createElement('h3');
      header.innerText = category.name;
      parent.appendChild(header);

      //Create and add button to add new card if member has permissions
      if(cookies.access_level >= category.permission_level){
        let add_btn = document.createElement('button');
        add_btn.onclick = function(){interface.bulletin.new(this)};
        add_btn.innerText = 'Create';
        add_btn.category = category;
        parent.appendChild(add_btn);
      }
      
      let description = document.createElement('h4');
      description.innerText = category.description;
      parent.appendChild(description);

      //Initialize framework-list
      framework.list.init({
        div: parent.appendChild(document.createElement('div')),
        api_path: 'bulletin/' + category.id,
        data_mapping: interface.bulletin.data_mapping,
        template: template,
        default_sort: 'date.desc',
        onclick: interface.bulletin.open_popup,
        display_mode: category.display_mode
      });

    });
  });
};

interface.bulletin.data_mapping = function(a){
  let mappings = 
  [
    {
      element_id: 'bulletin_message',
      property: 'innerText',
      value: a.message
    },
    {
      element_id: 'bulletin_author',
      property: 'innerText',
      value: a.author
    },
    {
      element_id: 'bulletin_date',
      property: 'innerText',
      value: new Date(a.date).toISOString().substring(0, 10)
    },
    {
      element_id: 'bulletin_display_more_a',
      property: 'href',
      value: 'wikipedia.com/duck'
    }
  ];

  let enable_coordinates = false;
  if(interface.bulletin.categories[a.category].enable_trading){
    mappings.push({
      element_id: 'bulletin_trades',
      property: 'innerText',
      value: 'Bulletin trades'
    });
    enable_coordinates = true;
  };

  if(interface.bulletin.categories[a.category].enable_event){
    let event_date = new Date(a.event_date);
    mappings.push({
      element_id: 'bulletin_event_date',
      property: 'innerText',
      value: `${event_date.toISOString().substring(0, 10)} at ${event_date.toLocaleTimeString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`
    });
    mappings.push({
      element_id: 'bulletin_event_countdown',
      property: 'innerText',
      value: `Something happens in ${_internal.countdown(event_date)} `
    });
    mappings.push({
      element_id: 'bulletin_event_coords',
      property: 'innerText',
      value: `at: ${a.location_x}/${a.location_z}`
    });
    mappings.push({
      element_id: 'bulletin_event_coords',
      property: 'href',
      value: `https://play.paxterya.com/dynmap/?worldname=world2&mapname=flat&zoom=6&x=${a.location_x}&z=${a.location_z}&nogui=true`
    });
    enable_coordinates = true;
  };

  if(interface.bulletin.categories[a.category].enable_coordinates || enable_coordinates){
    mappings.push({
      element_id: 'bulletin_coords',
      property: 'href',
      value: `https://play.paxterya.com/dynmap/?worldname=world2&mapname=flat&zoom=6&x=${a.location_x}&z=${a.location_z}&nogui=true`
    });
    mappings.push({
      element_id: 'bulletin_coords',
      property: 'innerText',
      value: `${a.location_x}/${a.location_z}`
    });
  };
  
  return mappings; 
};

interface.bulletin.open_popup = function(card){

};

interface.bulletin.new = function(btn){
  let template = document.getElementById('bulletin_new_template').cloneNode(true);
  template.hidden = false;
  template.category = btn.category;

  framework.popup.create({
    div: template,
    confirmClose: true,
    title: 'new bulletin'
  }, function(popup){});
};

interface.bulletin.save = function(popup){
  let data = {
    message: popup.querySelector('#message').value,
    event_date: popup.querySelector('#event_date').value ? new Date(popup.querySelector('#event_date').value + 'T' + popup.querySelector('#event_time').value) : false,
    category: popup.options.div.category.id
  };

  _internal.send('bulletin', false, 'POST', false, data, function(status, res){
    if(status != 200){
      framework.popup.create_info({title: 'Error', text: status + JSON.stringify(res)});
      return;
    }

    //Update list that got the new card
    document.getElementById(`bulletin_category_${popup.options.div.category.id}`).childNodes[3].update(document.getElementById(`bulletin_category_${popup.options.div.category.id}`).childNodes[3].options);
  
    //Close popup
    framework.popup.close_for_real(popup);
  });
};