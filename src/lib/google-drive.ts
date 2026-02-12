/**
 * Google Drive API utilities for reading and writing files
 */

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink?: string;
  modifiedTime: string;
  size?: string;
  parents?: string[];
}

export interface GoogleDriveFolder {
  id: string;
  name: string;
  webViewLink: string;
}

/**
 * Extract folder ID from Google Drive URL
 * Supports formats:
 * - https://drive.google.com/drive/folders/FOLDER_ID
 * - https://drive.google.com/drive/u/0/folders/FOLDER_ID
 * - FOLDER_ID (direct ID)
 */
export function extractFolderId(urlOrId: string | null | undefined): string | null {
  if (!urlOrId) return null;
  
  // If it's already just an ID (no slashes), return it
  if (!urlOrId.includes('/')) {
    return urlOrId;
  }
  
  // Extract from URL patterns
  const patterns = [
    /\/drive\/folders\/([a-zA-Z0-9_-]+)/,
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = urlOrId.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Build Google Drive folder URL from folder ID
 */
export function buildFolderUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}

/**
 * Get Google Drive API access token
 * This should be called from a server-side API route
 */
export async function getGoogleDriveAccessToken(): Promise<string | null> {
  // Check for service account credentials or OAuth token
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
  
  if (accessToken) {
    return accessToken;
  }
  
  if (credentials) {
    // Use service account for server-to-server auth
    // This would require googleapis package
    // For now, return null and handle in API route
    return null;
  }
  
  return null;
}

/**
 * List files in a Google Drive folder
 */
export async function listFolderFiles(
  folderId: string,
  accessToken: string
): Promise<GoogleDriveFile[]> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webViewLink,webContentLink,modifiedTime,size,parents)&orderBy=modifiedTime desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to list files: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.files || [];
}

/**
 * Create a file in Google Drive folder
 */
export async function createFile(
  folderId: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/plain',
  accessToken: string
): Promise<GoogleDriveFile> {
  // First, create metadata
  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: mimeType,
  };
  
  // Create file
  const createResponse = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/related; boundary=boundary',
      },
      body: createMultipartBody(metadata, content, mimeType),
    }
  );
  
  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Failed to create file: ${error}`);
  }
  
  const file = await createResponse.json();
  
  // Get full file details
  const fileResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?fields=id,name,mimeType,webViewLink,webContentLink,modifiedTime,size,parents`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!fileResponse.ok) {
    throw new Error(`Failed to get file details: ${fileResponse.statusText}`);
  }
  
  return await fileResponse.json();
}

/**
 * Update a file in Google Drive
 */
export async function updateFile(
  fileId: string,
  content: string,
  mimeType: string = 'text/plain',
  accessToken: string
): Promise<GoogleDriveFile> {
  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/related; boundary=boundary',
      },
      body: createMultipartBody({}, content, mimeType),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update file: ${error}`);
  }
  
  const file = await response.json();
  
  // Get full file details
  const fileResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?fields=id,name,mimeType,webViewLink,webContentLink,modifiedTime,size,parents`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return await fileResponse.json();
}

/**
 * Read file content from Google Drive
 */
export async function readFile(
  fileId: string,
  accessToken: string
): Promise<string> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to read file: ${response.statusText}`);
  }
  
  return await response.text();
}

/**
 * Create multipart body for file upload
 */
function createMultipartBody(
  metadata: Record<string, unknown>,
  content: string,
  mimeType: string
): string {
  const boundary = 'boundary';
  const parts = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    `Content-Type: ${mimeType}`,
    '',
    content,
    `--${boundary}--`,
  ];
  
  return parts.join('\r\n');
}

/**
 * Get folder information
 */
export async function getFolderInfo(
  folderId: string,
  accessToken: string
): Promise<GoogleDriveFolder> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,webViewLink`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get folder info: ${response.statusText}`);
  }
  
  return await response.json();
}
