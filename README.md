# График работы сотрудников

Next.js + TypeScript + Ant Design 4.24. Таймлайн смен с режимами **План/Факт**, подсветкой отклонений (**опоздание**, **ранний уход**,
**прогул**), фильтрами, светлой/тёмной темой и локалью **ru-RU**. Архитектура — **Feature-Sliced Design (FSD)**.

---

## Поднятие проекта

-   yarn (установка зависимостей)
-   yarn dev (поднятие в режиме разработки)
-   yarn build (сборка)
-   yarn start (полнятие в продакшн режиме)

## ✨ Возможности

-   **Таймлайн на несколько дней**
    -   «липкая» шкала времени, сетка по 2 часа, разделители суток и подписи дат;
    -   автоматическая подрезка интервалов по границам выбранного диапазона.
-   **План / Факт**
    -   план — сплошная плашка; факт — штрихованная поверх;
    -   компактные режимы: на узких барах скрываются бейджи и время.
-   **Отклонения (enum)**
    -   `late` — опоздание, `early` — ранний уход, `absence` — прогул;
    -   настройки через фильтры; типы оформлены `DeviationType`.
-   **Фильтры**
    -   показ/скрытие факта;
    -   чекбоксы по отклонениям;
    -   пример HOC над AntD Checkbox — `PersistedCheckbox` (сохранение состояния в LocalStorage).
-   **Тема**
    -   светлая/тёмная; выбор сохраняется в LS (`ui-theme`);
    -   `useTheme` подключает `antd.dark.css` (локально, с фоллбеком на CDN).
-   **Локализация**
    -   `ruRU` для AntD и `dayjs` с `ru`-локалью.
-   **Скроллбары**
    -   кроссбраузерные стили: достаточно повесить класс `nice-scroll` на контейнер.
-   **Производительность**
    -   `React.memo` для строк таймлайна;
    -   реэкспорт AntD через фасад с импортами из `antd*` для корректного tree-shaking.

---

## 🧱 Архитектура (FSD)

<details>
<summary><strong>Структура проекта</strong></summary>

```text
src/
├─ app/
│  ├─ layout.tsx
│  └─ page.tsx
├─ widgets/
│  └─ schedule/
│     ├─ ui/
│     │  ├─ Schedule.tsx
│     │  ├─ Timeline.tsx
│     │  └─ Row.tsx
│     └─ timeline.css
├─ features/
│  └─ timeline-filters/
│     ├─ ui/
│     │  └─ Filters.tsx
│     └─ model/
│        └─ types.ts
├─ entities/
│  └─ shift/
│     ├─ model/
│     │  ├─ types.ts
│     │  └─ deviation.ts
│     └─ lib/
│        ├─ buildFactIndex.ts
│        ├─ groupRows.ts
│        └─ timeScale.ts
├─ shared/
│  ├─ config/
│  │  └─ theme/
│  │     └─ useTheme.ts
│  ├─ lib/
|  |  ├─ antd.ts  # фасад-реэкспорт AntD
│  │  └─ date/
│  │     └─ getInitialRange.ts
│  ├─ styles/
│  │  └─ scrollbars.css
│  └─ ui/
│     ├─ PersistedCheckbox.tsx   # пример HOC над Checkbox
│     └─ timeline/
│        └─ size.ts
└─ public/
   └─ data/
      ├─ plan.json
      └─ fact.json
```
