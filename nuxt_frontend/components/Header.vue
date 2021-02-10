<template>
  <div>
    <NuxtLink to="/">Home</NuxtLink>
    <NuxtLink to="/">Somewhere</NuxtLink>
    <NuxtLink to="/">Still Home</NuxtLink>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div
  background: $pax-darkcyan
  display: flex
  flex-wrap: nowrap
  align-items: stretch
  justify-content: center
  position: sticky
  top: 0px
  width: 100%
  z-index: 100
  box-shadow: 0px 0px 5px #102f36 inset
  a
    color: white
    text-decoration: none
    @extend .pax-semibold
    font-size: 20pt
    padding: 0.3% 3% 0.3% 3%
    &:hover
      text-shadow: 0px 0px 10px $pax-lightcyan
</style>