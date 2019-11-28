/*
 *
 *  This file contains all front-end javascript logic thats necessary to interface with the backend
 *
 */

//Holder for all functions
var root = {};

//Container for the all functions necessary for interface.html to work properly
root.interface = {};

//Loads the applications from the api and puts them into the table; bs is just some random variable because we get some shit from the onload
root.interface.loadApplications = function(bs, filter){
  //We need to send the cookie, but the browser is doing that for us!
  _internal.send('application', false, 'GET', filter, false, function(status, res){
    console.log(res);
    if(status == 200){
      if(res.length > 0){
        //Get our table rows
        let table = document.getElementById('applications-table').rows;

        //Clone row 0 as much as we need it, start at one because we already have row 0
        for(let i = 1; i < res.length; i++) document.getElementById('applications-table').appendChild(table[1].cloneNode(true));

        //Update our table rows
        table = document.getElementById('applications-table').rows;

        //Iterate over all applications we got from the api
        for(let i = 0; i < res.length; i++){
          //Translate the status number into a string
          let statusString = 'invalid';
          statusString = res[i].status == 1 ? 'pending review' : statusString;
          statusString = res[i].status == 2 ? 'denied'         : statusString;
          statusString = res[i].status == 3 ? 'accepted'       : statusString;

          //Fill the cells
          table[i+1].cells[0].childNodes[0].textContent = res[i].id;
          table[i+1].cells[1].childNodes[0].textContent = new Date(res[i].timestamp).toLocaleString('de');
          table[i+1].cells[2].childNodes[0].textContent = res[i].discord_nick;
          table[i+1].cells[3].childNodes[0].textContent = res[i].mc_ign;
          table[i+1].cells[4].childNodes[0].textContent = res[i].about_me.substring(0, 50);
          table[i+1].cells[5].childNodes[0].textContent = statusString;
          table[i+1].setAttribute("onclick", `root.interface.redirectToApplication(${res[i].id})`);
        }
      }else{

      }

    }else{
      window.alert('Failed to retrieve applications: ', res);
    }
  });
};

//Gets called whenever the user changes the status to filter the table
root.interface.changeStatus = function(){
  //Refresh the table
  //Get our table rows
  let table = document.getElementById('applications-table').rows;

  //Emtpy any existing data
  if(table.length > 2) for(let i = 1; i < table.length; i++) document.getElementById('applications-table').deleteRow(i);
  if(table.length > 2) for(let i = 1; i < table.length; i++) document.getElementById('applications-table').deleteRow(i);
  if(table.length > 2) for(let i = 1; i < table.length; i++) document.getElementById('applications-table').deleteRow(i);
  if(table.length > 2) for(let i = 1; i < table.length; i++) document.getElementById('applications-table').deleteRow(i);

  root.interface.loadApplications(null, {status: document.getElementById('status').value});
};

root.interface.redirectToApplication = function(id){
  window.location.href = `https://${window.location.host}/staff/application.html?id=${id}`;
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

//Container for all functions necessary for join-us.html to work properly
root.join_us = {};

root.join_us.onload = function(){
  //Check if we got redirected here from the discords oauth login
  let code = _internal.getQueryValue('id');
  if(code){
    //We got here from discords oauth login with some code, show the form and hide the button
    document.getElementById('app-form').hidden = false;
  }else{
    //User is new to the site, hide the form and show the button
    document.getElementById('oauth-login').hidden = false;
  }
};

//Sends the data of the application form to the api
root.join_us.sendApplication = function(){
  //Assemble the object to send to the api
  let application = {
    mc_ign:                document.getElementById('ign').value,
    discord_id:            _internal.getQueryValue('id'),
    email_address:         document.getElementById('email').value,
    country:               document.getElementById('country').value,
    birth_month:           document.getElementById('selectmonth').value,
    birth_year:            document.getElementById('selectyear').value,
    about_me:              document.getElementById('about_text').value,
    motivation:            document.getElementById('motivation_text').value,
    build_images:          document.getElementById('build_images').value,
    publish_about_me:      document.getElementById('publish_about_me').checked,
    publish_age:           document.getElementById('publish_age').checked,
    publish_country:       document.getElementById('publish_country').checked,
    accept_privacy_policy: document.getElementById('accept_privacy_policy').checked,
    accept_rules:          document.getElementById('accept_rules').checked
  };

  //Lets send the application to the api
  _internal.send('application', {}, 'POST', {}, application, function(status, res){
    if(status == 201){
      //Redirect user to success page
        window.location.href = `https://${document.location.host}/application-sent.html`;
    }else{
      window.alert('Woops something bad happend, we are very sorry for the inconvenience\nHere is the error: ' + res.err);
    }
  });
};

//Container for all functions necessary for contact-us.html to work properly
root.contact_us = {};

//Gets called when the form gets sent
root.contact_us.send = function(){
  //Construct the object to send to the api
  let obj = {
    'name':    document.getElementById('name').value,
    'email':   document.getElementById('email').value,
    'subject': document.getElementById('subject').value,
    'text':    document.getElementById('text').value
  }
  //Send the object to the api
  _internal.send('contact', {}, 'POST', {}, obj, function(status, res){
    if(status == 200){
      window.alert('You inquiry was sent successfully!');
    }else{
      window.alert('Woops, something went wrong ', res.err)
    }
  });
};

//members.html stuff
root.members = {};

//This gets executed onload and should trigger the update of member cards
root.members.init = function(){
  root.members.update();
};

//This updates the member cards
root.members.update = function(){
  //Get all members date from the api
  _internal.send('member', false, 'GET', false, false, function(status, docs){
    if(status == 200){

      //Sort after date joined
      docs = _internal.sortArray(docs, 'joined_date', 'asc');

      //Iterate over docs: copy template, fill it out, make it visible
      let i = 0;
      docs.forEach((doc) => {
        console.log(doc)
        //Clone template
        let template = document.getElementById('template');
        let div = template.cloneNode(true);
        div.id = i;

        //Fill out the static stuff
        div.querySelector('#mc_ign').innerText = doc.mc_nick;
        div.querySelector('#discord_name').innerText = doc.discord_nick;
        div.querySelector('#playtime').innerText = doc.playtime;

        //Fill out date
        div.querySelector('#joined').innerText = new Date(doc.joined_date).toISOString().substring(0, 10);;

        //Add country or remove it if its false
        if (doc.age) {
          div.querySelector('#country').innerText = doc.country;
        } else {
          let toDel = div.querySelector('#country-desc');
          toDel.parentNode.removeChild(toDel);
          toDel = div.querySelector('#country');
          toDel.parentNode.removeChild(toDel);
        }

        //Add age or remove it if its false
        if(doc.age){
          div.querySelector('#age').innerText = doc.age;
        }else{
          let toDel = div.querySelector('#age-desc');
          toDel.parentNode.removeChild(toDel);
          toDel = div.querySelector('#age');
          toDel.parentNode.removeChild(toDel);
        }

        //Add correct src to image
        div.querySelector("#render").src = doc.mc_render_url;

        //Make it visible
        div.style.display = null;
        template.parentNode.append(div);

        i++;
      });

    }else{
      window.alert('Couldnt get data', docs.err);
    }
  });
};

//Internal helper functions
var _internal = {};

//Used to send the payload (JS Object) to an api path
_internal.send = function(path, headers, method, queryStringObject, payload, callback){
  //Build the querystring
  let querystring = '';
  for(key in queryStringObject){
    querystring += key + '=' + queryStringObject[key] + '&';
  }

  //Build the correct requestUrl
  let requestUrl = `https://${document.location.host}/api/${path}?${querystring}`

  console.debug(method + requestUrl);

  //Start building the ajax request
  let xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl);
  xhr.setRequestHeader("Content-type", "application/json");

  //Add the headers
  for(key in headers){
    if(headers.hasOwnProperty(key)) xhr.setRequestHeader(key, headers[key]);
  }

  //Send the request
  xhr.send(JSON.stringify(payload));

  //Handle the response
  xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE) {
      var status = xhr.status;
      var response = xhr.responseText;

      // Callback if necessary
      if(callback){
        let error = false;
        try{
          response = JSON.parse(response)
        } catch(err){
          error = true;
        }
        if(!error) callback(status, response);
          else callback(status, false);
      }
    }
  }
};

//Used to get the value of the given querystring param
_internal.getQueryValue = function(param){
  let query = document.location.search.replace('?','').replace('#','').split('&');
  if(query[0].length < 2) query.pop();
  if(query.length > 0){
    let value = 0;
    while(typeof value != 'string'){
      if(query[value].split('=')[0] == param) value = query[value].split('=')[1];
        else value++;
    }
    return value;
  }else{
    return false;
  }
};

//Sorts an array of objects based on the given key 'asc' or 'desc'
_internal.sortArray = function(input, property, order = 'asc'){
  if(order === 'asc'){
    return input.sort((a, b) => {
      if (a[property] > b[property]) return 1;
      if (a[property] < b[property]) return -1;
      return 0;
    });
  }else{
    return input.sort((a, b) => {
      if (a[property] < b[property]) return 1;
      if (a[property] > b[property]) return -1;
      return 0;
    });
  }
  return input;
};