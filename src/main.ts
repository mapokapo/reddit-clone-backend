import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { writeFile } from "fs/promises";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    })
  );

  app.enableCors({
    origin: "http://localhost:3000",
  });

  const configService = app.get(ConfigService);

  const openApiConfig = new DocumentBuilder()
    .setTitle("Reddit Clone")
    .setDescription("The Reddit Clone OpenAPI documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, openApiConfig);

  if (configService.get("NODE_ENV") === "openapi-gen") {
    await writeFile("openapi.json", JSON.stringify(document, null, 2));

    await app.close();
  } else {
    SwaggerModule.setup("docs", app, document);

    await app.listen(5000);
  }
}
void bootstrap();
