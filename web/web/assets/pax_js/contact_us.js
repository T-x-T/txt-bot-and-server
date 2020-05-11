/*
 *  This file contains all js stuff for the contact form on contact-us.html
 */

var contact_us = {};

//Gets called when the form gets sent
contact_us.send = function(){
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