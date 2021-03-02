<template>
  <div id="wrapper">
    <div id="section_blog" class="scrollTarget"></div>
    <h1>Blog</h1>

    <div v-if="posts">
      <article class="hover" v-if="!showAllPosts">
        <div id="controls">
          <button id="prevPost" @click="prevPost()">
            <svg v-if="currentId < posts.length - 1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous post
          </button>
          <button id="allPosts" @click="showAllPosts = true">
            All posts
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button id="nextPost" @click="nextPost()">
            Next post
            <svg v-if="currentId > 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <BlogSinglePost :post="posts[currentId]" />
      </article>

      <div id="postList" v-if="showAllPosts">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Author</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in postsRevSort" :key="index" @click="currentId = index; showAllPosts = false">
              <td>{{new Date(item.date).toISOString().substring(0, 10)}}</td>
              <td>{{item.author}}</td>
              <td>{{item.title}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="!posts">
      <p>
        Oh no, we could not load any blog posts 
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
        <br>
        <button @click="reload()">Try again</button>
      </p>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#wrapper
  padding-bottom: 4%

article
  background: $pax-darkcyan
  width: 60%
  margin: 2%
  padding: 20px
  overflow: hidden
  left: 18%
  position: relative
  @media screen and ($mobile)
    width: 98vw
    margin: 0
    left: 0
    padding: 1vw
    filter: none

button
  font-size: 20pt
  box-shadow: 0px 0px 15px #102f36
  padding: 5px 20px 5px 20px
  width: max-content
  &:hover
    box-shadow: 0px 0px 5px #102f36 inset
  svg
    height: 28pt
    width: auto
    margin-bottom: -10px

div#controls
  display: flex
  justify-content: space-around
  margin-bottom: 2%
  @media screen and ($mobile)
    flex-direction: column
    margin-bottom: 20px
    button
      width: 90vw

p
  text-align: center
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
    postsRevSort: null,
    currentId: 0,
    showAllPosts: false
  }),

  async fetch(){
    await this.reload();
  },

  methods: {
    prevPost: function() {
      if(this.currentId < this.posts.length - 1) this.currentId++;
    },
    nextPost: function() {
      if(this.currentId > 0) this.currentId--;
    },
    reload: async function() {
      this.posts = await this.$axios.$get("/api/blog?public")
        .catch((e) => console.error("Couldnt load blog posts: " + e));
      if(this.posts) this.postsRevSort = this.posts.sort((a, b) => b.id - a.id);
      this.currentId = 0;
    }
  }
}
</script>