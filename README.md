# Draftly

AI-powered microblogging platform. Write posts, refactor them with AI, like, comment, search, upload images, and go premium for advanced features.

## Tech Stack

Next.js 16 (App Router) | Tailwind CSS | shadcn/ui | MongoDB | Auth.js | Azure OpenAI | Razorpay | ImageKit

## Features

- **Authentication** - Google OAuth + email/password signup & login
- **AI Refactor** - Rewrite posts in 5 styles: basic, professional, casual, funny, concise
- **Like/Heart** - Like posts with optimistic UI, like counts on every post
- **Comments** - Inline threaded comments on every post, delete your own
- **Search** - Search posts by keyword in real time
- **Image Upload** - Attach images to posts via ImageKit (premium)
- **Premium Upgrade** - Pay via Razorpay to unlock unlimited refactors, all styles, and image uploads
- **My Posts** - View, edit, and delete your own posts
- **Dark/Light Mode** - Theme toggle with persistence
- **Two-Column Layout** - Sidebar with profile card and compose box, feed on the right (responsive, collapses on mobile)

## Database

**MongoDB** with four collections:

| Collection | Fields |
|---|---|
| `users` | name, email, password (hashed), image, isPremium, dailyRefactorCount, lastRefactorDate |
| `posts` | userId, text, imageUrl, createdAt |
| `comments` | postId, userId, text, createdAt |
| `likes` | postId, userId, createdAt (unique index on postId + userId) |

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/signup` | Create account with email/password |
| POST / GET | `/api/post` | Create post / list all posts (with like & comment counts, search via `?q=`) |
| PUT / DELETE | `/api/post/[id]` | Edit / delete own post |
| GET | `/api/post/me` | List current user's posts |
| POST | `/api/like` | Toggle like/unlike on a post |
| POST / GET | `/api/comment` | Add comment / list comments for a post |
| DELETE | `/api/comment/[id]` | Delete own comment |
| POST | `/api/refactor` | AI-powered text refactoring |
| POST | `/api/upload-image` | Upload image via ImageKit (premium only) |
| POST | `/api/checkout` | Create Razorpay order |
| POST | `/api/verify-payment` | Verify Razorpay payment signature |
| GET | `/api/user` | Get current user info |

## Free vs Premium

| Feature | Free | Premium |
|---|---|---|
| AI Refactor | 5/day, basic style only | Unlimited, all 5 styles |
| Image Upload | Not available | Up to 2MB per image |
| Likes & Comments | Yes | Yes |
| Search | Yes | Yes |

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `AUTH_SECRET` | Auth.js secret (`npx auth secret`) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |

## Created by

[Pratik Gupta](https://pratik-gupta-portfolio.vercel.app/)
