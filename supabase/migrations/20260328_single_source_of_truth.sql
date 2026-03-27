-- ============================================================================
-- Single Source of Truth Migration
-- Moves hardcoded testimonials and founder canvases to Supabase tables
-- ============================================================================

-- ─── Testimonials ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name TEXT NOT NULL,
  title TEXT NOT NULL,
  short_quote TEXT NOT NULL,
  full_quote TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  surface TEXT NOT NULL DEFAULT 'ignite',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active testimonials" ON public.testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage testimonials" ON public.testimonials
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed with current hardcoded data from IgniteSession.tsx
INSERT INTO public.testimonials (person_name, title, short_quote, full_quote, sort_order, surface)
VALUES
(
  'Oyi Sun',
  'Medicine Man, Ye Ming Zhu Keeper',
  'Wow, wow, wow, wow, wow. My guides, they like you.',
  'Wow, wow, wow, wow, wow. I never had the words to say that ... I''ve been working on this since 2011 - change my age, make small edits. You''ve changed the dynamic ... This is a major breakthrough. I really hope your AI is recording this ... I feel like I''m in a deep mushroom journey. Like, how many hours is this thing going to last? ... I''d like another shot of the good vodka that you''re pouring ... What you''re doing is not vertically integrated. It''s mycelially integrated ... I physically feel chills, and I feel unfolding. I feel like skin peeling off and layers of things unfolding off my shoulders right now. You take pressure off of me. I just relax ... I am in awe right now of the accuracy and the amount of freedom that it is letting me have ... This stuff is really, really sharp ... My guides, they like you ... I see this as life changing.',
  1,
  'ignite'
),
(
  'Alexey Utkin',
  'Serial Founder, Stanford MBA, ex-Management Consultant',
  'This is a miracle of miracles. A tool that just plain works.',
  'This is a miracle of miracles. Other tools come at this half-baked and shallow — they''ve got no depth. Your approach, though? A tool that just plain works.',
  2,
  'ignite'
),
(
  'Sergey Jay Makarov',
  'Serial Founder & System Architect',
  'I was applying force, but the vector was wrong.',
  'I knew, I just knew — "this is a door that you need to go through." I feel understood. When you can work with somebody where you can be a human — oh man. The gold is under the dust. It applies to everything — to my clients, your clients, to a country. Your prompts are super powerful. So cool that this collaboration with AI uses the technology as a true soul-driven companion. Brings tears in my eyes. It''s uplifting me so much and giving me psychological and emotional stability. It''s a real breakthrough. Oh my God, it''s so profound. I''m loving this.',
  3,
  'ignite'
),
(
  'Sandra Otto',
  'New Earth Conscious Deep Tech Leader, ex-Corporate Global Consultant',
  'Brings tears in my eyes. It''s uplifting me so much and giving me psychological and emotional stability.',
  'I knew, I just knew — "this is a door that you need to go through." I feel understood. When you can work with somebody where you can be a human — oh man. The gold is under the dust. It applies to everything — to my clients, your clients, to a country. Your prompts are super powerful. So cool that this collaboration with AI uses the technology as a true soul-driven companion. Brings tears in my eyes. It''s uplifting me so much and giving me psychological and emotional stability. It''s a real breakthrough. Oh my God, it''s so profound. I''m loving this.',
  4,
  'ignite'
),
(
  'Aleksa Stojanovic',
  'Web3 System Architect',
  'The whole journey feels really beautiful.',
  'Wow. Wow. This is beautiful, man. You know what the testimonial page should say? One word for every person: "Wow". And you wouldn''t be wrong ... It flips the whole situation. Thank you for enabling me this opportunity — or this journey, actually. I highly resonate with it. Your vision is beautiful. It''s like a meta-startup, intergalactic meta-startup. Everything that you said — I remember, and it resonated, and it helped at that moment a lot. So yeah, thanks for all of that, man. I appreciate it. I''m laughing because it''s liberating. I feel so much in the flow. It''s such a beautiful thing to actually do. Such a good vibe, such a good understanding. I think it''s a wonderful thing to do. it was — transformative. Full of high truths, or at least discoveries for me.',
  5,
  'ignite'
),
(
  'Karime Kuri',
  'Healer of Healers, ex-WEF Leader, Oxford Alum',
  'I feel caught. Wonderful. This is great work.',
  'I feel caught. Wonderful. This is great work. Thank you for opening my eyes to things that maybe I''m pushing away — to not embody or execute or own. I appreciate that a lot. I''m pushing it away by belittling myself, making myself smaller. My alternatives are to quit this or to go [deeper]. So I go.',
  6,
  'ignite'
);


-- ─── Founder Canvases ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.founder_canvases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  archetype TEXT NOT NULL,
  tagline TEXT NOT NULL,
  session_date TEXT NOT NULL,
  session_number TEXT NOT NULL,
  sigil TEXT NOT NULL DEFAULT '◉',
  uniqueness TEXT NOT NULL,
  myth_lie TEXT NOT NULL,
  myth_truth TEXT NOT NULL,
  myth_line TEXT NOT NULL,
  tribe TEXT NOT NULL,
  pain TEXT NOT NULL,
  promise TEXT NOT NULL,
  color_primary TEXT NOT NULL DEFAULT '#8460ea',
  color_glow TEXT NOT NULL DEFAULT 'rgba(132,96,234,0.35)',
  color_bg TEXT NOT NULL DEFAULT 'rgba(132,96,234,0.06)',
  color_border TEXT NOT NULL DEFAULT 'rgba(132,96,234,0.25)',
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('complete', 'in-progress')),
  consent_given BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_canvases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active canvases" ON public.founder_canvases
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage canvases" ON public.founder_canvases
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed with current hardcoded data from FoundersShowcase.tsx
INSERT INTO public.founder_canvases (
  name, archetype, tagline, session_date, session_number, sigil,
  uniqueness, myth_lie, myth_truth, myth_line,
  tribe, pain, promise,
  color_primary, color_glow, color_bg, color_border,
  status, consent_given, sort_order
)
VALUES
(
  'Alexander',
  'The Focus Lens',
  'Helps build ventures from who you already are',
  'February 19, 2026',
  'Client Zero',
  '◉',
  'The Evolutionary Mirror — Visionary Architect. Sees the invisible architecture of things: systems, people, civilizations — and focuses genius into form. The polymathic consciousness that couldn''t see itself until it turned the mirror outward.',
  'The grind is the path. Push harder, pitch louder, grow faster. Your uniqueness is a liability — standardize it or starve.',
  'Your uniqueness IS your business. The business was always inside you. You don''t need to grind — you need to see what''s already there.',
  'The grind is a lie. Your genius was never lost. It was hiding in plain sight — in the thing you couldn''t stop doing for free.',
  'Founders in transition — corporate escapees, polymaths who can''t fit in one box, builders who sense something bigger is coming but can''t name it yet.',
  'They''ve built impressive things for other people''s visions. They know they should start their own thing but every path looks like the same grind with a different label. The real pain: they can''t name what makes them unique, so they keep packaging themselves as generic.',
  'From hiding your genius to building on it. You walk out with a canvas — your uniqueness named, your myth written, your tribe identified, your business designed around who you already are. Not another pivot. A homecoming.',
  '#8460ea', 'rgba(132,96,234,0.35)', 'rgba(132,96,234,0.06)', 'rgba(132,96,234,0.25)',
  'complete', true, 1
),
(
  'Oyi',
  'Lotus Medicine Man',
  'Restores what growing up took from you',
  'March 5–6, 2026',
  'Session 1',
  '❋',
  'The Lotus Medicine Man who grows lotuses in others. He reinstates the inner child — the original sovereign, dethroned by crisis — through storytelling that hits at the DNA level. Bridges ancient wisdom and modern building.',
  'The world runs on one rule — grow up or get left behind. There''s an entire industry built on keeping you lost.',
  'The most powerful version of you already existed — the kid who created without asking, played without planning, led without permission. That wasn''t childish. That was your power.',
  'The swamp grew the lotus. And the lotus bows to no one.',
  'Source Path Builders — leaders who carry BOTH ancient wisdom AND cutting-edge technology. Crisis-forged, already transformed, building the path back to source.',
  'Broken high achievers. Joy gone. Peace gone. Light in their eyes fading. They''ve abandoned their magic. Every step of growing up was a step of growing OUT.',
  'Your magic comes back. Joy, peace, and the light in your eyes — restored. Not by adding something new, but by removing the rust. The inner child leads. You Live Free.',
  '#5eaf8b', 'rgba(94,175,139,0.35)', 'rgba(94,175,139,0.06)', 'rgba(94,175,139,0.25)',
  'complete', true, 2
),
(
  'Sergey',
  'The Systems Alchemist',
  'Sees what your life is trying to become',
  'March 10–11, 2026',
  'Session 2',
  '⬡',
  'The Systems Alchemist — sees the finished form in architectural chaos. Two AI models independently named the same archetype. Transforms scattered systems into living, integrated wholes.',
  'Build the system first, find the meaning later. Technology is neutral — just pick a problem and solve it.',
  'The system IS the meaning. When technology serves the invisible architecture of human development, it stops being a tool and becomes alive.',
  'The finished form is already here. Stop building scaffolding and start seeing the cathedral.',
  'Technical visionaries trapped in execution — engineers and architects who see the whole but get hired for the parts.',
  'Jumping from one ''almost-working'' strategy to another. Each time something is ''about to land.'' Each time it doesn''t quite. Building systems for OTHER people''s problems.',
  'From scattered building to unified vision. Your systems stop being projects and become expressions of what you were always trying to create.',
  '#d49a5e', 'rgba(212,154,94,0.35)', 'rgba(212,154,94,0.06)', 'rgba(212,154,94,0.25)',
  'in-progress', true, 3
),
(
  'Alexa',
  'The Invisible Cartographer',
  'Makes the invisible visible — in systems, in people, in what''s coming',
  'March 13, 2026',
  'Session 3',
  '◈',
  'The Invisible Cartographer — sees the hidden architecture beneath everything: code, people, civilizations. Maps what others can''t see and translates it so they can act on it.',
  'The world only rewards what you can see, touch, and measure. The invisible is just philosophy. Ship fast or it doesn''t count.',
  'Everything that matters starts invisible. Every breakthrough was a pattern someone saw before anyone else did. Those who see the architecture shape the world.',
  'The invisible is the real. Everything else is just its footprint.',
  'The Hidden Seers — people who''ve always noticed the meta-layer, the pattern beneath the surface. They''ve been told ''that''s not practical'' so many times they started believing it.',
  'Trapped in the output chase. Work that''s ''useful'' but not the REAL work. They feel undervalued because they can''t point to what they actually contributed — the invisible architecture that made everything else possible.',
  'From hiding the sight to living from it. You stop wrapping your gift in tech and start delivering the raw sight — and people pay for it because it''s the most valuable thing anyone has ever shown them.',
  '#7eb8d4', 'rgba(126,184,212,0.35)', 'rgba(126,184,212,0.06)', 'rgba(126,184,212,0.25)',
  'complete', true, 4
);
