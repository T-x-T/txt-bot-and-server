<template>
  <div>
    <svg id="back" @click="back()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>

    <img :src="images[index]" />

    <svg id="next" @click="next()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div
  position: relative

img
  width: 100vw
  height: auto

svg
  width: 20vh
  height: 20vh
  color: white
  filter: drop-shadow( 0px 0px 8px rgba(0, 0, 0, .7))
  position: absolute
  &:hover
    filter: drop-shadow( 0px 0px 12px rgba(0, 0, 0, 1))
svg#back
  top: 50%
  margin-top: -10vh
svg#next
  top: 50%
  left: 100%
  margin-top: -10vh
  margin-left: -20vh
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