import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WhatsappConfig } from './schemas/whatsapp-config.schema';

@Injectable()
export class ConfigServiceApp {
  constructor(
    @InjectModel(WhatsappConfig.name)
    private readonly configModel: Model<WhatsappConfig>,
  ) {}

  create(payload: Partial<WhatsappConfig>) {
    return this.configModel.create(payload);
  }

  list() {
    return this.configModel.find().sort({ createdAt: -1 }).lean();
  }

  findActiveByPhoneId(phoneNumberId: string) {
    return this.configModel.findOne({
      phone_number_id: phoneNumberId,
      is_active: true,
    });
  }

  findActiveByDisplayPhone(displayPhoneNumber: string) {
    return this.configModel.findOne({
      display_phone_number: displayPhoneNumber,
      is_active: true,
    });
  }

  async update(id: string, payload: Partial<WhatsappConfig>) {
    const updated = await this.configModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Config not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.configModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Config not found');
    return { deleted: true };
  }
}
