График работы сотрудников

Next.js + TypeScript + Ant Design 4.24. Таймлайн смен с режимами План/Факт, подсветкой отклонений (опоздание, ранний уход, прогул),
фильтрами, светлой/тёмной темой и локалью ru-RU. Архитектура — Feature-Sliced Design (FSD).

✨ Возможности

Таймлайн на несколько дней

адаптивная сетка по 2 часа;

«липкая» шкала времени;

разграничители суток + подписи дат.

План / Факт

план — залитая плашка, факт — штриховка поверх;

автоматическая подрезка интервалов на границах диапазона;

в узких местах плашки «умнеют»: скрывают подписи/бейджи.

Отклонения

late — опоздание (красная «шапка» слева),

early — ранний уход (оранжевая «шапка» справа),

absence — прогул (штрих-пунктирное кольцо + чип).

Типы отклонений оформлены enum’ом DeviationType.

Фильтры

показ/скрытие факта;

чекбоксы по отклонениям (работают через единый тип FiltersState);

пример HOC над Checkbox — PersistedCheckbox c сохранением состояния в LocalStorage (filters:late|early|absence).

Тема

переключатель светлая/тёмная;

хук useTheme сохраняет выбор в LS (ui-theme) и добавляет

<link> на antd.dark.css (есть фоллбек на CDN).

Улучшенные скроллбары

кроссбраузерные, «подтянутые» стили — достаточно повесить класс nice-scroll на нужный контейнер.

Локализация

ruRU для AntD + dayjs с ru-локалью.

Производительность

мемоизация строк таймлайна (React.memo);

реэкспорт AntD через фасад с импортами из antd/es/\* для корректного tree-shaking.

🧱 Архитектура (FSD) src/ ├─ app/ # Next.js App Router │ ├─ layout.tsx # глобальные стили, antd.css │ └─ page.tsx # сборка виджета │ ├─
widgets/ │ └─ schedule/ # виджет расписания │ ├─ ui/ │ │ ├─ Schedule.tsx # контейнер виджета │ │ ├─ Timeline.tsx # «полотно» с рядами │ │ └─
Row.tsx # одна строка таймлайна │ └─ timeline.css # стили виджета │ ├─ features/ │ └─ timeline-filters/ │ ├─ ui/Filters.tsx # панель
фильтров │ └─ model/types.ts # FiltersState │ ├─ entities/ │ └─ shift/ │ ├─ model/ │ │ ├─ types.ts # ShiftPlan/ShiftFact │ │ └─
deviation.ts # enum DeviationType, дефолтные флаги │ └─ lib/ │ ├─ groupRows.ts # группировка планов по строкам │ ├─ buildFactIndex.ts #
индекс фактов │ └─ timeScale.ts # HOUR_MS, COL_HOURS │ ├─ shared/ │ ├─ ui/ │ │ ├─ antd.ts # фасад-реэкспорт AntD (см. ниже) │ │ ├─
PersistedCheckbox.tsx # HOC-вариант чекбокса │ │ └─ timeline/size.ts # правила размеров баров │ ├─ styles/scrollbars.css # .nice-scroll
стили скролла │ ├─ lib/date/getInitialRange.ts# стартовый диапазон (сегодня и 3 дня назад) │ └─ config/theme/useTheme.ts # переключение
темы + antd.dark.css │ └─ public/ └─ data/ # мок-данные (plan.json, fact.json)

Зачем реэкспорт AntD?

Файл src/shared/ui/antd.ts — единая точка импорта:

красивые импорты: import { DatePicker, Tooltip, ruRU, ConfigProvider } from '@/shared/ui/antd';

tree-shaking: импорт идёт из antd/es/\*, сборщик не подтягивает целиком antd;

изоляция внешней библиотеки — при миграции на другую версию/библиотеку меняется один фасад.

Пример содержимого:

// src/shared/ui/antd.ts export { default as ConfigProvider } from 'antd/es/config-provider'; export { default as Space } from
'antd/es/space'; export { default as Tooltip } from 'antd/es/tooltip'; export { default as Divider } from 'antd/es/divider'; export {
default as Tag } from 'antd/es/tag'; export { default as Checkbox } from 'antd/es/checkbox'; export { default as Switch } from
'antd/es/switch'; export { default as DatePicker } from 'antd/es/date-picker'; export { default as ruRU } from 'antd/es/locale/ru_RU';
export { default as Typography } from 'antd/es/typography'; // …и подкомпоненты Typography при необходимости

Важно: в коде проекта не смешиваем импорты из корня "antd" и из antd/es/\*. CSS AntD подключаем один раз в app/layout.tsx: import
'antd/dist/antd.css'.

Пример HOC над Checkbox

PersistedCheckbox демонстрирует, как подключать HOC, не ломая базовые компоненты. Обычный Checkbox остаётся доступным через фасад, а
HOC-версия живёт отдельно:

// src/shared/ui/PersistedCheckbox.tsx import { Checkbox } from '@/shared/ui/antd'; import { withPersistedChecked } from
'@/shared/ui/hoc/withPersistedChecked';

// добавляет проп persistKey и синхронизацию с localStorage export const PersistedCheckbox = withPersistedChecked(Checkbox);

Использование в фильтрах:

<PersistedCheckbox persistKey="filters:late" checked={deviations.late} onChange={(e) => onChange({ deviations: { ...deviations, late:
e.target.checked } })}

> Опоздания </PersistedCheckbox>

🚀 Как запустить

1. Предусловия

Node.js >= 18

менеджер пакетов: pnpm / yarn / npm

2. Установка

# один из вариантов:

pnpm i

# или

yarn

# или

npm i

3. Режим разработки pnpm dev # http://localhost:3000

4. Продакшн-сборка pnpm build pnpm start

5. Данные

Моки лежат в public/data (например, plan.json, fact.json). Их можно менять, не пересобирая приложение — фронт читает JSON-файлы как статику.

🧩 Ключевые куски Диапазон дат по умолчанию // сегодня (endOf('day')) и три дня назад (startOf('day')) getInitialRange(): { fromMs, toMs }

Темизация

useTheme() хранит выбор в localStorage("ui-theme"), ставит атрибут data-theme, и подключает antd.dark.css из /public (если 404 — подменяет
на CDN jsDelivr).

Скроллбары

Добавьте класс nice-scroll на любой контейнер со скроллом и импортируйте стили:

<div className="timeline nice-scroll">…</div>

🧭 Правила зависимостей (коротко по FSD)

shared — базовые переиспользуемые вещи (утилиты, UI, стили, конфиг).

entities — доменные модели и их примитивы (тип ShiftPlan, DeviationType).

features — пользовательские сценарии/интеракции (timeline-filters).

widgets — готовые блоки для страниц (виджет расписания).

app/pages — конкретные страницы и их композиция из виджетов/фич.

Зависимости сверху вниз: app → widgets → features → entities → shared. Обратных зависимостей быть не должно.

🛠️ Полезные команды pnpm lint # ESLint pnpm format # Prettier pnpm typecheck # TypeScript

🐞 Частые вопросы

404 на /antd.dark.css Проверь, что файл лежит в /public/antd.dark.css. Если нет — хук подхватит CDN-версию автоматически. Для офлайн-режима
положите файл в public.

Tooltip/типизация AntD Все импорты AntD идут через src/shared/ui/antd.ts, который реэкспортирует модули из antd/es/\*. Не смешивайте это с
import { … } from 'antd'.
