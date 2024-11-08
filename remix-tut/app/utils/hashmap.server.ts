import Redis from "ioredis";

const redis = new Redis({ port: 8080 });

export default class HashMap {
  map: Map<number, string>;
  private static crypto: typeof import("crypto") | null = null;

  constructor() {
    this.map = new Map();
  }

  static async genKey(str: string): Promise<number> {
    if (!this.crypto) this.crypto = await import("crypto");
    const hash = this.crypto.createHash("md5").update(str).digest("hex");
    return parseInt(hash.slice(0, 6), 16) % 1000000;
  }

  static async set(
    token: string,
    magnet: string,
    expiry: number = 60 * 60
  ): Promise<void> {
    await redis.hset("tokenMap", token, magnet);
    await redis.expire("tokenMap", expiry);
  }

  static async get(token: string): Promise<string | null> {
    return await redis.hget("tokenMap", token);
  }
}
