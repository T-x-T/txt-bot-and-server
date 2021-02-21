<template>
  <div id="wrapper">
    <h1>Worlds</h1>
    <div id="container">

      <div class="item">
        <a href="https://paxterya.com/dynmap/survival" target="blank">
          <h1 class="link">Survival
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg></h1>
        </a>
        <div class="overlay" @click="survivalActive = true" v-if="!survivalActive">
          <svg class="pointer" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <div class="iframeContainer">
          <iframe class="hover" @mouseleave="survivalActive = false" src="https://paxterya.com/dynmap/survival/?nocompass=true"></iframe>
        </div>
        <p @click="survivalActive = true" v-if="!survivalActive">To look around, click into the Map</p>
      </div>    

      <div class="item">
        <a href="https://paxterya.com/dynmap/creative" target="blank">
          <h1 class="link">Creative
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg></h1>
        </a>
        <div class="overlay" @click="creativeActive = true" v-if="!creativeActive">
          <svg class="pointer" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <div class="iframeContainer">
          <iframe class="hover" @mouseleave="creativeActive = false" src="https://paxterya.com/dynmap/creative/?nocompass=true&mapname=surface"></iframe>
        </div>
        <p @click="creativeActive = true" v-if="!creativeActive">To look around, click into the Map</p>
      </div>   

    </div>
  </div>  
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#wrapper
  margin-bottom: 50px
  @media screen and ($mobile)
    width: 95vw

div#container
  display: flex
  align-content: center
  justify-content: center
  div.item
    margin: 0px 2% 2% 2%
    height: 750px
    width: 45%
    h1.link:hover
      color: $pax-lightcyan
    svg.icon
      height: 35pt
      width: auto
      transform: translateY(5pt)
    iframe
      border-radius: 1vw
      border: 0px
      width: 100%
      height: 90%
      &:hover
        cursor: pointer
  @media screen and ($mobile)
    flex-direction: column
    padding-bottom: 50px
    div.item
      width: 95vw
      margin: 0 2.5vw 75px 2.5vw
      

.iframeContainer
  height: 100%
  margin-bottom: -4%

div.overlay
  width: 45%
  height: 750px * 0.9
  position: absolute
  z-index: 102
  border-radius: 1vw
  &:hover
    box-shadow: 0px 0px 2vw #102f36
    cursor: pointer
  svg.pointer
    color: white
    width: 75px
    height: 75px
    position: absolute
    bottom: 10px
    right: 10px
  @media screen and ($mobile)
    width: 95vw
    margin: 0 2.5vw 75px 2.5vw
    left: -3px
    svg.pointer
      right: 50px

p
  text-align: center
  cursor: pointer
  @media screen and ($mobile)
    font-size: 18pt
    margin-top: -75px

</style>

<script>
export default {
  data: () => ({
    survivalActive: false,
    creativeActive: false,
  })
}
</script>