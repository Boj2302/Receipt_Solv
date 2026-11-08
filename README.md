# ReceiptSolv Pro - Receipt & Invoice Generator

A tailored, high-performance receipt and invoice generator built directly from the templates, spreadsheets, and scanned documents in the **`Receipt_Solv`** folder for **WEB BISHOP TECHNOLOGY LTD**.

---

## 🚀 Quick Start (1-Click Run)

Just double-click:
```
start-receipt-generator.bat
```
* **On your Computer**: Opens automatically in your browser at `http://localhost:5173`
* **On your Mobile Phone**: Open `http://192.168.100.150:5173` or click **"📱 Use on Phone"** in the app to scan the QR code!

---

## 🆕 New Updates & Features

### 1. Ghana Tax Engine: Flat Rate VAT & Levies Overhaul
* **COVID-19 Health Recovery Levy has been completely removed** from all calculations, templates, and Excel exports.
* **New 3-Way Tax Regime Switcher**:
  1. **Standard GRA Levies**: 2.5% NHIL + 2.5% GETFund + 15.0% VAT (with standard compound taxable base calculation).
  2. **Flat Rate VAT Scheme**: Selecting **Flat VAT** **disables NHIL and GETFund completely**! It applies only the Flat VAT percentage (default 3.0%, adjustable to 5% or custom) and computes:
     $$\text{Grand Total} = \text{Subtotal} + \text{Flat VAT}$$
  3. **No Tax / Exempt**: Bypasses all taxes where $\text{Grand Total} = \text{Subtotal}$ (ideal for non-VAT proformas and cash receipts).

### 2. Sequential Ordered Invoice Numbering
* **No more randomized invoice numbers!**
* Invoice numbers now increment sequentially: e.g. `2026001`, `2026002`, `2026003`, or starting from any custom number (such as `2026355`).
* Click the **`+1`** button beside the invoice field at any time to advance to the next number.
* Set or adjust your next starting number anytime in **Settings**.

### 3. Fixed Print & PDF Blank Sheet Issue
* Previously, when printing from responsive/smaller screens, the preview container was hidden by responsive media classes, causing a blank preview sheet.
* **Fixed completely**:
  * Print styles now enforce standard A4 bounds (`210mm x 297mm`) and force the receipt element to be 100% visible regardless of screen size or active tab.
  * PDF generator now captures from an off-screen clone with crisp 2x resolution, ensuring sharp PDF downloads on all devices.

### 4. Full Mobile Phone Support
* **Wi-Fi Connectivity**: Built-in `--host` network server allows any phone connected to your Wi-Fi (or mobile hotspot) to load the app at `http://192.168.100.150:5173`.
* **QR Code Scanner**: Click the **"📱 Use on Phone"** button in the navbar to scan the QR code with your smartphone camera.
* **Install as Mobile App**:
  * **iPhone (Safari)**: Tap *Share > Add to Home Screen*
  * **Android (Chrome)**: Tap *Menu (⋮) > Add to Home screen*
* **Mobile-Optimized Controls**: Sticky tab switcher (`[Edit Form]` / `[Live A4 Preview]`) and direct mobile print/PDF export.

---

## 📁 Project Structure

```
Receipt_Solv/
├── start-receipt-generator.bat      # 1-click launcher with mobile host enabled
├── README.md                        # Documentation
├── Invoice1.xlsx, RCPL 2026 1.xlsx  # Original templates
├── WEBBISHOP.pdf                    # Original scanned copies
└── receipt-generator/               # React + Vite application
    ├── public/                      # Static assets & company logo
    ├── src/
    │   ├── assets/                  # Base64 logo embeds for PDF/print
    │   ├── components/
    │   │   ├── Navbar.tsx           # Toolbar with mobile QR button
    │   │   ├── ReceiptForm.tsx      # Split-screen form with Flat VAT & +1 numbering
    │   │   ├── ReceiptPreview.tsx   # Live A4 page renderer
    │   │   ├── MobileModal.tsx      # Mobile Wi-Fi connection & QR Code
    │   │   ├── templates/
    │   │   │   ├── ClassicTemplate.tsx  # 1:1 replica of scanned/Excel document
    │   │   │   ├── ModernTemplate.tsx   # Modern executive variant
    │   │   │   └── CompactTemplate.tsx  # Thermal slip variant
    │   │   ├── HistoryModal.tsx     # Saved invoices list, search & duplicate
    │   │   ├── ClientsModal.tsx     # Frequent client database
    │   │   └── SettingsModal.tsx    # Logo upload, banking & next invoice counter
    │   ├── constants/               # Defaults & presets
    │   ├── types/                   # TypeScript interfaces
    │   └── utils/
    │       ├── calculations.ts      # Subtotal, Flat VAT & Ghana tax math
    │       ├── excelExport.ts       # Pixel-perfect XLSX generation
    │       ├── pdfExport.ts         # High-res PDF download & print
    │       └── storage.ts           # Sequential counter & LocalStorage persistence
```
