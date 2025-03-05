import { Injectable, Inject } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService {
  constructor(@Inject("REDIS_CLIENT") private readonly redisClient: Redis) {}

  /**
   * Menyimpan nilai string ke dalam Redis
   */
  async set(key: string, value: string, ttl: number = 3600): Promise<string> {
    return this.redisClient.set(key, value, "EX", ttl); // TTL default 1 jam
  }

  /**
   * Mengambil nilai berdasarkan key dari Redis
   */
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  //   /**
  //    * Menyimpan data ke dalam Redis dalam bentuk hash
  //    * @param key - Nama hash
  //    * @param field - Field dalam hash
  //    * @param value - Nilai yang disimpan
  //    */
  async hset(key: string, field: string, value: string): Promise<number> {
    return this.redisClient.hset(key, field, value);
  }

  //   /**
  //    * Mengambil nilai dari hash di Redis
  //    * @param key - Nama hash
  //    * @param field - Field dalam hash
  //    */
  async hget(key: string, field: string): Promise<string | null> {
    return this.redisClient.hget(key, field);
  }

  //   /**
  //    * Mengambil semua field dan nilai dalam hash
  //    * @param key - Nama hash
  //    */
  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redisClient.hgetall(key);
  }

  //   /**
  //    * Menghapus field dalam hash
  //    * @param key - Nama hash
  //    * @param field - Field yang ingin dihapus
  //    */
  async hdel(key: string, field: string): Promise<number> {
    return this.redisClient.hdel(key, field);
  }

  //   /**
  //    * Menghapus key dari Redis
  //    * @param key - Key yang ingin dihapus
  //    */
  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }
}
