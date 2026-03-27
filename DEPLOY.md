# How to Deploy NOGIRR for Your Friends

## Step 1: Create a GitHub Account (if you don't have one)
Go to https://github.com and sign up.

## Step 2: Install Git
1. Download Git from: https://git-scm.com/downloads/win
2. Run the installer (keep all default settings)
3. Restart your code editor after installing

## Step 3: Push Code to GitHub
1. Go to https://github.com/new
2. Repository name: `nogirr`
3. Keep it **Public**
4. Click **"Create repository"**
5. Open a NEW terminal in VS Code and run these commands ONE BY ONE:

```bash
cd "c:\Users\Suriya\OneDrive\Desktop\NOGIRR"
git init
git add .
git commit -m "NOGIRR food sharing app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nogirr.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 4: Deploy on Vercel (FREE)
1. Go to https://vercel.com
2. Click **"Sign Up"** → Sign up with **GitHub**
3. Click **"Add New Project"**
4. Import your `nogirr` repository
5. Before clicking Deploy, add **Environment Variables**:
   - Click **"Environment Variables"**
   - Add these 3 variables:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://hwtypafgkcegaluusexe.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_pBv3RBWWIcs6Vp4kVXTA7A_nmhsrPvb` |
   | `JWT_SECRET` | `nogirr_secret_key_2024_suriya` |

6. Click **"Deploy"**
7. Wait 1-2 minutes for deployment to finish
8. Vercel will give you a URL like: **https://nogirr.vercel.app**

## Step 5: Share with Friends! 🎉
Share the Vercel URL with your friends. They can:
- Open it on any device (phone, laptop, tablet)
- Register their own account
- Start donating and receiving food!

## Important Notes
- The app works on both mobile and desktop browsers
- Friends need to allow location access for the map and scoreboard to work
- All data is stored in your Supabase database
- Vercel free tier gives you unlimited deployments
