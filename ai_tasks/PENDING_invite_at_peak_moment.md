# Add "Invite a Friend" at Peak Moment

## Goal
Prompt sharing right after emotional high (ZoG results, Appleseed reveal).

## Where to Add
- After Zone of Genius snapshot (`/zone-of-genius/assessment/step-4`)
- After Appleseed/Excalibur result (`/zone-of-genius/entry` result screens)

## Implementation
1. After user sees their results, show:
   - "Know someone who'd love to discover their genius?"
   - [Share] button → copy link or native share
   
2. Use Web Share API if available, fallback to copy link

3. Optional: Track invite events in `action_events` table

## Files to Check
- `src/modules/zone-of-genius/Step4GenerateSnapshot.tsx`
- `src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx`

## Acceptance
- Invite prompt appears naturally after wow moment
- Easy one-tap share
- Non-intrusive (can be dismissed)
