-- Reserve /mastermind (public landing for the Founder-Market Fit Discovery
-- Mastermind) so it cannot be claimed as a profile username.
--
-- Same function as 20260722224112 with 'mastermind' added to the list.

create or replace function public.profile_username_is_reserved(p_username text)
returns boolean
language sql
immutable
strict
set search_path = public
as $$
  select p_username = any (array[
    -- Current top-level application routes plus conventional infrastructure
    -- routes. Keep this list additive whenever a new root route ships.
    '1-pager', '27', 'about', 'account', 'activate', 'activate-top-talent',
    'activations', 'admin', 'ai-os', 'ai-upgrade', 'alexander',
    'api', 'app', 'art', 'asset-mapping', 'auth', 'blog', 'build', 'callback',
    'canvas', 'character', 'cockpit', 'codex', 'collaborate', 'communities',
    'community', 'connections', 'contact', 'dashboard', 'destiny', 'docs',
    'dossier', 'equilibrium', 'events', 'explore', 'favicon', 'feedback',
    'fmf', 'founder', 'founder-market-fit', 'founders', 'game', 'genius-admin',
    'genius-layer-matching', 'genius-offer', 'genius-offer-intake', 'grow',
    'growth-paths', 'help', 'hero', 'holomap', 'home', 'ignite',
    'integral-theory-upgrade1', 'integralevolution', 'intelligences', 'intros',
    'karime', 'landing', 'legal', 'library', 'login', 'logout', 'm',
    'manifesto', 'map', 'marketplace', 'mastermind', 'mdls-preview', 'me',
    'mens-circle', 'mission-discovery', 'missions', 'modules', 'monetization',
    'mp', 'my-artifacts', 'my-page', 'my-result', 'onboarding', 'oyi', 'p',
    'page', 'path', 'playbook', 'preview', 'privacy', 'product',
    'product-builder', 'products', 'profile', 'prompt',
    'proposalforwegoodovahere', 'quality-of-life-map', 'quiz', 'resources',
    'reveal', 'robots', 'sandra', 'sergey', 'settings', 'sign-in', 'sign-up',
    'sitemap', 'skills', 'sohn', 'spaces', 'start', 'support', 'terms',
    'the-originals', 'today', 'tools', 'transcriber', 'u', 'ubb', 'ubd', 'ubl',
    'web3', 'you', 'zone-of-genius'
  ]::text[]);
$$;
