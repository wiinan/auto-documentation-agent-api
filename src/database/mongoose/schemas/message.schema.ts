import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export type MessageDocument = Message & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
  timestamps: true,
})
export class Message {
  @ApiProperty()
  @IsString()
  @Prop({
    type: String,
    required: true,
  })
  message: string;
  @ApiProperty()
  @IsString()
  @Prop({
    required: true,
  })
  status: string;
  @ApiProperty()
  @IsString()
  @Prop({
    required: true,
  })
  @ApiProperty()
  @IsString()
  type: string;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
