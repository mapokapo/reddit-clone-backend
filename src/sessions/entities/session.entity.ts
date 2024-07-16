import { Exclude, Expose } from "class-transformer";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Exclude()
@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column()
  token: string;

  @ManyToOne(() => User, user => user.sessions)
  user: User;

  @Expose()
  @Column()
  expiresAt: Date;
}
