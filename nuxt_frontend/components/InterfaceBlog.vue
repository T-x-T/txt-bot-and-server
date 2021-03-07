<template>
  <div id="wrapper">
    <h1>Blog post editor</h1>

    <button id="newPost" v-if="!openPost" @click="newPost">New Post</button>
    <table class="hover" v-if="!openPost">
      <thead>
        <tr>
          <th>ID</th>
          <th>Date</th>
          <th>Author</th>
          <th>Title</th>
          <th>
            <select v-model="visibilityFilter">
              <option value="null" disabled>Visibilty</option>
              <option value="0">All</option>
              <option value="1">Public</option>
              <option value="2">Private</option>
            </select>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in filteredPosts" :key="index" @click="openPost = item">
          <td>{{item.id}}</td>
          <td>{{new Date(item.date).toISOString().substring(0, 10)}}</td>
          <td>{{item.author}}</td>
          <td>{{item.title}}</td>
          <td>{{item.public ? "Public" : "Private"}}</td>
        </tr>
      </tbody>
    </table>

    <div id="popup" class="hover" v-if="openPost">
      <button @click="openPost = null">Cancel</button>
      <button @click="save">Save</button>
      <div id="blogWrapper">
        <div id="edit">
          <div class="input">
            <label for="author">Author:</label>
            <select id="author" v-model="openPost.author">
              <option value="ExxPlore">ExxPlore</option>
              <option value="TxT">TxT</option>
            </select>
          </div>
          <div class="input">
            <label for="title">Title:</label>
            <input id="title" type="text" v-model="openPost.title">
          </div>
          <div class="input">
            <label for="date">Date:</label>
            <input type="date" v-model="openPost.date">
          </div>
          <div class="input">
            <label for="public">Visibilty:</label>
            <select v-model="openPost.public">
              <option :value="true">Public</option>
              <option :value="false">Private</option>
            </select>
          </div>
          <div id="editBody">
            <button @click="openPost.body += '<h3></h3>'">Append heading</button>
            <button @click="openPost.body += '<p></p>'">Append p</button>
            <button @click="openPost.body += '<ul class=\'rules\'>\n  <li>XP farms of any kind</li>\n</ul>'">Append list</button>
            <button @click="openPost.body += '<div class=\'article-img big\'><img src=\'link\'><span class=\'subtitle\'>Subtitle</span></div>'">Append big img</button>
            <button @click="openPost.body += '<div class=\'article-img\'><img src=\'link\'><span class=\'subtitle\'>Subtitle</span></div>'">Append small img</button>
            <textarea v-model="openPost.body"></textarea>
          </div>
        </div>
        <div id="post">
          <BlogSinglePost :post="openPost" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

#wrapper
  margin-bottom: 50px

#popup
  background: $pax-darkcyan
  padding: 1vw
  width: 100vw
  padding-bottom: 150px

button#newPost
  margin-left: 20vw
  margin-bottom: 25px

#blogWrapper
  display: flex
  #edit
    width: 50vw
    label
      position: initial
      display: inline
      top: 0
      left: 0
      opacity: 1
      font-size: 14pt
      color: white
      @extend .pax-p
    input
      position: inline
      width: 25vw
      color: white
    textarea
      height: 1000px
    #editBody
      margin-top: 25px
  #post
    width: 48vw
    padding: 1vw
</style>

<script>
export default {
  data: () => ({
    posts: [],
    filteredPosts: [],
    visibilityFilter: null,
    openPost: null,
  }),

  props: {
    token: String
  },

  async mounted(){
    this.refresh();
  },

  watch: {
    visibilityFilter(){
      this.filter();
    }
  },

  methods: {
    async refresh(){
      this.posts = (await this.$axios.$get("/api/blog")).sort((a, b) => b.id - a.id);
      this.filter();
    },

    filter(){
      if(this.visibilityFilter === null){
        this.filteredPosts = this.posts;
      }else{
        this.filteredPosts = this.posts.filter(x => this.visibilityFilter == "0" ? true : this.visibilityFilter == "1" ? x.public : !x.public);
      }
    },

    async save(){
      console.log(typeof this.openPost.id)
      try{
        if(typeof this.openPost.id == "number"){
          await this.$axios.put("/api/blog", this.openPost);
        }else{
          await this.$axios.post("/api/blog", this.openPost);
        }
        this.openPost = null;
        this.refresh();
      }catch(e){
        window.alert(e);
      }
    },

    newPost(){
      this.openPost = {
        author: "ExxPlore",
        body: "",
        date: new Date().toISOString().substring(0, 10),
        public: false,
        title: ""
      };
    },
  }
}
</script>