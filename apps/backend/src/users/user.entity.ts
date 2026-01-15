import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  hash: string;

  @Column({ type: 'varchar', nullable: true })
  hashedRt: string | null;

  @Column({ type: 'jsonb', nullable: true })
  results: any;
}
