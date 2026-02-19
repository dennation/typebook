# Studio — Roadmap

## Tier 1 — Must have

### Search
Текстовый фильтр в sidebar. При 50+ компонентах без поиска невозможно.

## Tier 2 — Дифференциаторы

### Responsive Preview
Кнопки Mobile / Tablet / Desktop — переключают ширину контейнера превью.
Критично для UI-библиотек.

### Component Playground
Встроенный редактор JSX: написал `<Button size="lg" disabled>` → видишь результат.
Мощнее controls — позволяет тестировать композицию компонентов.

### AI Story Generation
Анализ компонента → автогенерация `.stories.tsx` с осмысленными вариантами.
Type extraction уже есть — AI может предложить edge cases: длинный текст, disabled + loading, etc.
Ни у кого такого нет.

## Tier 3 — Масштабирование

### Visual Snapshot Testing
`npx @dennation/studio test` → скриншоты всех вариантов, diff с предыдущими. CI интеграция.

### A11y Audit
Встроенный axe-core — проверка каждого варианта на accessibility прямо в UI.

### Custom Themes
Переключение пользовательских тем (бренды, цветовые схемы).
Обёртка ThemeProvider вокруг превью компонентов.
Базовый light/dark toggle уже реализован — нужна поддержка произвольных тем.

---

## Tier 2.5 — Киллер-фичи (используют type extraction как рычаг)

### Copy-Paste Code Snippets
Кнопка «Copy JSX» на каждой variant-карточке и в interactive preview.
Клик → в буфере `<Button size="lg" variant="ghost">Click me</Button>`.
Пропсы уже известны точно (включая defaults) — генерация тривиальна.
Дизайнеры и PM-ы смогут бровзить studio и копировать готовый код.
**Effort: низкий. Impact: высокий.**

### Shareable State Deep Links
Расширить hash-routing до кодирования состояния props panel:
`/#button/Default?size=lg&disabled=true&variant=ghost`.
Нашёл баг → скопировал URL → отправил в Slack/Jira → коллега видит то же самое.
Hash-routing уже есть — нужно лишь serialize/deserialize props в query string.
**Effort: низкий. Impact: высокий.**

### Prop Coverage Map
Инструмент знает ВСЕ возможные значения пропсов из типов. Можно посчитать, какой процент комбинаций покрыт stories.
Визуализация: heatmap-таблица (строки — один проп, столбцы — другой, ячейка зелёная если покрыта).
Пример: Button имеет `size × variant × color` = 45 комбинаций. Stories покрывают 12. Coverage: 27%.
Это как code coverage, но для UI-вариантов. **Ни у кого такого нет.**
**Effort: средний. Impact: высокий.**

### Chaos / Stress Variants (UI Fuzz Testing)
Одна кнопка «Stress test» — автоматическая генерация граничных значений по типам пропсов:
- `string` → пустая строка, 500 символов, emoji 🔥🔥🔥, RTL текст, HTML-сущности
- `number` → 0, -1, 999999, NaN
- `boolean` → оба значения
- `ReactNode` → null, пустой fragment, глубоко вложенные элементы

Показывает как компонент ведёт себя на edge cases без единой строки конфигурации.
По сути fuzz-testing для UI. **Ни один инструмент этого не делает.**
**Effort: средний. Impact: высокий.**

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
**Effort: средний. Impact: высокий.**

## Tier 3.5 — Продвинутые фичи

### Render Performance Profiling
Каждый вариант уже в отдельном iframe. Измерить `performance.now()` до и после рендера.
Показать время рядом с карточкой. Heatmap по матрице: красные ячейки = медленные комбинации.
Автоматическое обнаружение перформанс-регрессий.
**Effort: средний. Impact: средний.**

### Design Token Audit
В iframe доступен `getComputedStyle`. Извлечь реальные CSS-значения и сравнить с design tokens:
```
Button[size=lg]:
  font-size: 18px ✓ (token: --font-lg = 18px)
  padding: 12px 20px ✗ (token: --spacing-lg = 16px)
```
Автоматический аудит: «design system compliance: 94%».
Решает боль «implementation doesn't match Figma».
**Effort: высокий. Impact: средний.**

### Interaction Recording & Replay
Записать последовательность взаимодействий (click → type → hover → blur) и сохранить как «interaction story».
При изменении кода — воспроизвести автоматически. Закрывает щель между component stories (статика) и e2e-тесты (тяжёлые).
**Effort: высокий. Impact: высокий.**

### Cross-Component Composition Stories
Новый примитив `compose()` — определять stories для композиций компонентов (Form + Input + Button).
Тестирует как компоненты работают вместе, не только в изоляции.
С автоматическими вариантами для каждого вложенного компонента.
**Effort: высокий. Impact: средний.**

### Visual Diff Overlay
При изменении пропов в interactive preview — overlay с подсветкой изменившихся пикселей.
Два canvas, pixel diff через ImageData. Полезно при рефакторинге CSS.
**Effort: высокий. Impact: средний.**
