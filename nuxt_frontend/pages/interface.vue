<template>
  <main>
    <h1>Staff Interface</h1>
    <p>{{token}}</p>
  </main>
</template>

<style lang="sass" scoped>

</style>

<script>
export default {
  data: () => ({
    token: null,
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
        this.token = (await this.$axios.$get("/api/tokenfromcode?code=" + this.$route.query.code)).access_token;
      }catch(e){
        console.error("Failed to get token from code: ", e.response.data.err);
      }
    }
  }
}
</script>