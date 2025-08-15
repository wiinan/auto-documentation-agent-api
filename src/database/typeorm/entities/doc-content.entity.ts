import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Doc } from './doc.entity';

@Entity('doc_contents')
export class DocContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: false })
  link: string;

  @Column({ nullable: false })
  docId: number;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => Doc)
  @JoinColumn({ name: 'docId', referencedColumnName: 'id' })
  doc: Doc;
}
