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

### Copy-Paste Code Snippets — расширение
Code preview с копированием уже реализован в Inspect Panel (JSX генерируется из props, подсветка shiki, кнопка Copy). Осталось:
- Кнопка «Copy JSX» на каждой variant-карточке (сейчас только в Inspect Panel).
- Пропускать props, совпадающие с defaults.
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

### Component API Changelog (из git-истории)
`ui-studio-meta.gen.ts` коммитится в git — полная история PropInfo уже хранится в репозитории. Не нужно отдельное хранилище снэпшотов.

**Механизм:**
1. `git tag --sort=version:sort` — список всех версий
2. Для каждого тега: `git show <tag>:ui-studio-meta.gen.json` — PropInfo на тот момент
3. Diff последовательных пар тегов по компонентам
4. Склейка в полную историю

**Предусловие:** генерировать `ui-studio-meta.gen.json` параллельно с `.ts` — чистый JSON, тривиально парсится без AST.

**CLI:**
```bash
npx @dennation/ui-studio changelog                        # полная история всех компонентов
npx @dennation/ui-studio changelog --component Button     # один компонент
npx @dennation/ui-studio changelog --since v1.0.0         # с определённой версии
```

**Вывод:**
```
## Button

### v1.3.0
  + added prop `isLoading` (boolean, optional)

### v1.2.0
  ~ `size` — added value 'xl'
  ~ `variant` — removed value 'underlined'

### v1.1.0
  + added prop `disabled` (boolean, optional)
  - removed prop `outline` (string)

### v1.0.0
  Initial: size, variant, color, children (4 props)
```

**Страница в Studio UI:** вкладка "Changelog" у каждого компонента — генерируется при сборке из тех же данных.

**CI-интеграция:** на каждый PR — автокомментарий «Component API changes» (diff текущей ветки vs base branch).

**"Since" badge:** первый тег, в котором компонент появляется в meta — версия его появления. Показывать бейдж "Since v1.2.0" в sidebar и на странице API. Аналогично для отдельных пропсов — "added in v1.3.0" в таблице Playground.

Решает боль мейнтейнеров UI-библиотек: ручное отслеживание breaking changes. **Ни у кого такого нет.**

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

### Cross-Component Composition Stories
Новый примитив `compose()` — определять stories для композиций компонентов (Form + Input + Button).
Тестирует как компоненты работают вместе, не только в изоляции.

### Visual Diff Overlay
При изменении пропов в interactive preview — overlay с подсветкой изменившихся пикселей.
Два canvas, pixel diff через ImageData. Полезно при рефакторинге CSS.
