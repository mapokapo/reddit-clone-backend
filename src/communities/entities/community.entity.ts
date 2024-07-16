import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Exclude()
@Entity()
export class Community {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @Expose()
  @ApiProperty()
  @Column()
  name!: string;

  @Expose()
  @ApiProperty()
  @Column()
  description!: string;

  @ManyToOne(() => User, user => user.communities)
  owner!: User;

  @Expose()
  @ApiProperty()
  @Column()
  createdAt!: Date;
}
