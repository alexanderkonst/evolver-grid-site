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
  "https://cal.com/aleksandrkonstantinov/direction-choice-call";
const SELF_DISCOVERY_URL = "findyourtoptalent.com";
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

function platformEnglishDraft(record) {
  const hasTalent =
    record.talentRevealCompleted === "yes" && Boolean(record.topTalent);
  const name = firstName(record.name) || "friend";
  const subject = hasTalent
    ? `Your top talent: ${record.topTalent}`
    : "What's next, professionally";
  const platformMemory = hasTalent
    ? `Some time back you revealed your top talent on the platform: ${record.topTalent}\n\nDoes it still resonate? I'd love to know what's happened with your professional clarity since.`
    : "Some time back you created your profile on the platform. I wonder where things stand for you now.";

  return {
    subject,
    body: `Hey ${name},\n\nIt's Sasha, the person behind FindYourTopTalent.\n\n${platformMemory}\n\nThe talent reveal is one piece of a bigger possibility: helping people build their own scaling business by monetizing their zone of genius.\n\nHere is the main secret I've discovered on this path:\n\nSelf-knowledge is the source that professional success is born from.\n\nWhen I applied this formula to my business and the businesses of others, building a scalable business from scratch with AI became radically simpler and faster.\n\nI run free 45-minute calls on finding your next professional direction. No awkward sales pitching, we just look at your situation together.\n\nThese calls are especially useful when the transition to your next professional level has been dragging on, or when you're ready to see which vector to choose.\n\nIf that's you, pick a time right in my calendar: ${DIRECTION_CALL_URL}\n\nAnd if someone you know would benefit from the free self-discovery test, pass it along: ${SELF_DISCOVERY_URL}\n\nSasha`,
  };
}

function platformRussianDraft(record) {
  const hasTalent =
    record.talentRevealCompleted === "yes" && Boolean(record.topTalent);
  const name = firstName(record.name) || "друг";
  const subject = hasTalent
    ? `Твой главный талант: ${record.topTalent}`
    : "Что дальше в профессиональной жизни?";
  const platformMemory = hasTalent
    ? `Некоторое время назад ты раскрыл свой главный талант на платформе: ${record.topTalent}\n\nВсе еще резонирует? Мне очень интересно, что с тех пор происходило с твоей профессиональной ясностью.`
    : "Некоторое время назад ты создал свой профиль на платформе. Интересно, где ты находишься сейчас.";

  return {
    subject,
    body: `Привет, ${name}!\n\nЭто Саша, создатель FindYourTopTalent.\n\n${platformMemory}\n\nРаскрытие таланта - это одна часть более широкой возможности: я помогаю людям строить собственный масштабируемый бизнес через монетизацию своей зоны гениальности.\n\nВот главный секрет, который я открыл на этом пути:\n\nСамопонимание - это источник, из которого рождается профессиональный успех.\n\nКогда я применил эту формулу к своему бизнесу и бизнесам других людей, создание масштабируемого бизнеса с нуля с помощью ИИ стало радикально проще и быстрее.\n\nЯ провожу бесплатные 45-минутные созвоны по нахождению следующего профессионального направления. Никаких неловких продаж, мы просто вместе смотрим на твою ситуацию.\n\nЭти созвоны особенно полезны, когда переход на следующий профессиональный уровень подзатянулся или когда ты готов увидеть, какой вектор выбрать.\n\nЕсли это про тебя, выбирай время прямо в моём календаре: ${DIRECTION_CALL_URL}\n\nЕсли кому-то из знакомых будет полезно пройти бесплатный тест на самоопределение, поделись с ним: ${SELF_DISCOVERY_URL}\n\nСаша`,
  };
}

function englishDraft(record) {
  if (record.source === "platform") return platformEnglishDraft(record);
  const talent = record.superpower || record.topTalent;
  const subject = talent
    ? `Your zone of genius: ${subjectPhrase(talent)}`
    : "Your zone of genius";
  const phrasing = talent
    ? `Here's the phrasing you landed on back then: ${talent}`
    : "I don't have your original phrasing on file anymore, but I still remember our work together.";
  const resonance = talent
    ? "Does it still resonate? I'm sure you've gained even more clarity about yourself since."
    : "I'm sure you've gained even more clarity about yourself since.";

  return {
    subject,
    body: `Hey friend\n\nIt's Sasha.\n\nA few years ago you did the zone of genius discovery with me.\n\n${phrasing}\n\n${resonance}\n\nOver these years, creating that test led me to the work of my life: helping people build their own scaling business by monetizing their "zone of genius."\n\nThank you for helping me get here 💗\n\nI'll share the main secret I've discovered for myself on this path.\n\nSelf-knowledge is the source that professional success is born from.\n\nUsing this formula, building a scalable business from scratch with AI becomes radically simpler, faster, and available to anyone.\n\nI run free 45-minute calls on finding next professional direction. No awkward sales pitching, we just look at your situation together.\n\nThey're especially useful when the transition to the next professional level has been dragging on, or when one is ready to choose the main direction.\n\nIf that's you, pick a time right in my calendar: ${DIRECTION_CALL_URL}\n\nAnd if someone you know would benefit from the free self-discovery test, here's its latest version: ${SELF_DISCOVERY_URL}\n\nSasha`,
  };
}

function russianDraft(record) {
  if (record.source === "platform") return platformRussianDraft(record);
  const talent = record.superpower || record.topTalent;
  const subject = talent
    ? `Твоя зона гениальности - ${subjectPhrase(talent)}`
    : "Твоя зона гениальности";
  const phrasing = talent
    ? `У тебя тогда получилась вот такая формулировка: ${talent}`
    : "Твоя исходная формулировка у меня не сохранилась, но я помню нашу совместную работу.";
  const resonance = talent
    ? "Все еще резонирует? Уверен, что с тех пор у тебя прибавилось ясности в понимании себя."
    : "Уверен, что с тех пор у тебя прибавилось ясности в понимании себя.";

  return {
    subject,
    body: `Привет, друг\n\nЭто Саша.\n\nТы проходил со мной тест на определение зоны гениальности несколько лет назад.\n\n${phrasing}\n\n${resonance}\n\nЗа прошедшие годы создание того теста вывело меня на дело моей жизни - помогать строить собственный бизнес через монетизацию своей «зоны гениальности».\n\nСпасибо, что ты помог мне сюда добраться 💗\n\nПоделюсь главным секретом, который я для себя открыл на этом пути.\n\n*Самопонимание - это источник, из которого рождается профессиональный успех.*\n\nС этой формулой создание масштабируемого бизнеса с нуля с помощью ИИ радикально упрощается и ускоряется.\n\nЯ провожу бесплатные 45-минутные созвоны по нахождению следующего профессионального направления. Никаких неловких продаж, мы просто вместе смотрим на твою ситуацию.\n\nОни особенно полезны, когда переход на следующий профессиональный уровень подзатянулся или когда уже хочется понять, какой вектор выбрать.\n\nЕсли это про тебя, выбирай время прямо в моём календаре: ${DIRECTION_CALL_URL}\n\nЕсли кому-то из знакомых будет полезно пройти бесплатный тест на самоопределение, вот его последняя версия: ${SELF_DISCOVERY_URL}\n\nСаша`,
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
      talentRevealCompleted: "",
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
      talentRevealCompleted: String(row.talent_reveal_completed ?? "")
        .trim()
        .toLowerCase(),
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
