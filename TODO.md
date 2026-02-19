# Studio — Roadmap

## Tier 1 — Must have

### Search
Текстовый фильтр в sidebar. При 50+ компонентах без поиска невозможно.

### Static Build
`npx @dennation/studio build` → папка с HTML/JS для деплоя.
Открывает аудиторию за пределами "разработчик с запущенным Vite" — дизайнеры, PM.

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
