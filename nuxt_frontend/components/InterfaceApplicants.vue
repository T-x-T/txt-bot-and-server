<template>
  <div id="wrapper">
    <h1>Applications</h1>

    <InterfaceApplicantsTable
      v-if="!openApplication"
      :applications="applications"
      :statusFilter="filter"
      v-on:openApplication="openPopup"
      v-on:refresh="refresh"
      v-on:updateFilter="updateFilter"
    />

    <InterfaceApplicantsPopup
      v-if="openApplication"
      :openApplication="openApplication"
      v-on:close="closePopup"
    />

  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

#wrapper
  margin-bottom: 50px

h1
  margin: 20px 0
</style>

<script>
export default {
  data: () => ({
    applications: [],
    filter: null,
    openApplication: null,
  }),

  async mounted(){
    await this.refresh();
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

    closePopup() {
      this.openApplication = null;
      this.refresh();
    },

    updateFilter(newFilter) {
      this.filter = newFilter;
    }
  }
}
</script>