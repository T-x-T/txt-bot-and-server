<template>
  <main>
    <Header />
    <h1>Staff Interface</h1>
    <div v-if="accessLevel < 7">
      <p class="noPerms">You're not cool enough to see anything here. But still pretty cool!</p>
      <p class="goHome"><NuxtLink to="/">Go home</NuxtLink></p>
    </div>

    <div v-if="accessLevel >= 7">
      <div id="nav">
        <button ref="applicants" class="secondary" @click="activeSection = 'applicants'">Applications</button>
        <button ref="applicationStats" class="secondary" @click="activeSection = 'applicationStats'">Application Statistics</button>
        <button ref="members" class="secondary" @click="activeSection = 'members'">Members</button>
        <button ref="blog" class="secondary" @click="activeSection = 'blog'" v-if="accessLevel >= 9">Blog</button>
      </div>
      <InterfaceApplicants v-if="activeSection == 'applicants'" />
      <InterfaceApplicationStats v-if="activeSection == 'applicationStats'" />
      <InterfaceMembers v-if="activeSection == 'members'" />
    </div>
    
    <div v-if="accessLevel >= 9">
      <InterfaceBlog v-if="activeSection == 'blog'" />
    </div>
  </main>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

main
  margin: 120px 0 20px 0

p.noPerms
  width: 30%
  margin: 0 auto
  background: $pax-red
  color: $pax-white
  padding: 10px 20px
  @extend .pax-semibold

p.goHome
  width: 30%
  margin: 20px auto
  background: $pax-lightcyan
  color: $pax-white
  padding: 10px 20px
  @extend .pax-semibold

div#nav
  display: flex
  justify-content: center
  button
    margin: 20px
    padding: 10px 20px 10px 20px
    font-size: 20px
  button.active
    background: $pax-yellow
</style>

<script>
export default {
  head: {
    title: "Super duper Staff interface"
  },

  data: () => ({
    token: null,
    accessLevel: null,
    activeSection: "applicants"
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
      if(this.$refs[this.activeSection]) this.$refs[this.activeSection].classList.add("active");
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
  },

  watch: {
    activeSection(newVal, oldVal) {
      this.$refs[newVal].classList.add("active");
      this.$refs[oldVal].classList.remove("active");
    }
  }
}
</script>