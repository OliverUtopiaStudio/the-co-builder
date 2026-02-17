# Google Drive API Quick Start Guide

Follow these steps to get your Google Drive API working in 10 minutes.

## Step 1: Create Google Cloud Project (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **"New Project"**
4. Name it: `The Co-Builder` (or any name you prefer)
5. Click **"Create"**
6. Wait for it to be created, then select it from the dropdown

## Step 2: Enable Google Drive API (1 minute)

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for: `Google Drive API`
3. Click on **"Google Drive API"**
4. Click the big blue **"Enable"** button
5. Wait for it to enable (usually instant)

## Step 3: Create OAuth Credentials (3 minutes)

1. Go to **"APIs & Services"** → **"Credentials"** (in left sidebar)
2. Click **"+ Create Credentials"** at the top
3. Select **"OAuth client ID"**
4. If prompted, configure the OAuth consent screen:
   - Choose **"External"** (unless you have a Google Workspace)
   - Click **"Create"**
   - Fill in:
     - **App name**: `The Co-Builder`
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click **"Save and Continue"** through the rest (you can skip scopes for now)
   - Click **"Back to Dashboard"**

5. Now create the OAuth client:
   - Click **"+ Create Credentials"** → **"OAuth client ID"**
   - **Application type**: `Web application`
   - **Name**: `The Co-Builder Web`
   - **Authorized redirect URIs**: Click **"+ Add URI"** and add:
     - `http://localhost:3000`
     - `https://the-co-builder.vercel.app`
   - Click **"Create"**
   - **IMPORTANT**: Copy the **Client ID** and **Client Secret** (you'll need these)

## Step 4: Get Access Token Using OAuth Playground (4 minutes)

### Method A: Using OAuth Playground (Easiest)

1. Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (⚙️) in the top right
3. Check **"Use your own OAuth credentials"**
4. Paste your **Client ID** and **Client Secret** from Step 3
5. In the left panel, scroll down and find **"Drive API v3"**
6. Expand it and check these scopes:
   - `https://www.googleapis.com/auth/drive.file` (read/write files)
   - `https://www.googleapis.com/auth/drive.readonly` (read files)
7. Click **"Authorize APIs"** at the bottom
8. Sign in with your Google account
9. Click **"Allow"** to grant permissions
10. Click **"Exchange authorization code for tokens"**
11. **Copy the "Access token"** - this is what you need!

### Method B: Using Service Account (More Secure for Production)

1. In Google Cloud Console, go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"Service account"**
3. Fill in:
   - **Service account name**: `co-builder-drive`
   - **Service account ID**: (auto-filled)
   - Click **"Create and Continue"**
4. Skip role assignment (click **"Continue"**)
5. Skip granting access (click **"Done"**)
6. Click on the service account you just created
7. Go to **"Keys"** tab
8. Click **"Add Key"** → **"Create new key"**
9. Choose **"JSON"** and click **"Create"**
10. The JSON file will download - **keep this secure!**
11. Share your Google Drive folders with the service account email:
    - Open each venture's Google Drive folder
    - Click **"Share"**
    - Add the service account email (looks like `co-builder-drive@your-project.iam.gserviceaccount.com`)
    - Give it **"Editor"** permissions
    - Click **"Send"**

## Step 5: Configure Environment Variables

### For Local Development

1. Create/update `.env.local` in your project root:
```bash
GOOGLE_ACCESS_TOKEN=your_access_token_here
```

Replace `your_access_token_here` with the access token from Step 4.

### For Production (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **the-co-builder**
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add:
   - **Key**: `GOOGLE_ACCESS_TOKEN`
   - **Value**: Your access token
   - **Environment**: Select all (Production, Preview, Development)
6. Click **"Save"**
7. **Redeploy** your project (or it will auto-deploy on next push)

## Step 6: Test It!

1. **Restart your local dev server** (if testing locally):
   ```bash
   npm run dev
   ```

2. **Create a test venture**:
   - Go to `/venture/new`
   - Fill in venture details
   - Add a Google Drive folder URL (like: `https://drive.google.com/drive/folders/YOUR_FOLDER_ID`)
   - Create the venture

3. **Check the venture page**:
   - You should see a "Google Drive Files" section
   - It should list files from your folder (or show "No files found" if empty)

4. **Test saving to Drive**:
   - Go to any asset page
   - Fill in some responses
   - Click **"Save to Drive"**
   - Check your Google Drive folder - you should see a new markdown file!

## Troubleshooting

### "Google Drive API not configured"
- Make sure `GOOGLE_ACCESS_TOKEN` is set in your environment variables
- Restart your dev server after adding to `.env.local`
- For Vercel, make sure you redeployed after adding the env var

### "Invalid Google Drive URL"
- Make sure the URL format is: `https://drive.google.com/drive/folders/FOLDER_ID`
- The folder ID is the long string after `/folders/`

### "Failed to list files" or "Unauthorized"
- Your access token might have expired (OAuth tokens expire after 1 hour)
- Get a new token from OAuth Playground
- For production, consider using a Service Account (doesn't expire)

### Access Token Expired
- OAuth access tokens expire after ~1 hour
- For production, you should:
  - Use a Service Account (doesn't expire)
  - Or implement token refresh logic

## Next Steps

Once it's working:
1. **For Production**: Set up a Service Account (more secure, doesn't expire)
2. **Share folders**: Make sure all venture Google Drive folders are shared with your service account
3. **Test thoroughly**: Create a test venture and verify files appear

## Need Help?

- Check the full documentation: `docs/GOOGLE_DRIVE_SETUP.md`
- Google Drive API docs: https://developers.google.com/drive/api
- OAuth Playground: https://developers.google.com/oauthplayground/
