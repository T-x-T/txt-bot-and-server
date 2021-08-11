<template>
  <div id="wrapper">
    <label for="combineDays">Combine days:</label>
    <input id="combineDays" type="number" v-model="combineDays" min="1">
    <highchart 
      :options="chartOptions"
    />
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

input#combineDays
  width: 75px
label
  opacity: 100
  position: inherit
  color: white
  font-size: 25px
  @extend .pax-semibold
</style>

<script>
export default {
  data: () => ({
    combineDays: 7,
    applications: [],
    cache: [],
    chartOptions: {
      title: {
        text: "Applications"
      },
      xAxis: {
        type: "datetime",
      },
      yAxis: {
        min: 0,
        title: {
          text: "Number of applications"
        }
      },
      series: [
        {
          data: [],
          name: "Total Applications",
          color: "black",
          marker: {
            symbol: "circle"
          }
        },
        {
          data: [],
          name: "Accepted Applications",
          color: "green",
          marker: {
            symbol: "circle"
          }
        },
        {
          data: [],
          name: "Denied Applications",
          color: "red",
          marker: {
            symbol: "circle"
          }
        },
      ]
    }
  }),

  async mounted() {
    this.applications = (await this.$axios.$get("/api/applications")).sort((a, b) => a.id - b.id);
    this.recalculate();
  },

  methods: {
    recalculate() {
      this.chartOptions.series[0].data = this.calculateSeries(this.applications, 0);
      this.chartOptions.series[1].data = this.calculateSeries(this.applications.filter(x => x.status === 3), 1);
      this.chartOptions.series[2].data = this.calculateSeries(this.applications.filter(x => x.status === 2), 2);
    },

    calculateSeries(applications, number) {
      if (!this.cache[number] || this.cache[number].length === 0) {
        this.cache[number] = this.aggregateSeries(applications);
      }
      return this.combineSeries([...this.cache[number]]);
    },

    aggregateSeries(applications) {
      let applicationsPerDay = [];
      for (
        let currentTimestamp = this.applications[this.applications.length - 1].timestamp;
        currentTimestamp > this.applications[0].timestamp;
        currentTimestamp -= (1000 * 60 * 60 * 24)
      ) {
        const currentDate = this.toISODate(currentTimestamp);
        applicationsPerDay.push(
          [currentTimestamp, applications.filter(x => (this.toISODate(x.timestamp) === currentDate)).length]
        );
      }

      applicationsPerDay.reverse();

      return applicationsPerDay;
    },

    combineSeries(applicationsPerDay) {
      let combinedApplicationsPerDay = [];
      while(applicationsPerDay.length > 0){
        const currentApplication = applicationsPerDay.pop();
        let combinedApplications = [currentApplication[0], currentApplication[1]];
        for(let i = 1; i < this.combineDays; i++) {
          if(applicationsPerDay.length === 0) break;
          combinedApplications[1] += applicationsPerDay.pop()[1];
        }
        combinedApplicationsPerDay.push(combinedApplications);
      };

      return combinedApplicationsPerDay;
    },

    toISODate(timestamp) {
      return new Date(timestamp).toISOString().substring(0, 10);
    }
  },

  watch: {
    combineDays() {
      this.recalculate();
    }
  }
}
</script>