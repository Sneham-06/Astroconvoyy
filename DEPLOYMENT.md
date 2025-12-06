# 🚀 CLOUD DEPLOYMENT GUIDE

## 📋 **DEPLOYMENT CHECKLIST**

### ✅ **Files Created:**
- ✅ `backend/requirements.txt` - Python dependencies
- ✅ `backend/runtime.txt` - Python version
- ✅ `backend/Procfile` - Gunicorn configuration
- ✅ `backend/app.py` - Updated for deployment

---

## 🔧 **PART 1: BACKEND DEPLOYMENT (Render)**

### **Step 1: Create GitHub Repository**
1. Go to https://github.com
2. Click "New Repository"
3. Name: `astraconvoy-backend`
4. Click "Create repository"

### **Step 2: Push Backend to GitHub**
```powershell
# In your backend folder
cd d:\codered\backend
git init
git add .
git commit -m "Initial backend deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/astraconvoy-backend.git
git push -u origin main
```

### **Step 3: Deploy on Render**
1. Go to https://render.com
2. Sign up / Log in (use GitHub account)
3. Click **"New +"** → **"Web Service"**
4. Connect your **astraconvoy-backend** repository
5. **Configure:**
   - **Name:** `astraconvoy-backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Plan:** `Free`
6. Click **"Create Web Service"**
7. **Copy your backend URL** (e.g., `https://astraconvoy-backend.onrender.com`)

---

## 🌐 **PART 2: FRONTEND DEPLOYMENT (Vercel)**

### **Step 1: Create Environment Variable File**

**IMPORTANT:** Create a file named `.env.local` in `d:\codered\` with:
```
NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_URL_HERE
```
Replace `YOUR_BACKEND_URL_HERE` with the Render URL from Part 1.

### **Step 2: Update API Calls** (I'll do this for you)

After you give me your backend URL, I'll update all API calls to use:
```
process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
```

### **Step 3: Deploy on Vercel**
1. Go to https://vercel.com
2. Sign up / Log in (use GitHub account)
3. Click **"Add New..."** → **"Project"**
4. Import your `codered` repository (or create one)
5. **Configure:**
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `./`
   - **Environment Variables:**
     - Key: `NEXT_PUBLIC_API_URL`
     - Value: `https://astraconvoy-backend.onrender.com` (your Render URL)
6. Click **"Deploy"**
7. Wait 2-3 minutes for deployment
8. **Copy your frontend URL** (e.g., `https://astraconvoy.vercel.app`)

---

## 🎯 **QUICK START (Simplified)**

### **Option A: Use Render for Both**
1. Deploy backend to Render (above)
2. Deploy frontend to Render as Static Site
3. Configure environment variable

### **Option B: Vercel + Render (Recommended)**
1. Backend → Render (Free)
2. Frontend → Vercel (Free, faster)

---

## 📱 **AFTER DEPLOYMENT:**

Once deployed, you can access from:
- ✅ **Any PC** - Just visit your Vercel URL
- ✅ **Any Phone** - Same URL works on mobile
- ✅ **Anywhere in the world** - Internet access only

**Example URLs:**
- Frontend: `https://astraconvoy.vercel.app`
- Backend API: `https://astraconvoy-backend.onrender.com`

---

## ⚠️ **IMPORTANT NOTES:**

1. **Free Tier Limitations:**
   - Render: May sleep after 15 min inactivity (first request takes 30s to wake)
   - Vercel: 100GB bandwidth/month
   - Both: More than enough for demo!

2. **Database:**
   - SQLite works but data resets on Render restart
   - For production: Use PostgreSQL (free on Render)

3. **First Deploy:**
   - Takes 5-10 minutes
   - Subsequent deploys: 2-3 minutes

---

## 🆘 **NEED HELP?**

Let me know:
1. If you need help with GitHub setup
2. If you want me to update the frontend API calls
3. If you encounter any errors

---

## 🎬 **NEXT STEPS:**

**Tell me:**
1. Have you created GitHub account?
2. Do you want step-by-step help for each part?
3. Or shall I create automated deployment scripts?
