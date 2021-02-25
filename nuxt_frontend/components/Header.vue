<template>
  <div id="outer">
    <div id="inner">
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/join-us">Apply</NuxtLink>
      <NuxtLink to="/">Sumthin</NuxtLink>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#outer
  width: 100vw
  display: flex
  justify-content: center
  position: fixed
  top: 15px
  z-index: 100
  @media screen and ($mobile)
    top: 0px

div#inner
  background: rgba(0, 0, 0, 0.25)
  display: flex
  flex-wrap: nowrap
  align-items: stretch
  justify-content: center
  width: max-content
  backdrop-filter: blur(20px)
  border-radius: 20px
  padding-left: 40px
  padding-right: 40px
  a
    color: white
    text-decoration: none
    @extend .pax-semibold
    font-size: 20pt
    padding: 20px 40px 20px 40px
    text-shadow: 0px 0px 5px #102f36
    &:hover
      text-shadow: 0px 0px 15px #102f36
      @media screen and ($desktop)
        transform: scale(1.2)
  @media screen and ($mobile)
    padding: 0
    width: 100vw
    border-radius: 0px
</style>