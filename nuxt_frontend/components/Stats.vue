<template>
  <div class="background">
    <h1>Paxterya in numbers</h1>
    <div id="wrapper">
      
      <div class="item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <div class="textWrapper">
          <h1>{{memberCount}}</h1>
          <p>Currently active members</p>
        </div>
      </div>

      <div class="item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="textWrapper">
          <h1>{{playtime}} hours</h1>
          <p>playtime from currently active members this season</p>
        </div>
      </div>

      <div class="item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
        </svg>
        <div class="textWrapper">
          <h1>{{averageAge}} / {{medianAge}}</h1>
          <p>Average / median age</p>
        </div>
      </div>

      <div class="item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
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
  align-items: center
  flex-wrap: wrap
  padding-bottom: 50px
  width: 100vw

div.item
  width: 380px
  max-width: 100%
  padding: 10px 0 10px 10px
  background: $pax-darkmodecyan1
  display: flex
  margin: 0 40px 20px 0
  cursor: pointer
  flex-shrink: 0
  filter: drop-shadow( 0px 0px 8px rgba(0, 0, 0, .7))
  opacity: 0.9
  &:hover
    filter: drop-shadow( 0px 0px 16px rgba(0, 0, 0, .9))
    opacity: 1
    scale: 1.1

svg
  width: 125px
  min-width: 125px
  color: white
  margin-right: 25px

div.textWrapper
  width: 225px
  h1
    background: $pax-cyan
    padding: 3px 15px 3px 15px
    text-shadow: 1px 2px 0px $pax-darkcyan
    border-right: 4px solid rgba(0,0,0,0.15)
    overflow-x: hidden
    font-size: 24pt
    text-align: right
  p
    background: $pax-darkcyan
    padding: 3px 0px 3px 15px
    border-right: 4px solid rgba(0,0,0,0.15)
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