# Google Drive & Slack Connection Verification System

**Date:** 2026-02-12  
**Status:** ✅ Built & Ready for Testing

---

## Overview

Built a comprehensive connection verification system that checks Google Drive folder and Slack channel connections for each venture. This ensures fellows have proper access to their work storage and communication channels.

---

## What Was Built

### 1. Connection Verification Actions ✅
**File:** `src/app/actions/connections.ts`

**Functions:**
- `verifyGoogleDriveConnection()` - Verifies Google Drive folder exists and is accessible
- `verifySlackConnection()` - Verifies Slack channel exists and is accessible
- `getVentureConnections()` - Gets connection status for a venture
- `getAllVentureConnections()` - Gets all venture connections (admin only)

**Features:**
- Extracts folder/channel IDs from URLs
- Validates API access
- Returns verification status with error messages
- Returns folder/channel names when verified

### 2. Slack Utility Functions ✅
**File:** `src/lib/slack/utils.ts`

**Functions:**
- `extractSlackChannelId()` - Parses Slack channel ID from URLs
- `buildSlackChannelUrl()` - Builds Slack channel URL from ID

**Supported URL formats:**
- `https://thestudiofellows.slack.com/archives/C0ADHAF5Y6T`
- `C0ADHAF5Y6T` (direct ID)

### 3. Connection Status Component ✅
**File:** `src/components/connections/ConnectionStatus.tsx`

**Features:**
- Visual status indicators (✅ Connected, ⚠️ Error, ⚪ Not Connected)
- Shows connection name when verified
- Displays error messages
- Links to Google Drive/Slack
- Optional "Verify Connection" button

### 4. Venture Connections Display ✅
**File:** `src/components/connections/VentureConnections.tsx`

**Features:**
- Shows both Google Drive and Slack connection status
- Two-column layout (responsive)
- Warning message if neither is connected
- Auto-loads connection status

### 5. Admin Slack Management ✅
**File:** `src/app/(admin)/admin/ventures/[ventureId]/slack/page.tsx`

**Features:**
- Link Slack channel to venture
- Unlink Slack channel
- List available Slack channels
- Paste Slack channel URL or select from list
- Shows current connection status

### 6. Admin Actions ✅
**File:** `src/app/actions/admin.ts`

**New Functions:**
- `linkSlackChannelToVenture()` - Links Slack channel to venture
- `unlinkSlackChannelFromVenture()` - Unlinks Slack channel
- `getSlackChannelForVenture()` - Gets Slack channel info for venture

**Features:**
- Prevents duplicate channel linking
- Validates channel URL format
- Updates existing mappings

### 7. Enhanced Slack Client ✅
**File:** `src/lib/slack/client.ts`

**New Function:**
- `getChannelInfo()` - Gets Slack channel information (name, privacy status)

---

## Integration Points

### Fellow View (`/venture/[ventureId]`)
- Connection status displayed at top of venture page
- Shows Google Drive and Slack connection status
- Links to open folders/channels

### Admin View (`/admin/ventures/[ventureId]`)
- Connection status displayed with "Verify" button
- Link to manage Slack channel (`/admin/ventures/[ventureId]/slack`)
- Shows connection errors for troubleshooting

---

## Database Schema

Uses existing tables:
- `ventures.google_drive_url` - Stores Google Drive folder URL
- `slack_channel_ventures` - Maps Slack channels to ventures
  - `venture_id` - References venture
  - `slack_channel_id` - Slack channel ID (e.g., C0ADHAF5Y6T)
  - `slack_channel_name` - Channel name (fetched from Slack API)

---

## Example Usage

### For Venture "L0g"

**Google Drive:**
- URL: `https://drive.google.com/drive/folders/16I_L0_nQxT2p5lPtYIub2x5W0AZjLrTT`
- Status: ✅ Connected & Verified
- Name: "L0g" (from Google Drive API)

**Slack Channel:**
- URL: `https://thestudiofellows.slack.com/archives/C0ADHAF5Y6T`
- Status: ✅ Connected & Verified
- Name: "l0g" (from Slack API)

---

## API Requirements

### Google Drive API
- Requires: `GOOGLE_ACCESS_TOKEN` environment variable
- Scopes: `https://www.googleapis.com/auth/drive.readonly`
- Used for: Verifying folder access, getting folder name

### Slack API
- Requires: `SLACK_BOT_TOKEN` environment variable
- Scopes: `channels:read`, `groups:read`
- Used for: Verifying channel access, getting channel name, listing channels

---

## User Flows

### Fellow Flow
1. Fellow creates venture with Google Drive URL
2. Connection status automatically checked
3. Fellow sees status on venture page
4. If not connected, sees warning message

### Admin Flow
1. Admin views venture detail page
2. Sees connection status with verify button
3. Clicks "Manage Slack Channel" to link/unlink
4. Can paste URL or select from available channels
5. Connection verified automatically after linking

---

## Error Handling

**Google Drive Errors:**
- "No Google Drive URL provided"
- "Invalid Google Drive URL format"
- "Google Drive API not configured"
- "Failed to verify folder access" (permission/not found)

**Slack Errors:**
- "No Slack channel ID provided"
- "Invalid Slack channel URL format"
- "Channel not found or not accessible"
- "Failed to verify channel access"

---

## Testing Checklist

- [ ] Verify Google Drive folder connection works
- [ ] Verify Slack channel connection works
- [ ] Test connection status display on venture page
- [ ] Test admin Slack management page
- [ ] Test error handling for invalid URLs
- [ ] Test error handling for inaccessible folders/channels
- [ ] Test unlink functionality
- [ ] Test duplicate channel prevention

---

## Next Steps

1. **Add to Venture Creation:** Option to link Slack channel during creation
2. **Bulk Verification:** Admin page to verify all connections at once
3. **Notifications:** Alert fellows when connections fail
4. **Auto-verification:** Periodic background checks
5. **Connection History:** Track when connections were verified/changed

---

**Build Status:** ✅ Success  
**Ready for:** Testing & Deployment
