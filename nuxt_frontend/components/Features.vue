<template>
  <div id="section_features" class="scrollTarget">
    <div class="hover paxItem">
      <p class="headline">Plugins</p>
      <ul class="text">
        <li>Self-made PaxteryaPlugin<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="question-circle" class="svg-inline--fa fa-question-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zM262.655 90c-54.497 0-89.255 22.957-116.549 63.758-3.536 5.286-2.353 12.415 2.715 16.258l34.699 26.31c5.205 3.947 12.621 3.008 16.665-2.122 17.864-22.658 30.113-35.797 57.303-35.797 20.429 0 45.698 13.148 45.698 32.958 0 14.976-12.363 22.667-32.534 33.976C247.128 238.528 216 254.941 216 296v4c0 6.627 5.373 12 12 12h56c6.627 0 12-5.373 12-12v-1.333c0-28.462 83.186-29.647 83.186-106.667 0-58.002-60.165-102-116.531-102zM256 338c-25.365 0-46 20.635-46 46 0 25.364 20.635 46 46 46s46-20.636 46-46c0-25.365-20.635-46-46-46z"></path></svg><span class="hoverInfo">Our self-made plugin contains some useful tweaks that don't change gameplay. Learn more in the #faq on our Discord.</span></li>
        <li>CoreProtect</li>
        <li>Dynmap</li>
        <li>DiscordSRV</li>
        <li>WorldBorder</li>
        <li>DrSleep</li>
      </ul>
    </div>

    <div class="hover paxItem">
      <p class="headline">Features</p>
      <ul class="text">
        <li>Minecraft {{mcVersion}} (Java Edition)</li>
        <li>Vanilla Gameplay</li>
        <li>Whitelist <NuxtLink to="/join-us">(Apply here!)</NuxtLink></li>
        <li>YouTube Channel <a href="https://www.youtube.com/Paxterya" target="_blank">(visit)</a></li>
        <li>New season since July 18, 2021</li>
        <li>Dedicated Server with Ryzen 5950x, 128GB RAM and NVME Storage</li>
      </ul>
    </div>
  
    <div class="hover paxItem"> 
      <p class="headline">Data packs</p>
      <ul class="text">
        <li>Anti Enderman Grief</li>
        <li>Armor Statues</li>
        <li>Coordinates HUD</li>
        <li>Durability Ping</li>
        <li>Silence Mobs</li>
        <li>Spore Blossom Crafting</li>
        <li>Unlock All Recipes</li>
        <li>Piglin Sand Bartering</li>
      </ul>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#section_features
  display: flex
  flex-wrap: nowrap
  align-items: stretch
  justify-content: center
  @media screen and ($mobile)
    flex-direction: column
.paxItem
  width: 400px
  max-width: 90%
  padding: 5%
  @media screen and ($mobile)
    box-sizing: border-box
    padding: 3% 30px

  li 
    position: relative
    span.hoverInfo
      opacity: 0
      @extend .pax-regular
      color: $pax-white
      position: absolute
      z-index: 99
      width: 200px
      right: 0
      top: 0
      background: $pax-darkmodecyan1
      border-radius: 30px
      padding: 10px 20px
      user-select: none
    svg
      width: 17px
      height: auto
      color: $pax-lightcyan
      margin: 0 0 -2px 5px
    &:hover
      span.hoverInfo
        opacity: 1

</style>

<script>
export default {
  data: () => ({
    mcVersion: null
  }),

  async fetch(){
   this.mcVersion = await this.$axios.$get("/api/mcversion");
  }
}
</script>