<template>
  <div id="wrapper">
    <h1>Blog</h1>

    <article v-if="!showAllPosts">
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
  overflow: hidden
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

table
  @extend .pax-regular
  border-collapse: separate
  border-spacing: 0px
  width: 60%
  white-space: nowrap
  left: 20%
  position: relative
  box-shadow: 0px 0px 15px #102f36
  filter: opacity(0.9)
  &:hover
    box-shadow: 0px 0px 50px #102f36
    filter: opacity(1)
th
  background: $pax-cyan
  color: $pax-white
  @extend .pax-semibold
  border-bottom: 2px solid $pax-darkcyan
  text-shadow: 1px 1px 0px $pax-darkcyan
  text-align: center
  font-size: 16pt
tr
  &:nth-child(even) td
    background: $pax-cyan
  &:nth-child(odd) td
    background: transparent
  &:hover > td
    cursor: pointer
td
  padding: 3px 10px
  background: #e9e9e9
  font-size: 12pt
  text-overflow: ellipsis
  white-space: inherit
  overflow: hidden
  color: $pax-black
  max-width: 150px
  text-align: center
  color: white



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
    this.posts = await this.$axios.$get("/api/blog?public");
    this.postsRevSort = this.posts.sort((a, b) => b.id - a.id);
    this.currentId = 0;
  },

  methods: {
    prevPost: function() {
      if(this.currentId < this.posts.length - 1) this.currentId++;
    },
    nextPost: function() {
      if(this.currentId > 0) this.currentId--;
    }
  }
}
</script>