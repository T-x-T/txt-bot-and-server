<template>
  <div id="wrapper">
    <h1>Applications</h1>
    
    <div v-if="!openApplication">
      <table>
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
            <th>
              <select v-model="statusFilter">
                <option value="null" disabled>Status</option>
                <option value="">All</option>
                <option value="1">Pending review</option>
                <option value="2">Denied</option>
                <option value="3">Accepted</option>
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filteredApplications.slice(0, limit)" :key="index" @click="openPopup(item)" :class="rowClasses[index]">
            <td >{{item.id}}</td>
            <td>{{new Date(item.timestamp).toLocaleString("de")}}</td>
            <td>{{item.discord_nick}}</td>
            <td>{{item.mc_ign}}</td>
            <td>{{item.about_me}}</td>
            <td>{{item.status == 1 ? "Pending review" : item.status == 2 ? "Denied": "Accepted"}}</td>
          </tr>
        </tbody>
      </table>
      <div id="tableControls" >
        <button class="secondary" @click="refresh">refresh</button>
        <button class="secondary" @click="showMore">show more</button>
        <button class="secondary" @click="showLess">show less</button>
      </div>
    </div>

    <div id="popup" v-if="openApplication">
      <button id="back" @click="closePopup">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" /></svg>
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
          <div class="buttons">
            <button id="accept" @click="accept">Accept</button>
            <button id="deny" @click="deny">Deny</button>
          </div>
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

h1
  margin: 20px 0

table
  tr.green td:last-child
    background: $pax-green
  tr.red td:last-child
    background: $pax-red
  @media screen and ($mobile)
    col
      width: auto !important
    th:nth-child(1), td:nth-child(1), th:nth-child(2), td:nth-child(2), th:nth-child(3), td:nth-child(3), th:nth-child(5), td:nth-child(5)
      display: none

#tableControls
  margin-top: 30px
  width: 80%
  margin: 10px auto
  display: flex
  justify-content: center
  button.secondary
    width: 25%
    margin: 0 10px

#status
  display: flex
  flex-wrap: wrap
.value
  margin: 20px 30px 0 0
  display: block
  h3, p
    color: white
    display: inline
    padding: 3px 10px 5px 10px
    font-size: 12pt
    white-space: nowrap
  p
    background: $pax-cyan
  h3
    background: $pax-darkestcyan

#popup
  width: 50%
  margin: 0 auto
  @media screen and ($mobile)
    width: 90%
    padding: 5vw
    margin: 0
  button#back
    svg
      height: 18px
      margin-bottom: -4px
  #grid
    display: grid
    grid-template-columns: 50% 50%
    grid-template-rows: 200px "*" 100px 100px
    @media screen and ($mobile)
      grid-template-columns: 100%
      grid-template-rows: repeat(5, max-content)
    #texts, #status, #controls
      @media screen and ($desktop)
        grid-column: 1 / span 2
  #avatars
    justify-self: end
    img
      height: 200px
      margin-left: 25px
  #texts
    margin: 20px 0 50px 0
    h4
      color: white
      font-size: 16pt
    .text
      margin: 10px 0 10px 0
  #controls
    margin-top: 20px
    width: 100%
    select
      width: 100%
    .buttons
      display: flex
      justify-content: space-between
    button
      width: 45%
      color: $pax-white
    button#accept
      background: $pax-green
    button#deny
      background: $pax-red
</style>

<script>
export default {
  data: () => ({
    applications: [],
    filteredApplications: [],
    limit: 20,
    rowClasses: [],
    openApplication: null,
    denyReason: "",
    customDenyReason: false,
    errorMessage: "",
    statusFilter: null,
  }),

  props: {
    token: String
  },

  async mounted(){
    await this.refresh();
    setInterval(this.refresh, 1000 * 60);
  },

  watch: {
    statusFilter(newStatus, oldStatus){
      this.filter("status", newStatus);
    }
  },

  methods: {
    async refresh(){
      this.applications = (await this.$axios.$get("/api/applications")).sort((a, b) => b.id - a.id);
      this.filter("status", this.statusFilter);
    },

    filter(property, value){
      if(property && value){
        this.filteredApplications = this.applications.filter(x => x[property] == value);
      }else{
        this.filteredApplications = this.applications;
      }

      this.rowClasses = this.filteredApplications.map(x => x.status == 1 ? "" : x.status == 2 ? "red" : "green");
    },

    showMore(){
      this.limit < this.applications.length ? this.limit += 20 : this.limit = this.applications.length;
      this.refresh();
    },

    showLess(){
      this.limit > 20 ? this.limit -= 20 : this.limit = 20;
      this.refresh();
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