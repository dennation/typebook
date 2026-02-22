# Studio — Roadmap

## Tier 0 — Launch Prep (максимальный ROI)

Без этого проект не наберёт аудиторию, независимо от качества кода.

### Hero GIF / скриншот
Анимированный GIF (5-10 секунд): пишешь `allOf('size')` → получаешь grid всех вариантов.
Без визуала люди не понимают ценность. Записать через QuickTime/OBS или сделать before/after скриншот (код → результат).
**Blocked by:** улучшения дизайна UI (сначала довести визуал до финального состояния, потом записывать).
**Effort: низкий.** **Impact: критический.** Это первое, что видят на GitHub.

### README: переписать на продающий формат
Текущий README технически хорош, но не продаёт. Новая структура:
1. One-liner: "Zero-boilerplate component stories from your TypeScript types"
2. Hero GIF
3. Comparison table: Storybook vs ui-studio (lines per story, type extraction, variant generation, cold start)
4. Quick Start (30 секунд до первого результата)
5. Features с code snippets (single, variants, matrix)
6. API reference
7. Requirements

За 10 секунд скролла должно быть понятно зачем это нужно.
**Blocked by:** Hero GIF.
**Effort: низкий.** **Impact: критический.**

### "Migrate from Storybook" guide
Главный driver adoption — люди ищут "Storybook alternative", не "new story tool".
- Маппинг концептов: CSF → define(), argTypes → automatic, decorators → defaults
- Before/after кода (15 строк Storybook → 3 строки ui-studio)
- Пошаговая инструкция миграции
- Что поддерживается, чего пока нет
**Effort: низкий.** **Impact: высокий.**

### Online demo (StackBlitz)
StackBlitz playground: Vite + React + ui-studio, 2-3 компонента (Button, Input, Card), все три вида историй.
Ссылка "Try it online" в README.
Люди хотят попробовать за 10 секунд без npm install. Конвертирует browser → star.
**Effort: низкий.** **Impact: высокий.**

### Landing page (одностраничник)
Минимальный лендинг: Hero GIF + one-liner + install command, comparison table, 3 фичи с code snippets, quick start, ссылки.
Деплой на Vercel/GitHub Pages.
**Effort: низкий–средний.** **Impact: высокий.**

### Стабилизация API → v1.0
v0.2.0 = "не готово к production". Для v1.0:
- Заморозить `define()` сигнатуру
- Добавить тесты на React компоненты (Studio, StoryRenderer, ComponentPreview)
- Edge cases в type extraction
- CHANGELOG.md
**Effort: средний.** **Impact: высокий.** v1.0 = "можно использовать".

### Launch посты
**Только после готовности README + demo + landing + v1.0.**
1. **Reddit r/reactjs** — "I built a Storybook alternative that auto-generates all component variants from your TypeScript types"
2. **Hacker News** — Show HN
3. **Twitter/X** — thread с GIF + comparison table
4. **Dev.to** — "Why I stopped writing Storybook stories manually"

Timing: вторник-среда утром EST.
**Blocked by:** всё выше.
**Effort: низкий.** **Impact: критический.**

---

## Tier 1 — Фундамент (дёшево, высокий профит)

Технический долг и архитектурные улучшения, без которых всё остальное строится на шатком фундаменте.

### Улучшение PropControl
`isControllable()` в `ComponentPreview.tsx` — контролы только для `literal`, `boolean`, `string`, `number`, `node`.
Минимально необходимые доработки:
- **Color picker** для строковых пропсов с именем `color`/`backgroundColor`/etc. — `<input type="color">`, 0 зависимостей.
- **Range slider** для number-пропсов — `<input type="range">` с min/max.
- **Textarea** для длинных строк / `node`-пропсов.
- **Actions log** — для `function`-пропсов вместо прочерка показать callback, который логирует вызовы в панель снизу (как Storybook Actions).
Каждый контрол — независимый, можно добавлять инкрементально.
**Effort: низкий–средний (на каждый контрол).** **Impact: высокий.** Интерактивность — ключевая ценность инструмента.

---

## Tier 2 — Производительность, надёжность и Quick Wins

### Устойчивость type extraction
`convertTsType()` в `ts-client.ts` уже покрывает: literals, boolean, string, number, function, ReactNode, template literals, conditional types (`Extract`/`Exclude`), intersection types, `Pick`/`Omit`/`Partial`, generics, nullable unions, complex unions.
Тесты: 10 describe-блоков, ~30 кейсов (fixtures).
Остаётся:
- **`Record<K, V>`** — не обрабатывается, падает в `unknown`.
- **Mapped types** (`{ [K in Keys]: V }`) — не обрабатываются.
- **Tuple types** (`[string, number]`) — не тестировались.
- **Расширить snapshot-тесты** — довести до 50+ кейсов для regression safety.
**Effort: низкий–средний.** **Impact: средний.** Основные кейсы уже покрыты.

### Copy-Paste Code Snippets
Кнопка «Copy JSX» на каждой variant-карточке и в interactive preview.
Клик → в буфере `<Button size="lg" variant="ghost">Click me</Button>`.
Пропсы уже известны точно (включая defaults) — генерация тривиальна.
Дизайнеры и PM-ы смогут бровзить studio и копировать готовый код.

### Shareable State Deep Links
Расширить hash-routing до кодирования состояния props panel:
`/#button/Default?size=lg&disabled=true&variant=ghost`.
Нашёл баг → скопировал URL → отправил в Slack/Jira → коллега видит то же самое.
Hash-routing уже есть (`useHashRoute.ts`) — нужно лишь serialize/deserialize props в query string.

### Custom Themes
Переключение пользовательских тем (бренды, цветовые схемы).
Обёртка ThemeProvider вокруг превью компонентов.
Light/dark toggle уже реализован — нужна поддержка произвольных тем через конфиг.

---

## Tier 2.5 — Дифференциаторы (средний effort, высокий impact)

### Responsive Preview
Кнопки Mobile / Tablet / Desktop — переключают ширину контейнера превью.
Критично для UI-библиотек.

### ~~Component Documentation (MDX / Markdown)~~ ✅ Implemented
Реализовано через `definePage()` и `.docs.tsx` файлы. Standalone documentation pages появляются в sidebar рядом с компонентами. MDX поддерживается через пользовательский `@mdx-js/rollup` плагин.

### Prop Coverage Map
Инструмент знает ВСЕ возможные значения пропсов из типов. Можно посчитать, какой процент комбинаций покрыт stories.
Визуализация: heatmap-таблица (строки — один проп, столбцы — другой, ячейка зелёная если покрыта).
Пример: Button имеет `size × variant × color` = 45 комбинаций. Stories покрывают 12. Coverage: 27%.
Это как code coverage, но для UI-вариантов. **Ни у кого такого нет.**

### Component API Diff / Changelog
PropInfo[] уже извлекается через TS Compiler API. Сохранять между сборками (JSON в `.studio/`), автоматический diff:
```
Button:
  + added prop `isLoading` (boolean)
  ~ `size` — added value 'xl'
  - removed prop `outline`
```
CI-интеграция: на каждый PR — автокомментарий «Component API changes».
Решает боль мейнтейнеров UI-библиотек: ручное отслеживание breaking changes.

---

## Tier 3 — Heavy Features (средний-высокий effort)

### Chaos / Stress Variants (UI Fuzz Testing)
Одна кнопка «Stress test» — автоматическая генерация граничных значений по типам пропсов:
- `string` → пустая строка, 500 символов, emoji, RTL текст, HTML-сущности
- `number` → 0, -1, 999999, NaN
- `boolean` → оба значения
- `ReactNode` → null, пустой fragment, глубоко вложенные элементы

Показывает как компонент ведёт себя на edge cases без единой строки конфигурации.
По сути fuzz-testing для UI. **Ни один инструмент этого не делает.**

### Testing Integration
Поэтапный план:
1. **Visual Snapshot Testing** — `npx @dennation/ui-studio test` → скриншоты всех вариантов, diff с предыдущими. CI-интеграция. Playwright для скриншотов.
2. **A11y Audit** — встроенный axe-core — проверка каждого варианта на accessibility прямо в UI. Бейдж pass/fail на каждой карточке.
3. **Interaction Recording & Replay** — записать последовательность взаимодействий (click → type → hover → blur) и сохранить как «interaction story». При изменении кода — воспроизвести автоматически.
**Effort: высокий (суммарно).** Каждый этап самостоятелен. **Impact: высокий.** Без тестов инструмент — только dev-time визуализатор, не часть CI/CD.

### AI Story Generation
Анализ компонента → автогенерация `.stories.tsx` с осмысленными вариантами.
Type extraction уже есть — AI может предложить edge cases: длинный текст, disabled + loading, etc.

---

## Tier 3.5 — Продвинутые фичи (высокий effort)

### Component Playground (JSX Editor)
Встроенный редактор JSX (Monaco/CodeMirror): написал `<Button size="lg" disabled>` → видишь результат.
Мощнее controls — позволяет тестировать композицию компонентов.

### Multi-Framework / Multi-Bundler Support
Сейчас: React + Vite. Это **не приоритет** на ранней стадии — лучше сделать идеальный React+Vite опыт, чем посредственный мультиплатформенный.
Но архитектурно стоит готовиться:
- Разделить `define()`/`resolve()` (framework-agnostic) от `<Studio />` (React-specific).
- Плагин абстрагировать от Vite (bundler adapter layer).
Реализация Vue/Svelte/webpack — только если будет реальный спрос.
**Effort: очень высокий.** **Impact: средний** (краткосрочно) / **высокий** (долгосрочно, для adoption).

### Render Performance Profiling
Каждый вариант уже в отдельном iframe. Измерить `performance.now()` до и после рендера.
Показать время рядом с карточкой. Heatmap по матрице: красные ячейки = медленные комбинации.

### Design Token Audit
В iframe доступен `getComputedStyle`. Извлечь реальные CSS-значения и сравнить с design tokens:
```
Button[size=lg]:
  font-size: 18px ✓ (token: --font-lg = 18px)
  padding: 12px 20px ✗ (token: --spacing-lg = 16px)
```
Автоматический аудит: «design system compliance: 94%».

### Cross-Component Composition Stories
Новый примитив `compose()` — определять stories для композиций компонентов (Form + Input + Button).
Тестирует как компоненты работают вместе, не только в изоляции.

### Visual Diff Overlay
При изменении пропов в interactive preview — overlay с подсветкой изменившихся пикселей.
Два canvas, pixel diff через ImageData. Полезно при рефакторинге CSS.
