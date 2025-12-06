# 🚀 Quick Start Guide - AstraConvoy

## ⚡ 5-Minute Setup

### Step 1: Start Backend (Terminal 1)

```bash
cd d:\codered\backend
pip install -r requirements.txt
python app.py
```

**Expected Output:**
```
🚀 AstraConvoy Backend Starting...
📡 API Server running on http://localhost:5000
* Running on http://0.0.0.0:5000
```

### Step 2: Start Frontend (Terminal 2)

```bash
cd d:\codered
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in Xs
```

### Step 3: Open Browser

Navigate to: **http://localhost:3000**

---

## 🎮 Quick Demo Flow

### Test Scenario 1: Create Your First Convoy

1. Click **"Create New Convoy"** button
2. Fill in:
   - Start: "Delhi Cantonment"
   - Destination: "Ladakh Base"
   - Mission: Medical (Priority 10)
   - Load: 25 tons
   - Vehicles: 5
   - Urgency: Critical
   - Night movement: ✓ Checked
3. Click **"Create Convoy & Analyze"**
4. **Expected Result:**
   - Threat Score: 7-9 (HIGH/CRITICAL)
   - Route with backup options
   - Fleet optimization
   - Climate impact data

### Test Scenario 2: Monitor Dashboard

1. Go to **Dashboard** page
2. **What to see:**
   - Active convoys list
   - Real-time threat levels
   - Priority scores
   - System stats

### Test Scenario 3: Trigger Emergency

1. From Dashboard, click **"Emergency SOS"** on any convoy
2. **Expected:**
   - Emergency alert created
   - Actions list displayed
   - Status updated

### Test Scenario 4: View Threat Analysis

1. Go to **Threat Analysis** page
2. **What to see:**
   - Threat distribution chart
   - Per-convoy risk factors
   - Mitigation guidelines

### Test Scenario 5: Digital Twin Simulation

1. Go to **Digital Twin** page
2. Select a convoy
3. Click **"Start Simulation"**
4. **Watch:**
   - Animated route progress
   - Real-time events
   - Environmental conditions

---

## 🎯 Key Pages Overview

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Overview & features |
| Create Convoy | `/create` | Add new convoy |
| Dashboard | `/dashboard` | Real-time monitoring |
| Threats | `/threats` | Threat analysis |
| Emergencies | `/emergencies` | Emergency system |
| Priority | `/priority` | Priority engine |
| Conflicts | `/conflicts` | Conflict detection |
| Digital Twin | `/digital-twin` | Simulation |

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access homepage
- [ ] Can create convoy
- [ ] Threat analysis displays correctly
- [ ] Dashboard shows real-time data
- [ ] Emergency triggers work
- [ ] Digital twin simulation runs

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Make sure you're in the right directory
cd d:\codered\backend

# Check Python version (need 3.8+)
python --version

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend won't start
```bash
# Delete node_modules and reinstall
cd d:\codered
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### API Connection Error
- Make sure backend is running on port 5000
- Check browser console for CORS errors
- Verify `http://localhost:5000/api/health` returns status

---

## 📞 Quick Commands

```bash
# Check backend health
curl http://localhost:5000/api/health

# Create convoy via API
curl -X POST http://localhost:5000/api/convoy/create \
  -H "Content-Type: application/json" \
  -d '{"start_point":"Delhi","destination":"Ladakh","mission_type":"medical","load_weight":25,"num_vehicles":5}'

# List all convoys
curl http://localhost:5000/api/convoy/list

# Get dashboard stats
curl http://localhost:5000/api/analytics/dashboard
```

---

**Ready to deploy! 🚀🛡️**
