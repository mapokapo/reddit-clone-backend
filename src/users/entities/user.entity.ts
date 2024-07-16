import { Exclude, Expose } from "class-transformer";
import { Session } from "src/sessions/entities/session.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Exclude()
@Entity()
export class User {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({
    unique: true,
  })
  email: string;

  @Expose()
  @Column({
    unique: true,
  })
  username: string;

  @Column()
  passwordHash: string;

  @OneToMany(() => Session, session => session.user)
  sessions: Session[];
}
