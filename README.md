# 📘 Daily Study Target Tracker

A lightweight, no-backend web app to track daily programming study targets — set goals, earn points for completing them, and watch a red ✕ or green ✓ mark whether you hit your deadline.

## Features
- ✅ Add daily targets with a title, date, and optional deadline time
- 🟢 Green tick when completed, 🔴 red cross if the deadline passes unmet
- 🏆 Points system (Easy / Medium / Hard) with a running total
- 🔥 Day-streak tracking for consistency
- 📊 Progress report with completion percentage
- 🔔 Browser notifications when a target's deadline passes without being marked done
- 🏷️ Subject tags (Java, C++, DSA, Other) on every target
- 📈 Points-by-subject bar chart and a 7-day points trend line chart
- 💾 Data persists locally via `localStorage` — no server needed

## Tech Stack
- HTML, CSS, vanilla JavaScript
- Chart.js for data visualization
- Browser `Notification` API
- `localStorage` for persistence

## Running locally
Just open `index.html` in a browser — no build step or dependencies required.

## Live demo
Enable GitHub Pages in repo settings to get a live link here.

## Roadmap / planned improvements
- [x] Subject/category tags (Java, C++, DSA, etc.)
- [x] Charts for weekly trends (Chart.js)
- [ ] Light/dark mode toggle
- [ ] Export/import progress as JSON
- [ ] Backend sync (Firebase) for multi-device use
- [ ] Java console version of the same tracker logic

## License
MIT
