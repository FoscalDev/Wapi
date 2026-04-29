import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

type GoogleUserInput = {
  email: string;
  googleId: string;
  fullName: string;
  avatarUrl?: string;
};

@Injectable()
export class UsersService {
  private toPublicUser(user: User & { _id: unknown }) {
    return {
      id: String(user._id),
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      permissions: user.permissions ?? [],
      is_active: user.is_active,
      can_access: user.is_active && (user.permissions?.length ?? 0) > 0,
    };
  }

  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).lean();
  }

  async findById(id: string) {
    return this.userModel.findById(id).lean();
  }

  async findOrCreateFromGoogle(input: GoogleUserInput) {
    const email = input.email.toLowerCase();
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      existing.google_id = input.googleId;
      existing.full_name = input.fullName;
      existing.avatar_url = input.avatarUrl;
      await existing.save();
      return existing.toObject();
    }
    const created = await this.userModel.create({
      email,
      google_id: input.googleId,
      full_name: input.fullName,
      avatar_url: input.avatarUrl,
      permissions: [],
      is_active: true,
    });
    return created.toObject();
  }

  async provisionUser(payload: {
    email: string;
    full_name: string;
    permissions?: string[];
    is_active?: boolean;
  }) {
    const email = payload.email.toLowerCase();
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      existing.full_name = payload.full_name;
      if (payload.permissions) {
        existing.permissions = payload.permissions;
      }
      if (typeof payload.is_active === 'boolean') {
        existing.is_active = payload.is_active;
      }
      await existing.save();
      return this.toPublicUser(existing.toObject() as User & { _id: unknown });
    }

    const created = await this.userModel.create({
      email,
      google_id: `pending:${email}`,
      full_name: payload.full_name,
      avatar_url: '',
      permissions: payload.permissions ?? [],
      is_active: typeof payload.is_active === 'boolean' ? payload.is_active : true,
    });
    return this.toPublicUser(created.toObject() as User & { _id: unknown });
  }

  async listUsers() {
    const users = (await this.userModel.find().sort({ createdAt: -1 }).lean()) as (User & {
      _id: unknown;
    })[];
    return users.map((user) => this.toPublicUser(user));
  }

  async hasAnyAdminUser() {
    const count = await this.userModel.countDocuments({
      is_active: true,
      permissions: { $in: ['*', 'users.manage'] },
    });
    return count > 0;
  }

  async grantSuperAdmin(id: string) {
    return this.updateUserAccess(id, { permissions: ['*'], is_active: true });
  }

  async updateUserAccess(id: string, payload: { permissions?: string[]; is_active?: boolean }) {
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...(payload.permissions ? { permissions: payload.permissions } : {}),
          ...(typeof payload.is_active === 'boolean' ? { is_active: payload.is_active } : {}),
        },
        { new: true },
      )
      .lean();
    if (!updated) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.toPublicUser(updated as User & { _id: unknown });
  }
}
