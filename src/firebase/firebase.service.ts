import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { App, cert, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";

@Injectable()
export class FirebaseService {
  public readonly app: App;
  public readonly auth: Auth;

  constructor(config: ConfigService) {
    this.app = initializeApp({
      credential: cert(
        config.getOrThrow("FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY_PATH")
      ),
    });

    this.auth = getAuth(this.app);
  }
}
