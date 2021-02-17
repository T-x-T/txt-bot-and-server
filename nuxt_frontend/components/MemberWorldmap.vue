<template>
  <div id="background">
    <h1>Worldmap</h1>
    <p class="subtitle">Where our Members live IRL</p>
    <client-only>
      <div id="map">
        <div ref="mapContainer" id="mapContainer"></div>
      </div>
    </client-only>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#background
  background: $pax-darkcyan

div#mapContainer
  padding-bottom: 70% !important
  box-shadow: 0px 0px 1500px #102f36 inset

.subtitle
  @extend .pax-p
  text-align: center
  margin: -10px 0 10px 0
  color: white
</style>

<script>
export default {

  data: () => ({
    map: null
  }),

  beforeMount() {
    window.addEventListener("resize", this.resizeHandler);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeHandler);
  },

  methods: {
    resizeHandler() {
      this.map.resize();
    }
  },

  async mounted() {
    const map_data = await this.$axios.$get("/api/memberworldmapdata");

    this.$nextTick(() => this.$nextTick(() => {
      this.map = new Datamap({
        scope: 'world',
        element: this.$refs["mapContainer"],
        projection: 'mercator',
        height: screen.width * 0.7,
        width: screen.width,
        aspectRatio: 0.5625,
        responsive: true,
        fills: {
          defaultFill: '#e9e9e9',
          '0%': '#B4B4B4',
          '10%': '#A3DFE8',
          '20%': '#00acc4',
          '30%': '#0099ae',
          '40%': '#008395',
          '50%': '#007787',
          '60%': '#018799',
          '80%': '#017a8a',
          '70%': '#006c7b',
          '90%': '#00616f',
          '100%': '#00616f',
        },
        geographyConfig: {
          highlightOnHover: false,
          popupTemplate: function (geo, data) {
            return `<div class='hoverinfo'>${geo.properties.name}: ${data.numberOfThings} Member(s)</div>`;
          },
        },
        data: map_data
      });
    }));
  }
}
</script>