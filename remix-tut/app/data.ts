////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Remix, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { matchSorter } from "match-sorter";
// @ts-expect-error - no types, but it's a tiny function
import sortBy from "sort-by";
import invariant from "tiny-invariant";

type FileMutation = {
  id?: string;
  filename?: string;
  type?: string;
  size?: number;
  magnet?: string;
  token?: number;
  notes?: string;
  favorite?: boolean;
};

export type FileRecord = FileMutation & {
  id: string;
  createdAt: string;
};

export const fileIconMap = {
  "application/pdf": "fas fa-file-pdf",
  "application/zip": "fas fa-file-archive",
  "image/jpeg": "fas fa-file-image",
  "image/png": "fas fa-file-image",
  "text/plain": "fas fa-file-alt",
};

////////////////////////////////////////////////////////////////////////////////
// This is just a fake DB table. In a real app you'd be talking to a real db or
// fetching from an existing API.
const fakeFiles = {
  records: {} as Record<string, FileRecord>,

  async getAll(): Promise<FileRecord[]> {
    return Object.keys(fakeFiles.records)
      .map((key) => fakeFiles.records[key])
      .sort(sortBy("-createdAt", "last"));
  },

  async get(id: string): Promise<FileRecord | null> {
    return fakeFiles.records[id] || null;
  },

  async create(values: FileMutation): Promise<FileRecord> {
    const id = values.id || Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();
    const newFile = { id, createdAt, ...values };
    fakeFiles.records[id] = newFile;
    return newFile;
  },

  async set(id: string, values: FileMutation): Promise<FileRecord> {
    const file = await fakeFiles.get(id);
    invariant(file, `No file found for ${id}`);
    const updatedFile = { ...file, ...values };
    fakeFiles.records[id] = updatedFile;
    return updatedFile;
  },

  destroy(id: string): null {
    delete fakeFiles.records[id];
    return null;
  },
};

////////////////////////////////////////////////////////////////////////////////
// Handful of helper functions to be called from route loaders and actions
export async function getFiles(query?: string | null) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  let files = await fakeFiles.getAll();
  if (query) {
    files = matchSorter(files, query, {
      keys: ["filename", "token"],
    });
  }
  return files.sort(sortBy("last", "createdAt"));
}

export async function createEmptyFile() {
  const file = await fakeFiles.create({});
  return file;
}

export async function getFile(id: string) {
  return fakeFiles.get(id);
}

export async function updateFile(id: string, updates: FileMutation) {
  const file = await fakeFiles.get(id);
  if (!file) {
    throw new Error(`No file found for ${id}`);
  }
  await fakeFiles.set(id, { ...file, ...updates });
  return file;
}

export async function deleteFile(id: string) {
  fakeFiles.destroy(id);
}

[
  {
    magnet: "magnet:?xt=...",
    filename: "file.pdf",
    type: "application/pdf",
    token: 100100,
    notes: "Hello world",
  },
  {
    magnet: "magnet:?xt=...",
    filename: "file.txt",
    type: "text/plain",
    token: 200200,
    notes: "",
  },
  {
    magnet: "magnet:?xt=...",
    filename: "file.zip",
    type: "application/zip",
    token: 300300,
    notes: "",
  },
].forEach((file) => {
  fakeFiles.create({
    ...file,
    id: `${file.filename.toLowerCase()}-${file.token}`,
  });
});
