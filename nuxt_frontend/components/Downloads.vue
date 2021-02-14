<template>
  <div id="background">
    <h1>Downloads</h1>
    <section>
      <h1>Worldsaves</h1>
      <div class="item">
        <h3>Paxterya Season 3</h3>
        <p>The map we've been playing on from December 1, 2019 to July 17, 2020. Check the museum for coordinates of important locations.</p>
        <a href="https://stor.paxterya.com/minecraft_maps/paxteryaS3.zip"><button>Download ZIP (25 GB)</button></a>
        <p>Or join paxterya.com:25603</p>
      </div>
      
      <div class="item">
        <h3>Paxterya Season 2</h3>
        <p>The map we've been playing on in September and October 2019. To play on this map, you will need to set up your own server. <a href="https://minecraft.gamepedia.com/Tutorials/Setting_up_a_server" target="_blank">Here's how to do that on your PC.</a></p>
        <a href="https://stor.paxterya.com/minecraft_maps/2019-11-30_paxterya_beta.zip"><button>Download ZIP (1.1 GB)</button></a>
        <p>Or join paxterya.com:25602</p>
      </div>

      <div class="item">
        <h3>Paxterya Season 1 (Ancient Paxterya)</h3>
        <p>The map we've been playing on from June to November 2017. That's right, 2017.</p>
        <a href="https://stor.paxterya.com/minecraft_maps/2017-11-22-paxterya_original.zip"><button>Download ZIP (5.4 GB)</button></a>
        <p>Or join paxterya.com:25601</p>
      </div>

      <div class="item">
        <h3>Paxterya modded S1 (All the Mods 5)</h3>
        <p>Our first try playing modded together in November 2020.</p>
        <a href="https://stor.paxterya.com/minecraft_maps/modded_s1_singleplayer.zip"><button>Download ZIP (2.5 GB)</button></a>
      </div>

      <div class="item">
        <h3>Paxterya modded S2 (Skyfactory 4)</h3>
        <p>After playing in the beautiful world of All the Mods 5, we had to do something simpler in December 2020.</p>
        <a href="https://stor.paxterya.com/minecraft_maps/modded_s2.zip"><button>Download ZIP (70 MB)</button></a>
      </div>

      <div class="item">
        <h3>Paxterya modded S3 (RLCraft)</h3>
        <p>In January 2021 we came back down to earth to get ourselves killed way too often.</p>
        <a href="https://stor.paxterya.com/minecraft_maps/modded_s3_rlcraft.zip"><button>Download ZIP (1.2 GB)</button></a>
      </div>
    </section>

    <section>
      <h1>Wallpapers</h1>
        <div class="item">
          <p class="margin-left">Good looking Wallpapers to make your Computer look 100% better! All of them come in a crisp resolution of 2560x1440 pixels.</p>

          <a href="https://stor.paxterya.com/paxterya_art/paxterya_art.zip">
            <img src="https://stor.paxterya.com/paxterya_art/mix_wallpaper.png">
            <button class="margin-left">Download ZIP (18.6 MB)</button>
          </a>
        </div>
    </section>

    <section>
      <h1>YouTube Thumbnail Templates</h1>
      <div class="item">
        <p class="margin-left">It is recommended to use Adobe Photoshop to edit the thumbnail template. If you don't have Photoshop, there are two transparent PNGs with the Paxterya overlay for you to combine with your individual thumbnail.</p>

        <a href="https://stor.paxterya.com/paxterya_art/paxterya-thumbnail-template.zip">
          <img src="https://stor.paxterya.com/paxterya_art/thumbnail-template-public.jpg">
          <button class="margin-left">Download ZIP (14.1 MB)</button>
        </a>
      </div>
    </section>

    <section>
      <h1>And more...</h1>
      <div class="item">
        <p>You can find much more like special maps, tons of screenshots and Factorio Saves directly on our Download Server</p>
        <a href="https://stor.paxterya.com" target="blank"><button>Take a look</button></a>
      </div>
    </section>
  </div>  
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#background
  background: $pax-darkcyan
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center

section
  width: 50%
  margin: 2%
  box-shadow: 0px 0px 15px #102f36
  filter: opacity(0.9)
  &:hover
    box-shadow: 0px 0px 50px #102f36
    filter: opacity(1)

div.item
  margin: 2%

h3
  color: white

p
  @extend .pax-p
  color: white

a
  color: $pax-white
  @extend .pax-semibold
  &:hover
    color: $pax-lightcyan
  &:focus
    outline: none

button
  &:hover
    box-shadow: 0px 0px 5px #102f36 inset
  svg
    height: 28pt
    width: auto
    margin-bottom: -10px

.margin-left
  margin-left: 2%

img
  width: 96%
  margin: 2%
  box-shadow: 0px 0px 15px #102f36
  &:hover
    box-shadow: 0px 0px 35px #102f36
</style>