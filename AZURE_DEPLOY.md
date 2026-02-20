# Deploy Next.js to Azure App Service — Step by Step

Yes, you can deploy a Next.js project on Azure. This guide walks you through deploying the LMS frontend (or any Next.js app) to **Azure App Service** (Web App).

---

## Prerequisites

- **Azure account** — [Create one](https://azure.microsoft.com/free/) if needed.
- **Node.js** on your machine (for local build/test).
- **Git** and your code in a **GitHub** repo (for CI/CD; optional if you deploy manually).

---

## Step 1: Create a Web App in Azure

1. Go to [Azure Portal](https://portal.azure.com) and sign in.
2. Click **Create a resource** → search for **Web App** → **Create**.
3. Fill in:
   - **Subscription**: Your subscription.
   - **Resource group**: Create new (e.g. `LMS-Frontend_group`) or use existing.
   - **Name**: Unique name, e.g. `LMS-Frontend` (this becomes `lms-frontend.azurewebsites.net` or similar).
   - **Publish**: **Code**.
   - **Runtime stack**: **Node 22 LTS**.
   - **Operating System**: **Linux** (recommended for Node/Next.js).
   - **Region**: Choose one (e.g. Canada Central).
4. Click **Review + create** → **Create**.
5. Wait for deployment, then go to the new **App Service** resource.

---

## Step 2: Configure the Web App for Node/Next.js

1. In the Web App, go to **Settings** → **Configuration**.
2. **General settings**:
   - **Startup Command**: Leave **empty** (default runs `npm start`) or set to:
     ```bash
     npm start
     ```
   - Do **not** use `npm run build && npm start` — the build should run in your pipeline, not on every restart.
3. **Application settings** (same Configuration blade → Application settings):
   Add these so the app and build know your URLs:

   | Name | Value | Notes |
   |------|--------|------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.azurewebsites.net` | Backend API base URL (no trailing `/`) |
   | `NEXT_PUBLIC_APP_URL` | `https://<your-frontend-default-domain>` | Optional; e.g. `https://lms-frontend-xxx.azurewebsites.net` |

   Click **Save** and **Restart** the app when prompted.

---

## Step 3: Deploy the app

You can deploy in two ways: **GitHub Actions** (recommended) or **manual**.

---

### Option A: Deploy with GitHub Actions (recommended)

Your repo already has a workflow (`.github/workflows/azure-frontend.yml`) that builds and deploys the **frontend** folder.

1. **Get the Publish profile**
   - In Azure Portal → your Web App → **Get publish profile** (top bar).
   - Save the downloaded `.PublishSettings` file; you’ll paste its contents as a secret.

2. **Add the secret in GitHub**
   - Repo → **Settings** → **Secrets and variables** → **Actions**.
   - **New repository secret**:
     - Name: `AZUREAPPSERVICE_PUBLISHPROFILE_LMS_FRONTEND`
     - Value: open the publish profile file in a text editor and paste the **entire** contents.

3. **Optional: set build-time variables**
   - Same page → **Variables** tab.
   - Add:
     - `NEXT_PUBLIC_API_URL` = your backend URL (e.g. `https://lms-backend.azurewebsites.net`).
     - `NEXT_PUBLIC_APP_URL` = your frontend URL (e.g. `https://lms-frontend-xxx.azurewebsites.net`).
   - These are used during `npm run build` in the workflow.

4. **Trigger the workflow**
   - Push to `main` and change something under `frontend/`, **or**
   - **Actions** tab → **Build and deploy Next.js to Azure Web App - LMS-Frontend** → **Run workflow**.

5. After the job succeeds, open your app’s default domain (e.g. `https://lms-frontend-xxx.azurewebsites.net`).

**If your Next.js app is in a different repo or at repo root:**  
Copy the workflow into that repo and adjust paths: remove `working-directory: frontend` and use `.` instead of `frontend/` where the workflow references the app folder. Use that repo’s publish profile and Web App name.

---

### Option B: Deploy manually (zip or local Git)

1. **Build locally**
   ```bash
   cd frontend
   npm ci
   npm run build
   ```
2. **Deploy the built app**
   - Zip the entire `frontend` folder (include `node_modules`, `.next`, `package.json`, `next.config.mjs`, `public`, `server.js`, etc.).
   - In Azure Portal → Web App → **Deployment Center** → choose **Zip Deploy** or **Local Git** and upload/push the zip or repo.
   - Or use Azure CLI:
     ```bash
     cd frontend
     zip -r ../deploy.zip . -x "*.git*"
     az webapp deploy --resource-group <resource-group> --name <app-name> --src-path ../deploy.zip --type zip
     ```

---

## Step 4: Make sure the app listens on Azure’s port

This project uses a small **start script** so the app listens on the port Azure provides:

- **Start script**: `frontend/server.js` runs `next start -H 0.0.0.0 -p PORT`.
- **package.json**: `"start": "node server.js"`.

You do **not** need to set `PORT` or `WEBSITES_PORT` in App settings; Azure sets `PORT` automatically. Just keep the startup command as `npm start` (or empty).

---

## Step 5: If you see “Application Error”

1. **Check that the deployed app was built**
   - If using GitHub Actions: the workflow runs `npm run build` and deploys the `frontend/` folder (including `.next`). No extra step.
   - If deploying manually: you must deploy **after** running `npm run build` so `.next` exists.

2. **Check logs**
   - **Log stream**: Web App → **Monitoring** → **Log stream**. Reproduce the error and look for Node/Next.js messages.
   - **Deployment Center** → **Logs**: confirm build and deploy steps.
   - **Overview** / **Properties**: if **Runtime status** shows “Issues Detected”, open it for details.

3. **Restart**
   - Configuration → **Save** (if you changed settings) → **Restart** the app.

**If Netlify works but Azure shows "Application Error":**  
- **Log stream** (Monitoring → Log stream): see the real Node/Next.js error.  
- Set **Node 22** on Azure: **Configuration** → **Application settings** → add `WEBSITE_NODE_DEFAULT_VERSION` = `~22`, then Save and Restart.  
- Ensure **Startup Command** is empty or `npm start` (not `npm run build && npm start`).  
- After any config change: **Save** → **Restart** → try the URL again.

---

## Summary checklist

| Step | Action |
|------|--------|
| 1 | Create Web App (Code, Node 22 LTS, Linux). |
| 2 | Configuration: Startup = `npm start` or empty; add `NEXT_PUBLIC_*` in App settings. |
| 3 | GitHub: add secret `AZUREAPPSERVICE_PUBLISHPROFILE_LMS_FRONTEND` (publish profile). |
| 4 | Push to `main` (with `frontend/` changes) or run the workflow manually. |
| 5 | Open the default domain; if error, use Log stream and Runtime status. |

Yes, you can deploy a Next.js project on Azure; following these steps will get your app built and running on App Service.
