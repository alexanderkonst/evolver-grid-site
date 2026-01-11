# Seed Data: Test Profiles for Matchmaking

**Purpose**: Create 3 test profiles with pre-filled Appleseed and Excalibur data for testing matchmaking.

**IMPORTANT**: Do NOT send any emails to these users. Just create the accounts.

---

## Profiles to Create

### 1. Karime Kuri

**Auth:**
- Email: `karimekurit@gmail.com`
- Password: `dclk109252`

**Profile:**
- First Name: Karime
- Last Name: Kuri

**Appleseed:**
```json
{
  "vibrationalKey": {
    "name": "Sacred Mirror",
    "tagline": "She who reflects the love you forgot existed"
  },
  "threeLenses": {
    "primeDriver": "Reconnect · Restore · Remember",
    "archetype": "Mother Healer · Feminine Leader Midwife",
    "actions": ["Reflect", "Hold space", "Transmute pain"]
  },
  "elevatorPitch": "Karime is a Sacred Mirror who helps high-performing women see their true selves beyond the masks of achievement, guiding them back to sovereign wholeness."
}
```

**Excalibur:**
```json
{
  "sword": {
    "offer": "I guide high-performing women out of burnout and back into sovereign, sacred wholeness—so they can lead from deep inner connection, not overextension.",
    "form": "3-month Container (1:1 sessions, rituals, practices, voice support)",
    "price": "$1,111–$1,777 sliding scale"
  },
  "value": {
    "whoBenefitsMost": "Women leaders burned out, hyper-responsible, afraid of not being enough",
    "survivalBlock": "The need to earn love through doing"
  }
}
```

---

### 2. Tracey Abbott

**Auth:**
- Email: `tracey@onpurposeleadership.co`
- Password: `dclk109252`

**Profile:**
- First Name: Tracey
- Last Name: Abbott

**Appleseed:**
```json
{
  "vibrationalKey": {
    "name": "Network Cartographer",
    "tagline": "She who maps the invisible bridges between right rooms and right roles"
  },
  "threeLenses": {
    "primeDriver": "Align Purpose with Position",
    "archetype": "Timing Oracle · Bridge Builder",
    "actions": ["Map networks", "Sense timing", "Introduce"]
  },
  "elevatorPitch": "Tracey is a Network Cartographer who helps accomplished leaders between chapters find their true rooms and roles, cutting through the fog of too many options."
}
```

**Excalibur:**
```json
{
  "sword": {
    "offer": "I work with people between chapters to help them choose the few rooms and roles that are truly theirs, leave what isn't, and step into right settings with warm introductions.",
    "form": "2-session Right Rooms, Real Role process",
    "price": "$1,500–$3,000"
  },
  "value": {
    "whoBenefitsMost": "Leaders who've built things, are in many rooms, between chapters",
    "survivalBlock": "The pattern: if I stay in everything, I'll be safe and won't miss out"
  }
}
```

---

### 3. Tylor Middlestadt

**Auth:**
- Email: `info@ipd2group.com`
- Password: `dclk109252`

**Profile:**
- First Name: Tylor
- Last Name: Middlestadt

**Appleseed:**
```json
{
  "vibrationalKey": {
    "name": "Temple Builder of Futures",
    "tagline": "He who translates vision into sacred form"
  },
  "threeLenses": {
    "primeDriver": "Forge Sacred Form",
    "archetype": "Land Listener · Team Firekeeper · Integration Architect",
    "actions": ["Listen to land", "Hold vision", "Build structure"]
  },
  "elevatorPitch": "Tylor is a Temple Builder who helps visionary land stewards translate their New Earth dreams into buildable blueprints, bridging ceremony and construction."
}
```

**Excalibur:**
```json
{
  "sword": {
    "offer": "For Visionary Stewards whose New Earth land project is stuck between vision and construction, I serve as Sacred Architect to distill a Project Soulprint and translate it into a buildable roadmap.",
    "form": "Structural Reset — 6–7 hour Land Vision Architecture Sprint",
    "price": "Starting $3,333, scaling to $7,500+"
  },
  "value": {
    "whoBenefitsMost": "Land stewards with land, purpose, some funding, stuck in Money–Motion Gap",
    "survivalBlock": "Paralysis between 'we have the dream' and 'we know what to build first'"
  }
}
```

---

## Instructions for Lovable

1. Create Supabase Auth users for each email/password
2. Create game_profiles entries linked to each user
3. Populate appleseed_data and excalibur_data JSONB fields
4. Do NOT trigger any email notifications

---

*Created: Day 8*
