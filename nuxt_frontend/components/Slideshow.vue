<template>
  <div id="wrapper">
    <div id="section_slideshow" class="scrollTarget"></div>

    <div id="controlsWrapper">
      <div id="controls">
        <svg ref="back" id="back" @click="back()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        <p>{{index + 1}} / {{images.length}}</p>
        <svg ref="next" id="next" @click="next()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </div>
    </div>

    <img :src="images[index]"/>

  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#wrapper
  position: relative
  @media screen and ($mobile)
    width: 100vw
    margin-bottom: 125px

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
  width: 500px
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
    bottom: -100px
    border-radius: 25px
    width: 90vw
  svg
    height: 80px
    width: 80px
    color: white
    filter: drop-shadow( 0px 0px 8px rgba(0, 0, 0, .7))
    &:hover
      filter: drop-shadow( 0px 0px 12px rgba(0, 0, 0, 1))
  p
    @extend .pax-semibold
    font-size: 60px

</style>

<script>
export default {
  data: () => ({
    index: 0,
    images: [
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
    ]
  }),
  methods: {
    back: function(){
      if(this.index > 0) this.index--;
      else this.index = this.images.length - 1;
    },
    next: function(){
      if(this.index < this.images.length - 1) this.index++;
      else this.index = 0;
    }
  }
}
</script>