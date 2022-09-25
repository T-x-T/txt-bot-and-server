export default {
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  target: "static",
  modules: [
    "@nuxtjs/axios",
    "nuxt-highcharts",
  ],
  css: ["assets/general", "assets/_vars"],
  components: true,
  head: {
    titleTemplate: "%s | Paxterya Minecraft SMP",
    link: [
      {rel: "icon", type: "image/png", href: "/logo-icon.svg"}
    ],
    meta: [
      {name: "viewport", content:"width=device-width, initial-scale=1.0"},
      {name: "description", content:"Paxterya is a Minecraft SMP with a whitelist and a friendly community! Apply and join us and our adventures today!"},
      {name: "keywords", content:"Minecraft, Server, SMP, Survival, Creative, Whitelist, Application, Java Edition, Vanilla, Dynmap, Discord, YouTube channel, Seasons, Long-term, Community"}
    ]
  },
  axios: {
    proxy: false
  },
  proxy: {
    "/api2/v1": {target: "https://thetxt.io/", pathRewrite: {"2": ""}},
    "/api": process.env.NODE_ENV === "prod" ? "https://paxterya.com" : "http://localhost:4000",
    "/users": "https://api.mojang.com/",
  },
  publicRuntimeConfig: {
    discordOauthJoinUs: process.env.NODE_ENV === "prod" ? "https://discord.com/api/oauth2/authorize?client_id=624980994889613312&redirect_uri=https%3A%2F%2Fpaxterya.com%2Fjoin-us&response_type=code&scope=identify" : "https://discord.com/api/oauth2/authorize?client_id=624980994889613312&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fjoin-us&response_type=code&scope=identify",
    discordOauthInterface: process.env.NODE_ENV === "prod" ? "https://discord.com/api/oauth2/authorize?client_id=624980994889613312&redirect_uri=https%3A%2F%2Fpaxterya.com%2Finterface&response_type=code&scope=identify" : "https://discord.com/api/oauth2/authorize?client_id=624980994889613312&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Finterface&response_type=code&scope=identify",
  }
}