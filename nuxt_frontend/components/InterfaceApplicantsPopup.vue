<template>  
  <div id="popup">
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
        <div v-if="openApplication.status == 1">
          <input v-if="customDenyReason" v-model="denyReason" type="text">
          <select v-if="!customDenyReason" v-model="denyReason" @change="customDenyReason = true">
            <option value="">Deny reason</option>
            <option value="">Custom</option>
            <option value="Your application was a bit too short, so try adding some more depth and detail.">Your application was a bit too short, so try adding some more depth and detail.</option>
            <option value="Your application didn't contain any pictures of your previous builds. If you have trouble with adding them, then please let us help you by joining our Discord server.">Your application didn't contain any pictures of your previous builds. If you have trouble with adding them, then please let us help you by joining our Discord server.</option>
          </select>
          <div class="buttons" v-if="openApplication.status == 1">
            <button id="accept" @click="accept" :disabled="customDenyReason">Accept</button>
            <button id="deny" @click="deny">Deny</button>
          </div>
        </div>
        <div v-if="openApplication.status == 2">
          <input v-if="customDenyReason" v-model="denyReason" type="text" readonly>
        </div>
        <p v-if="errorMessage">{{errorMessage}}</p>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

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
      &:disabled
        opacity: 0.5
    button
      width: 45%
      color: $pax-white
    button#accept
      background: $pax-green
    button#deny
      background: $pax-red
  #status
    display: flex
    flex-wrap: wrap
</style>

<script>
export default {
  data: () => ({
    denyReason: "",
    customDenyReason: false,
    errorMessage: "",
  }),

  props: ["openApplication"],

  mounted() {
    if(this.openApplication.deny_reason) {
      this.customDenyReason = true;
      this.denyReason = this.openApplication.deny_reason;
    }
  },

  methods: {
    closePopup(){
      this.$emit("close");
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