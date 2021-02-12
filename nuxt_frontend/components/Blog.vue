<template>
  <div id="wrapper">
    <h1>Blog</h1>

    <article>
      <BlogSinglePost :post="posts[posts.length - 1]" />
      
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
  data: () => ({
    posts: null
  }),

  async fetch(){
    this.posts = await this.$axios.$get("/api/blog?public");
  }
}
</script>