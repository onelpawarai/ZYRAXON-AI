const stage = process.env.SST_STAGE || "dev"

export default {
  url: stage === "production" ? "https://zyraxon.ai" : `https://${stage}.zyraxon.ai`,
  console: stage === "production" ? "https://zyraxon.ai/auth" : `https://${stage}.zyraxon.ai/auth`,
  email: "help@anoma.ly",
  socialCard: "https://social-cards.sst.dev",
  github: "https://github.com/onelpawarai/ZYRAXON-AI",
  discord: "https://zyraxon.ai/discord",
  headerLinks: [
    { name: "app.header.home", url: "/" },
    { name: "app.header.docs", url: "/docs/" },
  ],
}
