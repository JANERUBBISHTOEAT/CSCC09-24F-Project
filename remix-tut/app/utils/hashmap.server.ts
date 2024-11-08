import Redis from "ioredis";

const redis = new Redis({ port: 8080 });

export default class HashMap {
  map: Map<number, string>;
  private static crypto: typeof import("crypto") | null = null;

  constructor() {
    this.map = new Map();
  }

  static async genKey(str: string): Promise<number> {
    // TODO: Check collision
    if (!this.crypto) this.crypto = await import("crypto");

    const maxRetries = 10;
    let attempts: number = 0;
    let token: number = -1;
    let hash: string;

    while (attempts++ < maxRetries) {
      hash = this.crypto
        .createHash("md5")
        .update(str + Math.random())
        .digest("hex");
      token = parseInt(hash.slice(0, 6), 16) % 10 ** 6;

      const exists = await this.get(token.toString());
      if (!exists) break;
    }
    if (attempts === maxRetries) {
      console.error("genKey failed with attempts", attempts);
      console.info("Redis health:", (await this.getKeysCnt()) / 10 ** 6);
      token = -1;
    }

    return token;
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

  static async getKeysCnt(): Promise<number> {
    return await redis.hlen("tokenMap");
  }
}
