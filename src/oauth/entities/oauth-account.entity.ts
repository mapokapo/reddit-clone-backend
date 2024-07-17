import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class OAuthAccount {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  provider!: string;

  @Column()
  providerId!: string;

  @ManyToOne(() => User, user => user.accounts, {
    onDelete: "CASCADE",
  })
  user!: User;
}
