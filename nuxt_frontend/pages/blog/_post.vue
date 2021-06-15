<template>
  <div id="wrapper">
    <Header />
    
    <div id="spacer"></div>

    <BlogSinglePost id="post" v-if="blog" :post="blog" />
    
    <div v-if="!blog">
      <p id="loading">loading...</p>
    </div>

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

#spacer
  margin-top: 150px

#loading
  text-align: center

button#back
  margin: 20px
  svg
    height: 18px
    margin-bottom: -4px

#post
  padding: 10vh 25vw
  background: $pax-darkestcyan
  @media screen and ($mobile)
    width: 90vw
    padding: 5vh 5vw

</style>

<script>
export default {
  head: {
    title: "Blog"
  },

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