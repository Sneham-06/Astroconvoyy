# API Configuration Helper

## 🔧 **TO UPDATE API URLS:**

After you deploy the backend and get your URL (e.g., `https://astraconvoy-backend.onrender.com`):

1. **Tell me your backend URL**
2. I'll automatically update all these files to use it:
   - `app/page.tsx`
   - `app/dashboard/page.tsx`
   - `app/create/page.tsx`
   - `app/threats/page.tsx`
   - `app/emergencies/page.tsx`
   - `app/priority/page.tsx`
   - `app/conflicts/page.tsx`
   - `app/digital-twin/page.tsx`
   - `app/driver/page.tsx`

## 📝 **CURRENT STATUS:**

All API calls currently use: `http://localhost:5000`

For deployment, they need to use: `YOUR_BACKEND_URL`

## ⚡ **QUICK METHOD:**

Just tell me:
1. Your Render backend URL
2. I'll update everything in seconds!

## 🛠️ **MANUAL METHOD (if needed):**

Replace all instances of:
```javascript
fetch('http://localhost:5000/api/...
```

With:
```javascript
fetch('https://YOUR-BACKEND-URL.onrender.com/api/...
```

**But don't worry - I'll do this for you! Just deploy backend first and give me the URL!**
