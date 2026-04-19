# 🚀 AstraConvoy: AI Defence & Threat Intelligence

**Intelligent Logistics for the Modern Battlefield**
Empowering defence operations with predictive analytics, optimized routing, and real-time tactical oversight.

---

## 🎯 Mission Brief

AstraConvoy is a high-precision military logistics platform designed to optimize convoy movement in high-risk environments.
It integrates threat prediction, route intelligence, and mission prioritization into a unified command interface.

---

## ⚡ Tactical Features

* ⚠️ **Threat Prediction**
  Calculates a risk score using terrain complexity, weather conditions, and route isolation.

* 🎯 **Route Optimization**
  Generates primary and fallback routes using distance-based and risk-aware logic.

* 🚨 **Auto-SOS System**
  Detects emergency triggers and initiates rerouting with alert propagation.

* ⭐ **Priority Engine**
  Allocates convoy importance based on mission type (Medical, Ammunition, Supplies).

* 📡 **V2V Communication**
  Enables secure vehicle-to-vehicle data exchange for coordinated movement.

* 🎮 **Digital Twin**
  Real-time simulation of convoy movement and operational state.

* 🌍 **Sustainability (SDG 12)**
  Tracks fuel usage and estimates carbon footprint.

---

## 🏗️ Technical Stack

* **Frontend:** Next.js 15, TypeScript
* **Backend:** Flask (Python), SQLite
* **Logic:** Rule-based scoring, Haversine distance calculations
* **UI:** Glassmorphism design, Orbitron typography

---

## 🔄 How It Works

1. A convoy mission is created via the command interface
2. Backend evaluates route risk using predefined scoring logic
3. Optimal and backup routes are generated
4. Convoy is monitored in real-time via dashboard
5. SOS triggers initiate emergency response workflows

---

## 📁 Project Structure

```
d:\codered
├── app/                         # Next.js Command Center
│   ├── components/
│   │   ├── TacticalMap.tsx      # Satellite Tracking UI
│   │   ├── Navigation.tsx       # Secure Navigation Module
│   │   └── VoiceCommand.tsx     # AI Voice Interface
│   ├── driver/                 # Ground Unit Portal
│   ├── login/                  # Secure Entry (RBAC)
│   ├── create/                 # Mission Initialization
│   ├── dashboard/              # Command Dashboard
│   ├── threats/                # Threat Feed
│   ├── digital-twin/           # Operations Simulation
│   ├── globals.css             # Design Tokens
│   └── config.ts               # API Config
│
├── backend/                    # Flask Backend
│   ├── app.py                  # API & Logic
│   └── astraconvoy.db          # Database
│
├── scratch/                    # Testing Scripts
└── README.md
```

---

## 🚀 Deployment

### Prerequisites

* Node.js 18+
* Python 3.8+

### Run Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Run Frontend

```bash
npm install
npm run dev
```

Access at: http://localhost:3000

---

## 📊 API Endpoints

* `POST /api/convoy/create` → Create mission & analyze threat
* `GET /api/convoy/list` → Track active convoys
* `POST /api/driver/sos` → Trigger emergency protocol
* `GET /api/analytics/dashboard` → View strategic metrics

---

## 🎤 Strategic Pitch

AstraConvoy transforms logistics into intelligence.
By combining threat analysis, mission prioritization, and real-time monitoring, it reduces response delays and enhances operational safety in high-risk environments.

---

## 👥 Project Info

* **Target:** Defence Technology Systems
* **Classification:** Tactical Logistics Platform
* **Contact:** [support@astraconvoy.in](mailto:support@astraconvoy.in)

---

## 🛡️ AstraConvoy

**Secure. Intelligent. Reliable.**
