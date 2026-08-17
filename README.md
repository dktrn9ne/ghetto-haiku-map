# Ghetto Haiku Map

An interactive 3D album experience that turns a YouTube playlist into a navigable transit system. Each song is represented as a station, narrative themes become routes, and the camera travels across the map as listeners explore the project.

## What this project demonstrates

- Interactive 3D interfaces with React Three Fiber and Three.js
- Animated camera movement and world-coordinate mapping
- YouTube IFrame API integration for playlist playback
- Route, station, and system-line filtering
- Responsive interface composition with React and TypeScript
- A keyboard-driven placement mode for tuning station coordinates
- Deployment-ready Next.js architecture

## Experience

Listeners can select a narrative route or colored system line, choose a song station, follow the animated camera to that destination, and control the synchronized YouTube playlist.

## Architecture

The main page owns destination data, narrative groupings, player state, and the camera target. React Three Fiber renders the map as a textured plane, Three.js handles coordinates and animation, and reusable React components provide navigation and playback controls.

```text
app/
├── page.tsx                 # 3D scene, routes, player state, camera travel
├── components/
│   ├── PlayerPanel.tsx      # Track and playback controls
│   └── SideMenu.tsx         # Experience navigation
├── globals.css              # Visual system and responsive layout
└── layout.tsx
```

## Technology

Next.js 16 · React 19 · TypeScript · Three.js · React Three Fiber · React Three Drei · YouTube IFrame API

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The scene expects its map artwork at `public/backdrop.jpg`. YouTube playback requires network access and may require one manual play action when the browser blocks autoplay.

## Useful controls

- Select a station to travel to it and load its track.
- Use the player controls to move through visible stations.
- Press `P` to toggle placement mode.
- Press `Escape` to leave placement mode.

## Portfolio focus

This project combines creative direction with production-oriented frontend engineering. It demonstrates how 3D interaction, media APIs, and narrative information architecture can become one coherent browser experience.
