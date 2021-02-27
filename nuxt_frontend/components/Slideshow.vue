<template>
  <div id="wrapper">
    <div id="section_slideshow" class="scrollTarget"></div>

    <div id="controlsWrapper">
      <div id="controls">
        <svg ref="back" id="back" @click="back()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        <div id="textContainer">
          <p id="index">{{index + 1}} / {{images[towns[townIndex]].length}}</p>
          <span v-for="(item, i) in towns" :key="i" :ref="`town${i}`" @click="townIndex = i; index = 0" class="town">{{item}}</span>
        </div>
        <svg ref="next" id="next" @click="next()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </div>
    </div>

    <img :src="images[towns[townIndex]][index]"/>

  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#wrapper
  position: relative
  @media screen and ($mobile)
    width: 100vw
    margin-bottom: 175px

img
  width: 90vw
  height: auto
  border-radius: 25px
  margin-top: 25px
  margin-left: 5vw
  filter: drop-shadow( 0px 0px 8px rgba(0, 0, 0, .7))
  @media screen and ($mobile)
    width: 100vw
    margin: 0
    filter: none
    border-radius: 0

div#controlsWrapper
  display: flex
  justify-content: center
  height: 100%

div#controls
  width: max-content
  height: 100px
  display: flex
  flex-wrap: nowrap
  justify-content: space-between
  align-items: center
  background: rgba(0, 0, 0, 0.25)
  border-radius: 25px
  backdrop-filter: blur(20px)
  position: absolute
  z-index: 2
  bottom: 25px
  @media screen and ($mobile)
    bottom: -150px
    border-radius: 25px
    width: 95vw
    height: 150px
  svg
    height: 80px
    width: 80px
    color: white
    filter: drop-shadow( 0px 0px 8px rgba(0, 0, 0, .7))
    &:hover
      filter: drop-shadow( 0px 0px 12px rgba(0, 0, 0, 1))
      cursor: pointer
  div#textContainer
    margin-top: -5px
  p
    text-align: center
  p#index
    @extend .pax-semibold
    font-size: 40px
  span.town
    @extend .pax-p
    color: white
    font-size: 20px
    margin: 0 20px 0 20px
    &:hover
      cursor: pointer
  span.activeTown
    @extend .pax-semibold
    color: $pax-lightcyan

</style>

<script>
export default {
  data: () => ({
    index: 0,
    towns: [],
    townIndex: 0,
    images: {
      "Town of Paxterya": [
        "https://stor.paxterya.com/website/screenshots/top_01.webp",
        "https://stor.paxterya.com/website/screenshots/top_02.webp",
        "https://stor.paxterya.com/website/screenshots/top_03.webp",
        "https://stor.paxterya.com/website/screenshots/top_04.webp",
        "https://stor.paxterya.com/website/screenshots/top_05.webp",
        "https://stor.paxterya.com/website/screenshots/top_06.webp",
        "https://stor.paxterya.com/website/screenshots/top_07.webp",
        "https://stor.paxterya.com/website/screenshots/top_08.webp",
        "https://stor.paxterya.com/website/screenshots/top_09.webp",
        "https://stor.paxterya.com/website/screenshots/top_10.webp"
      ],
      "Penliam": [
        "https://stor.paxterya.com/website/screenshots/penliam_01.webp",
        "https://stor.paxterya.com/website/screenshots/penliam_02.webp",
        "https://stor.paxterya.com/website/screenshots/penliam_03.webp",
        "https://stor.paxterya.com/website/screenshots/penliam_04.webp",
        "https://stor.paxterya.com/website/screenshots/penliam_05.webp",
        "https://stor.paxterya.com/website/screenshots/penliam_06.webp"
      ],
      "Cookieville": [
        "https://stor.paxterya.com/website/screenshots/cookietown_01.webp",
        "https://stor.paxterya.com/website/screenshots/cookietown_02.webp",
        "https://stor.paxterya.com/website/screenshots/cookietown_03.webp",
        "https://stor.paxterya.com/website/screenshots/cookietown_04.webp"
      ]
    }
  }),
  async fetch(){
    this.towns = Object.keys(this.images);
  },
  async mounted(){
    this.$refs["town" + this.townIndex][0].classList.add("activeTown");
  },
  methods: {
    back: function(){
      if(this.index > 0){
        this.index--;
      }else{
        this.townIndex = this.townIndex > 0 ? this.townIndex - 1 : this.towns.length - 1;
        this.index = this.images[this.towns[this.townIndex]].length - 1;
      } 
    },
    next: function(){
      if(this.index < this.images[this.towns[this.townIndex]].length - 1){
        this.index++;
      }else{
        this.townIndex = this.townIndex < this.towns.length - 1 ? this.townIndex + 1 : 0;
        this.index = 0;
      }
    }
  },
  watch: {
    townIndex(newIndex, oldIndex){
      this.$refs["town" + oldIndex][0].classList.remove("activeTown");
      this.$refs["town" + newIndex][0].classList.add("activeTown");
    }
  }
}
</script>