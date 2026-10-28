# Testimonial clips — template

**Produces:** ultra-short video clips (4–20 s) of real people speaking about Sasha's work **in their own words**, cut from recorded calls, with burned-in English subtitles, in two framings (original 16:9 and vertical 9:16), plus one 30–45 s compilation. First use: notes after a module's Outro at each village place in *The Game of Being You* (§14.4: Outro → back to the village).

## Meta-description
- Level / parent: L2 · Content & Transmission (proposed L1, awaiting Sasha's confirmation, Meta-Template T3) · parent: [meta-template.md](./meta-template.md)
- Lens(es): **Ideal Forms** (the canonical clip: verbatim, 4–20 s, one standalone line, consent-gated) · **Causal** (source → quote bank → cut → subtitle → assemble → consent → embed)
- Shift carried: PST 155 Testimony Frequency — diagnosing the viewer's pain (doctor and patient) → a peer's lived words the viewer recognizes themselves in · also PST 100 (ideas spread through self-recognition), 67 (consent of seeing), 135 (the transaction completes recursively: the one recognized recognizes another) · shift check: a newcomer watches a clip and says "that's me", and the speaker gave consent freely
- What emerges: real people's own words about what shifted for them, kept exactly as spoken and left in the game for those who come after.
- As a part of the whole: the Meta-Template sees this as emergence reflected back by others as social proof: the same transformation the other templates set in motion, now visible from outside, in the voice of the one it happened to.
- Siblings / repeats: course-from-source (transmission going out; this is it coming back); game blueprint §15 Miyazaki ("leave a particle of yourself", a new kind of testimonial) and §14.4 Outro; the transmission-repurposing gap in the README inventory.
- Status · applied in · last reviewed: in use · first batch 2026-10-27 (private until consent) · 2026-10-27

**Hard rules**
1. **Verbatim only.** Never paraphrase, merge two sentences from different moments, or "clean up" meaning. Subtitles carry the transcript words; the only edit allowed is cutting at sentence boundaries.
2. **Consent before any public use.** Each person sees their clip and says yes (Sasha asks them himself, in his own channel). No consent → the clip stays private. Record the yes (date, channel) in the quote bank.
3. **No outreach by the agent.** Agents never contact the people in the clips.
4. **Translation is labelled.** For a non-English speaker the subtitle is a faithful translation; the original-language line is kept in the quote bank, and a native speaker listens once before use.

---

## 1. Sources

| Source | How | Notes |
|---|---|---|
| Fathom (main) | API `GET https://api.fathom.ai/external/v1/meetings?limit=…&include_calendar_invitees=true` (10 per page, cursor), then `GET /recordings/<recording_id>/transcript` | Key: vault "Fathom API key Hark" (header `X-Api-Key`). ~1 req/s, back off on 429. Find people by invitee email and title, not only by name (Meet display names can be wrong). |
| Fathom video | each meeting's `share_url` → `<share_url>/video.m3u8` (HLS, 6 s chunks) | Works without login while the share link is active. Download only the window you need: `ffmpeg -user_agent "Mozilla/5.0" -ss <floor((start-2)/6)*6> -i <share_url>/video.m3u8 -t <dur> -c copy src.mp4`. Check `ffprobe … start_time`: if non-zero, the real window starts at `ss + start_time`. |
| Zoom / other recordings | upload the file to the workspace | Many early sessions were on Zoom, not Fathom. |
| Text-only transcripts | quote bank only | No video → quote card, not a clip. |

## 2. Verbatim quote bank

One file (`quotes.md`), one row per quote: person · call title · date · `start–end` · exact quote · length · why it is strong · consent status.

Finding the lines (by script, then by reading):
- Keep only segments **not** spoken by Sasha.
- Grep praise / shift markers — EN: *thank you, grateful, clarity, breakthrough, resonate, powerful, profound, chills, tears, life changing, genius, first person…*; RU: *спасибо, благодарен, круто, откликается, гениально, прорыв, ценно, мурашки, ясность*.
- Read ±60 s around each hit: is it about **his work / the session / their shift**, or about their own project? Discard the latter.
- Rank: **short (≤ 20 s), specific, emotional, standalone** (makes sense with no context), face visible (not a screen share). One person can have several.

Timestamps: Fathom gives segment **start** times rounded to the second. A clip runs from a segment start to the next segment start; choose quotes that are whole segments. If a quote starts mid-segment, find the pause with `silencedetect` and mark "trim by ear".

## 3. Timestamp cut

- Pad: start −0.3 s, end +0.6 s (end timestamps are rounded).
- Frame-accurate re-encode (`-preset veryfast -crf 20`, 30 fps, AAC 128k/48 kHz, `+faststart`).
- Audio: `loudnorm=I=-16:TP=-1.5:LRA=11`, 0.15 s fade-in, 0.25 s fade-out; matching video fades.
- Check: duration equals expected; `silencedetect` shows speech starting within the first second.

## 4. Subtitle

- ASS file per clip, DejaVu Sans Bold, white with black outline, bottom-centred; 2-line cues, ~34 chars/line vertical, ~48 horizontal.
- Cue timing: proportional to text length across the speaking time (no word timings from Fathom). Good enough for ≤ 20 s; for longer clips align by ear or by `silencedetect` pauses.
- Small name label at the top (the person's real name, not the Meet display name).

## 5. Assemble

- **16:9 original:** full call frame, subtitles burned in.
- **9:16 vertical:** crop the speaker's tile (coordinates read off an extracted frame; crop above the in-tile name label), place it at width 720 on a blurred, darkened copy of itself (720×1280), subtitles in the lower third. Full-frame speaker view → centre crop `ih*9/16`.
- **Compilation (30–45 s):** 3–5 clips, strongest first-3-seconds first, concat and re-encode once.
- **Visual check before handing over:** extract one frame per clip (`-ss 3 -frames:v 1`), view it: face in frame, subtitles not covering the mouth, no wrong name labels, no screen share.

Script: kept with the private working files (reads the picks + source offsets, writes `<id>.mp4` and `<id>_9x16.mp4`).

## 6. Consent

Before anything leaves private storage:
1. Sasha sends each person their clip(s) (private link), in his words. Suggested ask, for him to adapt: *"I cut a few seconds from our call where you said X. May I show it inside my game / on my site, with your name?"*
2. Record in the quote bank: yes / no / with conditions (name only, first name, no face → audio + quote card), date, channel.
3. A "no" or no answer = the clip is deleted from any public surface and stays private.

## 7. Embed in the game

- Place: after a module's Outro, at the village place that module belongs to (e.g. Uniqueness/Myth → Workshop; Zone of Genius → Your House). Pick the clip whose words match that place's result (praise of the method's structure → Workshop; "you put into words what I couldn't" → Your House / ZoG; "clarity" → Reception).
- Format: 9:16 clip, muted autoplay with subtitles, tap for sound; poster frame = a frame with the face; ≤ 2 MB (raise CRF to 26–28 for the web copy).
- Data: `{ person, place, clip_url, poster_url, quote_verbatim, translated: bool, consent: {status, date} }`. Render only when `consent.status = "yes"`.
- Host the files only after consent (Supabase storage or `/public/testimonials/`); until then they live in the private workspace.

---

## Applied

- **2026-10-27, first batch** (Fathom, Jun 2025 → Oct 2026): 7 clips from 5 people (one Russian → English), plus one 35 s compilation. All private, consent pending; quote bank and clips are kept outside this public repo. Several key sessions turned out not to be in Fathom (Zoom / text only).

*This repo is public: never commit names, quotes or clips of people here before their consent.*
