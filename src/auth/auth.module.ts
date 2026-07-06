import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminModule } from '@/admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { CoadminModule } from '@/coadmin/coadmin.module';

@Module({
  imports: [AdminModule,
    CoadminModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    })],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})

export class AuthModule {}
