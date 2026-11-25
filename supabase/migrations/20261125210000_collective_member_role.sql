-- Collective WP1 · migration 1 of 3: the `collective_member` role.
-- Spec: docs/specs/collective/build_spec.md (v0.2) → "Data model", "Wave 1".
--
-- Own file on purpose: Postgres cannot use a new enum value in the transaction
-- that adds it. Migration 2 (collective_members + RLS) references the value, so
-- this one must commit first.
--
-- has_role() needs no change: for any role other than 'admin' it already reads
-- public.user_roles (see 20260515195200_*.sql).

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'collective_member';
