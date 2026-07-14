#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PLATFORM_PATH = resolve(ROOT, "docs/warm_base_platform_users.csv");
const FORM_PATH = resolve(
  ROOT,
  "docs/02-strategy/warm-base/superpower_responses.csv",
);
const OUTPUT_CSV = resolve(ROOT, "docs/02-strategy/warm-base/drafts.csv");
const OUTPUT_GS = resolve(ROOT, "docs/02-strategy/warm-base/create_drafts.gs");

const DIRECTION_CALL_URL =
  "https://cal.com/aleksandrkonstantinov/direction-call";
const SENDER_EMAILS = new Set([
  "alexanderkonst@gmail.com",
  "personalytics@gmail.com",
]);
const DOMAIN_CORRECTIONS = new Map([
  ["gmai.com", "gmail.com"],
  ["gmaill.com", "gmail.com"],
  ["gmail.con", "gmail.com"],
]);

const RUSSIAN_FIRST_NAMES = new Set(
  [
    "aleksandr",
    "alexander",
    "alexey",
    "aleksei",
    "alena",
    "alessia",
    "anna",
    "anton",
    "daria",
    "danila",
    "dima",
    "dmitrii",
    "elena",
    "emil",
    "kseniia",
    "ksenia",
    "kirill",
    "kristina",
    "maria",
    "nastya",
    "nika",
    "oleg",
    "olga",
    "sasha",
    "sergey",
    "tatiana",
    "tatjana",
    "tanya",
    "vera",
    "viktoria",
    "victoria",
  ].join(" ").split(" "),
);

export function parseCsv(source) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...values] = rows;
  return values
    .filter((cells) => cells.some((cell) => cell.trim()))
    .map((cells) =>
      Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])),
    );
}

function csvCell(value) {
  const string = String(value ?? "");
  return /[",\r\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

export function stringifyCsv(rows, headers) {
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\n") + "\n";
}

function normalizeEmail(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at < 0) return normalized;
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  return `${local}@${DOMAIN_CORRECTIONS.get(domain) ?? domain}`;
}

export function isAllowedEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const [local, domain] = email.split("@");
  if (local.includes("+")) return false;
  if (SENDER_EMAILS.has(email)) return false;
  if (/findyourtoptalent/i.test(domain)) return false;
  if (/(^|[._-])(admin|test)([._-]|$)/i.test(local)) return false;
  return true;
}

function cleanName(value) {
  return String(value ?? "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstName(name) {
  return cleanName(name).split(" ")[0] || "";
}

function superpowerScore(row) {
  const value = String(row.Superpower ?? "").trim();
  return value.length + (value.includes("Your superpower is to") ? 200 : 0);
}

function extractSuperpower(row) {
  const source = String(row.Superpower ?? row[""] ?? "")
    .replace(/\r/g, " ")
    .replace(/\n+/g, " ")
    .replace(
      /^(?:Your superpower is to|MY (?:SUPERPOWER|UNIQUE GIFT|ZONE OF GENIUS)):\s*/i,
      "",
    )
    .replace(/\s+/g, " ")
    .replace(/^(?:\d+[.)]\s*)+(?=\d+[.)])/, "")
    .trim();
  if (!source) return "";

  const numberedThoughts = [
    ...source.matchAll(
      /(?:^|\s)\d+[.)]\s*(.*?)(?=\s+\d+[.)](?:\s|$)|$)/g,
    ),
  ]
    .map((match) => match[1].trim())
    .filter(Boolean);
  const selected = numberedThoughts[0] || source;
  const firstThought = selected
    .split(/(?<=[.!?])\s*(?=[A-ZА-ЯЁ])/u)[0]
    .replace(/[.!?]+$/, "")
    .trim();
  if (firstThought.length <= 220) return firstThought;
  const shortened = firstThought.slice(0, 217).replace(/\s+\S*$/, "");
  return `${shortened}...`;
}

function subjectPhrase(value) {
  const words = String(value ?? "")
    .split(":")[0]
    .replace(/[“”"'()[\],.:;!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 4);
  while (words.length > 2 && /^(and|or|to|with|of|the|a|an)$/i.test(words.at(-1))) {
    words.pop();
  }
  return words.join(" ") || "top talent";
}

function isRussian(record) {
  const text = `${record.name} ${record.superpower}`;
  if (/[А-Яа-яЁё]/.test(text)) return true;
  if (/\.(ru|su)$/i.test(record.email.split("@")[1] ?? "")) return true;
  return RUSSIAN_FIRST_NAMES.has(firstName(record.name).toLowerCase());
}

function englishDraft(record) {
  const name = firstName(record.name) || "there";
  const hasWords = Boolean(record.superpower || record.topTalent);
  const talent = record.superpower || record.topTalent;
  const subject = hasWords
    ? `Your ${subjectPhrase(talent)}: what's next`
    : "Your professional direction: what's next";
  const opener = record.superpower
    ? `Sasha here. When we worked together, you named this as your superpower: ${record.superpower}. I still remember it, and I'm writing because that work grew into something much more complete.`
    : record.topTalent
      ? `Sasha here. You revealed ${record.topTalent} on the platform. I'm writing because that work grew into something much more complete.`
      : `Sasha here. A while back you created your profile on FindYourTopTalent. A lot has grown since.`;

  return {
    subject,
    body: `Hi ${name},\n\n${opener}\n\nI now help people name what's next professionally and package it into a real offer, with AI doing the heavy lifting. Real clients, real businesses launched since.\n\nI'm opening a few free 45-minute Direction Calls. You leave with your transition named and your strongest next direction on the table. Practically everyone does.\n\nIf this lands for where you are right now, grab a time: ${DIRECTION_CALL_URL}\nIf not, all good. Happy to be back in touch either way.\n\nAleks`,
  };
}

function russianDraft(record) {
  const name = firstName(record.name);
  const greeting = name ? `Здравствуйте, ${name}!` : "Здравствуйте!";
  const talent = record.superpower || record.topTalent;
  const subject = talent
    ? `Ваш талант: ${subjectPhrase(talent)}. Что дальше?`
    : "Ваше профессиональное направление. Что дальше?";
  const opener = record.superpower
    ? `Это Саша. Когда мы работали вместе, вы назвали свою сильную сторону так: ${record.superpower}. Я это помню и пишу вам, потому что с тех пор эта работа стала намного глубже и полнее.`
    : record.topTalent
      ? `Это Саша. На платформе вы раскрыли свой талант: ${record.topTalent}. Я пишу вам, потому что с тех пор эта работа стала намного глубже и полнее.`
      : "Это Саша. Некоторое время назад вы создали профиль на FindYourTopTalent. С тех пор проект сильно вырос.";

  return {
    subject,
    body: `${greeting}\n\n${opener}\n\nСейчас я помогаю людям определить следующий профессиональный шаг и превратить его в реальное предложение, а основную работу берет на себя ИИ. За это время появились реальные клиенты и были запущены реальные бизнесы.\n\nЯ открываю несколько бесплатных 45-минутных звонков о профессиональном направлении. После звонка у вас будет ясное понимание своего перехода и самое сильное следующее направление. Так происходит практически с каждым.\n\nЕсли это откликается вам сейчас, выберите время: ${DIRECTION_CALL_URL}\nЕсли нет, все хорошо. В любом случае рад снова быть на связи.\n\nАлекс`,
  };
}

export function buildDraftRows(platformRows, formRows) {
  const formByEmail = new Map();
  for (const row of formRows) {
    const email = normalizeEmail(row.Email || row["Email Address"]);
    if (!isAllowedEmail(email)) continue;
    const current = formByEmail.get(email);
    if (!current || superpowerScore(row) > superpowerScore(current)) {
      formByEmail.set(email, row);
    }
  }

  const records = new Map();
  for (const [email, row] of formByEmail) {
    records.set(email, {
      email,
      name: cleanName(row.Name),
      superpower: extractSuperpower(row),
      topTalent: "",
      source: "form",
    });
  }

  for (const row of platformRows) {
    const email = normalizeEmail(row.email);
    if (!isAllowedEmail(email)) continue;
    const form = records.get(email);
    records.set(email, {
      email,
      name: cleanName(row.display_name) || form?.name || "",
      superpower: form?.superpower || "",
      topTalent: String(row.top_talent ?? "").trim(),
      source: "platform",
    });
  }

  return [...records.values()]
    .sort((a, b) => a.email.localeCompare(b.email))
    .map((record) => {
      const language = isRussian(record) ? "ru" : "en";
      const draft = language === "ru" ? russianDraft(record) : englishDraft(record);
      return {
        email: record.email,
        name: record.name || "there",
        language,
        subject: draft.subject,
        body: draft.body,
      };
    });
}

export function renderAppsScript(drafts) {
  const json = JSON.stringify(drafts, null, 2).replaceAll("</", "<\\/");
  return `/**
 * Warm-base Gmail draft creator.
 * Generated by scripts/generate-warm-base-drafts.mjs.
 *
 * Run createWarmBaseDrafts() once from script.google.com. A per-recipient
 * property is recorded after each successful draft, so a retry after an
 * interruption will not create duplicates.
 */
const WARM_BASE_DRAFTS = ${json};

function createWarmBaseDrafts() {
  const properties = PropertiesService.getUserProperties();
  let created = 0;
  let skipped = 0;

  WARM_BASE_DRAFTS.forEach(function (draft) {
    const key = "warm-base-draft:" + draft.email.toLowerCase();
    if (properties.getProperty(key)) {
      skipped += 1;
      return;
    }

    GmailApp.createDraft(draft.email, draft.subject, draft.body);
    properties.setProperty(key, new Date().toISOString());
    created += 1;
  });

  console.log("Created " + created + " drafts; skipped " + skipped + " already created.");
}
`;
}

export function generate() {
  const platformRows = parseCsv(readFileSync(PLATFORM_PATH, "utf8"));
  const formRows = parseCsv(readFileSync(FORM_PATH, "utf8"));
  const drafts = buildDraftRows(platformRows, formRows);
  writeFileSync(
    OUTPUT_CSV,
    stringifyCsv(drafts, ["email", "name", "language", "subject", "body"]),
  );
  writeFileSync(OUTPUT_GS, renderAppsScript(drafts));
  return drafts;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const drafts = generate();
  const languages = Object.groupBy
    ? Object.groupBy(drafts, (draft) => draft.language)
    : drafts.reduce((groups, draft) => {
        (groups[draft.language] ||= []).push(draft);
        return groups;
      }, {});
  console.log(
    `Generated ${drafts.length} drafts (${languages.en?.length ?? 0} EN, ${languages.ru?.length ?? 0} RU).`,
  );
}
