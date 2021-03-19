<template>
  <div class="background-dark" ref="dynmapsWrapper">
    <div id="section_dynmaps" class="scrollTarget"></div>
    <h1>Worlds</h1>
    <div id="container">

      <div class="item">
        <a href="https://paxterya.com/dynmap/survival" target="blank">
          <h2 class="link">Survival
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg></h2>
        </a>
        <div class="overlay" @click="survivalActive = true" v-if="!survivalActive">
          <p @click="survivalActive = true" v-if="!survivalActive" class="activateDynmap">Click to navigate</p>
        </div>
        <div class="iframeContainer">
          <iframe v-if="inView" class="hover" @mouseleave="survivalActive = false" src="https://paxterya.com/dynmap/survival/?nocompass=true" loading="lazy"></iframe>
        </div>
        
      </div>    

      <div class="item">
        <a href="https://paxterya.com/dynmap/creative" target="blank">
          <h2 class="link">Creative
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg></h2>
        </a>
        <div class="overlay" @click="creativeActive = true" v-if="!creativeActive">
          <p @click="creativeActive = true" v-if="!creativeActive" class="activateDynmap">Click to navigate</p>
        </div>
        <div class="iframeContainer">
          <iframe v-if="inView" class="hover" @mouseleave="creativeActive = false" src="https://paxterya.com/dynmap/creative/?nocompass=true&mapname=surface" loading="lazy"></iframe>
        </div>
        
      </div>   

    </div>
  </div>  
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#container
  display: flex
  align-content: center
  justify-content: center
  padding: 30px 0 50px 0
  div.item
    margin: 0px 2% 2% 2%
    height: 500px
    width: 45%
    position: relative
    h2
      background: $pax-darkmodecyan1
      text-transform: uppercase
      font-size: 14pt
      text-align: center
      &:hover
        color: $pax-lightcyan
      svg.icon
        height: 15pt
        width: auto
        transform: translateY(3px)
    iframe
      border-radius: 0 0 20px 20px
      border: 0px
      width: 100%
      height: 100%
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
  width: 100%
  height: 100%
  position: absolute
  z-index: 10
  border-radius: 0 0 20px 20px
  background: rgba(0,0,0,0.5)
  .activateDynmap
      position: absolute
      text-transform: uppercase
      z-index: 11
      @extend .pax-semibold
      left: 50%
      top: 50%
      transform: translate(-50%, -50%)
      background: rgba(0,0,0,0.9)
      font-size: 14pt
      padding: 5px 10px
  &:hover
    cursor: pointer
    > .activateDynmap
          padding: 10px 20px
  svg.pointer
    color: white
    width: 75px
    height: 75px
    position: absolute
    bottom: 10px
    right: 120px
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
    inView: false,
  }),

  mounted(){
    this.$nextTick(this.setupOberserver());
  },

  methods: {
    intersect(entries){
      if(entries[0].isIntersecting){
        this.inView = true;
      }else{
        this.inView = false;
      }
    },

    setupOberserver(){
      this.$nextTick(function(){
        const options = {
          root: null,
          rootMargin: "100px",
          threshold: 0.0
        }

        const observer = new IntersectionObserver(this.intersect, options);
        observer.observe(this.$refs["dynmapsWrapper"]);
      });
    }
  }
}
</script>