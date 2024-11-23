import dotenv from "dotenv";
import Redis from "ioredis";
import lodash from "lodash";

dotenv.config();
console.log("redis env:", process.env.REDIS_HOST, process.env.REDIS_PORT);
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
});

const { orderBy } = lodash;

type FileMutation = {
  id?: string;
  filename?: string;
  type?: string;
  size?: number;
  magnet?: string;
  token?: string;
  notes?: string;
  favorite?: boolean;
};

export type FileRecord = FileMutation & {
  id: string;
  createdAt: string;
};

export type UserFileRelation = {
  fileId: string;
  source: "sent" | "received";
};

export const RedisFile = {
  async saveFilesToRedis(files: FileRecord[]): Promise<void> {
    const fileData = files.reduce((acc, file) => {
      acc[file.id] = file;
      return acc;
    }, {} as Record<string, FileMutation>);
    await redis.set("fileData", JSON.stringify(fileData));
    console.log("File data stored.");
  },

  async saveUserFileRelations(
    userId: string,
    relations: UserFileRelation[]
  ): Promise<void> {
    await redis.set(`userFiles:${userId}`, JSON.stringify(relations));
    console.log(`User-file relations stored for user: ${userId}`);
  },

  // Get file by fid and uid
  async getFile(fileId: string, userId: string): Promise<FileMutation | null> {
    const fileData = await redis.get("fileData");
    if (!fileData) {
      return null;
    }

    const fileMap = JSON.parse(fileData);
    const file = fileMap[fileId];
    if (!file) {
      return null;
    }

    const userFileRelations = await redis.get(`userFiles:${userId}`);
    if (!userFileRelations) {
      return null;
    }

    const relations = JSON.parse(userFileRelations);
    const relation = relations.find(
      (rel: UserFileRelation) => rel.fileId === fileId
    );
    if (!relation) {
      return null;
    }

    return file;
  },

  // Get all files for a user
  async getUserFiles(
    userId: string
  ): Promise<(FileMutation & { source: string })[] | null> {
    const userFileRelations = await redis.get(`userFiles:${userId}`);
    if (!userFileRelations) {
      return null;
    }

    const fileData = await redis.get("fileData");
    if (!fileData) {
      return null;
    }

    const fileMap = JSON.parse(fileData);
    const userFiles = JSON.parse(userFileRelations).map(
      (relation: UserFileRelation) => {
        const fileDetails = fileMap[relation.fileId];
        return {
          ...fileDetails,
          source: relation.source,
        };
      }
    );

    return userFiles;
  },
};
