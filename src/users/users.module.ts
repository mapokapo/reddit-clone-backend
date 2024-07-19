import { forwardRef, Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersController } from "./users.controller";
import { AuthModule } from "src/auth/auth.module";
import { FirebaseModule } from "src/firebase/firebase.module";

@Module({
  imports: [
    forwardRef(() => AuthModule),
    FirebaseModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
