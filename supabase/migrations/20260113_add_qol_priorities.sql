alter table game_profiles
add column if not exists qol_priorities text[] default '{}'::text[];
