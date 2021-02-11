<template>
  <div>
    <ol>
    <p>How to join:</p>
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
  background-color: $pax-cyan
  color: white
  display: flex
  justify-content: center
  align-content: center

ol
  padding: 25px 25px 25px 35px
  margin: 1%
  background-color: $pax-darkcyan
  display: inline-block
  box-shadow: 0px 0px 15px #102f36 inset
li
  @extend .pax-regular
  font-size: 14pt
  list-style-type: decimal

p
  @extend .pax-semibold
  font-size: 20pt

a
  color: $pax-white
  @extend .pax-semibold
  &:hover
    color: $pax-lightcyan

button
  @extend .pax-semibold
  font-size: 20pt
  box-shadow: 0px 0px 5px #102f36 inset
  width: 100%
</style>