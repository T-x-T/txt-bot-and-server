<template>
  <div>
      <input id="search" type="text" v-model="searchTerm" placeholder="search">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Joined Date</th>
            <th>
              <select v-model="statusFilter">
                <option value="null" disabled>Status</option>
                <option value="">All</option>
                <option value="0">Guest</option>
                <option value="1">Active</option>
                <option value="2">Inactive</option>
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filteredMembers" :key="index" @click="openMember(item.discordId)" :class="rowClasses[index]">
            <td>{{item.mcIgn}}</td>
            <td>{{new Date(item.joinedDate).toISOString().substring(0, 10)}}</td>
            <td>{{item.status === 0 ? "Guest" : item.status === 1 ? "Active" : "Inactive"}}</td>
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
  tr.green td:last-child
    background: $pax-green
  tr.red td:last-child
    background: $pax-red
</style>

<script>
export default {
  data: () => ({
    filteredMembers: [],
    searchTerm: "",
    rowClasses: [],
    statusFilter: null,
  }),

  props: {
    members: Array,
    initSearchTerm: String
  },

  mounted() {
    this.applyFilters();
    this.searchTerm = this.initSearchTerm;
  },

  methods: {
    applyFilters() {
      if(this.searchTerm.length === 0) {
        this.filteredMembers = this.members;
      } else {
        this.filteredMembers = this.members.filter(x => x.mcIgn.toString().toLowerCase().includes(this.searchTerm));
      }

      if(this.statusFilter) this.filteredMembers = this.filteredMembers.filter(x => x.status.toString() === this.statusFilter);

      this.rowClasses = this.filteredMembers.map(x => x.status == 0 ? "" : x.status == 2 ? "red" : "green");
    },

    openMember(discordId) {
      this.$emit("openMember", discordId);
    }
  },

  watch: {
    searchTerm(term) {
      this.searchTerm = term.toLowerCase();
      this.$emit("updateSearchTerm", term);
      this.applyFilters();
    },

    statusFilter() {
      this.applyFilters();
    },

    members() {
      this.applyFilters();
    }
  }
}
</script>