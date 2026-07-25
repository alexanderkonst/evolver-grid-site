// Canonical email sender constants (Day 135, 2026-07-25).
//
// The sender domain must always match the brand domain the user signed up
// on — findyourtoptalent.com. Never use a personal domain (e.g.
// notify.aleksandrkonstantinov.com) or Resend's sandbox sender
// (onboarding@resend.dev) in production:
//   - A personal-domain sender on transactional auth mail (signup confirm,
//     magic link, recovery, invite, email change) reads as a stranger
//     emailing the user, not the brand they signed up with.
//   - onboarding@resend.dev is Resend's sandbox address and can only
//     deliver to the Resend account owner's own inbox — it silently fails
//     for real users.
//
// This file is the single source of truth for the brand sender identity.
// Import these constants instead of hardcoding the domain/from-address in
// individual functions.

export const BRAND_NAME = "Find Your Top Talent";
export const SENDER_DOMAIN = "notify.findyourtoptalent.com";
export const FROM_NOTIFICATIONS = `${BRAND_NAME} <notifications@${SENDER_DOMAIN}>`;
