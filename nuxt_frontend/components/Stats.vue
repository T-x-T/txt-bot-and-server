<template>
  <div class="background">
    <div id="section_stats" class="scrollTarget"></div>
    <h1>Paxterya in numbers</h1>
    <div id="wrapper">
      
      <div class="item">
        <div class="svg-container">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin-top: 5px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div class="textWrapper">
          <h1>{{memberCount}}</h1>
          <p>Active members</p>
        </div>
      </div>

      <div class="item">
        <div class="svg-container">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="textWrapper">
          <h1>{{playtime}} hrs</h1>
          <p>Playtime this season</p>
        </div>
      </div>

      <div class="item">
        <div class="svg-container">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
          </svg>
        </div>
        <div class="textWrapper">
          <h1>{{averageAge}} / {{medianAge}}</h1>
          <p>Average / median age</p>
        </div>
      </div>

      <div class="item">
        <div class="svg-container">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="textWrapper">
          <h1>{{silly}}</h1>
          <p>Cobblestone mined per death by zombie</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#wrapper
  display: flex
  justify-content: space-evenly
  align-items: top
  flex-wrap: wrap
  padding-bottom: 50px
  padding-top: 80px
  height: 150px

div.item
  width: 250px
  max-width: 100%
  position: relative
  &:hover
    > .svg-container
      top: -35px
    > .svg-container svg
      transform: rotate(-360deg)

.svg-container
  background: $pax-lightcyan
  border-radius: 50%
  width: 110px
  height: 110px
  position: absolute
  z-index: 1
  left: 50%
  top: -15px
  transform: translate(-50%,-50%)

svg
  width: 85px
  color: $pax-white
  margin: 10px auto
  display: block

div.textWrapper
  width: 100%
  margin: 0
  z-index: 2
  position: absolute
  h1
    background: $pax-darkestcyan
    color: $pax-white
    overflow-x: hidden
    font-size: 24pt
    text-align: center
    margin: 0
    width: 100%
    padding: 5px 0
  p
    background: $pax-darkmodecyan1
    margin: 0
    text-transform: uppercase
    text-align: center
    font-size: 12pt
    padding: 3px 0
    @extend .pax-semibold
    width: 100%
</style>

<script>
export default {
  data: () => ({
    memberCount: "...",
    playtime: "...",
    medianAge: "...",
    averageAge: "...",
    silly: "..."
  }),

  async mounted(){
    const res = await this.$axios.$get("/api/statsoverview");
    this.memberCount = res.total_members;
    this.playtime = res.total_playtime;
    this.medianAge = res.median_age;
    this.averageAge = res.average_age;
    this.silly = res.silly;
  }
}
</script>