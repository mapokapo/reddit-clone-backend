export class CreateUserDto {
  firebaseUid!: string;
  email!: string;
  name!: string;
  photoUrl!: string | null;
}
