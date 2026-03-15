# ⚡ PROJECT ELECTRIFY: THE WORKBENCH

Welcome to the high-voltage world of **Project Electrify**. This isn't just a "game"—it's a diegetic electrical engineering simulator built to turn you into a circuit wizard.

---

## 🖍️ THE MACARONI-CRAYON DIAGRAM (How it Works)

```text
   [ YOUR BRAIN ]
         |
         v
   [ THE BROWSER ] <--- (React + Vite: The "Paper")
         |
   +-----+-----+-----------------------+
   |           |                       |
[ ENGINE ]  [ ASSETS ]            [ BACKEND ]
(The Math)  (The Look)            (The Memory)
    |           |                       |
    |     [ CRT MONITOR ] <------ [ FIREBASE ]
    |     [ CLIPBOARD   ]         (Saves your
    |     [ PEGBOARD    ]          high scores!)
    |           |
    +-----> [ THE WORKBENCH ]
            (Where things go BOOM!)
```

1. **The Math (Nodal Analysis):** When you click "ENGAGE," the app treats electricity like water. It calculates the "pressure" (Voltage) at every dot and the "flow" (Current) through every wire.
2. **The Look (Diegetic UI):** Everything is designed to look like a physical object on a desk. The CRT monitor is your menu, the clipboard is your manual.
3. **The Memory (Firebase):** When you win, we send a "Hey, they did it!" message to the cloud so you don't lose your progress.

---

## 🚀 HOW TO LAUNCH IT

### Method A: The "Just Click Run" (AI Studio)
1. Look at the preview window on the right.
2. If it says "Authentication Required," click **Sign In with Google**.
3. Pick a level from the **Pegboard**.
4. Drag components, click **ENGAGE**.

### Method B: Local Development (Your Computer)
1. **Install Node.js** (The engine that runs the code).
2. **Download the code** from GitHub.
3. Open your terminal in that folder and run:
   ```bash
   npm install  # Installs the macaroni and crayons
   npm run dev  # Starts the workbench
   ```
4. Open `http://localhost:3000` in your browser.

---

## ☁️ HOW TO DEPLOY IT (To the Real World)

1. **Firebase Setup:**
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Create a project.
   - Enable **Google Auth** and **Firestore**.
   - Set your OAuth Consent Screen to **"External"** (so your friends can play!).

2. **The Build:**
   - Run `npm run build`. This squishes all the code into a tiny `dist/` folder.
   - Upload that `dist/` folder to any host (Firebase Hosting, Vercel, Netlify).

---

## 🛠️ TECH STACK (The "Grown-Up" Stuff)
- **Frontend:** React 18 + Tailwind CSS (Styling) + Motion (Animations).
- **State:** Zustand (Fast, lightweight memory).
- **Database:** Firebase Firestore (Real-time sync).
- **Simulation:** Custom iterative Nodal Analysis solver in TypeScript.

---

## ⚠️ SECURITY NOTE
Your Firebase keys are now stored in `.env` files. **NEVER** upload your `.env` file to GitHub. Use `.env.example` as a template for others!
