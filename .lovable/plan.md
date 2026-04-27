Проблема уже достаточно ясна: `auth-email-hook` падает на импорте `npm:@lovable.dev/webhooks-js`. `nodeModulesDir: "auto"` и локальный `deno install` не лечат это надежно, потому что деплой/рантайм Deno не стабильно резолвит этот приватный npm-пакет. При этом код пакета простой: HMAC SHA-256 проверка `x-lovable-signature` + timestamp + JSON parsing.

## План исправления

1. **Убрать хрупкую зависимость из `auth-email-hook`**
   - Удалить импорт:
     - `parseEmailWebhookPayload` из `@lovable.dev/email-js`
     - `WebhookError`, `verifyWebhookRequest` из `@lovable.dev/webhooks-js`
   - Оставить `@lovable.dev/email-js` только там, где он реально нужен для отправки писем (`process-email-queue`).

2. **Встроить минимальную webhook-проверку прямо в `auth-email-hook/index.ts`**
   - Реализовать локально:
     - `WebhookError` с теми же кодами ошибок
     - `computeSignature()` через Web Crypto HMAC SHA-256
     - constant-time сравнение сигнатур
     - timestamp parsing + 5-minute tolerance
     - body size limit 1 MB
     - JSON parsing/validation payload (`version`, `type`, `run_id`, `data.action_type`, `data.email`)
   - Поведение webhook останется тем же, но без внешнего приватного пакета.

3. **Почистить Deno-конфигурацию функции**
   - Оставить `deno.json` минимальным с `nodeModulesDir: "auto"` для React Email и Supabase client.
   - Удалить/обновить lockfile функции, если он продолжит тащить `@lovable.dev/webhooks-js` и ломать deploy.

4. **Проверить сборку и деплой**
   - Запустить Deno test/deploy validation для `auth-email-hook`.
   - Задеплоить `auth-email-hook`.
   - Вызвать preview endpoint или function smoke test, чтобы убедиться, что функция грузится и больше не падает на import resolution.

5. **Если всплывет следующий пакет**
   - Если после этого упадет `process-email-queue` на `@lovable.dev/email-js`, применить тот же принцип: заменить `sendLovableEmail` локальной минимальной функцией на `fetch("https://api.lovable.dev/v1/messaging/email/send")`, поскольку пакет тоже небольшой.
   - Но сначала фиксируем именно текущий blocking import в `auth-email-hook`.

## Почему это правильнее, чем снова `deno install`

Мы уже видим, что пакет присутствует локально, но ошибка приходит от Deno resolution в среде выполнения/деплоя. Значит проблема не в бизнес-логике email hook, а в приватном npm resolution. Самый надежный фикс — убрать этот runtime dependency из критического auth hook и оставить всю проверку webhook внутри функции.