# ReceiptSolv Pro - Receipt & Invoice Generator

A tailored, high-performance receipt and invoice generator built for **WEB BISHOP TECHNOLOGY LTD** with multi-device cloud synchronization, Bluetooth & social media sharing, and online recovery archive. Deployed seamlessly to **Vercel** via GitHub.

---

## 🚀 Quick Start (1-Click Run)

Just double-click:
```bat
start-receipt-generator.bat
```
* **On your Computer**: Opens automatically in your browser at `http://localhost:5173`
* **On your Mobile Phone**: Open `http://192.168.100.150:5173` or click **"📱 Install on Phone"** in the app to scan the QR code!

---

## 🆕 New Features & Enhancements

### 1. 📤 Bluetooth & Social Media Sharing
* **Share via Bluetooth / System Share**:
  * Automatically generates a high-resolution PDF file and opens the device's native sharing sheet.
  * On **Android** and **Windows**, choose **Bluetooth** or **Quick Share / Nearby Share** to beam the invoice file directly to any nearby device, phone, or computer.
  * On **iOS / macOS**, share via **AirDrop**, Bluetooth, or Files.
* **Direct Social Media Integration**:
  * **WhatsApp**: Opens chat with a pre-formatted itemized invoice breakdown (document number, client, date, items, subtotal, levies, and grand total).
  * **Telegram**: Direct message link with formatted invoice data.
  * **Email**: Pre-populates a professional email draft with the invoice subject and breakdown.
  * **SMS / Messages**: Direct SMS message link for mobile phones.
  * **X (Twitter)** & **LinkedIn**: Quick business share.
* **Web Bluetooth Device Pairing**:
  * Built-in browser tool to discover and pair with nearby Bluetooth Low Energy devices or Bluetooth thermal receipt printers.
* **Share Any Saved Invoice**:
  * A dedicated **Share** button is available on the main navbar, mobile quick-action bar, live preview, and on every past document in the **History** list.

---

### 2. 🔐 Account Creation, Protection & Authentication
* **User Accounts**: Create an account or sign in using your email and password.
* **Password Recovery**: 1-click password reset link sent to your email.
* **Data Protection**: Secures your business receipts, custom client lists, and banking settings under your account credentials.
* **Local Mode / Offline Fallback**: Even without internet connection or before configuring cloud credentials, the app operates smoothly in offline mode and synchronizes once reconnected.

---

### 3. 🔄 Real-Time Multi-Device Cloud Synchronization
* **Cross-Device Portability**:
  * Any receipt created or edited on your **phone** automatically appears on your **laptop or desktop** in real time (and vice versa) when signed in with the same account.
  * Company branding, bank details, and client lists synchronize across all your devices.
* **Cloud Firestore Engine**:
  * Backed by Google Cloud Firestore with real-time snapshot listeners (`onSnapshot`) for instant cross-device updates without needing page refreshes.
* **1-Click Cloud Backup**:
  * Easily migrate and upload all previous local receipts up to your cloud account from the Account modal.

---

### 4. ♻️ Online Recovery & Deleted Archive Function
* **Soft-Delete Protection**:
  * When you delete an invoice from History, it is never permanently destroyed immediately.
  * It is moved to the **Online Recovery & Deleted Archive** with a deletion timestamp.
* **Recover Deleted Receipts Anytime**:
  * Open the **Recovery Trash** modal from the navbar or History list.
  * Click **"Restore"** on any invoice to immediately return it to your active history across all connected devices.
  * Click **"Restore All"** to recover all deleted receipts in one click.
  * Option to **"Permanently Delete"** when you wish to purge a document.

---

### 5. 🌐 Vercel & GitHub Deployment
The project is optimized for deployment to Vercel via GitHub:
* **Root & Subfolder Vercel Configuration**: Pre-configured `vercel.json` files ensure clean builds and SPA routing on Vercel regardless of whether root or `receipt-generator` is chosen in Vercel project settings.
* **Environment Variables**:
  In Vercel -> **Project Settings** -> **Environment Variables**, add:
  ```env
  VITE_FIREBASE_API_KEY=your_api_key
  VITE_FIREBASE_PROJECT_ID=your_project_id
  VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
  VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
  VITE_FIREBASE_APP_ID=your_app_id
  ```
* **In-App Cloud Setup**: You can also enter or paste your Firebase settings directly inside the web app (**Account > Cloud Setup**) on any device!

---

### 6. 🇬🇭 Ghana Tax Engine & Sequential Numbering
* **Flat Rate VAT Scheme**: Disables NHIL and GETFund completely when active.
* **Standard GRA Levies**: 2.5% NHIL + 2.5% GETFund + 15.0% VAT with compound base calculation.
* **No Tax / Exempt**: Bypasses taxes for cash and non-VAT receipts.
* **Sequential Numbering**: Increments consecutively (e.g. `2026001`, `2026002`, `2026003`) with a manual `+1` button.

---

## 📁 Project Structure

```
Receipt_Solv/
├── vercel.json                      # Vercel deployment root configuration
├── start-receipt-generator.bat      # 1-click launcher with mobile host enabled
├── README.md                        # Documentation
└── receipt-generator/               # React + Vite application
    ├── vercel.json                  # SPA routing configuration
    ├── .env.example                 # Environment variables template
    ├── public/                      # Static assets & company logo
    ├── src/
    │   ├── assets/                  # Base64 logo embeds
    │   ├── components/
    │   │   ├── Navbar.tsx           # Toolbar with Share, Account, Recovery & Print
    │   │   ├── ShareModal.tsx       # Bluetooth, WhatsApp, Email & Social sharing
    │   │   ├── AuthModal.tsx        # Account creation, login & cloud sync setup
    │   │   ├── RecoveryModal.tsx    # Online recovery archive for deleted invoices
    │   │   ├── HistoryModal.tsx     # Saved invoices list with per-row Share & Recovery link
    │   │   ├── ClientsModal.tsx     # Frequent client database
    │   │   ├── SettingsModal.tsx    # Logo upload, banking & next invoice counter
    │   │   ├── MobileModal.tsx      # Mobile Wi-Fi connection & QR Code
    │   │   ├── ReceiptForm.tsx      # Document editor form
    │   │   ├── ReceiptPreview.tsx   # Live A4 page renderer
    │   │   └── templates/
    │   │       ├── ClassicTemplate.tsx
    │   │       ├── ModernTemplate.tsx
    │   │       └── CompactTemplate.tsx
    │   ├── constants/               # Defaults & presets
    │   ├── types/                   # TypeScript interfaces (User, Doc, Cloud)
    │   └── utils/
    │       ├── firebase.ts          # Auth, Firestore real-time sync & online recovery
    │       ├── calculations.ts      # Subtotal, Flat VAT & Ghana tax math
    │       ├── excelExport.ts       # Pixel-perfect XLSX generation
    │       ├── pdfExport.ts         # High-res PDF download, Blob export & print
    │       └── storage.ts           # Local-first persistence, soft delete & sequential counter
```
