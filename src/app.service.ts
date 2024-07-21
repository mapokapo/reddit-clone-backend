import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { SeederService } from "./seeder/seeder.service";

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(AppService.name);

  constructor(private readonly seederService: SeederService) {}

  async onApplicationBootstrap() {
    if (await this.seederService.shouldSeed()) {
      this.logger.log("Seeding the database...");
      await this.seederService.seed();
    } else {
      this.logger.log("Database already seeded.");
    }
  }
}
