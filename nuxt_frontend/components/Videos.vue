<template>
  <div id="wrapper">
    <p>Videos</p>
    <div id="thumbnailContainer">
      <img v-on:click="fullscreenVideo = 'https://www.youtube-nocookie.com/embed/imthf1D5BTs?autoplay=1'" src="https://i.ytimg.com/vi/imthf1D5BTs/maxresdefault.jpg" />
      <img v-on:click="fullscreenVideo = 'https://www.youtube-nocookie.com/embed/y8yxh_VYIrc?autoplay=1'" src="https://i.ytimg.com/vi/y8yxh_VYIrc/maxresdefault.jpg" />
      <img v-on:click="fullscreenVideo = 'https://www.youtube-nocookie.com/embed/enqxc0qD61E?autoplay=1'" src="https://i.ytimg.com/vi/enqxc0qD61E/maxresdefault.jpg" />
    </div>
    <div id="fullscreenVideo" v-if="fullscreenVideo" v-on:click="fullscreenVideo = null">
      <iframe id="video" :src="fullscreenVideo" frameborder="0" allow="autoplay" allowfullscreen></iframe>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#wrapper
  background-color: $pax-cyan

p
  @extend .pax-semibold
  text-align: center
  color: white
  font-size: 30pt
  text-shadow: 0px 0px 5px #102f36
  padding: 1%

div#thumbnailContainer
  display: flex
  flex-wrap: nowrap
  align-items: stretch
  justify-content: center
  img
    border-radius: 8px
    max-width: 25%
    height: auto
    margin: 0.5% 2% 5% 2%
    filter: opacity(0.85)
    box-shadow: 0px 0px 15px #102f36
    &:hover
      filter: opacity(1)
      box-shadow: 0px 0px 2vw #102f36

div#fullscreenVideo
  width: 100%
  height: 100%
  z-index: 101
  position: fixed
  top: 0px
  left: 0px
  background-color: rgba(0, 0, 0, 0.75)
iframe#video
  width: 90%
  height: 90%
  margin: 5vh 5vw
</style>

<script>
export default {
  data: () => ({
    fullscreenVideo: null
  })
}
</script>