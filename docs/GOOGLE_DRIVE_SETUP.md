# Google Drive Integration Setup

This document explains how to set up Google Drive integration for The Co-Builder platform.

## Overview

The Co-Builder integrates with Google Drive to:
- Display files from each venture's Google Drive folder
- Save asset responses as markdown files to Google Drive
- Enable read/write access to venture documentation

## Setup Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback` (for local development)
   - `https://your-domain.com/api/auth/callback` (for production)
5. Save the Client ID and Client Secret

### 3. Get Access Token

You have two options:

#### Option A: OAuth 2.0 Flow (Recommended for Production)

1. Use the OAuth 2.0 flow to get an access token
2. Store the token securely (environment variable or secure storage)
3. Refresh token as needed

#### Option B: Service Account (Recommended for Server-to-Server)

1. Create a Service Account:
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service account"
   - Create a new service account
   - Download the JSON key file

2. Share Google Drive folders with the service account email:
   - Open the Google Drive folder
   - Click "Share"
   - Add the service account email with "Editor" permissions

3. Use the service account credentials to authenticate API calls

### 4. Configure Environment Variables

Add to your `.env.local` (development) or Vercel environment variables (production):

```bash
# Option A: Direct access token (for OAuth flow)
GOOGLE_ACCESS_TOKEN=your_access_token_here

# Option B: Service account JSON (for service account)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

### 5. Map Google Drive Folders to Ventures

When creating a venture, provide the Google Drive folder URL:

```
https://drive.google.com/drive/folders/0ADANea9Ztfx_Uk9PVA
```

The system will automatically extract the folder ID (`0ADANea9Ztfx_Uk9PVA`) from the URL.

## Features

### Reading Files

- **Venture Overview Page**: Displays all files in the venture's Google Drive folder
- **File List**: Shows file names, types, sizes, and modification dates
- **Direct Links**: Click files to open them in Google Drive

### Writing Files

- **Save Asset to Drive**: Button on each asset workflow page
- **Automatic Export**: Saves all responses as a formatted markdown file
- **File Naming**: `Asset XX - Asset Title.md`
- **Content Format**: Structured markdown with all question responses

## API Endpoints

### GET `/api/google-drive/files?ventureId=xxx`
List files in a venture's Google Drive folder.

**Response:**
```json
{
  "folder": {
    "id": "0ADANea9Ztfx_Uk9PVA",
    "name": "Venture Name",
    "webViewLink": "https://drive.google.com/..."
  },
  "files": [
    {
      "id": "file_id",
      "name": "Asset 01 - Risk Capital.md",
      "mimeType": "text/markdown",
      "webViewLink": "https://drive.google.com/...",
      "modifiedTime": "2026-02-12T10:00:00Z",
      "size": "1234"
    }
  ]
}
```

### POST `/api/google-drive/files/create`
Create a file in a venture's Google Drive folder.

**Request:**
```json
{
  "ventureId": "venture_id",
  "fileName": "Asset 01 - Risk Capital.md",
  "content": "# Asset 1: Risk Capital...",
  "mimeType": "text/markdown"
}
```

## Troubleshooting

### "Google Drive API not configured"
- Ensure `GOOGLE_ACCESS_TOKEN` is set in environment variables
- Verify the token is valid and not expired

### "Invalid Google Drive URL"
- Ensure the URL format is: `https://drive.google.com/drive/folders/FOLDER_ID`
- The folder ID will be automatically extracted

### "Failed to list files"
- Check that the access token has proper permissions
- Verify the folder is shared with the service account (if using service account)
- Ensure the folder ID is correct

### "Unauthorized" errors
- Verify the user has access to the venture
- Check that the Google Drive folder is accessible with the provided token

## Security Considerations

1. **Access Tokens**: Store securely, never commit to version control
2. **Folder Permissions**: Only share folders with necessary accounts
3. **API Scopes**: Use minimal required scopes:
   - `https://www.googleapis.com/auth/drive.file` (read/write access to files created by the app)
   - `https://www.googleapis.com/auth/drive.readonly` (read-only access)

## Future Enhancements

- Automatic folder creation when creating a venture
- Real-time sync between Co-Builder and Google Drive
- Support for multiple file formats (PDF, DOCX, etc.)
- File versioning and history
- Collaborative editing integration
