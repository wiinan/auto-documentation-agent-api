import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DOC_STATUS } from 'src/constants/agent';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DocContent } from './';

@Entity('docs')
export class Doc {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsString()
  @Column({ nullable: false })
  name: string;

  @ApiProperty()
  @IsString()
  @Column({ nullable: false })
  link: string;

  @ApiProperty()
  @IsString()
  @Column({ nullable: false, default: DOC_STATUS.OPEN })
  status: string;

  @ApiProperty()
  @IsString()
  @Column({ nullable: true })
  modelName: string;

  @ApiProperty()
  @IsString()
  @Column({ nullable: true })
  fineTuneJobId: string;

  @ApiProperty()
  @Column({ default: new Date() })
  createdAt: Date;

  @ApiProperty()
  @Column({ default: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => DocContent, (content) => content.doc)
  docContent: DocContent[];
}
