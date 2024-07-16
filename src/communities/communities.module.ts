import { Module } from "@nestjs/common";
import { CommunitiesService } from "./communities.service";
import { CommunitiesController } from "./communities.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Community } from "./entities/community.entity";
import { AuthModule } from "src/auth/auth.module";
import { SessionsModule } from "src/sessions/sessions.module";

@Module({
  imports: [AuthModule, SessionsModule, TypeOrmModule.forFeature([Community])],
  controllers: [CommunitiesController],
  providers: [CommunitiesService],
})
export class CommunitiesModule {}
