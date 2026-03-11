# Loomance Dashboard

> **Where fabric meets finesse** — Financial management dashboard for Loomance Clothing

A full-stack React web dashboard for tracking income, expenses, employees, and generating reports across two business units: **Clothing Shop** and **Garment (Manufacturing)**.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Database | Firebase Firestore |
| Charts | Recharts |
| PDF Export | jsPDF |
| CSV Export | PapaParse |
| Routing | React Router v6 |
| Icons | Lucide React |

---

## 🛠️ Setup Instructions

### Step 1: Clone & Install

```bash
cd web
npm install
```

### Step 2: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → name it (e.g., `loomance-dashboard`)
3. Disable Google Analytics (optional) → **Create project**

### Step 3: Create a Firestore Database

1. In your Firebase project, go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a region close to you → **Enable**

### Step 4: Register a Web App

1. In Firebase Console, click the **</>** (Web) icon
2. Give it a name (e.g., `loomance-web`) → **Register app**
3. Copy the `firebaseConfig` object — you'll need these values

### Step 5: Configure Environment Variables

```bash
# In the project root (web/ folder)
cp .env.example .env
```

Open `.env` and fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...
```

### Step 6: Firestore Security Rules (Development)

In Firebase Console → Firestore → **Rules**, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ **For production**, restrict these rules to authenticated users.

### Step 7: Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Build for Production

```bash
npm run build
```

The output will be in the `dist/` folder.

---

## 🌐 Deployment

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root
3. Add environment variables in Vercel Dashboard → Project → Settings → Environment Variables
4. Redeploy: `vercel --prod`

### Deploy to Netlify

1. Run `npm run build`
2. Drag the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)
3. Add environment variables: Site settings → Environment variables
4. Trigger redeploy

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── SummaryCard.jsx       # KPI metric card
│   │   ├── RevenueChart.jsx      # Monthly income vs expenses chart
│   │   └── RecentTransactions.jsx
│   ├── Layout/
│   │   ├── Sidebar.jsx           # Collapsible navigation
│   │   ├── Header.jsx            # Page title + unit filter
│   │   └── Layout.jsx            # App shell
│   └── UI/
│       ├── Modal.jsx
│       ├── ConfirmDialog.jsx
│       ├── EmptyState.jsx
│       └── Spinner.jsx
├── pages/
│   ├── Dashboard.jsx             # Overview with charts
│   ├── Income.jsx                # Shop sales + garment orders
│   ├── Expenses.jsx              # Shop & garment expenses
│   ├── Employees.jsx             # Staff management + wages
│   ├── Reports.jsx               # Reports with PDF/CSV export
│   └── History.jsx               # Full transaction ledger
├── firebase/
│   ├── config.js                 # Firebase initialization
│   └── services.js               # Firestore CRUD operations
├── context/
│   └── AppContext.jsx            # Global state
└── utils/
    ├── formatters.js             # Currency, date, calculations
    ├── exportCSV.js              # CSV download
    └── exportPDF.js              # PDF generation (jsPDF)
```

---

## 🗄️ Firestore Collections

| Collection | Description |
|------------|-------------|
| `transactions` | All income and expense records |
| `employees` | Garment division employee records |
| `orders` | Garment sub-orders with status |

---

## 💰 Currency & Date Format

- Currency: **Sri Lankan Rupees (LKR)** — displayed as `Rs. 1,000.00`
- Dates: **DD/MM/YYYY** format throughout

---

## ✨ Features

- **Dashboard** — Summary KPIs, monthly chart, recent transactions, per-unit breakdown
- **Income** — Shop sales tracking, garment order management with status (pending/in-progress/completed)
- **Expenses** — Categorized by type (Stock, Wages, Materials, etc.) with per-category breakdown
- **Employees** — Staff cards with wage tracker, one-click wage payment recording
- **Reports** — Date range filtering, PDF download, CSV export, category breakdown
- **History** — Full searchable ledger with pagination, edit and delete

---

## 🔒 Production Security

Before going live, update your Firestore rules to add authentication or IP allowlisting. The app currently runs in single-user mode without auth.
