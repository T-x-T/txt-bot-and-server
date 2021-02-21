<template>
  <div id="wrapper">
    <h4>{{post.title}}</h4>
    <img class="author" :src="require(`../assets/avatar-${post.author.toLowerCase()}.png`)" loading="lazy"/>
    <span class="subtitle">{{new Date(post.date).toISOString().substring(0, 10)}} Author: {{post.author}} </span>
    <div>
      <section v-html="post.body"></section>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#wrapper
  @media screen and ($mobile)
    width: 90vw 

h4
  color: white
  font-size: 18pt
  @media screen and ($mobile)
    max-width: 60vw

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

section
  padding: 10px 10px 0 10px 

::v-deep section
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

::v-deep h3
  color: white

::v-deep span.subtitle
  @extend .pax-regular
  background: $pax-darkestcyan
  display: block
  background: $pax-darkgray
  color: $pax-white
  font-size: 10pt
  padding: 3px 10px

::v-deep .article-img
  float: right
  box-shadow: 0px 0px 15px #102f36
  margin: 10px 35px 10px 10px
  clear: both
  max-width: 90vw
  img
    width: 250px
    min-width: 15vw
    vertical-align: bottom
  &:hover
    box-shadow: 0px 0px 35px #102f36
::v-deep .big
  img
    width: 500px
    min-width: 30vw
    max-width: 100%
    box-shadow: 0px 0px 35px #102f36
    &:hover
      box-shadow: 0px 0px 50px #102f36

::v-deep p
  line-height: 1.3
  width: 80%
  @media screen and ($mobile)
    width: 80vw

::v-deep a
  color: $pax-white
  @extend .pax-semibold
  &:hover
    color: $pax-lightcyan

::v-deep ul
  @extend .pax-p
  margin: 10px 0
  list-style-type: none
  max-width: 80%
  li:before
    content: "▪"
    color: $pax-cyan
    padding-right: 5px

::v-deep summary
  @extend .pax-semibold
  color: $pax-lightcyan
  margin-top: 10px
  &:hover
    cursor: pointer
  &:focus
    outline: none

::v-deep b
  @extend .pax-semibold
  color: $pax-lightcyan

::v-deep button
  &:hover
    background: $pax-cyan
    box-shadow: 0px 0px 25px #102f36

</style>

<script>
export default {
  props: {
    post: Object
  }
}
</script>