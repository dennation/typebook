# Studio — Roadmap

## Tier 1 — Реализовано

- `define()` API с типизированными story builders (single, variants, matrix)
- Type extraction через TypeScript Compiler API → PropInfo[]
- Автогенерация двух gen-файлов (registry + meta) через Vite plugin
- `<Studio />` компонент: sidebar, поиск, группировка, interactive preview с prop controls
- Iframe-изоляция каждого варианта (стили не протекают)
- Lazy variant resolution через VariantConfig markers (allOf, values, generate)
- Hash-based routing (компонент + story в URL)
- Light/dark theme toggle
- CLI: `npx @dennation/ui-studio generate`

---

## Tier 1.5 — Фундамент (дёшево, высокий профит)

Технический долг и архитектурные улучшения, без которых всё остальное строится на шатком фундаменте.

### Scanner: regex → AST-парсинг
`scanner.ts` → `analyzeStoryFile()` разбирает `.stories.tsx` файлы регулярными выражениями.
Это ломается на: многострочных выражениях, комментариях, нестандартном форматировании, `as const`, re-export-ах.
`oxc-parser` уже в зависимостях (`package.json`) — нужно переписать анализ на AST.
**Effort: низкий.** oxc API минималистичный, замена — один файл. **Impact: высокий.** Убирает целый класс багов.

### Gen-файл: запись на диск → полный virtual module
Сейчас `ui-studio.gen.ts` пишется физически на диск (`plugins/vite/index.ts:74`).
Проблемы: нужно `.gitignore`, может устареть, перезапись триггерит watcher → лишние циклы, нет настоящего HMR.
Virtual module уже частично реализован (`VIRTUAL_MODULE_ID`), но `load()` всё равно читает с диска.
Нужно: хранить сгенерированный контент в памяти, отдавать через `load()`, инвалидировать через Vite server API (`server.moduleGraph.invalidateModule` + `server.ws.send`).
**Effort: низкий–средний.** Паттерн стандартный для Vite-плагинов. **Impact: средний–высокий.** Чистый DX, настоящий HMR, нет мусора в файловой системе.

### Улучшение PropControl
`ComponentPreview.tsx:14-16` — контролы только для `literal`, `boolean`, `string`, `number`, `node`.
Минимально необходимые доработки:
- **Color picker** для строковых пропсов с именем `color`/`backgroundColor`/etc. — `<input type="color">`, 0 зависимостей.
- **Range slider** для number-пропсов — `<input type="range">` с min/max.
- **Textarea** для длинных строк / `node`-пропсов.
- **Actions log** — для `function`-пропсов вместо прочерка показать callback, который логирует вызовы в панель снизу (как Storybook Actions).
Каждый контрол — независимый, можно добавлять инкрементально.
**Effort: низкий–средний (на каждый контрол).** **Impact: высокий.** Интерактивность — ключевая ценность инструмента.

---

## Tier 2 — Производительность, надёжность и Quick Wins

### Iframe: виртуализация / lazy rendering
Каждый вариант рендерится в отдельном `<IframePreview>` (`VariantCard.tsx:15`, `StoryRenderer.tsx:41`).
Страница Button из playground = ~71 iframe одновременно. На сложных компонентах — тормоза.
Варианты решения (от дешёвого к дорогому):
1. **IntersectionObserver** — рендерить iframe только когда карточка в viewport. ~30 строк кода.
2. **Один shared iframe** для variants/matrix внутри одной story (как Storybook, но на уровне story, не страницы).
3. **Shadow DOM** вместо iframe — легче, но слабее изоляция (не блокирует JS, только CSS).
**Effort: низкий (вариант 1) — средний (варианты 2–3).** **Impact: высокий.** Без этого матрицы 10×10 неюзабельны.

### Устойчивость type extraction
`ts-client.ts:156-217` — `convertTsType()` покрывает базовые случаи.
Ломается на: discriminated unions, template literal types, conditional types, `Record<K, V>`, deep generics.
План:
1. **Расширить `convertTsType`** — обработка `number literal union`, intersection types, `Record`/`Omit`/`Pick` на верхнем уровне.
2. **Graceful degradation** — для нераспознанных типов сохранять raw строку + флаг, чтобы UI мог показать «complex type» вместо пустоты.
3. **Тесты** — набор fixture-типов (30–50 кейсов), snapshot результата extraction.
**Effort: средний.** Каждый тип — отдельный case, но TS Compiler API нетривиально. **Impact: высокий.** Это ядро продукта.

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

### Component Documentation (MDX / Markdown)
Сейчас UI показывает только заголовок компонента, пропсы и variants. Нет возможности добавить описание, guidelines, do/don't, примеры использования.
Минимальная версия:
- Поле `description: string` в `DefineConfig` — рендерится над stories как текст.
- Опционально: `docs: './Button.docs.mdx'` → парсинг markdown, рендер между props panel и stories.
Storybook делает из этого полноценный docs site. Здесь достаточно inline-описаний.
**Effort: низкий (description) — средний (MDX).** **Impact: средний.** Без документации инструмент — только для разработчиков, не для дизайнеров/PM.

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
Сейчас — ноль тестовых возможностей. Storybook = платформа для тестирования (interaction testing, visual regression, a11y, snapshot, CI test runner).
Поэтапный план:
1. **Visual Snapshot Testing** — `npx @dennation/ui-studio test` → скриншоты всех вариантов, diff с предыдущими. CI-интеграция. Playwright для скриншотов — ~2 зависимости.
2. **A11y Audit** — встроенный axe-core — проверка каждого варианта на accessibility прямо в UI. Бейдж pass/fail на каждой карточке.
3. **Interaction testing** (будущее) — play functions для компонентов, запись и воспроизведение взаимодействий.
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
Сейчас: React + Vite. Точка.
Storybook: React, Vue, Angular, Svelte, Web Components + webpack, Vite, esbuild.
Это **не приоритет** на ранней стадии — лучше сделать идеальный React+Vite опыт, чем посредственный мультиплатформенный.
Но архитектурно стоит готовиться:
- Разделить `define()`/`resolve()` (framework-agnostic) от `<Studio />` (React-specific).
- Плагин абстрагировать от Vite (bundler adapter layer).
Реализация Vue/Svelte/webpack — только если будет реальный спрос.
**Effort: очень высокий.** **Impact: средний** (краткосрочно) / **высокий** (долгосрочно, для adoption).

### Render Performance Profiling
Каждый вариант уже в отдельном iframe. Измерить `performance.now()` до и после рендера.
Показать время рядом с карточкой. Heatmap по матрице: красные ячейки = медленные комбинации.
Автоматическое обнаружение перформанс-регрессий.

### Design Token Audit
В iframe доступен `getComputedStyle`. Извлечь реальные CSS-значения и сравнить с design tokens:
```
Button[size=lg]:
  font-size: 18px ✓ (token: --font-lg = 18px)
  padding: 12px 20px ✗ (token: --spacing-lg = 16px)
```
Автоматический аудит: «design system compliance: 94%».
Решает боль «implementation doesn't match Figma».

### Interaction Recording & Replay
Записать последовательность взаимодействий (click → type → hover → blur) и сохранить как «interaction story».
При изменении кода — воспроизвести автоматически. Закрывает щель между component stories (статика) и e2e-тесты (тяжёлые).

### Cross-Component Composition Stories
Новый примитив `compose()` — определять stories для композиций компонентов (Form + Input + Button).
Тестирует как компоненты работают вместе, не только в изоляции.
С автоматическими вариантами для каждого вложенного компонента.

### Visual Diff Overlay
При изменении пропов в interactive preview — overlay с подсветкой изменившихся пикселей.
Два canvas, pixel diff через ImageData. Полезно при рефакторинге CSS.
