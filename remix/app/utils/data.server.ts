import { matchSorter } from "match-sorter";
// import sortBy from "sort-by";
import orderBy from "lodash/orderBy";
import invariant from "tiny-invariant";
import HashMap from "./hashmap.server";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
console.log("redis env:", process.env.REDIS_HOST, process.env.REDIS_PORT);
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
});

type FileMutation = {
  id?: string;
  filename?: string;
  type?: string;
  size?: number;
  magnet?: string;
  token?: string;
  notes?: string;
  favorite?: boolean;
  // [x]: Add attr `sender/receiver`
  owner?: boolean;
};

export type FileRecord = FileMutation & {
  id: string;
  createdAt: string;
};

const userFilesKey = (userId: string) => `user:${userId}:files`;

const fakeFiles = {
  async getAll(userId: string): Promise<FileRecord[]> {
    const keys = await redis.hkeys(userFilesKey(userId));
    const files = await Promise.all(
      keys.map((key) => redis.hget(userFilesKey(userId), key).then(JSON.parse))
    );
    return orderBy(files, "createdAt", "desc");
  },

  async get(userId: string, id: string): Promise<FileRecord | null> {
    const file = await redis.hget(userFilesKey(userId), id);
    return file ? JSON.parse(file) : null;
  },

  async create(userId: string, values: FileMutation): Promise<FileRecord> {
    // Check duplicate file (happens when merging visitor profile)
    const files = await fakeFiles.getAll(userId);
    const duplicateFile = files.find(
      (file) =>
        file.magnet === values.magnet && file.filename === values.filename
    );

    if (duplicateFile) {
      console.log("Duplicate file found:", duplicateFile.id);
      // Do not create, return existing file
      return duplicateFile;
    }

    // Create new file
    const id = values.id || Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();
    const newFile = { id, createdAt, ...values };
    if (newFile.magnet) {
      const token_str = await HashMap.genToken(newFile.magnet);
      newFile.token = token_str ?? undefined;
      console.log("Updated token:", newFile.token);
    }
    await redis.hset(userFilesKey(userId), id, JSON.stringify(newFile));
    return newFile;
  },

  async set(
    userId: string,
    id: string,
    values: FileMutation
  ): Promise<FileRecord> {
    const file = await fakeFiles.get(userId, id);
    invariant(file, `No file found for ${id}`);

    // Check duplicate file (happens when manually adding dup)
    const files = await fakeFiles.getAll(userId);
    const duplicateFile = files.find(
      (file) =>
        file.magnet === values.magnet && file.filename === values.filename
    );

    if (duplicateFile) {
      console.log("Duplicate file found:", duplicateFile.id);
      // Delete this file, return existing file
      await fakeFiles.destroy(userId, id);
      return duplicateFile;
    }

    const updatedFile = { ...file, ...values };
    if (updatedFile.magnet) {
      const token_str = await HashMap.genToken(updatedFile.magnet);
      updatedFile.token = token_str ?? undefined;
      console.log("Updated token:", updatedFile.token);
    }
    await redis.hset(userFilesKey(userId), id, JSON.stringify(updatedFile));
    return updatedFile;
  },

  async destroy(userId: string, id: string): Promise<null> {
    await redis.hdel(userFilesKey(userId), id);
    return null;
  },
};

export async function getFiles(userId: string, query?: string | null) {
  await new Promise((resolve) => setTimeout(resolve, 500)); // TODO: Remove all fake delays
  let files = await fakeFiles.getAll(userId);
  if (query) {
    files = matchSorter(files, query, {
      keys: ["filename", "token"],
    });
  }
  return orderBy(files, "createdAt", "desc");
}

export async function createEmptyFile(userId: string) {
  // Only owner can create file
  const file = await fakeFiles.create(userId, { owner: true });
  return file;
}

export async function getFile(userId: string, id: string) {
  return fakeFiles.get(userId, id);
}

export async function updateFile(
  userId: string,
  id: string,
  updates: FileMutation
) {
  const file = await fakeFiles.get(userId, id);
  if (!file) {
    throw new Error(`No file found for ${id}`);
  }
  const ret_file = await fakeFiles.set(userId, id, { ...file, ...updates });
  return ret_file;
}

export async function deleteFile(userId: string, id: string) {
  await fakeFiles.destroy(userId, id);
}

// Merge visitor files to existing user files
export async function mergeFiles(
  userId: string,
  visitorId: string
): Promise<FileRecord[]> {
  const visitorFiles = await fakeFiles.getAll(visitorId);
  console.log("Merging", visitorFiles.length, "files from", visitorId);
  await Promise.all(visitorFiles.map((file) => fakeFiles.create(userId, file)));
  await redis.del(userFilesKey(visitorId));
  return fakeFiles.getAll(userId);
}
