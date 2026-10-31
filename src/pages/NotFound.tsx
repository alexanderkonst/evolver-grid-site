import MoonNotice from "@/components/game/MoonNotice";

/**
 * The one 404 template (issue #270). No game shell, no rail, no music: App.tsx mounts it
 * outside the shell layout, and PublicProfile hides its shell when it renders this.
 */
const NotFound = () => (
  <MoonNotice
    eyebrow="404"
    title="This page is not in the village"
    line="The link may be old, or the page may have moved."
    primary={{ to: "/village", label: "Back to the village" }}
    secondary={{ to: "/", label: "Title screen" }}
  />
);

export default NotFound;
