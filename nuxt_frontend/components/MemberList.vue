<template>
  <div class="background-dark">
    <div id="section_memberList" class="scrollTarget"></div>

    <h1>Members</h1>

    <div id="controls">
      <div id="searchBox">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <input type="text" v-model="searchString">
      </div>

      <div id="sortBox">
        <button class="secondary" id="sort" @click="sortDropdownOpen = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>  
          {{sort[currentSort].label}}
        </button>

        <div id="sortDropdown" v-if="sortDropdownOpen">
          <div v-for="(item, index) in sort" :key="index">
            <button class="dropdownBtn secondary" @click="sortDropdownOpen = false; currentSort = item.value">{{item.label}}</button>
          </div>
        </div>
      </div>
    </div>

    <div id="wrapper" v-if="members">
      <div v-for="(item, index) in processedMembers" :key="index">
        <div class="card hover">
          <img class="avatar" :src="item.mc_render_url" loading="lazy"/>
          <div class="infos">
            <h4>{{item.mc_nick}}</h4>
            <h5>{{item.discord_nick}}</h5>
            <div class="details">
              <p class="value">
                <span v-if="item.country">From {{item.country}}.</span>
                <span v-if="item.age">{{item.age}} y/o.</span>
              </p>
              <br>
              <p class="value">Played {{item.playtime}}h this season.</p>
              <br>
              <p class="value">Paxteryan since {{new Date(item.joined_date).toISOString().substring(0, 10)}}.</p>
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

.background-dark
  padding-bottom: 30px

div#controls
  display: flex
  justify-content: center
  margin: 20px auto
  width: 90%
  @media screen and ($mobile)
    flex-direction: column

div#searchBox
  width: 545px
  @media screen and ($mobile)
    width: 100%
  svg
    height: 45px
    width: auto
    color: white
    margin-bottom: -12px
    background: $pax-cyan
    padding: 10px
    float: left
    box-sizing: border-box
  input
    width: 500px
    padding: 5px
    height: 45px
    box-sizing: border-box
    margin: 0
    @media screen and ($mobile)
      width: calc(100% - 45px)

button#sort
  width: 200px
  height: 45px
  box-sizing: border-box
  margin: 0
  &:hover > svg
    color: $pax-darkcyan
  svg
    height: 25px
    color: $pax-white
    margin-bottom: -7px
    margin-right: 3px
  @media screen and ($mobile)
    float: right

div#sortDropdown
  position: absolute
  z-index: 2

.dropdownBtn
  margin: 0
  width: 200px
  &:hover
    background-color: $pax-white

div#wrapper
  max-width: 90vw
  margin: 0 auto
  display: flex
  flex-flow: wrap
  flex-direction: row
  justify-content: space-evenly

div.card
  display: flex
  width: 300px
  max-width: 100%
  padding: 10px 0 10px 10px
  background: linear-gradient(180deg, rgba(240,240,240,0) 15%, $pax-darkmodecyan1 15%, $pax-darkmodecyan1 85%, rgba(240,240,240,0) 85%)
  margin: 0 20px 10px 0
  cursor: pointer
  flex-shrink: 0
  img
    height: 180px
    width: auto
  &:hover
    @media screen and ($desktop)
      transform: scale(1.05)
  @media screen and ($mobile)
    max-width: 75vw
    margin-bottom: -20px

div.infos
  width: 70%
  padding: 28px 0 0 20px

h4
  @extend .pax-semibold
  background: $pax-cyan
  color: $pax-white
  padding: 3px 0px 3px 15px
  text-shadow: 1px 2px 0px $pax-darkcyan
  border-right: 4px solid rgba(0,0,0,0.15)
  overflow-x: hidden
  font-size: 14pt

h5
  @extend .pax-semibold
  background: $pax-darkcyan
  color: $pax-white
  padding: 3px 0px 3px 15px
  border-right: 4px solid rgba(0,0,0,0.15)
  font-size: 10pt
  word-break: break-all

div.details
  margin-left: 5px
  margin-top: 5px

.value
  color: white
  display: inline
  font-size: 10pt
  @extend .pax-regular

.avatar
  @media screen and ($mobile)
    width: 20vw
    object-fit: contain

button
  @extend .pax-semibold
  width: 50%
  font-size: 14pt
  margin: 20px auto
  display: block
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

  async mounted(){
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