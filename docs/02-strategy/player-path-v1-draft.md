# Player path v1 (DRAFT, not canon)

Status: Hark's synthesis sent to Sasha 2026-11-24 09:09 MST. Not adopted. Canon and code untouched.
Sasha 2026-11-24 21:39 MST: he wants to return to it when ready and build on this work. Keep it; do not implement until he reviews.
Related, also to return to: Founder Collective decisions D1-D4 (who is inside, terms line, rhythm, visibility).

Путь игрока: как бы я свёл три версии

## Рекомендация
Один путь и две проекции на него, а не три конкурирующих лестницы.

1. **Player One (§23.1, 13 шагов) становится хребтом.** Это последовательность квестов: что игрок делает и в каком порядке.
2. **Gift Path (§20, 4 стадии) становится шкалой прогресса**, а не вторым маршрутом: сырой дар → первая оплата от незнакомца → продукт → масштаб. Ступени засчитываются по следу в реальности. Показывается в доме и лавке.
3. **Journey (§14.2, J0–13) становится картой реализации**: какой модуль и маршрут ведут к каждому шагу Player One. Это служебная таблица, игрок её не видит.

## Почему
- «Путь игрока — это мой путь» (11-02). Это твоё последнее и самое цельное решение, в твоём порядке.
- «Gift path — это и есть процесс прохождения игры» (10-30) не спорит с этим, если читать его как измерение прогресса, а не как список дел. Так не появится третья шкала уровней (риск из §19.6).
- Journey уже зашит в код (`JOURNEY_SEQUENCE`). Его дешевле перепривязать к хребту, чем выбрасывать.

## Стыковка (черновик)
| Player One | Journey | Gift Path |
|---|---|---|
| 1 Reveal | J1 | I.1 |
| 2 Активация | — (медитации не в пути) | I.2 |
| 3 Интеграция, петля | — | I.3–I.4 |
| 4 Mission | J2 | — |
| 5 Ресурсы | J5 | — |
| 6–7 Что развивать, где я (QoL + глава) | J3–J4 | I.5 |
| 8 Спящий потенциал | — | — |
| 9–10 Лавка / The business within | J6–J7, J8 | I.6, II.1–II.2 |
| 11 Mastermind | J9 | II.3–II.7 (цена, первая продажа = J11–J12) |
| 12 Практики учителей | J10 | III |
| 13 Matchmaking | J13 (Town Hall) | IV |

## Что это вскрывает
- В коде нет твоих шагов 2, 3 и 8: активации, петли и спящего потенциала.
- Первой продажи нет в Player One явным шагом. Она живёт на шкале Gift Path (II.7) и открывает Town Hall.
- Спектр души (J3) в Player One не упомянут: вопрос, оставить ли его.

## Риски
- Если ты читаешь Gift Path как сам маршрут, схема переворачивается: хребтом становится дар, а Player One становится его первой стадией.
- Порядок Mission → лавка уже совпадает с решением 10-27 (Mission до бизнеса). Конфликта нет.

После твоего разбора: один раздел в GoBY с канонической таблицей, два других раздела ссылаются на него.

## Pending path moves (Sasha, 2026-11-24/25), collected here, not shipped
Sasha 2026-11-25 00:30 MST: «эти переносы - трики, там много деталей… Ломается часто. Пока не переносим, собираем в спеку по игровому пути.» Each move below waits for the path spec to be reviewed as a whole.
1. **Quality-of-life test leaves the profile.** The profile = top talent, mission, assets. QoL moves into the Academy as one of the first steps, after the first course «Your Unfolding Potential» (step 8 above, renamed 2026-11-24).
2. **Your AI instrument is received after the profile** (without QoL), not from the first screen (GoBY §25.10).
3. **The `oracle` village place becomes the quest «activate your AI»:** the AI names itself; an interactive course on it, power-ups, access to the Console (GoBY §25.10, Your AI tracker §21).
Until then the instrument ships behind the gate that already exists (the AI OS chip: T+M+A complete or `fytt:ai-os-visited`), and the `oracle` place stays as it is.
