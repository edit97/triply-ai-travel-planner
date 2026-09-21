# Triply — AI Travel Planner

Triply is an AI-powered travel planner that creates personalized day-by-day itineraries based on destination, trip duration, budget, and interests.

🌐 **Live Demo:** [https://triply-ai-travel-planner.onrender.com](https://triply-ai-travel-planner.onrender.com/)

## Features

- AI-generated personalized travel itineraries
- Destination, trip duration, budget, and interest selection
- Structured day-by-day travel plans
- Responsive design for desktop and mobile
- Loading, validation, and error handling
- Secure server-side OpenAI integration

## Tech Stack

**Frontend:** React, TypeScript, Vite, CSS  
**Backend:** Node.js, Express, TypeScript  
**AI:** OpenAI API  
**Validation:** Zod  
**Deployment:** Render

## How It Works

1. Enter your destination and trip duration.
2. Select your budget and interests.
3. Triply sends the preferences to the Express backend.
4. The backend uses OpenAI to generate a structured itinerary.
5. The personalized travel plan is displayed in the React interface.

## Architecture

React → Express API → OpenAI → Structured Itinerary → React UI

The OpenAI API key is stored securely on the server and is never exposed to the frontend.

## Run Locally

```bash
npm install

```

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key

```

Start the application:

```bash
npm run dev

```

Open `http://localhost:5173`.

## Live Project

🚀 **Try Triply:** [https://triply-ai-travel-planner.onrender.com](https://triply-ai-travel-planner.onrender.com/)