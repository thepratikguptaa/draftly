# Draftly - AI-Powered Microblogging Platform

An AI-powered microblogging platform where users write posts, improve them using AI, and unlock advanced writing features with a premium upgrade.

## Features

- **Google Authentication** - Sign in with Google via Auth.js
- **AI Refactor** - Improve your posts with AI-powered rewriting in multiple styles (basic, professional, casual, funny, concise)
- **Premium Upgrade** - Unlock unlimited refactors, premium styles, and image uploads via Razorpay
- **Image Upload** - Attach images to posts using ImageKit (premium only)
- **Feed** - View all posts in a clean, real-time feed

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: MongoDB (Mongoose)
- **Auth**: Auth.js (NextAuth) with Google provider
- **AI**: Azure OpenAI (GPT-4.1)
- **Payments**: Razorpay
- **Image Storage**: ImageKit
- **Font**: Poppins

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `AUTH_SECRET` | Auth.js secret (`npx auth secret`) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

| Method | Route | Description |
|---|---|---|
| POST/GET | `/api/post` | Create and list posts |
| POST | `/api/refactor` | AI-powered text refactoring |
| POST | `/api/upload-image` | Upload image via ImageKit (premium) |
| POST | `/api/checkout` | Create Razorpay order |
| POST | `/api/verify-payment` | Verify payment and upgrade user |
| GET | `/api/user` | Get current user info |

## Free vs Premium

| Feature | Free | Premium |
|---|---|---|
| AI Refactor | 5/day (basic only) | Unlimited (all styles) |
| Image Upload | No | Yes (2MB max) |
| Styles | Basic | Basic, Professional, Casual, Funny, Concise |

## Created by

[Pratik Gupta](https://pratik-gupta-portfolio.vercel.app/)
