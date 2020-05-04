/*
 *  This file contains all js stuff for the member list on members.html
 */

 var members = {};

 //This gets executed onload and should trigger the update of member cards
members.init = function(){
  members.update();
  setTimeout(function(){
    if(document.getElementById('searchInput').value.length > 0) members.search();
  }, 1000);
};

//This updates the member cards
members.update = function(){
  //Get all members date from the api
  _internal.send('member', false, 'GET', false, false, function(status, docs){
    if(status == 200){
      //Get the selected sorting
      let sorting = document.getElementById('sort').value;
      //Fix the playtime for sorting
      for(let i = 0; i < docs.length; i++) docs[i].playtime = typeof docs[i].playtime == 'undefined'? 0 : parseInt(docs[i].playtime);

      //Sort after sorting joined
      docs = _internal.sortArray(docs, _internal.sortings[sorting][0], _internal.sortings[sorting][1]);

      //Remove existing elements, that are not the template!
      let parent = document.getElementById('member-list');
      let elements = parent.children;
      let newElements = [];

      //Fill newElements with all elements we need to remove
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].id != 'template') newElements.push(elements[i]);
      }

      //Remove elements
      newElements.forEach((element) => {
        element.parentNode.removeChild(element);
      });

      //Iterate over docs: copy template, fill it out, make it visible
      let i = 0;
      docs.forEach((doc) => {
        //Clone template
        let template = document.getElementById('template');
        let div = template.cloneNode(true);
        div.id = i;

        //Fill out the static stuff
        div.querySelector('#mc_ign').innerText = doc.mc_nick;
        div.querySelector('#discord_name').innerText = doc.discord_nick;
        div.querySelector('#playtime').innerText = doc.playtime + 'h';

        //Fill out date
        div.querySelector('#joined').innerText = new Date(doc.joined_date).toISOString().substring(0, 10);

        //Add country or remove it if its false
        div.querySelector('#country').innerText = doc.country;

        if(div.querySelector('#country').innerText === 'false'){
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

//Makes the search work
members.search = function(){
  //Get the search term
  let term = document.getElementById('searchInput').value.toLowerCase();
  if(term.length == 0) return;

  //Iterate over all member cards and enable/disable them
  let parent = document.getElementById('member-list');
  let elements = parent.children;
  let newElements = [];

  //Fill newElements with all elements we need to evaluate
  for(let i = 0; i < elements.length; i++) {
    if(elements[i].id != 'template') newElements.push(elements[i]);
  }
  elements = newElements;

  elements.forEach((element) => {
    if(element.querySelector('#mc_ign').innerText.toLowerCase().includes(term) || element.querySelector('#discord_name').innerText.toLowerCase().includes(term)) element.style = '';
      else element.style = 'display: none;';
  });
};