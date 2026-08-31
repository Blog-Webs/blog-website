# HouseWorkAI — Setup & API Configuration Guide

## Overview
HouseWorkAI is a **fully frontend multi-agent simulation**. Most features work with **zero backend configuration**.

---

## ✅ Zero Config (Works Out of the Box)

| Feature | API | Required? | Notes |
|---|---|---|---|
| Particle Orb Animation | — | None | Pure Canvas |
| Office Simulation | — | None | Pure CSS/React |
| Task Routing (smart) | — | None | Keyword matching |
| AI Voice Output | Web Speech Synthesis API | None | Built into Chrome/Safari |
| Voice Input | Web Speech Recognition API | None | Chrome/Edge only |
| Chat (simulated) | — | None | Template-based AI responses |

> **Minimum requirement:** Google Chrome or Microsoft Edge browser for full voice support.

---

## 🔑 Optional API Keys (For Real AI Responses)

### 1. Google Gemini API (Recommended — Free Tier Available)
Enables real AI-generated responses instead of template-based replies.

**Steps:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API key"
3. Copy the key (starts with AIzaSy...)
4. Add to client/.env.local:
   VITE_GEMINI_API_KEY=AIzaSy_YOUR_KEY_HERE

**Cost:** Free (60 requests/minute on free tier)

---

### 2. ElevenLabs (Optional — Premium Voice Quality)
Enables ultra-realistic AI voice responses instead of browser TTS.

**Steps:**
1. Sign up at https://elevenlabs.io
2. Go to Profile → API Keys → Copy your API key
3. Add to client/.env.local:
   VITE_ELEVENLABS_API_KEY=your_key_here
   VITE_ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL

**Cost:** Free tier = 10,000 characters/month. Paid from $5/month.

---

### 3. OpenAI Whisper (Optional — Better Speech Recognition)
Better voice input recognition than browser's Web Speech API.

**Steps:**
1. Sign up at https://platform.openai.com
2. Go to API Keys → Create new key
3. Add to server/.env:
   OPENAI_API_KEY=sk-...

**Cost:** ~$0.006/minute of audio

---

## 🌐 Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| Voice Input (SpeechRecognition) | Full | Full | No | Partial |
| Voice Output (SpeechSynthesis) | Full | Full | Full | Full |
| Canvas Animation | Full | Full | Full | Full |

**Recommendation:** Use Google Chrome for the best experience.

---

## Example commands to try:
- "Fix the login bug in the auth module"         -> Dev starts working
- "Design a new dark theme for the dashboard"    -> Pixel starts designing
- "Analyze last week's user engagement metrics"  -> Sage runs analysis
- "Deploy the latest build to production"        -> Byte handles DevOps
- "Schedule a team standup for tomorrow"         -> Aria organizes it
- "Test the new payment flow for edge cases"     -> Nova starts QA
