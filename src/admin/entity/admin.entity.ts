import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";


export enum AdminReviewStatus {
  ACCEPTED = "ACCEPTED",
  NEED_REVIEW = "NEED_REVIEW",
  REJECTED = "REJECTED",
}

@Entity("admin")
export class Admin {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true})
  name: string;

  @Column({ nullable: true })
  password: string;
}
