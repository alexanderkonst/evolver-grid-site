# Feature Roadmap — Parked Ideas

## 1. Events Module (Luma-like)

**Status:** Parked  
**Priority:** Medium

### MVP Spec

Three clicks after signup:
1. See list of events
2. Pick an event
3. Get confirmation

### Event Card Data

| Field | Required |
|-------|----------|
| Photo | Yes |
| Name | Yes |
| Description | Yes |
| Date | Yes |
| Time | Yes |

### Actions

- [ ] Email confirmation on RSVP
- [ ] Email updates if event changes
- [ ] Add to Calendar button (Google/Apple)

### Route

`/events` — List view  
`/events/:id` — Single event

---

## 2. Admin Panel & Dashboard

**Status:** Parked  
**Priority:** Future

### For Community Leadership

- Member overview (count, activity, engagement)
- Invite members
- Manage branding (logo, colors, names)
- View aggregate QoL/ZoG patterns
- Manage events

### Permissions Layer

| Role | Can Do |
|------|--------|
| **Owner** | Everything |
| **Admin** | Manage members, events, branding |
| **Member** | Own profile, actions |

### Route

`/admin` — Dashboard  
`/admin/members` — Member list  
`/admin/branding` — White-label config  
`/admin/events` — Manage events

---

## 3. Placeholder Strategy

For unbuilt features, show:
- **[Coming Soon]** badge
- Grayed out module in sidebar
- Tooltip: "This feature is being built"

This informs users AND ourselves about the roadmap.
