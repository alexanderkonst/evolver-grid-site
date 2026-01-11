alter table game_profiles
add column if not exists spoken_languages text[] default '{}'::text[];
