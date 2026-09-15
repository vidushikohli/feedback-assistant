import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { JwtService } from '@nestjs/jwt';
import { CoadminService } from '../coadmin/coadmin.service';

@Injectable()
export class AuthService {
    constructor(
      private readonly usersService: AdminService,
      private readonly jwtService: JwtService,
      private readonly coadminService: CoadminService,
    ) {}

  async signIn(username: string, pass: string): Promise<any> {
    const admin = await this.usersService.findOne(username);
    if (admin?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: admin.adminId, username: admin.username };
    return {
      // 💡 Here the JWT secret key that's used for signing the payload 
      // is the key that was passed in the JwtModule
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async coadminSignIn(username: string, pass: string): Promise<any> {
    const coadmin = await this.coadminService.findOne(username);
    if (coadmin?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: coadmin.coadminId, username: coadmin.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
  }

