<template>
  <div class="background">

    <h1>Members</h1>

    <div id="controls">
      <div id="searchBox">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <input type="text" v-model="searchString">
      </div>

      <div id="sortBox">
        <button id="sort" @click="sortDropdownOpen = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>  
          {{sort[currentSort].label}}
        </button>

        <div id="sortDropdown" v-if="sortDropdownOpen">
          <div v-for="(item, index) in sort" :key="index">
            <button class="dropdownBtn" @click="sortDropdownOpen = false; currentSort = item.value">{{item.label}}</button>
          </div>
        </div>
      </div>
    </div>

    <div id="wrapper" v-if="members">
      <div v-for="(item, index) in processedMembers" :key="index">
        <div class="card hover">
          <img class="avatar" :src="item.mc_render_url">
          <div class="infos">
            <h4>{{item.mc_nick}}</h4>
            <h5>{{item.discord_nick}}</h5>
            <div class="details">
              <p class="description" v-if="item.country">Country:</p>
              <p class="value" v-if="item.country">{{item.country}}</p>
              <br>
              <p class="description" v-if="item.age">Age:</p>
              <p class="value" v-if="item.age">{{item.age}}</p>
              <br>
              <p class="description">Playtime:</p>
              <p class="value">{{item.playtime}}h</p>
              <br>
              <p class="description">Date joined:</p>
              <p class="value">{{new Date(item.joined_date).toISOString().substring(0, 10)}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button @click="showAll = true" v-if="!showAll">Show all</button>
    <button id="showLess" @click="showAll = false" v-if="showAll">Show less</button>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div.background
  padding: 1% 0 1% 0

div#controls
  display: flex
  justify-content: center
  align-items: center
  @media screen and ($mobile)
    flex-direction: column

div#searchBox
  box-shadow: 0px 0px 15px #102f36
  margin: 1%
  width: 558px
  max-width: 100%
  svg
    height: 32px
    max-width: 5vw
    width: auto
    color: white
    margin-bottom: -12px
    background: $pax-cyan
    padding: 10px
    float: left
  input
    width: 500px
    max-width: 87vw
    margin: 0
    border-width: 1px 1px 1px 0px
    border-color: #bebebe
    border-style: solid
    padding: 5px 0px 5px 5px
    height: 42px
    border: none
    font-size: 21px
    &:focus
      outline: none
  @media screen and ($mobile)
    margin: 0
    margin-bottom: 25px

button#sort
  margin: 0
  padding: 0
  width: 250px
  height: 52px
  svg
    height: 32px
    color: white
    margin-bottom: -8px

div#sortDropdown
  position: absolute
  z-index: 2

.dropdownBtn
  margin: 0
  box-shadow: none
  width: 250px
  &:hover
    box-shadow: none
    background-color: $pax-darkcyan

div#wrapper
  display: flex
  flex-flow: wrap
  flex-direction: row
  justify-content: space-evenly
  padding: 2% 10% 2% 10%

div.card
  display: flex
  width: 380px
  max-width: 100%
  padding: 10px 0 75px 10px
  background: linear-gradient(180deg, rgba(240,240,240,0) 15%, $pax-darkmodecyan1 15%, $pax-darkmodecyan1 85%, rgba(240,240,240,0) 85%)
  margin: 0 40px 20px 0
  cursor: pointer
  flex-shrink: 0
  &:hover
    @media screen and ($desktop)
      scale: 1.1
  @media screen and ($mobile)
    width: 75vw

div.infos
  width: 70%
  padding: 38px 0 0 30px

h4
  @extend .pax-semibold
  background: $pax-cyan
  color: $pax-white
  padding: 3px 0px 3px 15px
  text-shadow: 1px 2px 0px $pax-darkcyan
  border-right: 4px solid rgba(0,0,0,0.15)
  overflow-x: hidden
  font-size: 18pt
  @media screen and ($mobile)
    font-size: 36pt

h5
  @extend .pax-semibold
  background: $pax-darkcyan
  color: $pax-white
  padding: 3px 0px 3px 15px
  border-right: 4px solid rgba(0,0,0,0.15)
  font-size: 12pt
  word-break: break-all
  @media screen and ($mobile)
    font-size: 24pt

div.details
  margin-left: 5px
  margin-top: 5px

.description, .value
  color: white
  display: inline
  @media screen and ($mobile)
    font-size: 22pt

.value
  @extend .pax-p

.description
  @extend .pax-semibold

.avatar
  @media screen and ($mobile)
    width: 20vw
    object-fit: contain

button
  @extend .pax-semibold
  width: 50%
  margin: 0 25% 2% 25%
  padding: 0.5%
  font-size: 20pt
  box-shadow: 0px 0px 15px #102f36
  &:hover
    box-shadow: 0px 0px 35px #102f36
    background: $pax-cyan
div#background
  &:hover
    button#showLess
      position: fixed
      z-index: 4
      top: 90%  
</style>

<script>
export default {
  data: () => ({
    members: null,
    processedMembers: null,
    searchString: "",
    showAll: false,
    sort: {
      'joined_date.asc': { value: 'joined_date.asc', label: 'Date joined ASC' },
      'joined_date.desc': { value: 'joined_date.desc', label: 'Date joined DESC' },
      'playtime.asc': { value: 'playtime.asc', label: 'Playtime ASC' },
      'playtime.desc': { value: 'playtime.desc', label: 'Playtime DESC' },
      'age.asc': { value: 'age.asc', label: 'Age ASC'},
      'age.desc': { value: 'age.desc', label: 'Age DESC'},
      'country.asc': { value: 'country.asc', label: 'Country ASC'},
      'country.desc': { value: 'country.desc', label: 'Country DESC'},
      'mc_nick.asc': { value: 'mc_nick.asc', label: 'IGN ASC' },
      'mc_nick.desc': { value: 'mc_nick.desc', label: 'IGN DESC' },
      'discord_nick.asc': { value: 'discord_nick.asc', label: 'Discord ASC' },
      'discord_nick.desc': { value: 'discord_nick.desc', label: 'Discord DESC' },
    },
    currentSort: "joined_date.asc",
    sortDropdownOpen: false
  }),

  async fetch(){
    this.members = await this.$axios.$get("/api/member");
    this.processMembers();
  },

  watch: {
    searchString(){
      this.processMembers();
    },
    showAll(){
      this.processMembers();
    },
    currentSort(){
      this.processMembers();
    }
  },

  methods: {
    processMembers: function() {
      let searchString = this.searchString.toLowerCase();
      let processedMembers = this.members.filter(elem => elem.mc_nick.toLowerCase().includes(searchString) || elem.discord_nick.toLowerCase().includes(searchString) || (elem.country && elem.country.toLowerCase().includes(searchString)));
      
      if(this.currentSort.includes("age")){
        processedMembers = processedMembers.filter(elem => elem.age);
      } else if(this.currentSort.includes("country")){
        processedMembers = processedMembers.filter(elem => elem.country);
      }


      processedMembers = this.sortArray(processedMembers, this.currentSort.split(".")[0], this.currentSort.split(".")[1]);
      
      if(!this.showAll) processedMembers = processedMembers.slice(0, 12);
      this.processedMembers = processedMembers;
    },

    sortArray: function(input = [], property, order = 'asc'){
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
    }
  }
}
</script>