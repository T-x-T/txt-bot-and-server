<template>
  <div id="wrapper">
    <h1>Applications</h1>
    
    <div v-if="!openApplication">
      <table class="hover">
        <colgroup>
          <col style="width: 100px;">
          <col style="width: 200px;">
          <col style="width: 320px;">
          <col style="width: 200px;">
          <col>
          <col style="width: 200px;">
        </colgroup>
        <thead>
          <tr>
            <th>ID</th>
            <th>Timestamp</th>
            <th>Discord</th>
            <th>IGN</th>
            <th>About me</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in applications.slice(0, limit)" :key="index" @click="openPopup(item)">
            <td>{{item.id}}</td>
            <td>{{new Date(item.timestamp).toLocaleString("de")}}</td>
            <td>{{item.discord_nick}}</td>
            <td>{{item.mc_ign}}</td>
            <td>{{item.about_me}}</td>
            <td>{{item.status == 1 ? "Pending review" : item.status == 2 ? "Denied": "Accepted"}}</td>
          </tr>
        </tbody>
      </table>
      <div id="tableControls" >
        <button @click="refresh">refresh</button>
        <button @click="limit+=20">show more</button>
        <button @click="limit-=20">show less</button>
      </div>
    </div>

    <div id="popup" class="hover" v-if="openApplication">
      <button id="back" @click="closePopup">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        back
      </button>
      <div id="grid">
        <div id="basicInfo">
          <div class="value">
            <h3>Discord</h3><p>{{openApplication.discord_nick}}</p>
          </div>
          <div class="value">
            <h3>IGN</h3><p>{{openApplication.mc_ign}}</p>
          </div>
          <div class="value">
            <h3>Country</h3><p>{{openApplication.country}}</p>
          </div>
          <div class="value">
            <h3>Age</h3><p>~{{openApplication.birth_month > new Date(Date.now()).getMonth() + 1 ? Number(new Date().getFullYear() - openApplication.birth_year) - 1 : Number(new Date().getFullYear() - openApplication.birth_year) }}</p>
          </div>
        </div>

        <div id="avatars">
          <img :src="openApplication.discord_avatar_url">
          <img :src="openApplication.mc_skin_url">
        </div>

        <div id="texts">
          <div class="text">
            <h4>About me</h4>
            <p>{{openApplication.about_me}}</p>
          </div>
          <div class="text">
            <h4>Motivation</h4>
            <p>{{openApplication.motivation}}</p>
          </div>
          <div class="text">
            <h4>Build images</h4>
            <p>{{openApplication.build_images}}</p>
          </div>
        </div>

        <div id="status">
          <div class="value">
            <h3>Publish about me</h3><p>{{openApplication.publish_about_me ? "Yes" : "No"}}</p>
          </div>
          <div class="value">
            <h3>Publish Country</h3><p>{{openApplication.publish_country ? "Yes" : "No"}}</p>
          </div>
          <div class="value">
            <h3>Publish Age</h3><p>{{openApplication.publish_age ? "Yes" : "No"}}</p>
          </div>
          <div class="value">
            <h3>Current Status</h3><p>{{openApplication.status == 1 ? "Pending review" : openApplication.status == 2 ? "Denied" : "Accepted"}}</p>
          </div>
        </div>

        <div id="controls">
          <input v-if="customDenyReason" v-model="denyReason" type="text">
          <select v-if="!customDenyReason" v-model="denyReason" @change="customDenyReason = true">
            <option value="">Deny reason</option>
            <option value="">Custom</option>
            <option value="Your application was a bit too short, so try adding some more depth and detail.">Your application was a bit too short, so try adding some more depth and detail.</option>
            <option value="Your application didn't contain any pictures of your previous builds. If you have trouble with adding them, then please let us help you by joining our Discord server.">Your application didn't contain any pictures of your previous builds. If you have trouble with adding them, then please let us help you by joining our Discord server.</option>
          </select>
          <button id="accept" @click="accept">Accept</button>
          <button id="deny" @click="deny">Deny</button>
          <p v-if="errorMessage">{{errorMessage}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

#wrapper
  margin-bottom: 50px

table
  table-layout: fixed
  width: 80%
  left: 10%

#tableControls
  margin-top: 25px
  margin-left: 10%

.value
  margin: 20px 30px 0 0
  h3, p
    color: white
    display: inline
    padding: 3px 10px 5px 10px
    font-size: 14pt
  p
    background: $pax-cyan
  h3
    background: $pax-darkestcyan

#popup
  width: 50vw
  margin-left: 25vw
  background: $pax-darkcyan
  padding: 25px
  button#back
    font-size: 14pt
    svg
      height: 28px
      margin-bottom: -7px
    &:hover
      background: $pax-cyan
      filter: drop-shadow( 0px 0px 8px rgba(0, 0, 0, .7))
  #grid
    display: grid
    grid-template-columns: 50% 50%
    grid-template-rows: 10% 30% 10%
    #texts, #status
      grid-column: span 2
  #avatars
    justify-self: end
    img
      height: 200px
      margin-left: 25px
  #texts
    margin: 20px 0 25px 0
    h4
      color: white
      font-size: 16pt
    .text
      margin: 10px 0 10px 0
  #status
    .value
      display: inline
  #controls
    margin-top: 20px
    input
      color: white
    select
      width: 90%
    button
      padding: 5px 20px 5px 20px
      margin: 10px 20px 10px 0
      width: 100px
      &:hover
        filter: drop-shadow( 0px 0px 8px rgba(0, 0, 0, .7))
    button#accept
      background: #2a9e75
    button#deny
      background: #841717 !important
</style>

<script>
export default {
  data: () => ({
    applications: [],
    limit: 20,
    openApplication: null,
    denyReason: "",
    customDenyReason: false,
    errorMessage: "",
  }),

  props: {
    token: String
  },

  async fetch(){
    await this.refresh();
  },

  mounted(){
    setInterval(this.refresh, 1000 * 60);
  },

  methods: {
    async refresh(){
      this.applications = (await this.$axios.$get("/api/applications")).sort((a, b) => b.id - a.id);
    },

    async openPopup(application){
      try{
        this.openApplication = application;
        this.openApplication = await this.$axios.$get("/api/applications?id=" + application.id);
      }catch(e){
        window.alert(e.response.data.err);
      }
    },

    closePopup(){
      this.openApplication = null;
      this.denyReason = null;
      this.customDenyReason = false;

      this.refresh();
    },

    async accept(){
      try{
        await this.$axios.patch("/api/applications", {id: this.openApplication.id, status: 3});
        this.closePopup();
      }catch(e){
        this.errorMessage = e.response.data.err;
      }
    },

    async deny(){
      try{
        await this.$axios.patch("/api/applications", {id: this.openApplication.id, status: 2, reason: this.denyReason});
        this.closePopup();
      }catch(e){
        this.errorMessage = e.response.data.err;
      }
    }
  }
}
</script>