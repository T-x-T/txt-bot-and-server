<template>
  <div class="background-dark" ref="slideshowWrapper">
    <div id="section_slideshow" class="scrollTarget"></div>

    <img v-if="inView" :src="images[towns[townIndex]][index]"/>

    <div id="controlsWrapper">
      <div id="controls">
        <svg ref="back" id="back" @click="back()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" /></svg>
        <svg ref="next" id="next" @click="next()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" /></svg>
        <p id="index">{{index + 1}} / {{images[towns[townIndex]].length}}</p>
        <div id="textContainer">
          <span v-for="(item, i) in towns" :key="i" :ref="`town${i}`" @click="townIndex = i; index = 0" class="town">{{item}}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div.background-dark
  position: relative
  padding: 50px 0
  @media screen and ($mobile)
    padding: 50px 0 0 0

img
  width: 75vw
  height: auto
  border-radius: 25px
  display: block
  margin: 0 auto
  box-shadow: 0px 7px 0px $pax-darkmodecyan1
  @media screen and ($mobile)
    width: 100vw
    height: auto
    margin: 0
    border-radius: 0
div#controlsWrapper
  display: flex
  justify-content: center
  height: 100%
div#controls
  width: max-content
  height: 90px
  flex-wrap: nowrap
  justify-content: space-between
  align-items: center
  background: $pax-darkmodecyan1
  position: absolute
  bottom: 50px
  z-index: 2
  border-radius: 25px 25px 0 0
  padding: 0 30px
  user-select: none
  @media screen and ($mobile)
    position: relative
    top: 100%
    width: 100%
    border-radius: 0
    height: 70px
    padding: 10px 30px 20px 30px
    display: flex
    justify-content: space-around
  svg
    height: 50px
    width: 50px
    color: white
    position: absolute
    top: 50%
    transform: translateY(-50%)
    &#back
      left: 0
    &#next
      right: 0
    &:hover
      color: $pax-lightcyan
      cursor: pointer
    @media screen and ($mobile)
      position: relative
  div#textContainer
    margin: 0 auto
    width: fit-content
    display: flex
    @media screen and ($mobile)
      display: none
  p
    text-align: center
  p#index
    @extend .pax-semibold
    font-size: 25pt
    @media screen and ($mobile)
      display: none
  span.town
    @extend .pax-regular
    color: white
    font-size: 12pt
    margin: 0 20px 0 20px
    display: block
    &:hover
      color: $pax-lightcyan
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
    inView: false,
    images: {
      "Pearlshire": [
        "https://stor.paxterya.com/website/screenshots/2021-04/pearlshire_04.png_1080.webp",
        "https://stor.paxterya.com/website/screenshots/2021-04/pearlshire_07.png_1080.webp",
        "https://stor.paxterya.com/website/screenshots/2021-04/pearlshire_08.png_1080.webp",
        "https://stor.paxterya.com/website/screenshots/2021-04/pearlshire_09.png_1080.webp",
        "https://stor.paxterya.com/website/screenshots/2021-04/pearlshire_10.png_1080.webp",
        "https://stor.paxterya.com/website/screenshots/2021-04/pearlshire_11.png_1080.webp",
        "https://stor.paxterya.com/website/screenshots/2021-04/pearlshire_12.png_1080.webp",
        "https://stor.paxterya.com/website/screenshots/2021-04/pearlshire_13.png_1080.webp",
      ],
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
    this.setupOberserver();
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
    },
    intersect(entries){
      if(entries[0].isIntersecting){
        this.$nextTick(function(){this.inView = true});
      }
    },

    setupOberserver(){
      this.$nextTick(function(){
        const options = {
          root: null,
          rootMargin: "500px",
          threshold: 0.0
        }

        const observer = new IntersectionObserver(this.intersect, options);
        observer.observe(this.$refs["slideshowWrapper"]);
      });
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