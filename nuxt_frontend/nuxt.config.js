export default {
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  css: ["assets/general", "assets/_vars"],
  components: true,
  head: {
    titleTemplate: "%s | Paxterya",
    link: [
      {rel: "icon", type: "image/png", href: "logo-icon.svg"}
    ]
  }
}