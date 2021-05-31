<template>
  <div id="wrapper">
    <div id="section_blog" class="scrollTarget"></div>
    <BlogSinglePost id="blog" v-if="post" :post="post" />
    <NuxtLink id="link" to="/blog">
      <button class="secondary">
        See all blog posts
      </button>
    </NuxtLink>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

#wrapper
  display: flex
  flex-direction: column
  

#blog
  background-color: $pax-darkestcyan
  width: 60%
  margin: 35px auto
  padding: 20px
  overflow: hidden
  position: relative
  @media screen and ($mobile)
    width: 90%

#link, button
  width: 400px
  position: relative
  margin: 10px auto
</style>

<script>
export default {
  data: () => ({
    post: null
  }),

  async mounted() {
    this.post = await this.$axios.$get("/api/blog?public"); 
    this.post = this.post.sort((a, b) => b.id - a.id)[0];
  }
}
</script>