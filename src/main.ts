import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ValidationPipe } from "@nestjs/common";
import { AdminSeeder } from "./admin/seed/admin.seed";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe());
  // console.log(process.env.PORT);

  app.enableCors({
    origin: "*", // Ganti '*' dengan domain frontend Anda untuk keamanan produksi
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });
  await app.listen(process.env.PORT);

  console.log(`Application is running on: ${await app.getUrl()}`);

  const adminSeeder = app.get(AdminSeeder);
  await adminSeeder.seed();
}
bootstrap();
