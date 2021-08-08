<template>
  <div id="wrapper">

    <InterfaceMembersTable 
      v-if="!openMemberDiscordId" 
      :members="members" 
      :initSearchTerm="searchTerm" 
      v-on:openMember="setOpenMemberDiscordId" 
      v-on:updateSearchTerm="setSearchTerm"
    />

    <InterfaceMembersPopup 
      v-if="openMemberDiscordId" 
      :openMemberDiscordId="openMemberDiscordId" 
      v-on:close="openMemberDiscordId = null"
    />
  </div>
</template>

<script>
export default {
  data: () => ({
    members: [],
    openMemberDiscordId: null,
    searchTerm: ""
  }),
  
  async mounted() {
    this.refresh();
  },

  methods: {
    async refresh(){
      this.members = (await this.$axios.$get("/api/members/overview")).sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
    },

    setOpenMemberDiscordId(discordId) {
      this.openMemberDiscordId = discordId;
    },

    setSearchTerm(term) {
      this.searchTerm = term;
    }
  }
}
</script>