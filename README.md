# BCT Voice AI Calling Agent

Full-stack AI Voice Calling & Support Console built with Node.js, Express, Twilio Voice API, React, and Tailwind CSS.

## 🚀 Features

- **Outbound Voice AI Agents**:
  - `Feedback Calls`: Customer satisfaction surveys with automated Hindi TTS.
  - `Recharge Reminder`: Broadband plan expiry reminders with payment link generation.
  - `Plan Promotion`: Ultra fiber 300 Mbps upgrade campaigns.
- **Inbound Support IVR**:
  - Auto-answers incoming calls to `+1 (785) 384-5847` with greeting: *"Welcome to BCT Support. Thank you for calling BCT Support."*
- **Live Stream Console**:
  - Real-time animated speech transcript streaming.
  - 1-click **Cancel Call** action across all agents.

## 🛠️ Local Development Setup

1. **Install dependencies**:
   ```bash
   npm run postinstall
   ```

2. **Set up Environment Variables**:
   Create `Backend/.env`:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+17853845847
   ```

3. **Start Development Servers**:
   - Backend: `cd Backend && npm run dev` (Port 8000)
   - Frontend: `cd Frontend && npm run dev` (Port 5173)

## 🌐 Deploying to Render

1. Connect your repository to [Render](https://dashboard.render.com).
2. Create a new **Web Service**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. Add Environment Variables on Render:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
