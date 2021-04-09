<template>
  <div class="background-bright">
    <div id="section_downloads" class="scrollTarget"></div>
    <h1>Downloads</h1>
    <div id="container">
      <section ref="0" class="scrollTarget">
        <h2 @click="activeElement = 0">
          <svg v-if="activeElement !== 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <svg v-if="desktop || activeElement === 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
          Worldsaves</h2>
        <div v-if="desktop || activeElement === 0">
          <div class="item">
            <h3>Paxterya Season 3</h3>
            <p>The map we've been playing on from December 1, 2019 to July 17, 2020. Check the museum for coordinates of important locations.</p>
            <a href="https://stor.paxterya.com/minecraft_maps/paxteryaS3.zip"><button class="secondary">Download ZIP (25 GB)</button></a>
            <p>Or join paxterya.com:25603</p>
          </div>
          
          <div class="item">
            <h3>Paxterya Season 2</h3>
            <p>The map we've been playing on in September and October 2019. To play on this map, you will need to set up your own server. <a href="https://minecraft.gamepedia.com/Tutorials/Setting_up_a_server" target="_blank">Here's how to do that on your PC.</a></p>
            <a href="https://stor.paxterya.com/minecraft_maps/2019-11-30_paxterya_beta.zip"><button class="secondary">Download ZIP (1.1 GB)</button></a>
            <p>Or join paxterya.com:25602</p>
          </div>

          <div class="item">
            <h3>Paxterya Season 1 (Ancient Paxterya)</h3>
            <p>The map we've been playing on from June to November 2017. That's right, 2017.</p>
            <a href="https://stor.paxterya.com/minecraft_maps/2017-11-22-paxterya_original.zip"><button class="secondary">Download ZIP (5.4 GB)</button></a>
            <p>Or join paxterya.com:25601</p>
          </div>

          <div class="item">
            <h3>Paxterya Modded S1 (All the Mods 5)</h3>
            <p>Our first try playing modded together in November 2020.</p>
            <a href="https://stor.paxterya.com/minecraft_maps/modded_s1_singleplayer.zip"><button class="secondary">Download ZIP (2.5 GB)</button></a>
          </div>

          <div class="item">
            <h3>Paxterya Modded S2 (Skyfactory 4)</h3>
            <p>After playing in the beautiful world of All the Mods 5, we had to do something simpler in December 2020.</p>
            <a href="https://stor.paxterya.com/minecraft_maps/modded_s2.zip"><button class="secondary">Download ZIP (70 MB)</button></a>
          </div>

          <div class="item">
            <h3>Paxterya Modded S3 (RLCraft)</h3>
            <p>In January 2021 we came back down to Earth to get ourselves killed way too often.</p>
            <a href="https://stor.paxterya.com/minecraft_maps/modded_s3_rlcraft.zip"><button class="secondary">Download ZIP (1.2 GB)</button></a>
          </div>
        </div>
      </section>

      <section ref="1" class="scrollTarget">
        <h2 @click="activeElement = 2">Thumbnails
          <svg v-if="activeElement !== 2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <svg v-if="desktop || activeElement === 2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
        </h2>
        <div v-if="desktop || activeElement === 2">
          <div class="item">
            <p class="margin-left">It is recommended to use Adobe Photoshop to edit the thumbnail template. If you don't have Photoshop, there are two transparent PNGs with the Paxterya overlay for you to combine with your individual thumbnail.</p>

            <a href="https://stor.paxterya.com/paxterya_art/paxterya-thumbnail-template.zip">
              <img src="https://stor.paxterya.com/paxterya_art/thumbnail-template-public.jpg">
              <button class="margin-left secondary">Download ZIP (14.1 MB)</button>
            </a>
          </div>
        </div>
      </section>

      <section ref="2" class="scrollTarget">
        <h2 @click="activeElement = 1">Wallpapers
          <svg v-if="activeElement !== 1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <svg v-if="desktop || activeElement === 1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
        </h2>
          <div v-if="desktop || activeElement === 1">
            <div class="item">
              <p class="margin-left">Good looking wallpapers to make your computer look 100% better! All of them come in a crisp resolution of 2560x1440 pixels.</p>

              <a href="https://stor.paxterya.com/paxterya_art/paxterya_art.zip">
                <img src="https://stor.paxterya.com/paxterya_art/mix_wallpaper.png">
                <button class="margin-left secondary">Download ZIP (18.6 MB)</button>
              </a>
            </div>
          </div>
      </section>

      <section ref="3" class="scrollTarget">
        <h2 @click="activeElement = 3">And more...
          <svg v-if="activeElement !== 3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <svg v-if="desktop || activeElement === 3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
        </h2>
        <div v-if="desktop || activeElement === 3">
          <div class="item">
            <p>You can find much more like special maps, tons of screenshots and Factorio Saves directly on our Download Server.</p>
            <a href="https://stor.paxterya.com" target="blank"><button class="secondary">Take a look</button></a>
          </div>
        </div>
      </section>
    </div>
  </div>  
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#container
  max-width: 90%
  display: flex
  flex-direction: row
  align-items: flex-start
  margin: 0 auto
  @media screen and ($mobile)
    flex-direction: column

section
  background: $pax-cyan
  width: 25%
  margin: 20px 10px
  max-height: 50vh
  overflow-y: auto
  @media screen and ($mobile)
    max-height: 50vh
    width: 100%
    margin: 20px 0

section.scrollTarget
  scroll-margin-top: 100px

div.item
  background: $pax-darkcyan
  margin: 0 0 10px 0
  padding: 10px
  button
    margin: 5px 0

h2
  background: $pax-lightcyan
  text-transform: uppercase
  color: $pax-darkcyan
  text-align: center
  padding: 5px 0
  position: relative
  cursor: pointer
  &:hover
    background: $pax-white
  svg
    color: white
    height: 30px
    width: auto
    left: 5px
    top: 50%
    transform: translate(0,-50%)
    z-index: 1
    position: absolute
    background: $pax-darkcyan
    padding: 5px
    border-radius: 50%

h3
  color: white

a
  color: $pax-white
  @extend .pax-semibold
  &:hover
    color: $pax-lightcyan
  &:focus
    outline: none

button
  svg
    height: 28pt
    width: auto
    margin-bottom: -10px

.margin-left
  margin-left: 2%

img
  width: 100%
  margin-top: 10px
  
</style>

<script>
export default {
  data: () => ({
    activeElement: 0,
    desktop: false,
  }),

  watch: {
    activeElement(newElement, oldElement){
      this.$nextTick(() => this.$refs[newElement].scrollIntoView({behavior: "smooth", block: "start"}));
    }
  },

  mounted(){
    this.desktop = window.innerWidth >= 1000;
  }
}
</script>