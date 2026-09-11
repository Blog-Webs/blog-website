# HouseWorkAI — Setup & API Configuration Guide

## Overview
HouseWorkAI is a **multi-agent intelligence platform & office simulation** powered by **OpenAI ChatGPT** (GPT-4o-mini / GPT-4o) with a Perplexity-style acoustic voice assistant and simulated fallback.

---

## 🔑 OpenAI ChatGPT API Setup (Recommended)
Enables live multi-agent parallel responses powered by OpenAI ChatGPT.

**Steps:**
1. Go to https://platform.openai.com/api-keys
2. Create a new secret key (`sk-...`)
3. Add to `server/.env`:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   OPENAI_MODEL=gpt-4o-mini
   ```
4. Optional for client fallback (in `client/.env.local`):
   ```env
   VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

---

## 🎙️ Perplexity-Style Voice Assistant

| Feature | Engine | Requirement | Browser Support |
|---|---|---|---|
| **Voice Input (Speech-to-Text)** | Web Speech API | Microphone Permission | Google Chrome, Edge, Safari |
| **Voice Output (Text-to-Speech)** | Web Speech Synthesis | None (Native) | All Modern Browsers |
| **Acoustic Audio Visualizer** | Web Audio API Analyser | Microphone Active | Chrome, Edge, Safari, Firefox |
| **Neural Particle Orb** | HTML5 Canvas 2D Physics | None | Full GPU-accelerated |

> **Tip:** When using Voice Assistant, click the **Perplexity Neural Orb** or tap the **Mic** button. Ensure you click **Allow** on your browser's microphone permission prompt.

---

## 👥 Multi-Agent Persona Team
1. **👩‍💼 Aria** — Project Manager & Team Coordinator
2. **👨‍💻 Dev** — Lead Software & Backend Engineer
3. **🎨 Pixel** — Creative UI/UX & Visual Designer
4. **📊 Sage** — Data Analyst & Metrics Specialist
5. **🔍 Nova** — QA Engineer & Edge Case Reviewer
6. **⚙️ Byte** — DevOps & Cloud Infrastructure Engineer

---

## 🌐 Example Voice & Text Commands
- *"Plan our next two-week sprint and assign roles"*
- *"Fix the login authentication error and rate limit logic"*
- *"Design a dark-mode glassmorphic analytics dashboard"*
- *"Analyze this month's retention metrics and user growth"*
- *"Set up zero-downtime deployment pipeline with Docker"*
- *"Write unit and integration tests for payment edge cases"*
