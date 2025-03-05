import { Module, Global } from "@nestjs/common";
import Redis from "ioredis";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [ConfigModule], // Tambahkan ConfigModule agar bisa ambil dari .env
  providers: [
    {
      provide: "REDIS_CLIENT",
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get("REDIS_HOST"),
          port: configService.get("REDIS_PORT"),
          password: configService.get("REDIS_PASSWORD"),
        });
      },
    },
  ],
  exports: ["REDIS_CLIENT"],
})
export class RedisModule {}
