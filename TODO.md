# Studio — Roadmap

## Tier 0 — Launch Prep (максимальный ROI)

Без этого проект не наберёт аудиторию, независимо от качества кода.

### Hero GIF / скриншот
Анимированный GIF (5-10 секунд): пишешь `allOf('size')` → получаешь grid всех вариантов.
Без визуала люди не понимают ценность. Записать через QuickTime/OBS или сделать before/after скриншот (код → результат).
**Blocked by:** улучшения дизайна UI (сначала довести визуал до финального состояния, потом записывать).
**Effort: низкий.** **Impact: критический.** Это первое, что видят на GitHub.

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

### Actions — логирование событий
Сейчас `function`-пропсы в Playground показывают прочерк — `onClick`, `onChange` и т.д. уходят в пустоту. Без этого интерактивная превью компонентов с коллбэками ощущается сломанной.
- Хелпер `action(name)` — фабрика, возвращающая функцию, которая логирует вызовы с аргументами в панель.
- Панель Actions снизу в Playground/StoryRenderer: timestamp, call count, args.
- Кнопка Clear.
```ts
import { action } from '@dennation/ui-studio'
const button = define(Button, {
  defaults: { onClick: action('onClick') },
})
```
**Effort: низкий–средний.** **Impact: критический.** Блокирует повседневную работу с интерактивным preview.

### Глобальный wrapper на уровне Studio
`wrapper` в `define()` работает per-component. Если 30+ компонентов нуждаются в `<ThemeProvider>`, приходится повторять в каждом `define()`.
- Prop `wrapper` на `<Studio />` — оборачивает рендер каждой истории.
- Композиция: global wrapper → per-component wrapper → story.
```tsx
<Studio
  registry={registry}
  wrapper={(Story) => <ThemeProvider><Story /></ThemeProvider>}
/>
```
**Effort: низкий.** **Impact: критический.** Основная DX-фрикция для приложений с провайдерами.

### Улучшение PropControl
`isControllable()` в `Playground.tsx` — контролы только для `literal`, `boolean`, `string`, `number`, `node`.
Минимально необходимые доработки:
- **Children как редактируемый prop** — `children` самый частый prop в React, сейчас нет контрола для его редактирования. Textarea для строковых children.
- **Color picker** для строковых пропсов с именем `color`/`backgroundColor`/etc. — `<input type="color">`, 0 зависимостей.
- **Range slider** для number-пропсов — `<input type="range">` с min/max.
- **Textarea** для длинных строк / `node`-пропсов.
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
Кнопка «Copy JSX» на каждой variant-карточке и в Playground.
Клик → в буфере `<Button size="lg" variant="ghost">Click me</Button>`.
Пропсы уже известны точно (включая defaults) — генерация тривиальна.
- Живое обновление при изменении props в Playground.
- Пропускать props, совпадающие с defaults.
- `children` рендерить как JSX-children, не как атрибут.
Дизайнеры и PM-ы смогут бровзить studio и копировать готовый код.
**Blocked by:** children prop support (PropControl).

### Component Status Badges
Пометки `deprecated`, `wip`, `new`, `stable` в боковой панели рядом с именем компонента. Помогает навигации в больших библиотеках.
```ts
const button = define(Button, {
  name: 'Button',
  status: 'stable', // 'stable' | 'wip' | 'deprecated' | 'new'
})
```
- Визуальный бейдж с цветовой кодировкой: new=green, wip=yellow, deprecated=red.
- Опционально: фильтр по статусу в поиске.
**Effort: низкий.** **Impact: средний.** Полезно для больших команд.

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
Кнопки Mobile (375px) / Tablet (768px) / Desktop (1024px) / Full — переключают ширину контейнера превью.
Кастомный ввод ширины. Persists per session.
Интегрируется с существующим iframe-механизмом (`isolate`) — можно переиспользовать `IframePreview` с настраиваемой шириной.
Критично для UI-библиотек.

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

### Testing Utilities — переиспользование историй в тестах
Истории уже описывают компоненты с props — логично переиспользовать их в unit-тестах.
Новый entry point `@dennation/ui-studio/testing`:
```ts
import { composeStories } from '@dennation/ui-studio/testing'
import * as stories from './Button.stories'

const { Default, Sizes } = composeStories(stories)

test('renders default button', () => {
  render(<Default />)
})
```
- `composeStories(module)` — конвертирует экспорты историй в рендерируемые React-компоненты.
- Применяет defaults, wrapper, story props.
- Без зависимости на Studio UI — чистые React-компоненты.
**Effort: средний.** **Impact: высокий.** Включает studio в testing pipeline.

### Testing Integration — Visual / A11y / Interaction
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

### Toolbar Extensibility API
Точки расширения для пользовательских кнопок и панелей в toolbar превью (zoom, background color, RTL toggle).
```tsx
<Studio
  registry={registry}
  toolbar={[
    { icon: '🔄', label: 'RTL', onClick: toggleRTL },
    { icon: '🎨', label: 'Background', panel: BackgroundPanel },
  ]}
/>
```
- Prop `toolbar` на Studio — массив дескрипторов аддонов.
- Рендерит кнопки в toolbar области превью.
- Поддержка toggle-кнопок и panel popovers.
- Передаёт текущий component/story контекст в аддоны.
**Effort: средний.** **Impact: средний.** Extensibility для продвинутых пользователей.

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
