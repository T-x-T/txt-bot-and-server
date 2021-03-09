<template>
  <div id="outer">
      <NuxtLink to="/">
        <div id="bg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </div>
      </NuxtLink>
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

div#bg 
  background: rgba(0, 0, 0, 0.25)
  backdrop-filter: blur(10px)
  border-radius: 100%
  padding: 15px
  height: 75px
  width: 75px
  &:hover
    transform: scale(1.1)

svg
  color: white
  height: 100%
  width: 100%
  opacity: 0.5
  margin-top: -2px
  &:hover
    opacity: 1
</style>