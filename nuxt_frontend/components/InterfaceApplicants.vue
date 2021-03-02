<template>
  <div id="wrapper">
    <h1>Applications</h1>
    <table v-if="!openApplication">
      <thead>
        <th>ID</th>
        <th>Timestamp</th>
        <th>Discord</th>
        <th>IGN</th>
        <th>About me</th>
        <th>Status</th>
      </thead>
      <tbody>
        <tr v-for="(item, index) in applications" :key="index" @click="openApplication=item">
          <td>{{item.id}}</td>
          <td>{{new Date(item.timestamp).toLocaleString("de")}}</td>
          <td>{{item.discord_nick}}</td>
          <td>{{item.mc_ign}}</td>
          <td>{{item.about_me}}</td>
          <td>{{item.status == 1 ? "Pending review" : item.status == 2 ? "Denied": "Accepted"}}</td>
        </tr>
      </tbody>
    </table>

    <div id="popup" v-if="openApplication">
      <button @click="openApplication = null">back</button>

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
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

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
  #grid
    display: grid
    grid-template-columns: 50% 50%
    grid-template-rows: 10% 30% 10%
    #texts, #status
      grid-column: span 2
  img
    height: 200px
</style>

<script>
export default {
  data: () => ({
    applications: [],
    openApplication: null,
  }),

  props: {
    token: String
  },

  async fetch(){
    await this.refresh();
  },

  methods: {
    async refresh(){
      this.applications = await this.$axios.$get("/api/applications");
    }
  }
}
</script>