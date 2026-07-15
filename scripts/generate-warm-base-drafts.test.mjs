import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

import {
  buildDraftRows,
  isAllowedEmail,
  parseCsv,
  renderAppsScript,
  stringifyCsv,
} from "./generate-warm-base-drafts.mjs";

it("CSV parser round-trips multiline and quoted fields", () => {
  const rows = [{ email: "a@example.com", body: 'Hello,\n"friend"' }];
  expect(parseCsv(stringifyCsv(rows, ["email", "body"]))).toEqual(rows);
});

it("email filter rejects malformed, internal, admin, test, and alias addresses", () => {
  expect(isAllowedEmail("real@example.com")).toBe(true);
  expect(isAllowedEmail("not-an-email")).toBe(false);
  expect(isAllowedEmail("person+tag@example.com")).toBe(false);
  expect(isAllowedEmail("admin@example.com")).toBe(false);
  expect(isAllowedEmail("person@findyourtoptalent.com")).toBe(false);
  expect(isAllowedEmail("alexanderkonst@gmail.com")).toBe(false);
});

it("form headings and empty first slots do not become personalization", () => {
  const rows = buildDraftRows([], [
    {
      Email: "person@example.com",
      Name: "Person",
      Superpower:
        "MY ZONE OF GENIUS:\n\n1. \n\n2. Efficient Organizing: You thrive in organizing tasks efficiently.\n\n3. Leadership Taking.",
    },
  ]);
  expect(rows[0].body).toMatch(/Efficient Organizing/);
  expect(rows[0].subject).not.toMatch(/MY ZONE OF GENIUS/);
});

it("platform row wins while retaining form superpower words", () => {
  const rows = buildDraftRows(
    [
      {
        email: "person@example.com",
        display_name: "Fresh Name",
        talent_reveal_completed: "yes",
        top_talent: "Sense Patterns",
      },
    ],
    [
      {
        Email: "PERSON@example.com",
        Name: "Old Name",
        Superpower: "Your superpower is to:\n1. Bring order to complex situations.",
      },
    ],
  );
  expect(rows).toHaveLength(1);
  expect(rows[0].name).toBe("Fresh Name");
  expect(rows[0].subject).toBe("Your top talent: Sense Patterns");
  expect(rows[0].body).toMatch(/founder of FindYourTopTalent/);
  expect(rows[0].body).toContain(
    "Some months back you revealed your top talent on the platform: Sense Patterns",
  );
  expect(rows[0].body).toContain(
    "The platform is one piece of a bigger possibility: helping people build their own growing business",
  );
  expect(rows[0].body).not.toMatch(/helping me get here/);
});

it("platform rows without a completed reveal use the professional fallback", () => {
  const [draft] = buildDraftRows(
    [
      {
        email: "person@example.com",
        display_name: "Person Example",
        talent_reveal_completed: "no",
        top_talent: "",
      },
    ],
    [],
  );
  expect(draft.subject).toBe("What's next for you professionally?");
  expect(draft.body).toContain(
    "Some time back you created your profile on the platform. I wonder where things stand for you now.",
  );
});

it("common Gmail domain typos are corrected before drafting", () => {
  const rows = buildDraftRows(
    [
      {
        email: "person@gmai.com",
        display_name: "Person",
        talent_reveal_completed: "yes",
        top_talent: "Listen",
      },
    ],
    [],
  );
  expect(rows[0].email).toBe("person@gmail.com");
});

it("generated drafts contain both requested links and locked final language", () => {
  const platform = parseCsv(readFileSync("docs/warm_base_platform_users.csv", "utf8"));
  const form = parseCsv(
    readFileSync("docs/02-strategy/warm-base/superpower_responses.csv", "utf8"),
  );
  const rows = buildDraftRows(platform, form);
  expect(new Set(rows.map((row) => row.email)).size).toBe(rows.length);
  for (const row of rows) {
    expect(row.body, row.email).toContain(
      "https://cal.com/aleksandrkonstantinov/direction-choice-call",
    );
    expect(row.body, row.email).toContain("findyourtoptalent.com");
    expect(row.body, row.email).toMatch(
      /get clarity on next steps|получаем ясность по следующему шагу/,
    );
    expect(row.body, row.email).not.toMatch(
      /No awkward sales pitching|Никаких неловких продаж|scaling business/,
    );
  }
});

it("renders the four final cohort letters verbatim after personalization", () => {
  const rows = buildDraftRows(
    [
      {
        email: "platform-en@example.com",
        display_name: "Taylor Example",
        talent_reveal_completed: "yes",
        top_talent: "See hidden patterns",
      },
      {
        email: "platform-ru@example.ru",
        display_name: "Анна Пример",
        talent_reveal_completed: "yes",
        top_talent: "Видеть скрытые связи",
      },
    ],
    [
      {
        Email: "superpower-en@example.com",
        Name: "Taylor",
        Superpower: "See hidden patterns",
      },
      {
        Email: "superpower-ru@example.ru",
        Name: "Анна",
        Superpower: "Видеть скрытые связи",
      },
    ],
  );
  const byEmail = Object.fromEntries(rows.map((row) => [row.email, row]));

  expect(byEmail["superpower-en@example.com"].subject).toBe(
    "Your zone of genius: See hidden patterns",
  );
  expect(byEmail["superpower-en@example.com"].body).toBe(
    `Hey friend,\n\nIt's Sasha.\n\nA few years ago you did the zone of genius discovery with me.\n\nHere's the phrasing you landed on back then: See hidden patterns\n\nDoes it still resonate? I'm sure you've gained even more clarity about yourself since.\n\nOver these years, creating that test led me to the work of my life: helping people build their own business by monetizing their "zone of genius."\n\nThank you for helping me get here 💗\n\nI'll share the main secret I've discovered for myself on this path.\n\nSelf-knowledge is the source that professional success is born from.\n\nWhen I applied this formula to my business and the businesses of others, building a scalable business from scratch with AI became radically simpler and faster so I am sharing it with the world.\n\nI run free 45-minute calls on finding your next professional direction. We look at your situation together, and get clarity on next steps.\n\nThey're especially useful when the transition to your next professional level has been dragging on, or when you're ready to see which vector to choose.\n\nIf that's you, pick a time right in my calendar: https://cal.com/aleksandrkonstantinov/direction-choice-call\n\nAnd if someone you know would benefit from the free self-discovery test, here's its latest version: findyourtoptalent.com\n\nSasha`,
  );

  expect(byEmail["superpower-ru@example.ru"].subject).toBe(
    "Твоя зона гениальности: Видеть скрытые связи",
  );
  expect(byEmail["superpower-ru@example.ru"].body).toBe(
    `Привет!\n\nЭто Саша.\n\nТы проходил(а) со мной тест на определение зоны гениальности несколько лет назад.\n\nУ тебя тогда получилась вот такая формулировка: Видеть скрытые связи\n\nВсе еще резонирует? Уверен, что с тех пор у тебя прибавилось ясности в понимании себя.\n\nЗа прошедшие годы создание того теста вывело меня на дело моей жизни: помогать строить собственный бизнес через монетизацию своей «зоны гениальности».\n\nСпасибо, что ты помог(ла) мне сюда добраться 💗\n\nПоделюсь главным секретом, который я для себя открыл на этом пути.\n\nСамопонимание — это источник, из которого рождается профессиональный успех.\n\nКогда я применил эту формулу к моему и другим бизнесам, создание масштабируемого бизнеса с нуля с помощью ИИ радикально упростилось и ускорилось, и я стал этим делиться с миром.\n\nЯ провожу бесплатные 45-минутные созвоны по нахождению следующего профессионального направления. Мы просто вместе смотрим на твою ситуацию, и получаем ясность по следующему шагу.\n\nОни особенно полезны, когда переход на следующий профессиональный уровень подзатянулся, или когда уже хочется понять, какой вектор выбрать.\n\nЕсли это про тебя, можешь выбрать время прямо в моём календаре: https://cal.com/aleksandrkonstantinov/direction-choice-call\n\nЕсли кому-то из знакомых будет полезно пройти бесплатный тест на самоопределение, вот его последняя версия: findyourtoptalent.com\n\nСаша`,
  );

  expect(byEmail["platform-en@example.com"].subject).toBe(
    "Your top talent: See hidden patterns",
  );
  expect(byEmail["platform-en@example.com"].body).toBe(
    `Hey Taylor,\n\nIt's Sasha, the founder of FindYourTopTalent.\n\nSome months back you revealed your top talent on the platform: See hidden patterns\n\nDoes it still resonate? I'd love to know what's happened with it since.\n\nThe platform is one piece of a bigger possibility: helping people build their own growing business by monetizing their zone of genius.\n\nHere is the main secret I've discovered on this path:\n\nSelf-knowledge is the source that professional success is born from.\n\nWhen I applied this formula to my business and the businesses of others, building a scalable business from scratch with AI became radically simpler and faster so I am sharing it with the world.\n\nI run free 45-minute calls on finding your next professional direction. We look at your situation together, and get clarity on next steps.\n\nThey're especially useful when the transition to your next professional level has been dragging on, or when you're ready to see which vector to choose.\n\nIf that's you, pick a time right in my calendar: https://cal.com/aleksandrkonstantinov/direction-choice-call\n\nAnd if someone you know would benefit from the free self-discovery test, pass it along: findyourtoptalent.com\n\nSasha`,
  );

  expect(byEmail["platform-ru@example.ru"].subject).toBe(
    "Твой главный талант: Видеть скрытые связи",
  );
  expect(byEmail["platform-ru@example.ru"].body).toBe(
    `Привет, Анна!\n\nЭто Саша, основатель FindYourTopTalent.\n\nТы проходил(а) процесс раскрытия топ таланта на сайте, и у тебя тогда получилась вот такая формулировка: Видеть скрытые связи\n\nВсе еще резонирует? Уверен, что с тех пор у тебя прибавилось ясности в понимании себя.\n\nСоздание этого теста заняло несколько лет, и вывело меня на дело моей жизни: помогать строить собственный бизнес через монетизацию своей «зоны гениальности».\n\nПоделюсь главным секретом, который я для себя открыл на этом пути.\n\nСамопонимание — это источник, из которого рождается профессиональный успех.\n\nКогда я применил эту формулу к моему и другим бизнесам, создание масштабируемого бизнеса с нуля с помощью ИИ радикально упростилось и ускорилось, и я стал этим делиться с миром.\n\nЯ провожу бесплатные 45-минутные созвоны по нахождению следующего профессионального направления. Мы просто вместе смотрим на твою ситуацию, и получаем ясность по следующему шагу.\n\nОни особенно полезны, когда переход на следующий профессиональный уровень подзатянулся, или когда уже хочется понять, какой вектор выбрать.\n\nЕсли это про тебя, можешь выбрать время прямо в моём календаре: https://cal.com/aleksandrkonstantinov/direction-choice-call\n\nЕсли кому-то из знакомых будет полезно пройти бесплатный тест на самоопределение, ты знаешь адрес - findyourtoptalent.com :)\n\nСаша`,
  );
});

it("Apps Script is idempotent per recipient", () => {
  const script = renderAppsScript([
    { email: "a@example.com", name: "A", language: "en", subject: "Hi", body: "Body" },
  ]);
  expect(script).toMatch(/GmailApp\.createDraft/);
  expect(script).toMatch(/PropertiesService\.getUserProperties/);
  expect(script).toMatch(/properties\.setProperty/);
  expect(script).toMatch(/warm-base-draft:2026-07-15-final-v2:/);
});
