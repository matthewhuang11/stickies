# Stickies

A PWA for capturing spontaneous thoughts, reminders, and todos with a tactile sticky-note aesthetic. The anti-Apple-Notes: a wall of slightly-tilted paper notes that accumulates over time, with character and warmth.

## Core concept

- Every sticky is a unified object - plain text by default, toggleable into checklist mode
- Stickies accumulate on a "wall" view (the home screen) with slight random rotation (1-4°) and offset for organic feel
- Older stickies stick around. Completed todos/checklists get a hand-drawn check mark treatment but remain visible on the wall
- Capture speed is paramount - opening the app should immediately invite a new sticky

## Stack

- React + Vite
- Tailwind CSS for styling
- Framer Motion for animations
- localStorage for persistence (no backend - local-first)
- vite-plugin-pwa for installability

**Do not add:**
- A backend or sync layer (not yet - revisit after v1 is solid)
- UI component libraries (Material UI, shadcn, Chakra, etc) - everything should feel hand-made, not assembled from a kit
- State management libraries (Redux, Zustand) until localStorage + useState becomes painful
- TypeScript right now (keeping it simple for v1)

## Design principles

- **Charm over polish.** Paper textures, subtle shadows, slight imperfections. The app should feel like physical sticky notes, not a flat digital UI.
- **No generic SaaS look.** No clean white cards with grey borders. No standardized spacing that screams "tailwind defaults." Lean into warmth, organic feel, hand-drawn touches.
- **Friction is the enemy.** No save buttons, no title fields, no folder picking. Tap to create, type, done.
- **Animations should feel physical.** A new sticky should "land" on the wall with a slap. Deleting should crumple. Toggling checklist mode should feel tactile.

## Sticky data model

Each sticky has:
- `id` (uuid)
- `content` (string or array of `{ text, checked }` items if checklist mode)
- `mode` ("text" | "checklist")
- `color` (string, picked from a curated palette - not full color picker)
- `rotation` (number, set once at creation, -4 to 4 degrees)
- `createdAt` (timestamp)
- `completedAt` (timestamp or null - set when all checklist items checked, or manually marked done)

## Code conventions

- Functional components with hooks
- One component per file, named exports
- Components in `/src/components`, hooks in `/src/hooks`, utilities in `/src/lib`
- Tailwind for styling; reach for custom CSS only when tailwind can't express it (paper textures, custom shadows, etc.)
- Keep components small. Extract when a component exceeds ~150 lines.

## Current state

v0 - scaffolding phase. Building:
1. Wall view with stickies from localStorage
2. Create new sticky (text only)
3. Random tilt + offset on placement

## Roadmap (not yet built)

- Checklist mode toggle
- Delete sticky (with crumple animation)
- Visual polish pass (paper textures, shadows, refined typography)
- Completed state treatment
- Color palette
- PWA manifest + service worker
- Sticky detail/edit view

## Notes for working on this project

- When adding visual character, default to *more* texture/imperfection rather than less. The risk is looking too clean, not too messy.
- Before adding any feature, check it against "does this serve fast capture or the wall aesthetic?" If neither, defer it.
- When suggesting libraries, only do so if hand-rolling would take significantly longer. Avoid dependency bloat.