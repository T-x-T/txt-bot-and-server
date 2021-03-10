<template>
  <div id="background" class="background" ref="memberWorldmapBackground">
    <div id="section_memberWorldmap" class="scrollTarget"></div>
    <h1>Worldmap</h1>
    <p class="subtitle">Where our Members live IRL</p>
    <client-only>
      <div v-if="inView">
        <script type="application/javascript" src="https://d3js.org/d3.v3.min.js" @load="loadedScripts += 1" async="false"></script>
        <script type="application/javascript" src="https://d3js.org/topojson.v2.min.js" @load="loadedScripts += 1" async="false"></script>
        <script type="application/javascript" src="/datamaps.js" @load="loadedScripts += 1" async="false"></script>
      </div>

      <div id="map">
        <div ref="mapContainer" id="mapContainer"></div>
      </div>
    </client-only>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#background
  @media screen and ($mobile)
    width: 100vw

div#mapContainer
  padding-bottom: 70% !important
  box-shadow: 0px 0px 1500px #102f36 inset
  background: $pax-darkcyan
  @media screen and ($mobile)
    box-shadow: 0px 0px 150px #102f36 inset
    width: 100vw

.subtitle
  text-align: center
  margin: -10px 0 10px 0
</style>

<script>
export default {

  data: () => ({
    map: null,
    loadedScripts: 0,
    inView: false,
    mapData: null
  }),

  beforeMount() {
    window.addEventListener("resize", this.resizeHandler);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeHandler);
  },

  watch: {
    loadedScripts(newVal, oldVal){
      console.log(newVal)
      if(newVal === 3){
        this.run();
      }
    }
  },

  methods: {
    async run(){
      if (!this.mapData) this.mapData = await this.$axios.$get("/api/memberworldmapdata");

      this.$nextTick(function(){
        console.log(typeof window.d3, typeof window.topojson)
        if(window.d3 && window.topojson){
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
            data: this.mapData
          });
        }else{
          console.error("dependencies not loaded")
        }
      });
    },

    resizeHandler() {
      this.map.resize();
    },

    intersect(entries){
      if(entries[0].isIntersecting){
        this.$nextTick(function(){this.inView = true});
      }
    },

    setupOberserver(){
      this.$nextTick(function(){
        const options = {
          root: null,
          rootMargin: "500px",
          threshold: 0.0
        }

        const observer = new IntersectionObserver(this.intersect, options);
        observer.observe(this.$refs["memberWorldmapBackground"]);
      });
    }
  },

  async mounted() {
    if(document.readyState == "complete"){
      this.setupOberserver();
    }

    document.onreadystatechange = () => {
      if(document.readyState == "complete"){
        this.setupOberserver();
      }
    }
  }
}
</script>