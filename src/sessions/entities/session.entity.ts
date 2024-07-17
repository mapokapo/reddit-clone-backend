import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Exclude()
@Entity()
export class Session {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @Expose()
  @ApiProperty()
  @Column()
  token!: string;

  @ManyToOne(() => User, user => user.sessions, {
    onDelete: "CASCADE",
  })
  user!: User;

  @Expose()
  @ApiProperty()
  @Column()
  expiresAt!: Date;
}
