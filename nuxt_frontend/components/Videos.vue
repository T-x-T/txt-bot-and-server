<template>
  <div class="background-bright">
    <div id="section_videos" class="scrollTarget"></div>
    <h1>Videos</h1>
    <div id="thumbnailList">

      <div @click="fullscreenVideo = 'https://www.youtube-nocookie.com/embed/q1u7uBNrk34?autoplay=1'" class="thumbnailContainer">
        <div class="videoInfo">
          <h2>The Paxterya Cake</h2>
          <p>ExxPlore made our logo eatable, and it was delicious!</p>
        </div>
        <img src="https://stor.paxterya.com/website/thumbnails/1.webp" loading="lazy"/>
      </div>

      <div @click="fullscreenVideo = 'https://www.youtube-nocookie.com/embed/lqvVvIRxDMk?autoplay=1'" class="thumbnailContainer">
        <div class="videoInfo">
          <h2>Paxterya Trailer</h2>
          <p>A quick introduction to Paxterya: who are we and what do we do?</p>
        </div>
        <img src="https://stor.paxterya.com/website/thumbnails/2.webp" loading="lazy"/>
      </div>
      
      <div @click="fullscreenVideo = 'https://www.youtube-nocookie.com/embed/y8yxh_VYIrc?autoplay=1'" class="thumbnailContainer">
        <div class="videoInfo">
          <h2>Season 3 Cinematic</h2>
          <p>We love to portray our builds in an epic cinematic. This one shows off Season 3!</p>
        </div>
        <img src="https://stor.paxterya.com/website/thumbnails/4.webp" loading="lazy"/>
      </div>

    </div>
    <div id="fullscreenVideo" v-if="fullscreenVideo" @click="fullscreenVideo = null">
      <iframe id="video" :src="fullscreenVideo" frameborder="0" allow="autoplay" allowfullscreen></iframe>
    </div>
    <svg v-if="fullscreenVideo" v-on:click="fullscreenVideo = null" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
    </svg>

    <a href="https://youtube.com/Paxterya" target="_blank"><button>More on YouTube</button></a>

  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

.background-bright
  padding-bottom: 50px

div#thumbnailList
  display: flex
  flex-wrap: nowrap
  align-items: stretch
  justify-content: center
  margin-top: 50px
  .thumbnailContainer
    width: 25%
    height: fit-content
    margin: 0.5% 2% 2% 2%
    position: relative
    &:hover
      cursor: pointer
      transform: scale(1.1)
      .videoInfo
        opacity: 1
    img
      width: 100%
      height: auto
      border-radius: 8px
      display: block
    .videoInfo
      background: rgba(0, 0, 0, 0.75)
      position: absolute
      bottom: 0
      left: 0
      width: 100%
      height: 50%
      border-radius: 0 0 8px 8px
      padding: 10px 10px 20px 20px
      box-sizing: border-box
      opacity: 0
      h2
        color: $pax-lightcyan

  @media screen and ($mobile)
    flex-direction: column
    margin: 0
    padding: 20px 0
    
    .thumbnailContainer
      width: 80%
      max-width: 300px
      margin-left: auto
      margin-right: auto
      &:hover
        transform: none
        .videoInfo
          opacity: 0

.hover
  &:hover
    transform: scale(1.1)

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
  min-width: 60px
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

button
  margin: 0 auto
  display: block
</style>

<script>
export default {
  data: () => ({
    fullscreenVideo: null
  })
}
</script>