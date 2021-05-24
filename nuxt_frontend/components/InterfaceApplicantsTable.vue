<template>
  <div>
    <table>
      <colgroup>
        <col style="width: 100px;">
        <col style="width: 200px;">
        <col style="width: 320px;">
        <col style="width: 200px;">
        <col>
        <col style="width: 200px;">
      </colgroup>
      <thead>
        <tr>
          <th>ID</th>
          <th>Timestamp</th>
          <th>Discord</th>
          <th>IGN</th>
          <th>About me</th>
          <th>
            <select v-model="statusFilter">
              <option value="null" disabled>Status</option>
              <option value="">All</option>
              <option value="1">Pending review</option>
              <option value="2">Denied</option>
              <option value="3">Accepted</option>
            </select>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in filteredApplications.slice(0, limit)" :key="index" @click="openApplication(item)" :class="rowClasses[index]">
          <td >{{item.id}}</td>
          <td>{{new Date(item.timestamp).toLocaleString("de")}}</td>
          <td>{{item.discord_nick}}</td>
          <td>{{item.mc_ign}}</td>
          <td>{{item.about_me}}</td>
          <td>{{item.status == 1 ? "Pending review" : item.status == 2 ? "Denied": "Accepted"}}</td>
        </tr>
      </tbody>
    </table>
    <div id="tableControls" >
      <button class="secondary" @click="$emit('refresh');">refresh</button>
      <button class="secondary" @click="showMore">show more</button>
      <button class="secondary" @click="showLess">show less</button>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

table
  tr.green td:last-child
    background: $pax-green
  tr.red td:last-child
    background: $pax-red
  @media screen and ($mobile)
    col
      width: auto !important
    th:nth-child(1), td:nth-child(1), th:nth-child(2), td:nth-child(2), th:nth-child(3), td:nth-child(3), th:nth-child(5), td:nth-child(5)
      display: none

#tableControls
  margin-top: 30px
  width: 80%
  margin: 10px auto
  display: flex
  justify-content: center
  button.secondary
    width: 25%
    margin: 0 10px
</style>

<script>
export default {
  data: () => ({
    filteredApplications: [],
    limit: 20,
    rowClasses: [],
    statusFilter: null,
  }),

  props: {
    applications: Array,
    filter: Number
  },

  mounted() {
    this.statusFilter = this.filter;
    this.applyFilter();
  },

  watch: {
    statusFilter(newStatus){
      this.$emit("updateFilter", newStatus);
      this.applyFilter("status", newStatus);
    },

    applications() {
      this.applyFilter("status", this.statusFilter);
    }
  },

  methods: {
    applyFilter(property, value){
      if(property && value){
        this.filteredApplications = this.applications.filter(x => x[property] == value);
      }else{
        this.filteredApplications = this.applications;
      }

      this.rowClasses = this.filteredApplications.map(x => x.status == 1 ? "" : x.status == 2 ? "red" : "green");
    },

    showMore(){
      this.limit < this.applications.length ? this.limit += 20 : this.limit = this.applications.length;
      this.$emit("refresh");
    },

    showLess(){
      this.limit > 20 ? this.limit -= 20 : this.limit = 20;
      this.$emit("refresh");
    },

    openApplication(application) {
      this.$emit("openApplication", application)
    }
  }
}
</script>