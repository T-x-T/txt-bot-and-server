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

window.onload = function(){

  //Reset search with X click
  document.getElementById("cancel").addEventListener("click", clearSearch);
  function clearSearch() {
    $('#searchInput').val('').focus().trigger('change');
    members.update();
  }

  //toggle X icon in search bar 
  $("#searchInput").on('change keydown paste input', function(){
    if( document.getElementById('searchInput').value === '' ){
        document.getElementById("search").style.display="block"
        document.getElementById("cancel").style.display="none"
      }
    else {
      document.getElementById("search").style.display="none"
      document.getElementById("cancel").style.display="block"
    }

  });

  //custom selection dropdown list
  var x, i, j, selElmnt, a, b, c;
    /*look for any elements with the class "custom-select":*/
    x = document.getElementsByClassName("custom-select");
    for(i = 0; i < x.length; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];
        /*for each element, create a new DIV that will act as the selected item:*/
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        /*for each element, create a new DIV that will contain the option list:*/
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for(j = 1; j < selElmnt.length; j++) {
            /*for each option in the original select element,
            create a new DIV that will act as an option item:*/
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", function(e) {
                /*when an item is clicked, update the original select box,
                and the selected item:*/
                var y, i, k, s, h;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                h = this.parentNode.previousSibling;
                for(i = 0; i < s.length; i++) {
                    if(s.options[i].innerHTML == this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        y = this.parentNode.getElementsByClassName("same-as-selected");
                        for(k = 0; k < y.length; k++) {
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
        a.addEventListener("click", function(e) {
            /*when the select box is clicked, close any other select boxes,
            and open/close the current select box:*/
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
            members.update();
        });
    }
    function closeAllSelect(elmnt) {
        /*a function that will close all select boxes in the document,
        except the current select box:*/
        var x, y, i, arrNo = [];
        x = document.getElementsByClassName("select-items");
        y = document.getElementsByClassName("select-selected");
        for(i = 0; i < y.length; i++) {
            if(elmnt == y[i]) {
                arrNo.push(i)
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }
        for(i = 0; i < x.length; i++) {
            if(arrNo.indexOf(i)) {
                x[i].classList.add("select-hide");
            }
        }
    }
    /*if the user clicks anywhere outside the select box,
    then close all select boxes:*/
    document.addEventListener("click", closeAllSelect);
};


_internal.sortings = {
  0: ['joined_date', 'asc'],
  1: ['joined_date', 'desc'],
  2: ['playtime', 'asc'],
  3: ['playtime', 'desc'],
  4: ['age', 'asc'],
  5: ['age', 'desc'],
  6: ['mc_nick', 'asc'],
  7: ['mc_nick', 'desc'],
  8: ['discord_nick', 'asc'],
  9: ['discord_nick', 'desc'],
};