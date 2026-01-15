import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { LetterModule } from './letter/letter.module';

//postgresql://postgres:[YOUR_PASSWORD]@db.rorijfampwgnvuoglolx.supabase.co:5432/postgres

@Module({
  imports: [
    TypeOrmModule.forRoot({
      database: 'postgres',
      type: 'postgres',
      host: 'aws-1-eu-west-1.pooler.supabase.com',
      port: 6543,
      username: 'postgres.yozxrynozrcjstdozhco',
      password: 'I562530y2009',
      /**
       * The "poolMode" option is not valid in TypeORM configuration for postgres.
       * Removed invalid "poolMode" property.
       */
      entities: [User],
      synchronize: true,
      extra: {
        pool_mode: 'transaction',
      },
    }),
    AuthModule,
    LetterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
