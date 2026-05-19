/**
 * Real photographic sun, rendered as a circular orb. Used as the
 * central sphere in the SolarCycleBar.
 *
 * The image is clipped to a circle, with a soft outer glow corona +
 * inner glass-rim highlight. Suspended below the curved liquid-glass
 * reserve tube as a "secondary luminous sphere" (Sasha 2026-05-18 brief:
 * "less bright than the tube, slightly softer and calmer — subordinate
 * to the reserve tube").
 */

const SUN_PHOTO_URL = "/assets/equilibrium/sun.jpg";

interface SunOrbProps {
  /** Orb diameter in pixels. */
  size?: number;
  className?: string;
}

export const SunOrb = ({ size = 64, className }: SunOrbProps) => {
  return (
    <div
      role="img"
      aria-label="Current solar energy"
      className={className}
      style={{
        position: "relative",
        width: size,
        height: size,
        // Soft outer corona — glow extends past the orb a bit but
        // dissipates quickly. Restrained per the brief.
        filter: "drop-shadow(0 0 14px rgba(251, 146, 60, 0.35))",
      }}
    >
      {/* Inner glass-rim highlight + photo */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          backgroundImage: `url("${SUN_PHOTO_URL}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          // Inner shadow gives the sphere subtle volumetric depth.
          boxShadow: [
            // Top-left specular sheen (glass capsule effect)
            "inset 4px 6px 14px rgba(255,228,196,0.45)",
            // Bottom-right inner rim shadow
            "inset -4px -8px 14px rgba(120,53,15,0.40)",
            // Outer rim glow
            "0 0 0 1px rgba(255,200,140,0.45)",
          ].join(", "),
        }}
      />
    </div>
  );
};

export default SunOrb;
