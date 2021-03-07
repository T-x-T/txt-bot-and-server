<template>
  <main>
    <h1>Staff Interface</h1>
    <div v-if="accessLevel < 7">
      <p>You're not cool enough to see anything here. Besides this message of course</p>
      <NuxtLink to="/">Go home</NuxtLink>
    </div>

    <div v-if="accessLevel >= 7">
      <InterfaceApplicants :token="token" />
    </div>
    
    <div v-if="accessLevel >= 9">
      <InterfaceBlog :token="token" />
    </div>
  </main>
</template>

<style lang="sass" scoped>

</style>

<script>
export default {
  data: () => ({
    token: null,
    accessLevel: null,
  }),

  async fetch(){
    if(process.server){
      if(this.$route.query.code) await this.turnCodeIntoToken();
    }else{
      window.location.href = this.$config.discordOauthInterface;
    }
  },

  async mounted(){
    if(!this.$route.query.code){
      window.location.href = this.$config.discordOauthInterface;
    }
    if(this.token){
      window.document.cookie = `access_token=${this.token};Max-Age=21000};path=/`;
    }
    window.history.replaceState({}, null, "/interface");
  },

  methods: {
    async turnCodeIntoToken(){
      try{
        const res = await this.$axios.$get("/api/tokenfromcode?code=" + this.$route.query.code);
        this.token = res.access_token;
        this.accessLevel = res.access_level;
      }catch(e){
        console.error("Failed to get token from code: ", e.response.data.err);
      }
    }
  }
}
</script>