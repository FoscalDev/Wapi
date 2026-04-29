import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigsModule } from './modules/config/config.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LoggingModule } from './modules/logging/logging.module';
import { RetryModule } from './modules/retry/retry.module';
import { RoutingModule } from './modules/routing/routing.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UsersModule } from './modules/users/users.module';
import { WebhookModule } from './modules/webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
    AuthModule,
    ConfigsModule,
    WebhookModule,
    LoggingModule,
    RoutingModule,
    RetryModule,
    DashboardModule,
    SettingsModule,
    UsersModule,
  ],
})
export class AppModule {}
