# Nation Trends India - Deployment Guide

This project is structured with a separate **Frontend** and **Backend**. To deploy this online using GitHub and Vercel, follow these steps:

## Phase 1: GitHub
1. Create a new repository on GitHub.
2. Initialize git in your project root: `git init`.
3. Add all files: `git add .`.
4. Commit: `git commit -m "Initial commit for deployment"`.
5. Push to GitHub: `git remote add origin YOUR_REPO_URL` and `git push -u origin main`.

## Phase 2: Deploy Backend (Vercel)
1. Go to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. For the **Backend**:
   - Set the **Project Name** to `nation-trends-backend`.
   - Set the **Root Directory** to `backend`.
   - Add **Environment Variables**:
     - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - Click **Deploy**.
4. Once deployed, copy the **Production URL** (e.g., `https://nation-trends-backend.vercel.app`).

## Phase 3: Deploy Frontend (Vercel)
1. Go to Vercel dashboard and click **Add New > Project** again.
2. Import the same GitHub repository.
3. For the **Frontend**:
   - Set the **Project Name** to `nation-trends-india`.
   - Set the **Framework Preset** to `Vite`.
   - Set the **Root Directory** to `frontend`.
   - Add **Environment Variables**:
     - `VITE_API_URL`: *Paste the Backend URL from Phase 2 + /api* (e.g., `https://nation-trends-backend.vercel.app/api`)
   - Click **Deploy**.

## Phase 4: Final Link
Your website is now live! Vercel will provide a `.vercel.app` URL for your frontend. Any changes you push to GitHub will automatically update your live site.
