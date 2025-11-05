// app.config.ts
import 'dotenv/config';

export default {
  expo: {
    name: "rnw-entra",
    slug: "rnw-entra",
    scheme: "rnw-entra",
    platforms: ["web"],
    web: { favicon: "./favicon.png" },
    extra: {
      TENANT_SUBDOMAIN: process.env.TENANT_SUBDOMAIN,
      CLIENT_ID: process.env.CLIENT_ID,
      USER_FLOW: process.env.USER_FLOW,
      REDIRECT_URI: process.env.REDIRECT_URI,
      POST_LOGOUT_REDIRECT_URI: process.env.POST_LOGOUT_REDIRECT_URI
    }
  }
};
