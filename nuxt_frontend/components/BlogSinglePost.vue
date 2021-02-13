<template>
  <div>
    <h4>{{post.title}}</h4>
    <img class="author" :src="require(`../assets/avatar-${post.author.toLowerCase()}.png`)">
    <span class="subtitle">{{new Date(post.date).toISOString().substring(0, 10)}} Author: {{post.author}} </span>
    <div>
      <section v-html="post.body"></section>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

h4
  color: white
  font-size: 18pt

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
  margin: 10px 0 10px 10px
  clear: both
  img
    width: 250px
    min-width: 15vw
    max-width: 100%
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
  @extend .pax-p
  line-height: 1.3
  width: 80%

::v-deep a
  color: $pax-white
  @extend .pax-semibold
  &:hover
    color: $pax-lightcyan

::v-deep ul
  @extend .pax-p
  margin: 10px 0
  list-style-type: none
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