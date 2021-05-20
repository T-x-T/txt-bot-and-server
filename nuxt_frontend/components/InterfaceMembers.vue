<template>
  <div id="wrapper">
    <h1>Members</h1>
    
    <div v-if="!openMember">
      <input id="search" type="text" v-model="searchTerm" placeholder="search">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Joined Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filteredMembers" :key="index" @click="openMemberDiscordId = item.discordId">
            <td>{{item.mcIgn}}</td>
            <td>{{new Date(item.joinedDate).toISOString().substring(0, 10)}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div id="popup" v-if="openMember">
      <button id="back" @click="closeOpenMember">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" /></svg>
        back
      </button>
      <div id="grid">
        <div id="info" class="popupElement">
          <div class="value">
            <h3>Discord</h3><p>{{openMember.discordUserName}}</p>
          </div>
          <div class="value">
            <h3>IGN</h3><p>{{openMember.mcIgn}}</p>
          </div>
          <div class="value">
            <h3>Discord ID</h3><p>{{openMember.discordId}}</p>
          </div>
          <div class="value">
            <h3>Minecraft UUID</h3><p>{{openMember.mcUuid}}</p>
          </div>
          <div class="value">
            <h3>Country</h3><p>{{openMember.country}}</p>
          </div>
          <div class="value">
            <h3>Age</h3><p>{{openMember.age}}</p>
          </div>
          <div class="value">
            <h3>Joined Date</h3><p>{{openMember.isoJoinedDate}}</p>
          </div>
          <div class="value">
            <h3>Playtime</h3><p>{{openMember.playtime}}</p>
          </div>
          <div class="value">
            <h3>Karma</h3><p>{{openMember.karma}}</p>
          </div>
        </div>
        <div id="avatars" class="popupElement">
          <img :src="openMember.discordAvatarUrl">
          <img :src="openMember.mcSkinUrl">
        </div>
        <div id="status" class="popupElement" v-if="openMember.status === 0">
          <div class="value">
            <h3>Status</h3><p>Not whitelisted for a very long time...</p>
          </div>
        </div>
        <div id="status" class="popupElement" v-if="openMember.status === 1">
          <div class="value">
            <h3>Status</h3><p>Active</p>
          </div>
          <button class="secondary" @click="inactivateOpenMember">{{loading ? "loading..." : "Inactivate"}}</button>
        </div>
        <div id="status" class="popupElement" v-if="openMember.status === 2">
          <div class="value">
            <h3>Status</h3><p>Inactive</p>
          </div>
          <button class="secondary" @click="activateOpenMember">{{loading ? "loading..." : "Activate"}}</button>
        </div>
        <div id="controls" class="popupElement">
          <p>This is the place for some controls</p>
        </div>
        <div id="notes" class="popupElement">
          <textarea v-model="openMember.notes" autocomplete="off" placeholder="This could be the start of some great notes..."></textarea>
          <button @click="saveNotes()" class="secondary">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

#wrapper
  margin: 50px 0px 50px 0px

input#search
  max-width: 400px
  margin: 10px auto 10px auto
  display: block

table
  border: 4px solid $pax-darkestcyan

#popup
  width: 50%
  margin: 25px auto
  @media screen and ($mobile)
    width: 90%
    padding: 5vw
    margin: 0
  button#back
    margin-left: 50px
    svg
      height: 18px
      margin-bottom: -4px

.popupElement
  background-color: $pax-darkestcyan
  margin: 50px
  padding: 0px 20px 20px 20px

#notes
  padding-top: 20px
  grid-column: span 2

#grid
  display: grid
  grid-template-columns: 50% 50%

.value
  h3
    background: $pax-darkmodecyan1

#avatars
  display: flex
  justify-content: space-evenly
  align-items: center
  img
    max-height: 200px

#status
  padding: 20px
  display: flex
  align-items: center
  justify-content: space-evenly
  .value
    margin: 0
</style>

<script>
export default {
  data: () => ({
    members: [],
    filteredMembers: [],
    searchTerm: "",
    openMemberDiscordId: null,
    openMember: null,
    loading: false,
  }),

  props: {
    token: String
  },

  async mounted() {
    this.refresh();
  },

  methods: {
    async refresh(){
      this.members = (await this.$axios.$get("/api/members/overview")).sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
      this.applySearch();
      if(this.openMember) this.openMember = this.members.filter(x => x.discordId === this.openMember.discordId)[0];
    },

    applySearch() {
      if(this.searchTerm.length === 0) {
        this.filteredMembers = this.members;
      } else {
        this.filteredMembers = this.members.filter(x => x.mcIgn.toString().toLowerCase().includes(this.searchTerm));
      }
    },

    async activateOpenMember() {
      try {
        this.loading = true;
        await this.$axios.$post(`/api/members/${this.openMember.discordId}/activate`);
        await this.refresh();
        this.loading = false;
      } catch (e) {
        window.alert(e);
      }
    },

    async inactivateOpenMember() {
      try {
        this.loading = true;
        await this.$axios.$post(`/api/members/${this.openMember.discordId}/inactivate`);
        await this.refresh();
        this.loading = false;
      } catch (e) {
        window.alert(e);
      }
    },

    closeOpenMember() {
      this.saveNotes();
      this.openMember = null;
      this.openMemberDiscordId = null;
      this.refresh();
    },

    saveNotes() {
      this.$axios.$post(`/api/members/${this.openMember.discordId}/notes`, {notes: this.openMember.notes});
    }
  },

  watch: {
    searchTerm(term) {
      this.searchTerm = term.toLowerCase();
      this.applySearch();
    },

    async openMemberDiscordId(discordId) {
      if(discordId) {
        this.openMember = {discordId: discordId};
        this.openMember = await this.$axios.$get("/api/members?discordId=" + discordId);
        const karma = (await this.$axios.$get(`/api/v1/users/${discordId}/guildkarma`))?.filter(x => x.guildId === "624976691692961793")[0]?.guildkarma;
        const playtime = (await this.$axios.$get(`/api/members/${discordId}/playtime`)).playtime;
        const tempOpenMember = {
          karma: karma ? karma : 0,
          isoJoinedDate: new Date(this.openMember.joinedDate).toISOString().substring(0, 10),
          playtime: playtime ? playtime + "h" : "0h",
          ...this.openMember
        }
        this.openMember = tempOpenMember;
      }
    }
  }
}
</script>