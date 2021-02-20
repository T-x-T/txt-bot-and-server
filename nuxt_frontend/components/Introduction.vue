<template>
  <div id="wrapper">
    <div id="bgImg">
      <div id="bgFilter">
        <img id="logo" src="~/assets/logo-icon.svg">
        <div id="container">
          <p>
            Paxterya is a close-knit and dedicated Minecraft community. What we enjoy most is the freedom Minecraft has to offer. 
            You can do anything on Paxterya: start big projects with others, construct a town, or go far away to found your very own empire. 
            <br>Let's be creative together!
            <button><img id="discordLogo" src="~/assets/Discord-Logo-White.svg" /> Join our Discord!</button>
            We use Discord as our communication platform where we also talk about Minecraft, gaming, technology and everything else.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#bgImg
  height: 75vh
  background-image: url("https://stor.paxterya.com/website/screenshots/top_04.webp")
  background-size: cover
  background-position: center
  @media screen and ($mobile)
    height: 1250px
    width: 100vw

div#bgFilter
  height: 100%
  background-image: radial-gradient(transparent 50%, rgba(0,0,0,.3) 70%), linear-gradient(0deg, rgba(0,0,0,.3) 0%, transparent 5%, transparent 80%, rgba(0,0,0,.3) 100%), linear-gradient(rgba(0,81,92,.6) 0%, rgba(0,81,92,.6) 100%)
  display: flex
  align-items: center
  justify-content: center
  @media screen and ($mobile)
    width: 100vw
img#logo
  height: 60%
  width: auto
  filter: opacity(0.5)

div#container
  display: flex
  align-content: center
  justify-content: center
  position: absolute
  z-index: 1
  @media screen and ($mobile)
    width: 100vw
p
  width: 600px
  font-size: 14pt
  max-width: 90%
  padding: 1%
  background-color: rgba(16, 47, 54, 0.5)
  box-shadow: 0px 0px 5px #102f36 inset
  @media screen and ($mobile)
    width: 80%
    font-size: 24pt

button
  width: 400px
  border-radius: 20px
  font-size: 24pt
  text-shadow: 1px 2px 0px $pax-darkcyan
  padding: 4px 24px
  margin: 25px 75px 25px 75px
  box-shadow: 0px 0px 20px $pax-cyan
  filter: opacity(85%)
  &:hover
    box-shadow: 0px 0px 10px #102f36 inset
    filter: opacity(100%)
  img
    height: 28pt
    margin-right: 5px
    margin-bottom: -10px
  @media screen and ($mobile)
    width: 80%
    margin: 20px 10% 20px 10%
    font-size: 42pt
    img
      height: 50pt
</style>