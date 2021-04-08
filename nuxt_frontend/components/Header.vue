<template>
  <div id="outer">
      <NuxtLink to="/">
        <div id="bg">
          <img id="logo" src="~/assets/logo-icon.svg">
        </div>
      </NuxtLink>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#outer
  width: 100vw
  height: 20px
  display: flex
  justify-content: center
  position: fixed
  z-index: 100
  background: $pax-darkestcyan
  top: 0

div#bg 
  background: $pax-darkestcyan
  border-radius: 0 0 50px 50px
  padding: 15px
  height: 75px
  width: 75px
  position: relative
  &:hover
    transform: scale(1.1)
  img
    position: absolute
    left: 50%
    top: 50%
    transform: translate(-50%,-50%)
    width: 75%

    
</style>