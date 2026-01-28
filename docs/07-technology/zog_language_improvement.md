# Zone of Genius Language Improvement

## 🎯 Проблема (простым языком)

Сейчас наша платформа даёт крутые, но слишком "космические" описания людей:
- "Когерентный Алхимик" 
- "Sacred Mirror · Mother Healer"
- "Temple Builder of Futures"

Это красиво, но:
1. **Непонятно** — человек читает и не понимает слов
2. **Не заземлённо** — нет связи с реальной жизнью
3. **Не применимо** — непонятно что делать завтра

## 💡 Решение (простым языком)

**Добавляем "переводчика"** — после каждого красивого описания даём простое:

| Сейчас | Станет |
|--------|--------|
| "Когерентный Алхимик" | + "Я помогаю хаотичным системам стать гармоничными" |
| "Sacred Mirror" | + "Я отражаю людям их истинную суть" |
| "Prime Driver: Forge Sacred Form" | + "Создаю конкретные структуры из абстрактных идей" |

**Формула:** `Красивое название` + `Что это значит на практике`

---

## 🔧 Что меняем

### 1. Appleseed (Зона Гениальности)

**Файл:** Edge function для генерации Appleseed (нужно найти)

**Добавляем в промпт:**
```
LANGUAGE GUIDELINES:
- For every abstract term, provide a simple explanation
- archetype_title should be poetic but archetype_meaning should be in everyday language
- Use words a 13-year-old would understand in the "meaning" fields
- Connect every concept to a real-world action or result

OUTPUT ADDITIONS:
- archetype_meaning: "What this means in plain language"
- primeDriver_meaning: "What I actually do"
- tagline_simple: "One sentence anyone can understand"
```

### 2. Excalibur (Уникальное Предложение)

**Файл:** `supabase/functions/generate-excalibur/index.ts`

**Изменения в EXCALIBUR_PHILOSOPHY (строка 12-29):**
```
ADD TO GUIDING TENETS:
7. Plain Language Rule — Every poetic term must have a plain-language twin.
   "Sacred Mirror" → "I reflect back what people can't see in themselves"
8. 13-Year-Old Test — If a 13-year-old wouldn't understand it, rewrite it.
```

**Изменения в OUTPUT FORMAT (строка 136-174):**
```json
{
  "essenceAnchor": {
    "coreVibration": "string - poetic name",
    "coreVibration_plain": "string - what this means in everyday words",
    "primeDriver": "string - 3-word formula",
    "primeDriver_plain": "string - what I actually do",
    "archetype": "string - compound archetype",
    "archetype_plain": "string - who I am in simple terms"
  },
  // ... rest unchanged
}
```

---

## 📋 Задачи для Codex

### Task 1: Update Excalibur Prompt
```
Файл: ai_tasks/PENDING_excalibur_plain_language.md
- Добавить Language Guidelines в EXCALIBUR_PHILOSOPHY
- Добавить _plain поля в OUTPUT FORMAT
- Добавить пример в EXCALIBUR_EXAMPLES с plain language
```

### Task 2: Update Appleseed Prompt  
```
Файл: ai_tasks/PENDING_appleseed_plain_language.md
- Найти edge function для Appleseed
- Добавить те же Language Guidelines
- Добавить _plain поля в output
```

### Task 3: Update UI Display
```
Файл: ai_tasks/PENDING_zog_display_plain_language.md
- В UI показывать оба: красивое + простое
- Формат: "Когерентный Алхимик" (маленьким: "помогаю системам стать гармоничными")
```

---

## ✅ Критерии успеха

1. Человек читает свой результат и говорит: "Да, это я!"
2. Он может объяснить друзьям, что это значит
3. Он знает, что делать завтра утром

---

*Plan v1.0*
