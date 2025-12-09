import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error("Google Drive credentials not configured");
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: SCOPES,
  });
}

export async function createFolder(name: string, parentId?: string) {
  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId
        ? [parentId]
        : [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!],
    },
    fields: "id, name, webViewLink",
  });

  return response.data;
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string,
) {
  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const { Readable } = await import("stream");
  const stream = Readable.from(file);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: folderId
        ? [folderId]
        : [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, name, webViewLink, webContentLink, size, mimeType",
  });

  // Make file publicly readable
  await drive.permissions.create({
    fileId: response.data.id!,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return response.data;
}

export async function deleteFile(fileId: string) {
  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  await drive.files.delete({ fileId });
  return true;
}

export async function getFile(fileId: string) {
  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.get({
    fileId,
    fields: "id, name, webViewLink, webContentLink, size, mimeType",
  });

  return response.data;
}

export async function listFiles(folderId?: string, pageSize = 50) {
  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const query = folderId
    ? `'${folderId}' in parents and trashed = false`
    : `'${process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID}' in parents and trashed = false`;

  const response = await drive.files.list({
    q: query,
    pageSize,
    fields: "files(id, name, mimeType, size, createdTime, webViewLink)",
    orderBy: "createdTime desc",
  });

  return response.data.files || [];
}

export async function moveFile(fileId: string, newFolderId: string) {
  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const file = await drive.files.get({
    fileId,
    fields: "parents",
  });

  const previousParents = file.data.parents?.join(",") || "";

  const response = await drive.files.update({
    fileId,
    addParents: newFolderId,
    removeParents: previousParents,
    fields: "id, name, parents",
  });

  return response.data;
}

export async function createTenantFolder(tenantId: string, tenantName: string) {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  // Create main tenant folder
  const tenantFolder = await createFolder(
    `${tenantName} (${tenantId})`,
    rootFolderId,
  );

  // Create subfolders
  const subfolders = [
    "Documents",
    "Photos",
    "Invoices",
    "Contracts",
    "Reports",
  ];

  const folderIds: Record<string, string> = {
    root: tenantFolder.id!,
  };

  for (const name of subfolders) {
    const folder = await createFolder(name, tenantFolder.id!);
    folderIds[name.toLowerCase()] = folder.id!;
  }

  return folderIds;
}

export async function uploadCustomerDocument(
  customerId: string,
  file: Buffer,
  fileName: string,
  mimeType: string,
  tenantFolderId: string,
) {
  // Create customer folder if doesn't exist, or use documents folder
  const documentsFolder = await createFolder(
    `Customer_${customerId}`,
    tenantFolderId,
  );

  return uploadFile(file, fileName, mimeType, documentsFolder.id!);
}
