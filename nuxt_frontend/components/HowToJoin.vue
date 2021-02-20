<template>
  <div class="background">
    <h1>How to join</h1>
    <ol class="hover">
      <li>(Optional) Join our <a href="https://discord.gg/mAjZCTG" target="blank">Discord server</a></li>
      <li>Authenticate with Discord below</li>
      <li>Fill out the form</li>
      <li>Wait less than a day</li>
      <li>Check your E-Mails to see if you have been accepted</li>
      <a href="https://discord.com/oauth2/authorize?client_id=624980994889613312&redirect_uri=https%3A%2F%2Fpaxterya.com%2Fjoin-us.html&response_type=code&scope=identify" target="blank"><button>Authenticate with Discord</button></a>
    </ol>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div
  padding: 1%
  display: flex
  justify-content: center
  align-items: center
  flex-direction: column

ol
  padding: 25px 25px 25px 35px
  margin: 1%
  background-color: $pax-cyan
  width: 450px
  @media screen and ($mobile)
    width: 70vw
    margin-bottom: 25px

li
  @extend .pax-regular
  color: white
  font-size: 14pt
  list-style-type: decimal

p
  @extend .pax-semibold
  font-size: 20pt

a:hover
  color: $pax-darkcyan

button
  @extend .pax-semibold
  background: $pax-darkcyan
  font-size: 20pt
  width: 100%
  box-shadow: 0px 0px 5px #102f36 inset
  &:hover
    box-shadow: 0px 0px 15px #102f36 inset
</style>