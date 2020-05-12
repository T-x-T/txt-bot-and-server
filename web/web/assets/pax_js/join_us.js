/*
 *  This file contains all functions for join-us.html
 */

//Container for all functions necessary for join-us.html to work properly
var join_us = {};

join_us.onload = function(){
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

//This function ONLY validates the inputs to show a popup when something isnt met. The real validation gets handled by the form itself!!
join_us.validate = function(){
  let inputs = {
    mc_ign:                document.getElementById('ign').value.trim(),
    email_address:         document.getElementById('email').value.trim(),
    country:               document.getElementById('country').value,
    birth_month:           document.getElementById('selectmonth').value,
    birth_year:            document.getElementById('selectyear').value,
    about_me:              document.getElementById('about_text').value,
    motivation:            document.getElementById('motivation_text').value,
    build_images:          document.getElementById('build_images').value,
    accept_privacy_policy: document.getElementById('accept_privacy_policy').checked,
    accept_rules:          document.getElementById('accept_rules').checked
  };

  let input_ok = true;
  for(let input in inputs) if(!inputs[input]) input_ok = false;
  
  if(!input_ok) framework.popup.create_info({title: 'Missing input', text: 'You missed one or more required inputs!\nAll inputs except privacy controls are required.'});
};

//Sends the data of the application form to the api
join_us.sendApplication = function(){
  //Assemble the object to send to the api
  let application = {
    mc_ign:                document.getElementById('ign').value.trim(),
    discord_id:            _internal.getQueryValue('id'),
    email_address:         document.getElementById('email').value.trim(),
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
      let div = document.getElementById('popup-sent').cloneNode(true);
      div.hidden = false;
      framework.popup.create({title: 'Application sent', div: div}, function(popup){});
    }else{
      framework.popup.create_info({title: 'Error', text: `An error occured, please show this to TxT#0001 if you think you did everything correctly:\n${status} ${res.err}`});
    }
  });
};

//custom selection dropdown list
var x, i, j, selElmnt, a, b, c;
/*look for any elements with the class "custom-select":*/
x = document.getElementsByClassName("custom-select");
for (i = 0; i < x.length; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  /*for each element, create a new DIV that will act as the selected item:*/
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /*for each element, create a new DIV that will contain the option list:*/
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < selElmnt.length; j++) {
    /*for each option in the original select element,
    create a new DIV that will act as an option item:*/
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function (e) {
      /*when an item is clicked, update the original select box,
      and the selected item:*/
      var y, i, k, s, h;
      s = this.parentNode.parentNode.getElementsByTagName("select")[0];
      h = this.parentNode.previousSibling;
      for (i = 0; i < s.length; i++) {
        if (s.options[i].innerHTML == this.innerHTML) {
          s.selectedIndex = i;
          h.innerHTML = this.innerHTML;
          y = this.parentNode.getElementsByClassName("same-as-selected");
          for (k = 0; k < y.length; k++) {
            y[k].removeAttribute("class");
          }
          this.setAttribute("class", "same-as-selected");
          break;
        }
      }
      h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function (e) {
    /*when the select box is clicked, close any other select boxes,
    and open/close the current select box:*/
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}
function closeAllSelect(elmnt) {
  /*a function that will close all select boxes in the document,
  except the current select box:*/
  var x, y, i, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  for (i = 0; i < y.length; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < x.length; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}
/*if the user clicks anywhere outside the select box,
then close all select boxes:*/
document.addEventListener("click", closeAllSelect);

//app form character countdown  
var maxLength = 1500;
$('#about_text').keyup(function () {
  var length = $(this).val().length;
  var length = maxLength - length;
  $('#chars1').text(length);
});

$('#motivation_text').keyup(function () {
  var length = $(this).val().length;
  var length = maxLength - length;
  $('#chars2').text(length);
});

$('#build_images').keyup(function () {
  var length = $(this).val().length;
  var length = maxLength - length;
  $('#chars3').text(length);
});

//country list autocomplete and alternative country spellings
(function($){
  $(function(){
    $('#country').selectToAutocomplete();
  });
})(jQuery);

//require custom select
$("#app-form").on("submit", function(){
  if ($('#selectmonth').val() === '') {
      alertify.alert("Please select your month of birth.");
      return false;
  }

  if ($('#selectyear').val() === '') {
      alertify.alert("Please select your year of birth.");
      return false;
  }

  else return;
});

join_us.onload();