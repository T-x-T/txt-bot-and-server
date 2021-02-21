<template>
  <div class="background">
    <h1>Videos</h1>
    <div id="thumbnailContainer">
      <img class="hover" @click="fullscreenVideo = 'https://www.youtube-nocookie.com/embed/imthf1D5BTs?autoplay=1'" src="https://i.ytimg.com/vi/imthf1D5BTs/maxresdefault.jpg" />
      <img class="hover" @click="fullscreenVideo = 'https://www.youtube-nocookie.com/embed/y8yxh_VYIrc?autoplay=1'" src="https://i.ytimg.com/vi/y8yxh_VYIrc/maxresdefault.jpg" />
      <img class="hover" @click="fullscreenVideo = 'https://www.youtube-nocookie.com/embed/enqxc0qD61E?autoplay=1'" src="https://i.ytimg.com/vi/enqxc0qD61E/maxresdefault.jpg" />
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

div#thumbnailContainer
  display: flex
  flex-wrap: nowrap
  align-items: stretch
  justify-content: center
  img
    border-radius: 8px
    width: 25%
    height: auto
    margin: 0.5% 2% 5% 2%
    &:hover
      cursor: pointer
  @media screen and ($mobile)
    flex-direction: column
    img
      width: 95vw

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