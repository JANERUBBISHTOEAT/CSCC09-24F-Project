import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
console.log("redis env:", process.env.REDIS_HOST, process.env.REDIS_PORT);
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
});

export default class HashMap {
  map: Map<number, string>;
  private static crypto: typeof import("crypto") | null = null;

  constructor() {
    this.map = new Map();
  }

  static async genKey(str: string): Promise<number> {
    // [x]: Check collision
    if (!this.crypto) this.crypto = await import("crypto");

    const maxRetries = 10;
    let attempts: number = 0;
    let token: number = -1;
    let hash: string;
    let token_len: number = 6;

    while (attempts++ < maxRetries) {
      // [x]: Make 6 a variable that increases when full
      hash = this.crypto.createHash("md5").update(str).digest("hex");
      token = parseInt(hash.slice(0, token_len), 16) % 10 ** token_len;

      const exists = (await this.get(token.toString())) !== str; // Collision
      if (!exists) break;
      token_len++;
    }
    if (attempts === maxRetries) {
      console.error("genKey failed with attempts", attempts);
      console.info(
        "Redis health:",
        ((await this.getKeysCnt()) || -1) / 10 ** 6
      );
      token = -1;
    }

    return token;
  }

  static async set(
    token: string,
    magnet: string
    // expiry: number = 60 * 60
  ): Promise<void | null> {
    console.info("Redis health:", ((await this.getKeysCnt()) || -1) / 10 ** 6);
    if (!redis) return null;
    await redis.hset("tokenMap", token, magnet);
    // await redis.expire("tokenMap", expiry);
  }

  static async get(token: string): Promise<string | null> {
    if (!redis) return null;
    return await redis.hget("tokenMap", token);
  }

  static async getKeysCnt(): Promise<number | null> {
    if (!redis) return null;
    return await redis.hlen("tokenMap");
  }

  static async del(token: string): Promise<void | null> {
    if (!redis) return null;
    await redis.hdel("tokenMap", token);
  }

  static async genToken(magnet: string): Promise<string | null> {
    if (!redis || !magnet) return "";
    const token_num = await HashMap.genKey(magnet);
    const token_str = token_num.toString().padStart(6, "0");
    HashMap.set(token_str, magnet); // [ ]: Add expiry and return to caller
    return token_str;
  }
}
