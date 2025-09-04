This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Emotion Analyzer Integration

This project includes an Emotion Analyzer section that calls a server-side API route to classify emotions from text using Hugging Face Inference API.

### Setup

1. Create a free Hugging Face account and generate an Access Token:
   - https://huggingface.co/settings/tokens

2. Create `.env.local` in the project root and add your token:

```
HF_API_KEY=hf_your_access_token_here
# Optional: override default model
# EMOTION_MODEL=SamLowe/roberta-base-go_emotions
```

3. Restart the dev server after adding the env file.

### Usage

- Open the app and scroll to the "Emotion Analyzer" section.
- Enter text and click "Phân tích" to get top emotions with confidence scores.
- Optional: you can specify a model name in the input (e.g. `manhhd/sentiment-vietnamese` for Vietnamese sentiment). The API route will use `EMOTION_MODEL` or fall back to `SamLowe/roberta-base-go_emotions`.

### API details

- Route: `POST /api/emotion`
- Body:

```
{
  "text": "your text here",
  "model": "optional-model-name"
}
```

- Response:

```
{
  "model": "resolved-model",
  "results": [ { "label": "joy", "score": 0.85 }, ... ]
}
```

If the Hugging Face API returns an error or the model is loading, the API responds with status 502 and an error message.

## Using a Local TensorFlow Model (Recommended for SavedModel)

If your Hugging Face repo contains a TensorFlow SavedModel (e.g. `saved_model.pb` and `variables/`), you can run it locally via a small FastAPI server and have Next.js call it.

### Start local server

1. Install Python 3.10+ and create a virtual environment.
2. From project root:

```
cd backend/emotion_server
pip install -r requirements.txt

# Option A: Download model from Hugging Face automatically
set HF_REPO=duybk/emotionsdetect
uvicorn main:app --host 127.0.0.1 --port 8000

# Option B: Use a local SavedModel directory
# set MODEL_DIR=C:\\path\\to\\local_savedmodel
# uvicorn main:app --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000 to check status.

### Point Next.js to the local server

Add to `.env.local`:

```
LOCAL_EMOTION_API=http://127.0.0.1:8000/predict
```

Restart `npm run dev`. Now `POST /api/emotion` will forward to your local TensorFlow server.

### Expected request/response (local server)

Request body:

```
{ "text": "I feel great today!", "top_k": 6 }
```

Response:

```
{ "results": [ { "label": "joy", "score": 0.92 }, ... ] }
```
