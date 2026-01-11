import { CalendarDays, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AddToCalendarProps {
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
  durationMinutes?: number;
  timezone?: string;
}

const normalizeTime = (time: string) => {
  if (!time) return "00:00:00";
  const parts = time.split(":");
  if (parts.length === 2) {
    return `${time}:00`;
  }
  return time;
};

const buildDates = (date: string, time: string, durationMinutes: number) => {
  const normalizedTime = normalizeTime(time);
  const start = new Date(`${date}T${normalizedTime}`);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return { start, end };
};

const formatForGoogle = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, "");

const buildGoogleCalendarUrl = (props: AddToCalendarProps) => {
  const { start, end } = buildDates(props.date, props.time, props.durationMinutes ?? 120);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: props.title,
    dates: `${formatForGoogle(start)}/${formatForGoogle(end)}`,
    details: props.description || "",
    location: props.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const buildOutlookCalendarUrl = (props: AddToCalendarProps) => {
  const { start, end } = buildDates(props.date, props.time, props.durationMinutes ?? 120);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: props.title,
    body: props.description || "",
    location: props.location || "",
    startdt: start.toISOString(),
    enddt: end.toISOString(),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

const downloadIcs = (props: AddToCalendarProps) => {
  const { start, end } = buildDates(props.date, props.time, props.durationMinutes ?? 120);
  const formatForIcs = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, "").slice(0, -1);
  const timezoneLine = props.timezone ? `TZID=${props.timezone}` : "";

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART${timezoneLine ? `;${timezoneLine}` : ""}:${formatForIcs(start)}
DTEND${timezoneLine ? `;${timezoneLine}` : ""}:${formatForIcs(end)}
SUMMARY:${props.title}
DESCRIPTION:${props.description || ""}
LOCATION:${props.location || ""}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${props.title.replace(/[^a-z0-9]/gi, "_")}.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
};

const AddToCalendarButton = (props: AddToCalendarProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarDays className="w-4 h-4" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={() => window.open(buildGoogleCalendarUrl(props), "_blank")}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => window.open(buildOutlookCalendarUrl(props), "_blank")}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Outlook
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => downloadIcs(props)}>
          <Download className="w-4 h-4 mr-2" />
          Apple Calendar (.ics)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => downloadIcs(props)}>
          <Download className="w-4 h-4 mr-2" />
          Download .ics
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddToCalendarButton;
