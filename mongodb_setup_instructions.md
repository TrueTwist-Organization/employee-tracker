# MongoDB Complete Installation & Connection Guide

Maine aapke project mein filhal ek **"In-Memory Database"** (temporary database) setup kar diya hai. Is wajah se **abhi aap <urvashi@gmail.com> se successfully login kar sakte hain**. Frontend aur Backend dono sahi se properly start ho chuke hain.

Lekin, agar aapko hamesha ke liye apna data permanent database (MongoDB) mein save karna hai, toh aapko **MongoDB Community Server** download aur install karna hoga. Yahan MongoDB install aur connect karne ke poore steps likhe hain:

---

## Step 1: MongoDB kaunsa download karein?

Aapko **"MongoDB Community Server"** download karna hai. Ye free aur best version hai local development ke liye.

1. Is link par click karein: [MongoDB Community Server Download](https://www.mongodb.com/try/download/community)
2. Yahan par options check karein:
   - **Version:** `8.0` (yaa jo bhi latest "Current" likha ho)
   - **Platform:** `Windows`
   - **Package:** `msi`
3. Uske baad **Download** button par click karein aur setup file (.msi) download hone dein.

---

## Step 2: Install Kaise Karein?

1. Downloaded `.msi` file ko open karein.
2. **Next** press karein aur Terms accept karein.
3. Setup Type mein **"Complete"** par click karein.
4. **🔴 Ye step sabse zaroori hai:** Ek screen aayegi jispe "Install MongoDB as a Service" likha hoga. Ensure kijiye ki wo pehle se checked ho (`Run service as Network Service user`). Use checked rehne de aur Next karein.
5. Next screen par **"Install MongoDB Compass"** ka option hota hai (MongoDB Compass ek app hoti hai jisme aap apna database UI mein dekh sakte hain). Ise checked rehne dein aur Next karein.
6. Install par click karein aur process poora hone dein (End mein Finish kar dein).

---

## Step 3: Project mein kaise connect karein?

MongoDB install hone ke baad wo automatically background mein shuru (start) ho jata hai. Hamein bas project mein uski URL dalni hoti hai.

1. VS Code mein apna password file kholiye: `C:\Users\Admin\Desktop\em\backend\.env`
2. Us file mein check karein ki `MONGO_URI` ye likha ho:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/minihr
   JWT_SECRET=supersecretkey_minihr_2026
   NODE_ENV=development
   ```

   > Note: Localhost par by-default ye connection string hi MongoDB ko project se connect karti hai. Ye main pehle set kar chuka hun.

---

## Step 4: Login Testing

Ab jaise hi MongoDB aapke PC mein successfully install ho jayega:

1. Apne terminals mein jaake chal rahe codes ko band karein. (`Ctrl + C` dabayen)
2. Aur wapas se command line se start karein:

   ```bash
   cd C:\Users\Admin\Desktop\em
   npm run dev
   ```

3. Chuki temporary in-memory database band ho gaya, apko ek baar admin user naya banana hoga apne nayi MongoDB database mein usi folder mein:

   ```bash
   cd C:\Users\Admin\Desktop\em\backend
   node seed.js
   ```

Aap login page pe jayein, aur try karein:

- **Email:** <urvashi@gmail.com>
- **Password:** `Pass@123`

Login ab full properly chalega!

**Filhal ke liye temporary database active hone ke karan aap abhi jaa kar browser pe login test kar sakte ho bina error ke.**
