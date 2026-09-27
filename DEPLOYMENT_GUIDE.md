# ILLUMINATE Event Platform — Complete Deployment & Beginner Guide

Welcome to the **ILLUMINATE** platform codebase! This application is a production-oriented, full-stack event registration and participant management system built for **KMCT College of Engineering for Emerging Technologies and Management, Kasaragod**, conducted in association with **E-Cell, IIT Bombay**.

---

## 1. Quick Start (Running Locally)

You can run and test the complete platform locally immediately. Zero cloud setup is required on day one thanks to the built-in local persistence engine.

### Prerequisites Check
Verify your Node.js and npm versions in PowerShell:
```powershell
node -v
npm -v
```
*(Requires Node.js v18+ or v20+; v24 is tested and verified).*

### Start the Application
In your terminal, navigate to the project directory:
```powershell
npm run dev
```
Open your browser and navigate to:
- **Public Event Website:** [http://localhost:3000](http://localhost:3000)
- **Participant Registration:** [http://localhost:3000/register](http://localhost:3000/register)
- **Payment & Pass Checkout:** [http://localhost:3000/payment](http://localhost:3000/payment)
- **Coordinator Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)
  *(Default development passcode: `illuminate2026`)*

---

## 2. Platform Architecture & Features

### A. Signature Feature: 3D Apple-Inspired Phone Scroll Experience
- Procedurally generated 3D smartphone using Three.js with realistic proportions, titanium frame, triple-camera optical lenses, and an illuminated OLED screen.
- Scrolled-linked exploded view that smoothly separates into 7 components (front glass shield, OLED panel, titanium chassis, rear frosted glass, camera module, optical lenses, side buttons) and reassembles as the user scrolls toward the registration section.
- Automatic WebGL capability detection and `prefers-reduced-motion` accessible fallbacks.

### B. Participant Registration & Indian Mobile Validation
- Server-side and client-side Zod validation with 10-digit Indian phone normalization.
- Institution auto-filled with KMCT College of Engineering Kasaragod (editable for visiting colleges).
- Prevents duplicate email registrations while allowing pending applicants to resume payment.

### C. Razorpay Gateway & Direct UPI Verification Queue
- Authoritative server-side fee calculation in integer paise (`₹700` = `70000 paise`).
- HMAC-SHA256 cryptographic signature verification.
- **Safety Switch:** Live gateway payments are kept disabled by default until the organizing coordinator explicitly confirms the fee and merchant credentials.
- **Direct UPI Option:** Students can transfer directly via UPI to `rachit@ecell.in` (E-Cell IIT Bombay Lead) and submit their 12-digit UTR reference number.
- Manual UPI Queue in the admin dashboard allows coordinators to cross-reference bank statements and issue confirmed passes with one click.

### D. Official Digital Workshop Pass
- Printable pass with participant name, course, registration number (`ILL-KMCT-XXXX`), confirmed/pending status badge, and official E-Cell IIT Bombay accreditation notes.
- Automatic PDF print format.

### E. Coordinator Admin Dashboard
- **Pricing Discrepancy Banner:** Prominently flags that the configured fee is ₹700, whereas the official NEC discount guideline specifies ₹699 until 30 September 2026.
- Real-time KPIs: Total registrations, verified paid seats, pending count, manual review queue, and target progress (minimum 70 participants).
- Live payments toggle with security confirmation.
- One-click CSV Export formatted for official E-Cell IIT Bombay submission.
- Real-time Event Settings Editor: update date, hall, fee, capacity, or coordinator details without modifying code.

---

## 3. Step-by-Step Firebase Production Setup

When you are ready to deploy to Google Cloud & Firebase:

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**, name it `illuminate-kmct` (or your preferred name), and choose whether to enable Google Analytics.
3. Click **Create Project**.

### Step 2: Register the Web App
1. On the Project Overview page, click the **Web icon (`</>`)** to add an app.
2. Register app nickname: `illuminate-web`.
3. Copy the `firebaseConfig` object values into your `.env.local` file:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=illuminate-kmct.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=illuminate-kmct
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=illuminate-kmct.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789...
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789...
   ```

### Step 3: Create Cloud Firestore
1. In the Firebase console left menu, click **Firestore Database** -> **Create database**.
2. Select **Production mode** and choose your nearest region (e.g., `asia-south1` for Mumbai).
3. The included [firestore.rules](file:///c:/Users/User/Downloads/illuminate/firestore.rules) and [firestore.indexes.json](file:///c:/Users/User/Downloads/illuminate/firestore.indexes.json) will automatically enforce security:
   - Events are publicly readable but editable only by authorized coordinators.
   - Registrations cannot be publicly listed; participants can only read their own pass.
   - Payment status cannot be tampered with from the browser.

### Step 4: Generate Firebase Admin SDK Private Key
1. Go to **Project Settings** (gear icon) -> **Service Accounts**.
2. Click **Generate new private key** and download the JSON file.
3. Add the values to your `.env.local` (or Firebase App Hosting secrets):
   ```env
   FIREBASE_PROJECT_ID=illuminate-kmct
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@illuminate-kmct.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

### Step 5: Configure Razorpay (Optional for Live Mode)
1. Sign up or log into [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Under **Settings -> API Keys**, generate a Test Key ID and Secret.
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   RAZORPAY_WEBHOOK_SECRET=...
   ```
4. Configure Webhooks:
   - Webhook URL: `https://your-domain.web.app/api/payment/webhook`
   - Active Events: `payment.captured`, `order.paid`

### Step 6: Deploy with Firebase App Hosting or Firebase CLI
Deploy Firestore rules & indexes:
```powershell
npx -y firebase-tools deploy --only firestore:rules,firestore:indexes
```
For Firebase App Hosting:
1. Connect your GitHub repository to Firebase App Hosting in the Firebase Console.
2. The included [apphosting.yaml](file:///c:/Users/User/Downloads/illuminate/apphosting.yaml) automatically builds and scales the Next.js App Router application.

---

## 4. Running Automated Tests

To run the complete test suite at any time:
```powershell
npm test
```
Validates:
- Participant phone normalization & Zod schema rules.
- Cryptographic HMAC-SHA256 payment signature verification and tamper rejection.
- Event configuration defaults, fee calculation, minimum target of 70, and price discrepancy safeguards.

---

## 5. Contact & Support

- **Official Program Lead:** Rachit Kumar (E-Cell, IIT Bombay) — `+91 9719362033` | `rachit@ecell.in`
- **Host Institution:** KMCT College of Engineering for Emerging Technologies and Management, Kasaragod, Kerala
- **Official Illuminate Website:** [ecell.in/illuminate](https://www.ecell.in/illuminate/)
