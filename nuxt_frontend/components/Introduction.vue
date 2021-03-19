<template>
  <div id="wrapper">
    <div id="bgImg" ref="bgImg">
      <div id="bgFilter">
        
        <div id="container">
          <img id="logo" src="~/assets/logo-vertical-white.svg">

          <div class="titlebar">
            <span class="left">Minecraft SMP</span>
            <span class="right">Since 2019</span>
          </div>
          <p>
            Paxterya is a close-knit and dedicated Minecraft community. What we enjoy most is the freedom Minecraft has to offer. 
            You can do anything on Paxterya: start big projects with others, construct a town, or go far away to found your very own empire.
            <br>Let's be creative together!
          </p>
          <button><img id="discordLogo" src="~/assets/Discord-Logo-Black.svg"> Join our Discord</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#bgImg
  height: 100vh
  background-image: url("https://stor.paxterya.com/website/backgrounds/intro_bg.webp")
  background-size: cover
  background-position: center
  @media screen and ($mobile)
    height: 100vh
    width: 100vw

div#bgFilter
  height: 100%
  background-image: radial-gradient(transparent 30%, rgba(0,0,0,.2) 90%), radial-gradient(rgba(255,255,255,.1) 30%, transparent 70%)
  display: flex
  align-items: center
  justify-content: center
  @media screen and ($mobile)
    width: 100vw

div#container
  max-width: 90%
  img#logo
    height: auto
    width: 200px
    margin: 0 auto
    display: block
  div.titlebar
    display: flex
    margin-top: 30px
    text-transform: uppercase
    text-align: center
    font-size: 16pt
    span.left
      background: $pax-lightcyan
      color: $pax-darkestcyan
      box-shadow: none
      width: 50%
      margin: 0
      font-family: "bold"
      padding: 5px 0
    span.right
      background: $pax-darkestcyan
      color: $pax-lightcyan
      box-shadow: none
      width: 50%
      margin: 0
      font-family: "bold"
      padding: 5px 0
  p
    width: 500px
    padding: 10px 15px
    font-size: 13pt
    background: $pax-darkestcyan
    margin: 0 auto
    margin-bottom: 20px
  button
    margin: 0 auto
    display: block
    text-transform: uppercase
    img#discordLogo
      height: 20pt
      margin-bottom: -8px
      margin-left: -5px
</style>

<script>
export default {
  mounted: function(){
    this.$nextTick(function() {
      this.$refs.bgImg.style = `height: ${this.$refs.bgImg.clientHeight}px;`
    });
  }
}
</script>