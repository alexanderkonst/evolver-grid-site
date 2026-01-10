# Task: Add Outlook and Apple Calendar Support

**Assigned to:** Codex  
**Priority:** Medium  
**Created:** 2026-01-10

---

## Context

EventDetail.tsx already has Google Calendar. Add Outlook and Apple Calendar (.ics) support.

---

## Files to Read

- `src/pages/EventDetail.tsx` — lines 163-181 show `getGoogleCalendarUrl()`

---

## What to Build

### 1. Add `getOutlookCalendarUrl()` function

```tsx
const getOutlookCalendarUrl = () => {
    if (!event) return "#";
    
    const startDate = parseISO(`${event.event_date}T${event.event_time}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const params = new URLSearchParams({
        path: "/calendar/action/compose",
        rru: "addevent",
        subject: event.title,
        body: event.description || "",
        location: event.location || "",
        startdt: startDate.toISOString(),
        enddt: endDate.toISOString()
    });
    
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};
```

### 2. Add `downloadIcsFile()` function for Apple Calendar

```tsx
const downloadIcsFile = () => {
    if (!event) return;
    
    const startDate = parseISO(`${event.event_date}T${event.event_time}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatForIcs = (date: Date) => 
        date.toISOString().replace(/-|:|\\.\\d{3}/g, "").slice(0, -1);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatForIcs(startDate)}
DTEND:${formatForIcs(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || ""}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/[^a-z0-9]/gi, "_")}.ics`;
    link.click();
};
```

### 3. Update UI to show all three options

Replace the single Google Calendar link with a dropdown or three buttons:

```tsx
<div className="flex flex-wrap gap-3 mb-8">
    <a href={getGoogleCalendarUrl()} target="_blank" className="...">
        Google Calendar
    </a>
    <a href={getOutlookCalendarUrl()} target="_blank" className="...">
        Outlook
    </a>
    <button onClick={downloadIcsFile} className="...">
        Apple Calendar (.ics)
    </button>
</div>
```

---

## Success Criteria

- [ ] Google Calendar link works (already does)
- [ ] Outlook Calendar link opens Outlook web
- [ ] Apple Calendar downloads .ics file
- [ ] No TypeScript errors

---

## When Done

Rename this file to `DONE_calendar_options.md`
