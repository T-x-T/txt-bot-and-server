<template>
  <div>
    <div id="bgImg">
      <div id="bgFilter">
        <img id="logo" src="~/assets/logo-icon.svg">
      </div>
    </div>
    <p>
      Paxterya is a close-knit and dedicated Minecraft community. What we enjoy most is the freedom Minecraft has to offer. 
      You can do anything on Paxterya: start big projects with others, construct a town, or go far away to found your very own empire. 
      <br>Let's be creative together!
      <a href="https://discord.gg/mAjZCTG">
        <button><img id="discordLogo" src="~/assets/Discord-Logo-White.svg" /> Join our Discord!</button>
      </a>
      <br><br><br><br><br>
      We use Discord as our communication platform where we also talk about Minecraft, gaming, technology and everything else.
    </p>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#bgImg
  height: 75vh
  background-image: url("https://stor.paxterya.com/website/screenshots/top_04.webp")
  background-size: cover
  background-position: center
  background-attachment: fixed
div#bgFilter
  height: 75vh
  background-image: radial-gradient(transparent 50%, rgba(0,0,0,.3) 70%), linear-gradient(0deg, rgba(0,0,0,.3) 0%, transparent 5%, transparent 80%, rgba(0,0,0,.3) 100%), linear-gradient(rgba(0,81,92,.6) 0%, rgba(0,81,92,.6) 100%)
  display: flex
  align-items: center
  justify-content: center
#logo
  height: 60vh
  width: auto
  filter: opacity(0.5)

p
  @extend .pax-regular
  text-align: justify
  width: 600px
  font-size: 14pt
  color: white
  max-width: 90%
  position: absolute
  left: 50%
  transform: translateX(-50%)
  top: 25%
  padding: 1%
  background-color: rgba(16, 47, 54, 0.5)
  box-shadow: 0px 0px 5px #102f36 inset
  a
    position: absolute
    left: 50%
    transform: translateX(-50%)
    top: 190px

button
  display: flex
  align-items: center
  border-radius: 100px
  font-size: 24pt
  text-shadow: 1px 2px 0px $pax-darkcyan
  padding: 4px 24px
  box-shadow: 0px 0px 20px $pax-cyan
  filter: opacity(85%)
  &:hover
    box-shadow: 0px 0px 10px #102f36 inset
    filter: opacity(100%)
  img
    height: 28pt
    margin-right: 5px
</style>