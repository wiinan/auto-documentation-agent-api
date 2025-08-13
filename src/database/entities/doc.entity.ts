import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('docs')
export class Doc {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsString()
  @Column()
  name: string;

  @ApiProperty()
  @IsString()
  @Column()
  link: string;

  @ApiProperty()
  @Column({ default: new Date() })
  createdAt: Date;

  @ApiProperty()
  @Column({ default: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isDeleted: boolean;
}
