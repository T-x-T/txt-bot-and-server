<template>
  <div id="wrapper">
    <h1>Videos</h1>
    <div id="thumbnailContainer">
      <img @click="fullscreenVideo = 'https://www.youtube-nocookie.com/embed/imthf1D5BTs?autoplay=1'" src="https://i.ytimg.com/vi/imthf1D5BTs/maxresdefault.jpg" />
      <img @click="fullscreenVideo = 'https://www.youtube-nocookie.com/embed/y8yxh_VYIrc?autoplay=1'" src="https://i.ytimg.com/vi/y8yxh_VYIrc/maxresdefault.jpg" />
      <img @click="fullscreenVideo = 'https://www.youtube-nocookie.com/embed/enqxc0qD61E?autoplay=1'" src="https://i.ytimg.com/vi/enqxc0qD61E/maxresdefault.jpg" />
    </div>
    <div id="fullscreenVideo" v-if="fullscreenVideo" @click="fullscreenVideo = null">
      <iframe id="video" :src="fullscreenVideo" frameborder="0" allow="autoplay" allowfullscreen></iframe>
    </div>
    <svg v-if="fullscreenVideo" v-on:click="fullscreenVideo = null" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#wrapper
  background-color: $pax-cyan

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
      cursor: pointer

div#fullscreenVideo
  width: 100%
  height: 100%
  z-index: 101
  position: fixed
  top: 0px
  left: 0px
  background-color: rgba(0, 0, 0, 0.75)
svg
  z-index: 102
  width: 5%
  height: auto
  position: fixed
  top: 0px
  left: 0px
  color: white
  &:hover
    color: $pax-lightcyan
    cursor: pointer
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