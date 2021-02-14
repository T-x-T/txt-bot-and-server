<template>
  <div id="background">

  <h1>Members</h1>

    <div id="searchBox">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
      </svg>
      <input type="text" v-model="searchString">
    </div>

    <div id="wrapper" v-if="members">
      <div v-for="(item, index) in processedMembers" :key="index">
        <div class="card">
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
    <button @click="showAll = false" v-if="showAll">Show less</button>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#background
  background: $pax-cyan
  padding: 1%

div#searchBox
  box-shadow: 0px 0px 15px #102f36
  margin: 1%
  width: 558px
  svg
    height: 32px
    width: auto
    color: white
    margin-bottom: -12px
    background: $pax-cyan
    padding: 10px
    float: left
  input
    width: 500px
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
  padding: 10px 0 10px 10px
  background: linear-gradient(180deg, rgba(240,240,240,0) 15%, $pax-darkmodecyan1 15%, $pax-darkmodecyan1 85%, rgba(240,240,240,0) 85%)
  margin: 0 40px 20px 0
  cursor: pointer
  flex-shrink: 0
  filter: drop-shadow( 0px 0px 8px rgba(0, 0, 0, .7))
  opacity: 0.9
  &:hover
    filter: drop-shadow( 0px 0px 16px rgba(0, 0, 0, .9))
    opacity: 1
    scale: 1.1

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

h5
  @extend .pax-semibold
  background: $pax-darkcyan
  color: $pax-white
  padding: 3px 0px 3px 15px
  border-right: 4px solid rgba(0,0,0,0.15)
  font-size: 12pt
  word-break: break-all

div.details
  margin-left: 5px
  margin-top: 5px

.description, .value
  color: white
  display: inline

.value
  @extend .pax-p

.description
  @extend .pax-semibold

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

</style>

<script>
export default {
  data: () => ({
    members: null,
    processedMembers: null,
    searchString: "",
    showAll: false
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
    }
  },

  methods: {
    processMembers: function() {
      let searchString = this.searchString.toLowerCase();
      let processedMembers = this.members.filter(elem => elem.mc_nick.toLowerCase().includes(searchString) || elem.discord_nick.toLowerCase().includes(searchString) || (elem.country && elem.country.toLowerCase().includes(searchString)));
      if(!this.showAll) processedMembers = processedMembers.slice(0, 12);
      this.processedMembers = processedMembers;
    }
  }
}
</script>