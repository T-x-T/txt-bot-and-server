<template>
  <div id="wrapper">
    <h1>Blog</h1>

    <article>
      <h4>Blog title</h4>
      <img class="author" src="~/assets/avatar-txt.png">
      <span class="subtitle">2021-02-12 Author: TxT </span>
      <section>
        <p>Welcome on the brand new website of Paxterya, a soon-to-be Vanilla Minecraft server! Minecraft has been revived lately and we don't want to miss out on that. We, that is TxT and ExxPlore, are the admins of Paxterya. A while ago, we already hosted a Minecraft survival server which was tons of fun. But this time it's going to be even better! We present to you the basic concept of Paxterya:</p>

      <h3>Vanilla Survival</h3>
      <p>On Paxterya, you get the full Vanilla Minecraft experience. You start from scratch like in Singleplayer, but with the advantage of a welcoming community around you!</p>

      <div class="article-img">
<picture>
       <source srcset="https://stor.paxterya.com/website/articles/article1.webp" type="image/webp">
        <img src="https://stor.paxterya.com/website/articles/article1.jpg">
</picture>
<span class="subtitle">The Spawn Hub on Paxterya</span>
      </div>

      <h3>Build a Town</h3>
      <p>Our goal is to build a medieval themed town around the spawn of the map. If you are not a fan of this building style or if you would rather live on your own, then you can also explore the world and set your own base up.</p>

      <h3>Be Independent</h3>
      <p>If you don't choose to build in the spawn area, you can go rural and build in whatever style you like outside of our town! Our world has no limits besides the sky! You could even create your own cities and communities or build huge farms.

        <h3>Vanilla-ish Survival?</h3>
        <p>Well, when we say Vanilla we mean that your experience is just like in Vanilla singleplayer, with some modifications to make playing together smoother. This includes a plugin with which only half the players need to sleep, <a href="https://play.paxterya.com/dynmap">Dynmap</a>, so you can view Paxterya's map wherever you go, and last but not least a plugin that helps us figuring out who burned your home down. If so.</p>

        <h3>Sounds good?</h3>
        <p>Did this quick overview make you feel like joining? Paxterya is going to launch on <b>December 1st, 2019</b>, but you can already <b><a href="https://discord.gg/mAjZCTG">join our Discord server</a></b> and <b><a href="join-us.html">apply</a></b>! See you soon!</p>
     
      </section>
      
      <button>
        All posts
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>

    </article>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#wrapper
  background-color: $pax-darkcyan
  padding-bottom: 4%

article
  color: $pax-white
  width: 60%
  margin: 2%
  padding: 20px
  padding-bottom: 80px
  left: 20%
  position: relative
  box-shadow: 0px 0px 15px #102f36
  filter: opacity(0.9)
  &:hover
    box-shadow: 0px 0px 50px #102f36
    filter: opacity(1)


section
  border-left: 5px solid $pax-darkgray
  padding: 10px
  & p:first-of-type::first-letter, p.initial-letter:first-of-type::first-letter
    color: $pax-cyan
    font-weight: bold
    font-size: 270%
    float: left
    line-height: 40px
    padding-right: 3px
    text-shadow: 0px 0px 5px rgba(0, 0, 0, .4)

h4
  color: white
  font-size: 18pt

h3
  color: white

img.author
  width: 80px
  height: auto
  float: right
  margin: -40px 50px 10px 0
  border: 3px solid black
  box-shadow: 0px 0px 20px rgba(255, 255, 255, .5)
  &:hover
    box-shadow: 0px 0px 30px rgba(255, 255, 255, .75)

span.subtitle
  @extend .pax-regular
  background: $pax-darkestcyan
  display: block
  background: $pax-darkgray
  color: $pax-white
  font-size: 10pt
  padding: 3px 10px

.article-img
  float: right
  box-shadow: 0px 0px 15px #102f36
  margin: 10px 0 10px 10px
  img
    width: 250px
    max-width: 100%
    vertical-align: bottom
    &.big
      width: 500px
      max-width: 100%
  &:hover
    box-shadow: 0px 0px 35px #102f36

p
  @extend .pax-p
  line-height: 1.3
  width: 80%

a
  color: $pax-white
  @extend .pax-semibold
  &:hover
    color: $pax-lightcyan

button
  font-size: 20pt
  box-shadow: 0px 0px 15px #102f36
  padding: 5px 20px 5px 20px
  float: right
  &:hover
    box-shadow: 0px 0px 5px #102f36 inset
  svg
    height: 28pt
    width: auto
    margin-bottom: -10px

</style>

<script>
export default {
  
}
</script>