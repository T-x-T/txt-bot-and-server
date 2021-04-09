<template>
  <div class="background-bright" ref="memberWorldmapBackground">
    <div id="section_memberWorldmap" class="scrollTarget"></div>
    <h1>World map<span class="subtitle">We are a global community</span></h1>

    <div id="controls">
      <div class="buttonContainer">
        <button ref="metric_count" class="active" @click="currentMetric = 'count'">Members</button>
        <button ref="metric_playtime" @click="currentMetric = 'playtime'">Playtime</button>
      </div>
      <div class="buttonContainer">
        <button ref="scale_count" class="active" @click="currentScale = 'count'">Total</button>
        <button ref="scale_percent" @click="currentScale = 'percent'">Percent</button>
      </div>
    </div>

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
  background: $pax-darkcyan
  width: 100vw
  svg
    width: 90%
    margin: 0 auto

.subtitle
  text-align: center
  margin: -7px 0 7px 0
  display: block
  color: $pax-white
  font-size: 12pt

#controls
  width: 100vw
  display: flex
  justify-content: center

.buttonContainer
  border: 2px solid $pax-darkestcyan
  width: max-content
  margin: 25px
  border-radius: 25px
  flex-shrink: 0
  button
    background: transparent
    box-shadow: none
    &:hover
      background: $pax-lightcyan
      transform: none
  button.active
    background: $pax-darkcyan
    color: $pax-white
    border-radius: 25px
</style>

<script>
export default {

  data: () => ({
    map: null,
    loadedScripts: 0,
    inView: false,
    mapData: null,
    currentMetric: "count",
    currentScale: "count",
    totals: {"count": 0, "playtime": 0}
  }),

  beforeMount() {
    window.addEventListener("resize", this.resizeHandler);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeHandler);
  },

  watch: {
    loadedScripts(newVal, oldVal){
      if(newVal === 3){
        this.run();
      }
    },

    currentMetric(newVal, oldVal){
      for(let key in this.mapData){
        this.mapData[key].numberOfThings = this.mapData[key][newVal];
      }
      this.reloadMap();

      this.$refs[`metric_${oldVal}`].classList.remove("active");
      this.$refs[`metric_${newVal}`].classList.add("active");
    },

    currentScale(newVal, oldVal){
      this.reloadMap();

      this.$refs[`scale_${oldVal}`].classList.remove("active");
      this.$refs[`scale_${newVal}`].classList.add("active");
    }
  },

  methods: {
    async getMapData(){
      this.mapData = await this.$axios.$get("/api/worldmapdata");
      
      for(let metric in this.totals){
        for(let country in this.mapData){
          this.totals[metric] += this.mapData[country][metric];
        }
      }
    },

    reloadMap(){
      this.map = null;
      const parent = this.$refs["mapContainer"];
      while(parent.children.length != 0) parent.removeChild(parent.children[0]);
      this.run();
    },

    updateColorCoding(){
      let max = 0;
      for(let key in this.mapData) if(this.mapData[key].numberOfThings > max) max = this.mapData[key].numberOfThings;
      for(let key in this.mapData) if(this.mapData[key].numberOfThings > 0) this.mapData[key].fillKey = ((this.mapData[key].numberOfThings / max).toFixed(1) * 100) + '%';
    },

    async run(){
      if (!this.mapData) await this.getMapData();
      this.updateColorCoding();

      this.$nextTick(function(){
        if(window.d3 && window.topojson){
          this.map = new Datamap({
            scope: 'world',
            element: this.$refs["mapContainer"],
            projection: 'mercator',
            height: window.innerHeight,
            width: window.innerWidth,
            aspectRatio: 1,
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
              metric: this.currentMetric,
              scale: this.currentScale,
              total: this.totals[this.currentMetric],
              highlightOnHover: false,
              popupTemplate: function (geo, data) {
                return `<div class='hoverinfo'>${geo.properties.name}: ${this.scale == "count" ? data.numberOfThings : Math.round((data.numberOfThings / this.total) * 100)} ${this.scale == "count" ? this.metric == "count" ? "Member(s)" : "hours" : "%"}</div>`;
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