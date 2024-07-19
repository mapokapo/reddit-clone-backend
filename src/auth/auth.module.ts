import { forwardRef, Module } from "@nestjs/common";
import { FirebaseModule } from "src/firebase/firebase.module";
import { UsersModule } from "src/users/users.module";
import { AuthGuard } from "./auth.guard";

@Module({
  imports: [forwardRef(() => UsersModule), FirebaseModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
