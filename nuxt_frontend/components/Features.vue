<template>
  <div id="wrapper">
    <div>
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

    <div>
      <p class="headline">Features</p>
      <ul class="text">
        <li>Minecraft {mc_version} (Java Edition)</li>
        <li>Vanilla Gameplay</li>
        <li>Whitelist <a href="join-us.html">(Apply here!)</a></li>
        <li>YouTube Channel <a href="https://www.youtube.com/channel/UCH-JgwSf8J8tdjemXqihEKw" target="_blank">(visit)</a></li>
        <li>Current season since July 18, 2020</li>
      </ul>
    </div>
  
    <div> 
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

div#wrapper
  display: flex
  flex-wrap: nowrap
  align-items: stretch
  justify-content: center
  background: $pax-darkcyan
  div
    padding: 2%
    padding-left: 5%
    padding-right: 5%

.headline
  @extend .pax-semibold
  background: $pax-white
  color: $pax-cyan
  margin-left: -30px
  font-size: 20pt
  padding: 0px 0px 15px 25px
  height: 32px
  position: relative
  white-space: nowrap
  width: 150px
  &:before
    content: ""
    border-style: solid
    border-width: 0 30px 30px 0
    border-color: transparent #b8b8b8 transparent transparent
    position: absolute
    left: 0px
    top: 47px

.text
  @extend .pax-regular
  background: #007787
  color: white
  padding: 10px 15px
  font-size: 14pt
  text-shadow: 0px 1px 0px #00515c
  line-height: 1.5
  width: 100%
  box-shadow: 0px 0px 5px #102f36 inset
  li:before
    content: "▪"
    color: $pax-darkcyan
    padding-right: 5px
  a
    color: $pax-darkestcyan
    @extend .pax-semibold
    &:hover
      color: $pax-white
      opacity: 0.8
</style>