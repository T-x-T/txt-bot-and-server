<template>
  <div id="wrapper">
    <p>Worlds</p>
    <div id="container">

      <div class="item">
        <a href="https://paxterya.com/dynmap/survival" target="blank">
          <p class="link">Survival
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg></p>
        </a>

        <iframe src="https://paxterya.com/dynmap/survival/?nocompass=true"></iframe>
      </div>    

      <div class="item">
        <a href="https://paxterya.com/dynmap/creative" target="blank">
          <p class="link">Creative
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg></p>
        </a>
        
        <iframe src="https://paxterya.com/dynmap/creative/?nocompass=true&mapname=surface"></iframe>
      </div>   

    </div>
  </div>  
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#wrapper
  background-color: $pax-darkcyan
  height: 70vh

p
  @extend .pax-semibold
  text-align: center
  color: white
  font-size: 30pt
  text-shadow: 0px 0px 5px #102f36
  padding: 1%

div#container
  display: flex
  align-content: center
  justify-content: center
  div.item
    margin: 0px 2% 2% 2%
    height: 50vh
    width: 45vw
    p.link:hover
      color: $pax-lightcyan
    svg
      height: 35pt
      width: auto
      transform: translateY(5pt)
    iframe
      border-radius: 1vw
      filter: opacity(0.85)
      box-shadow: 0px 0px 15px #102f36
      width: 100%
      height: 90%
      &:hover
        filter: opacity(1)
        box-shadow: 0px 0px 2vw #102f36
        cursor: pointer
</style>