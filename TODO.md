# Studio — Roadmap

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
`convertTsType()` в `ts-client.ts` покрывает базовые случаи (literals, boolean, string, number, function, ReactNode).
Ломается на: discriminated unions, template literal types, conditional types, `Record<K, V>`, deep generics.
План:
1. **Расширить `convertTsType`** — обработка `number literal union`, intersection types, `Record`/`Omit`/`Pick` на верхнем уровне.
2. **Тесты** — набор fixture-типов (30–50 кейсов), snapshot результата extraction.
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
