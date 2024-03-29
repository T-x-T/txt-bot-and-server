<template>
  <div id="popup">
    <button id="back" @click="closeOpenMember">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" /></svg>
      back
    </button>
    <div id="grid" v-if="openMember">
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
        <button class="secondary" @click="tempban">Tempban until</button>
        <input v-model="tempbanDate" type="date">
      </div>

      <div id="notes" class="popupElement stretch">
        <textarea v-model="openMember.notes" autocomplete="off" placeholder="This could be the start of some great notes..."></textarea>
        <button @click="saveNotes()" class="secondary">Save</button>
      </div>

      <div id="modLog" class="popupElement stretch">
        <table>
          <header><h2>Modlog:</h2></header>
          <colgroup>
            <col style="width: max-content;">
            <col style="width: max-content;">
            <col style="width: 10000px;">
          </colgroup>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Logged by</th>
              <th>Text</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in openMember.modLog" :key="index">
              <td>{{new Date(item.timestamp).toISOString().substring(0, 10)}}</td>
              <td>{{item.mcName}}</td>
              <td>{{item.text}}</td>
            </tr>
            <tr>
              <td><input type="date" v-model="newmodLogEntry.timestamp"></td>
              <td><input type="text" value="You" style="width: 50px" readonly></td>
              <td><input type="text" v-model="newmodLogEntry.text" placeholder="Text..."></td>
            </tr>
          </tbody>
        </table>
        <button class="secondary" v-if="newmodLogEntry.text" @click="savemodLog()">Save new entry</button>
      </div>

      <div v-if="openMember && Array.isArray(openMember.applications) && openMember.applications.length > 0" id="applications" class="popupElement stretch">
        <h2>Applications:</h2>
        <InterfaceApplicantsTable
          v-if="!openApplication"
          :applications="openMember.applications"
          :filter="null"
          v-on:openApplication="(x) => openApplication = x"
        />

        <InterfaceApplicantsPopup
          v-if="openApplication"
          :openApplication="openApplication"
          v-on:close="openApplication = null"
        />
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

h2
  color: white

#popup
  width: 1500px
  max-width: 90%
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
  margin: 20px
  padding: 20px

.stretch
  grid-column: span 2

#grid
  display: grid
  grid-template-columns: 50% 50%
  @media screen and ("max-width:1600px")
    div
      grid-column: span 2

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

#controls
  input
    width: 200px
    margin: 10px

#modLog
  table
    width: 100%
    margin: 0
    input
      width: 100%
  
#applications
  table
    width: 100%
    margin: 0
</style>

<script>
export default {
  data: () => ({
    openMember: null,
    loading: false,
    newmodLogEntry: {},
    openApplication: null,
    tempbanDate: (new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)).toISOString().substring(0, 10),
  }),

  props: {
    openMemberDiscordId: String
  },

  mounted() {
    this.loadOpenMember(this.openMemberDiscordId);
  },

  methods: {
    async loadOpenMember(discordId) {
      this.openMember = {discordId: discordId};
      this.openMember = await this.$axios.$get("/api/members?discordId=" + discordId);
      const karma = (await this.$axios.$get(`/api2/v1/users/${discordId}/guildkarma`))?.filter(x => x.guildId === "624976691692961793")[0]?.guildkarma;
      const playtime = (await this.$axios.$get(`/api/members/${discordId}/playtime`)).playtime;
      const applications = await this.$axios.$get(`api/applications?discord_id=${discordId}`);
      const tempOpenMember = {
        karma: karma ? karma : 0,
        isoJoinedDate: new Date(this.openMember.joinedDate).toISOString().substring(0, 10),
        playtime: playtime ? playtime + "h" : "0h",
        applications: applications,
        ...this.openMember
      }
      this.openMember = tempOpenMember;
    },

    async activateOpenMember() {
      try {
        this.loading = true;
        await this.$axios.$post(`/api/members/${this.openMember.discordId}/activate`);
        await this.loadOpenMember(this.openMemberDiscordId);
        this.loading = false;
      } catch (e) {
        window.alert(e);
      }
    },

    async inactivateOpenMember() {
      try {
        this.loading = true;
        await this.$axios.$post(`/api/members/${this.openMember.discordId}/inactivate`);
        await this.loadOpenMember(this.openMemberDiscordId);
        this.loading = false;
      } catch (e) {
        window.alert(e);
      }
    },

    closeOpenMember() {
      this.saveNotes();
      this.openMember = null;
      this.$emit("close");
    },

    async tempban() {
      await this.$axios.$patch(`/api/members/${this.openMember.discordId}/tempban`, {
        duration: new Date(this.tempbanDate).valueOf() - Date.now()
      });
      window.alert("Success");
      await this.loadOpenMember(this.openMemberDiscordId);
    },

    saveNotes() {
      this.$axios.$post(`/api/members/${this.openMember.discordId}/notes`, {notes: this.openMember.notes});
    },

    async savemodLog() {
      await this.$axios.$post(`/api/members/${this.openMember.discordId}/modLog`, {modLog: this.newmodLogEntry});
      await this.loadOpenMember(this.openMemberDiscordId);
      this.newmodLogEntry = {};
    },
  }
}
</script>