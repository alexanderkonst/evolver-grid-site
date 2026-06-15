/* Blue Lotus — site configuration.
   Fill these four things before launch; everything else is wired. */
window.BLUE_LOTUS = {

  /* Karime's WhatsApp, international format, digits only. */
  whatsapp: "14157073432",

  /* Pre-filled WhatsApp messages, by tier. */
  whatsappMsg: {
    vessel: "Hello, I have received the Vessel (Blue Lotus, Caerulea VII). I would love to arrange delivery.",
    rite:   "Hello, I have received the Rite (Blue Lotus, Caerulea VII). I would love to arrange delivery and begin the Initiation."
  },

  /* Stripe Payment Link URLs. In each Stripe link, set the post-payment
     redirect to the full URL:
       https://<your-domain>/karime/bluelotus/confirmation.html?tier=vessel
       https://<your-domain>/karime/bluelotus/confirmation.html?tier=rite
     Until these are set, the buttons route straight to the confirmation page for preview. */
  stripe: {
    vessel: "",
    rite: ""
  },

  /* Display only. MXN is the charged currency; USD is shown for context. */
  usdRate: 18.5,

  /* The recorded initiation (888 / Rite only). Streamed from SoundCloud. */
  audio: {
    soundcloud: "https://soundcloud.com/karime-kuri/blue-lotus-activation-new-moon",
    title: "Initiation into the Blue Lotus Mysteries",
    duration: "1:11:11"
  },

  /* Optional ambient soundscape for the entry/sound toggle. Drop at assets/ambient.mp3 */
  ambient: "assets/ambient.mp3"
};
