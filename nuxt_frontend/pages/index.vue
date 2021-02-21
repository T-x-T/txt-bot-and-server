<template>
  <main>
    <FloatingNav />
    <Header />
    <Introduction />
    <Features />
    <Videos />
    <Dynmaps />
    <Stats />
    <Slideshow />
    <Rules />
    <HowToJoin />
    <Blog />
    <Downloads />
    <MemberList />
    <MemberWorldmap />
    <ContactForm />
    <Footer />
  </main>
</template>

<style lang="sass" scoped>

</style>

<script>
export default {
  head: () => ({
    script: [
      {src: "https://d3js.org/d3.v3.min.js", async: false, defer: false},
      {src: "https://d3js.org/topojson.v2.min.js", async: false, defer: false},
      {src: "https://datamaps.github.io/scripts/datamaps.world.min.js?v=1", async: false, defer: false},
    ]
  })
}
</script>