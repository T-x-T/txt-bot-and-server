export default {
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  modules: [
    "@nuxtjs/axios"
  ],
  css: ["assets/general", "assets/_vars"],
  components: true,
  head: {
    titleTemplate: "%s | Paxterya",
    link: [
      {rel: "icon", type: "image/png", href: "/logo-icon.svg"}
    ],
    meta: [
      {name: "viewport", content:"width=device-width, initial-scale=1.0"}
    ]
  },
  axios: {
    proxy: true
  },
  proxy: {
    "/api": process.env.NODE_ENV === "prod" ? "https://paxterya.com" : "http://localhost:4000"
  }
}