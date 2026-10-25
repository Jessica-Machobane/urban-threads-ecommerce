# Urban Threads — Modern Streetwear Store

A clean, modern streetwear e-commerce web application featuring South African Rand (ZAR / R) pricing, curated collections (Hoodies, T-shirts, Sneakers, Accessories), shopping cart with size and color selection, and Firebase Firestore & Authentication integration.

---

## What is Included in this Package

- **Landing Page (`index.html`)**: Complete hero banner with custom background image, curated category grid, heavyweight hoodie editorial capsule banner, and the 4 Selected Essentials (*Embroidered Cotton Beanie*, *Monochrome Chunky Runner*, *Oversized Hoodie*, and *Heavyweight Studio Boxy Tee*).
- **Catalog & Filter Flow (`shop.html`)**: Full product grid with real-time category filtering and South African Rand (R) pricing.
- **Cart & Checkout (`cart.html`)**: Shopping bag with size/color selections, persistent storage, and order calculation.
- **Customer Auth (`login.html`)**: Firebase Google Sign-In and email authentication with error handling.
- **Design System (`css/style.css`)**: Complete responsive styling and typography.
- **All Assets (`public/assets/images/`)**: All lifestyle photography, including your attached custom images.
- **Store Scripts (`js/`)**: Complete client logic (`index-page.js`, `shop-page.js`, `cart-page.js`, `login-page.js`, `products.js`, `cart.js`, `auth.js`, `firebase-client.js`, `common.js`).
- **Firebase Configuration**: Pre-configured `firebase-applet-config.json`, schema blueprints (`firebase-blueprint.json`), and security rules (`firestore.rules`).
- **Documentation (`README.md`)**: Complete quick-start guide and command reference.

---

## How to Run in VS Code

### 1. Prerequisites
- **Node.js** v18+ or v20+ ([Download Node.js](https://nodejs.org/))
- **VS Code** ([Download VS Code](https://code.visualstudio.com/))

### 2. Open Project
1. Extract `urban-threads-ecommerce.zip` to your computer.
2. Open VS Code.
3. Click **File > Open Folder...** and select the extracted folder.

### 3. Install Dependencies
Open the built-in terminal in VS Code (`Ctrl + \`` or `Cmd + \``) and run:
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## Build for Production
```bash
npm run build
```
Production-ready files will be generated into the `dist/` folder, ready for deployment to Netlify, Firebase Hosting, or any static host.
