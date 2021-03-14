<template>
  <div id="section_features" class="scrollTarget">
    <div class="hover paxItem">
      <p class="headline">Plugins</p>
      <ul class="text">
        <li>Self-made PaxteryaPlugin</li>
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
        <li>Whitelist <a href="join-us.html">(Apply here!)</a></li>
        <li>YouTube Channel <a href="https://www.youtube.com/channel/UCH-JgwSf8J8tdjemXqihEKw" target="_blank">(visit)</a></li>
        <li>Current season since July 18, 2020</li>
        <li>Dedicated Server with Ryzen 3900x, 128GB RAM and NVME Storage</li>
      </ul>
    </div>
  
    <div class="hover paxItem"> 
      <p class="headline">Datapacks</p>
      <ul class="text">
        <li>Coordinates HUD</li>
        <li>Custom Armor Stands</li>
        <li>Durability Ping</li>
        <li>Silence Mobs</li>
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
  div
    padding: 2%
    padding-left: 5%
    padding-right: 5%
  @media screen and ($mobile)
    flex-direction: column
    div
      width: 80vw
      margin: 25px 10vw 25px 5vw

.paxItem
  width: 500px
  .headline
    width: 250px

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