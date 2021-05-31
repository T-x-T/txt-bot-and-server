<template>
  <div id="wrapper">
    <Header />
    
    <BlogSinglePost id="post" v-if="blog" :post="blog" />

    <NuxtLink to="/blog">
      <button id="back">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" /></svg>
        Back to all posts
      </button>
    </NuxtLink>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

button#back
  margin: 20px
  svg
    height: 18px
    margin-bottom: -4px

#post
  margin-top: 150px
  padding: 10vh 25vw
  background: $pax-darkestcyan
  @media screen and ($mobile)
    width: 90vw
    padding: 5vh 5vw

</style>

<script>
export default {
  data: () => ({
    blog: null
  }),

  async fetch() {
    const id = this.$route.params.post.split("-")[0];
    this.blog = await this.$axios.$get(`/api/blog?public`);
    this.blog = this.blog.filter(x => x.id == id)[0];
  }
}
</script>