import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const AVAILABLE_PERMISSIONS = [
  'dashboard.read',
  'configs.manage',
  'logs.read',
  'logs.manage',
  'settings.manage',
  'users.manage',
] as const;

export type AppPermission = (typeof AVAILABLE_PERMISSIONS)[number];

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, unique: true, trim: true })
  google_id!: string;

  @Prop({ required: true, trim: true })
  full_name!: string;

  @Prop({ trim: true })
  avatar_url?: string;

  @Prop({ type: [String], default: [] })
  permissions!: string[];

  @Prop({ default: true })
  is_active!: boolean;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
