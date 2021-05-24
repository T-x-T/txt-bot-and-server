<template>
  <div>
      <input id="search" type="text" v-model="searchTerm" placeholder="search">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Joined Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filteredMembers" :key="index" @click="openMember(item.discordId)">
            <td>{{item.mcIgn}}</td>
            <td>{{new Date(item.joinedDate).toISOString().substring(0, 10)}}</td>
          </tr>
        </tbody>
      </table>
    </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

input#search
  max-width: 400px
  margin: 10px auto 10px auto
  display: block

table
  border: 4px solid $pax-darkestcyan
</style>

<script>
export default {
  data: () => ({
    filteredMembers: [],
    searchTerm: "",
  }),

  props: {
    members: Array,
    initSearchTerm: String
  },

  mounted() {
    this.applySearch();
    this.searchTerm = this.initSearchTerm;
  },

  methods: {
    applySearch() {
      if(this.searchTerm.length === 0) {
        this.filteredMembers = this.members;
      } else {
        this.filteredMembers = this.members.filter(x => x.mcIgn.toString().toLowerCase().includes(this.searchTerm));
      }
    },

    openMember(discordId) {
      this.$emit("openMember", discordId);
    }
  },

  watch: {
    searchTerm(term) {
      this.searchTerm = term.toLowerCase();
      this.$emit("updateSearchTerm", term);
      this.applySearch();
    },

    members() {
      this.applySearch();
    }
  }
}
</script>