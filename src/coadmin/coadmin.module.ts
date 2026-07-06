import { Module } from '@nestjs/common';
import { CoadminService } from './coadmin.service';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CoadminService],
  exports: [CoadminService],
})
export class CoadminModule {}
