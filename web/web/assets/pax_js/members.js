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
  framework.list.init({
    div: document.getElementById('member-list'),
    api_path: 'member',
    data_mapping: function(a){
      return [
        {
          element_id: 'render',
          property: 'src',
          value: a.mc_render_url
        },
        {
          element_id: 'mc_ign',
          property: 'innerText',
          value: a.mc_nick
        },
        {
          element_id: 'discord_name',
          property: 'innerText',
          value: a.discord_nick
        },
        {
          element_id: 'country',
          descriptor_id: 'country-desc',
          property: 'innerText',
          value: a.country
        },
        {
          element_id: 'age',
          descriptor_id: 'age-desc',
          property: 'innerText',
          value: a.age
        },
        {
          element_id: 'playtime',
          property: 'innerText',
          value: a.playtime + 'h'
        },
        {
          element_id: 'joined',
          property: 'innerText',
          value: new Date(a.joined_date).toISOString().substring(0, 10)
        }
      ];
    },
    template: document.getElementById('template').cloneNode(true),
    default_sort: 'joined_date.asc',
    display_mode: 'vertical',
    filterable: ['mc_nick', 'discord_nick', 'country']
  });
};

//Makes the search work
members.search = function(){
  document.getElementById('member-list').filter(document.getElementById('searchInput').value.toLowerCase());
};

members.sort = function(){
  let sortings = {
    0: 'joined_date.asc',
    1: 'joined_date.desc',
    2: 'playtime.asc',
    3: 'playtime.desc',
    4: 'age.asc',
    5: 'age.desc',
    6: 'mc_nick.asc',
    7: 'mc_nick.desc',
    8: 'discord_nick.asc',
    9: 'discord_nick.desc'
  };
  
  document.getElementById('member-list').sort(sortings[document.getElementById('sort').value]);
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
            members.sort();
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