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
    "/api": process.env.NODE_ENV === "prod" ? "https://paxterya.com" : "http://localhost:4000",
    "/users": "https://api.mojang.com/"
  },
  publicRuntimeConfig: {
    discordOauthJoinUs: process.env.NODE_ENV === "prod" ? "https://discord.com/api/oauth2/authorize?client_id=624980994889613312&redirect_uri=https%3A%2F%2Fpaxterya.com%2Fjoin-us&response_type=code&scope=identify" : "https://discord.com/api/oauth2/authorize?client_id=624980994889613312&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fjoin-us&response_type=code&scope=identify",
    discordOauthInterface: process.env.NODE_ENV === "prod" ? "https://discord.com/api/oauth2/authorize?client_id=624980994889613312&redirect_uri=https%3A%2F%2Fpaxterya.com%2Finterface&response_type=code&scope=identify" : "https://discord.com/api/oauth2/authorize?client_id=624980994889613312&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Finterface&response_type=code&scope=identify",
  }
}