<template>
  <div class="background-bright">
    <div id="section_howToJoin" class="scrollTarget"></div>

    <div class="grid">
      
      <h1 class="join1">How to join</h1>

      <p class="join2">To gain access to our Minecraft server, you will need to write an application. We're looking forward to hearing from you!</p>
      
      <ol class="join3">
        <li>Authenticate with Discord</li>
        <li>Write your application</li>
        <li>Wait for the response mail</li>
      </ol>
        
      <a class="join4" :href="$config.discordOauthJoinUs" target="blank"><button>Apply Now</button></a>
    </div>
    
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div.grid
  display: grid
  grid-template-columns: 1fr 1fr
  grid-template-rows: 100px 140px
  gap: 0px 0px
  grid-template-areas: "join1 ." "join2 join3" ". join4"
  width: fit-content
  margin: 0 auto
  padding-bottom: 40px
  h1
    background: $pax-lightcyan
    width: fit-content
    padding-left: 20px
    padding-right: 20px
    margin: 0
  p
    background: $pax-darkestcyan
    width: 250px
    padding: 10px 20px
  ol
    border: none
    background: none
    padding: 0
    li
      background: $pax-darkestcyan
      padding: 5px 15px
      margin-bottom: 7px
      &::before
        margin: -5px 0 0 -45px
        font-size: 100%
        padding: 5px 12px
  button
    font-size: 16pt
    text-transform: uppercase
    padding: 8px 20px
    margin: 0 auto
    display: block
    margin-top: -10px
.join1
  grid-area: join1
  align-self: end
.join2
  grid-area: join2
.join3
  grid-area: join3
  align-self: start
.join4
  grid-area: join4

</style>