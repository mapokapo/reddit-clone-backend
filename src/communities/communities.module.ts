import { Module } from "@nestjs/common";
import { CommunitiesService } from "./communities.service";
import { CommunitiesController } from "./communities.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Community } from "./entities/community.entity";
import { AuthModule } from "src/auth/auth.module";
import { FirebaseModule } from "src/firebase/firebase.module";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [
    AuthModule,
    FirebaseModule,
    TypeOrmModule.forFeature([Community]),
    UsersModule,
  ],
  controllers: [CommunitiesController],
  providers: [CommunitiesService],
})
export class CommunitiesModule {}
