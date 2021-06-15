<template>
  <div class="background">
    <h1>Blog</h1>

    <div v-if="posts">
      <article v-for="(item, index) in posts" :key="index">
        <NuxtLink :to="`/blog/${item.id.toString()}-${new Date(item.date).toISOString().substring(0, 10)}-${item.title.replace(/ /g, '-')}`">
          <BlogSinglePost :post="item" />
          <p>Click to expand</p>
        </NuxtLink>
      </article>
    </div>

    <div v-if="!posts && error">
      <p id="error">
        Oh no, we could not load any blog posts 
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
        <br>
        <button @click="reload()">Try again</button>
      </p>
    </div>

    <div v-if="!posts && !error">
      <p>loading some blog posts...</p>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

article
  background-color: $pax-darkestcyan
  width: 60%
  margin: 35px auto
  padding: 20px
  overflow: hidden
  position: relative
  @media screen and ($mobile)
    width: 90%

button
  background: $pax-darkcyan
  color: $pax-lightcyan
  &:hover
    color: $pax-darkestcyan
  svg
    height: 18pt
    width: auto
    margin-bottom: -7px

p
  text-align: center
p#error
  font-size: 16pt
  svg
    height: 24pt
    width: auto
    margin-bottom: -6pt

</style>

<script>
export default {
  data: () => ({
    posts: null,
    error: false
  }),

  async fetch(){
    await this.reload();
  },

  methods: {
    async reload() {
      try {
        this.posts = await this.$axios.$get("/api/blog?public"); 
        this.posts = this.posts.sort((a, b) => b.id - a.id);
        
        this.posts = this.posts.map(x => {
          x.body = x.body.split("<div")[0];
          x.body = x.body.slice(0, 499);
          x.body += "...";
          return x;
        });   
      } catch (e) {
        this.error = true;
      }
    }
  }
}
</script>