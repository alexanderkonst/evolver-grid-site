/* Blue Lotus — site configuration.
   Fill these four things before launch; everything else is wired. */
window.BLUE_LOTUS = {

  /* Karime's WhatsApp, international format, digits only. */
  whatsapp: "14157073432",

  /* Pre-filled WhatsApp messages, by tier. */
  whatsappMsg: {
    vessel: "Hello, I would like to receive the Vessel (Blue Lotus, Caerulea VII).",
    rite:   "Hello, I would like to receive the Rite: the tincture and the Initiation into the Blue Lotus Mysteries."
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

  /* The recorded initiation (888 / Rite only). Streamed from SoundCloud.
     Uses the ?si= share token so it plays for buyers whether the track is public or private.
     If the track is public, the bare URL (without ?si=) is fine too. */
  audio: {
    soundcloud: "https://soundcloud.com/karime-kuri/blue-lotus-activation-new-moon?si=36E4242A6DD641F4A884D7943C72F8B1",
    title: "Initiation into the Blue Lotus Mysteries",
    duration: "1:11:11"
  },

  /* Optional ambient soundscape for the entry/sound toggle. Drop at assets/ambient.mp3 */
  ambient: "assets/ambient.mp3"
};
