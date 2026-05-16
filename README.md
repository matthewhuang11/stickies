# Stickies

A web app for capturing spontaneous thoughts, reminders, and todos with a tactile sticky-note aesthetic. Think: a wall of slightly-tilted paper notes that accumulates over time. The anti-Apple-Notes.

> Built as a personal side project. Live at https://stickies-seven.vercel.app/.

## Why this exists

I kept opening Notes whenever I had a spontaneous thought, but Notes feels like a document editor when what I actually wanted was a scrap of paper. Stickies is the opposite — minimal, casual, visual. You just write what's in your head and slap it on the wall.

## What it does

- **Tap +, type, done.** No friction, no save button. The sticky doesn't appear on the wall until you dismiss the editor — until then it's just a draft.
- **Rich text, lightly.** Each sticky is a Tiptap document. Bold and italic via the bubble menu. Bullet lists and inline task lists (☑) via the toolbar. Optional title if you want one.
- **A wall, not a list.** Stickies live on a corkboard with random rotation. They stay until you delete them.
- **Tags as lenses, not folders.** Create named tags and assign one to any sticky. Tap a tag pill on the wall to filter — the wall reflows, showing only stickies with that tag. Tap again or the × indicator to clear.
- **Satisfying deletions.** Deleted stickies crumple and arc into the trash can. Four seconds to undo.

## Design principles

- **Capture speed is paramount.** Opening the app should immediately invite a new sticky. Friction is the enemy of spontaneous thoughts.
- **Charm over polish.** Slight imperfections, physical-feeling animations. The app should feel like real sticky notes, not a flat digital UI.
- **No categorization at capture time.** Every decision deferred is friction removed. Tags are applied after the fact, if at all.

## Stack

- React + Vite
- Tailwind CSS
- Framer Motion (animations)
- Tiptap (rich text editor)
- localStorage (local-first, no backend)
- vite-plugin-pwa (installable as a home-screen app)

## Running locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

To test the PWA build:

```bash
npm run build
npm run preview
```

## Installing as an app

On iOS: open the live URL in Safari → share button → "Add to Home Screen."  
On Android: open the live URL in Chrome — you'll be prompted to install.

Once installed, Stickies opens as a standalone app with its own icon. All data lives locally on your device and works fully offline.

## Status

This is a side project I built for myself. It works, I use it daily, and I'll keep adding things that bother me. It's not aiming to be a product — just a tool that does its one thing well.

If you find it useful, that's a happy bonus.

## License

MIT. Do whatever you want with it.
