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