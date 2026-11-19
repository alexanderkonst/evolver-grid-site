# Метод обучения — суть и карта файлов для другого агента

Подготовлено 19 ноября 2026. Перенесено в проект evolver-grid-site. Корень модуля: /Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning.

Мы разрабатываем адаптивный метод обучения через освоение и сочетание вложенных модульных структур навыка. Первый рабочий случай — обучение Саши японскому с русского языка.

Метод выбирает ключи по трём основаниям:
1. Сколько новых возможностей ключ открывает.
2. Насколько эти возможности важны человеку.
3. Какие следующие ключи и области деятельности становятся благодаря ему доступными.

Учитываются частотность реального использования, уже освоенные части и сложность следующего шага. Уроки дают материал для улучшения самого метода. Предпочтения ученика, наблюдения и общие гипотезы фиксируются с учётом того, где они применимы.

Каждый ключ объясняется в начале и конце его освоения одним предложением через призму «суть — значимость — следствия». Одобренный образец:
«Осваивая порядок событий в японской речи, ты обретаешь возможность делиться прожитым и замышлять будущее вместе с другим человеком».

Ежедневный минимум для японского — три самостоятельно построенные фразы, по одной за раз, примерно 2–5 минут. Далее — по желанию и энергии ученика.

## Таксономия и пути

### 1. Общий метод и переносимые промпты

Каталог:
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/

AI-SKILL-TUTOR-MASTER.md
Универсальный мастер-промпт для обучения любому навыку.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/AI-SKILL-TUTOR-MASTER.md

BUSINESS-RELATIONS-TUTOR.md
Полный универсальный промпт с задачами обучения деловым отношениям.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/BUSINESS-RELATIONS-TUTOR.md

MOON-MYSTICISM-TUTOR.md
Полный универсальный промпт с задачами изучения лунной мистики.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/MOON-MYSTICISM-TUTOR.md

README.md
Инструкция по использованию переносимых промптов.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/README.md

### 2. Языковая специализация и карта обучения

Каталог:
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/

AI-TUTOR-MASTER.md
Основная спецификация языкового тьютора. Содержит правила метода, особенности пары русский → японский и явные предпочтения Саши. Текст промпта на английском. Уроки на русском, японский отображается в ромадзи.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/AI-TUTOR-MASTER.md

JAPANESE-EVOLUTION-MAP.md
Маршрут устного японского до C2. По семь рабочих шагов на переход между уровнями, примеры модулей и критерии наблюдаемого продвижения.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/JAPANESE-EVOLUTION-MAP.md

JAPANESE-KEYBOOK.md
Пополняемая книга освоенных ключей. Краткие объяснения, таблицы, фразы ученика и ссылки на свидетельства из занятий.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/JAPANESE-KEYBOOK.md

### 3. Состояние ученика и продолжение уроков

LEARNER-STATE.md
Основной документ о текущих возможностях ученика, необходимой помощи и следующем шаге. При чтении учитывать последние обновления.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/LEARNER-STATE.md

HANDOFF.md
Заметки для продолжения другим агентом. Содержит хронологические обновления, последние уточняют текущую точку входа.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/HANDOFF.md

learner-model.json
Структурированная совместимая сводка состояния ученика. Основное содержательное описание находится в LEARNER-STATE.md.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/learner-model.json

### 4. Развитие и обоснование метода

BLUEPRINT.md
Устройство метода, рабочий цикл и принципы выбора ключей.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/BLUEPRINT.md

OBSERVATIONS.md
Наблюдения, изменения преподавания, обратная связь ученика и гипотезы для дальнейшей проверки.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/OBSERVATIONS.md

### 5. Записи, исходники и история

sessions/
Нумерованные записи занятий. В record.md зафиксированы задания, ответы, подсказки, трудности и следующий шаг.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/sessions/

Последняя завершённая запись на 19 ноября 2026:
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/sessions/027/record.md

sources/
Исходные материалы и сохранённые исторические версии.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/sources/

prompts/
Первоначальные промпты и дополнения.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/prompts/

templates/
Шаблоны записей.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/templates/

START-HERE.md
Точка входа в лабораторию.
/Users/alexanderkonst/evolver-grid-site/docs/06-modules/generative-learning/japanese-learning-lab/START-HERE.md

## Порядок входа для агента

Для продолжения японского:
AI-TUTOR-MASTER.md → последние обновления LEARNER-STATE.md и HANDOFF.md → последняя запись занятия → нужный раздел карты и книги ключей.

Для развития общего метода:
AI-SKILL-TUTOR-MASTER.md → BLUEPRINT.md → OBSERVATIONS.md → соответствующие записи занятий.

Для другого навыка:
AI-SKILL-TUTOR-MASTER.md + цель ученика, его исходные возможности и контекст применения.

Текущие версии на дату подготовки:
— Универсальный мастер v1.7.
— Языковой мастер v1.27.
— Карта японского v0.7.

Локальные пути требуют доступа к этому компьютеру или передачи самих файлов.
