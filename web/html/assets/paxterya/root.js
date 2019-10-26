/*
 *
 *  This file contains all front-end javascript logic thats necessary to interface with the backend
 *
 */

//Holder for all functions
var root = {};

//Config
root.config = {
  token: false
}

//Sends the data of the application form to the api
root.sendApplication = function(){
  //Assemble the object to send to the api
  let application = {
    mc_ign:                document.getElementById('ign').value,
    discord_nick:          document.getElementById('discord').value,
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
  root.send('application', {}, 'POST', {}, application, function(status, res){
    if(status == 201){
      //Redirect user to success page
        window.location.href = `https://${document.location.host}/application-sent.html`;
    }else{
      window.alert('Woops something bad happend, we are very sorry for the inconvenience\nHere is the error: ' + res.err);
    }
  });
};

//Used to send the payload (JS Object) to an api path
root.send = function(path, headers, method, queryStringObject, payload, callback){
  console.debug('Did someone just call root.send() ??????');
  //Build the correct requestUrl
  let requestUrl = `https://${document.location.host}/api/${path}?`

  console.debug(method + requestUrl);

  //Start building the ajax request
  let xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl);
  xhr.setRequestHeader("Content-type", "application/json");

  //Add the headers
  for(key in headers){
    if(headers.hasOwnProperty(key)) xhr.setRequestHeader(key, headers[key]);
  }

  //If we have a sessionToken set, add it as well
  if(root.config.sessionToken) xhr.setRequestHeader("token", root.config.sessionToken.id);

  //Send the request
  xhr.send(JSON.stringify(payload));

  //Handle the response
  xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE) {
      var status = xhr.status;
      var response = xhr.responseText;

      // Callback if necessary
      if(callback){
        try{
          callback(status, JSON.parse(response));
        } catch(err){
          callback(status, false);
        }
      }
    }
  }
};
