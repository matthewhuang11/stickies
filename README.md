# Stickies

A web app for capturing spontaneous thoughts, reminders, and todos with a tactile sticky-note aesthetic. Think: a wall of slightly-tilted paper notes that accumulates over time. The anti-Apple-Notes.

> Built as a personal side project. Live at https://stickies-seven.vercel.app/.

## Why this exists

I kept opening Notes whenever I had a spontaneous thought, but Notes feels like a document editor when what I actually wanted was a scrap of paper. Stickies is the opposite — minimal, casual, visual. You don't title things. You don't sort things into folders. You just write what's in your head and slap it on the wall.

## What it does

- **Tap the pad, type, done.** No friction, no save button, no titles required.
- **One unified sticky.** Plain text by default; toggle into checklist mode for todos. Optional title if you want one. Bold and italic for emphasis.
- **A wall, not a list.** Stickies live on a wall with subtle random rotation and offset. Older stickies stick around — completed ones get a check-mark treatment but don't disappear.
- **Tags as lenses, not folders.** Optional tags categorize without requiring a decision at capture time. Tap any tag pill on any sticky to filter the wall to that tag.
- **Different sticky colors.** Pick whatever feels right — color is aesthetic, not categorical.
- **Satisfying physics.** Stickies peel off the pad, fly onto the wall with a slight settle. Deleted stickies crumple.

## Design principles

- **Capture speed is paramount.** Opening the app should immediately invite a new sticky. Friction is the enemy of spontaneous thoughts.
- **Charm over polish.** Paper textures, slight imperfections, hand-drawn touches. The app should feel like physical sticky notes, not a flat digital UI.
- **No categorization at capture time.** Every decision deferred is friction removed. Tags, colors, and modes are all applied after the fact, if at all.
- **The wall is the truth.** Filters and views are just lenses over the one wall. No folders, no spaces, no separation.

## Stack

- React + Vite
- Tailwind CSS
- Framer Motion (for the satisfying animations)
- Tiptap (for minimal rich text)
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

On iOS: open the live url in Safari, tap the share button, "Add to Home Screen."  
On Android: open the live url in Chrome, you'll be prompted to install.

Once installed, Stickies opens as a standalone app with its own icon. All data lives locally on your device.

## Status

This is a side project I built for myself. It works, I use it daily, and I'll keep adding things that bother me. It's not aiming to be a product — just a tool that does its one thing well.

If you find it useful, that's a happy bonus.

## License

MIT. Do whatever you want with it.