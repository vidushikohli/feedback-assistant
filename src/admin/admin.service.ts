import { Injectable } from '@nestjs/common';

export type Admin = any;

@Injectable()
export class AdminService {
    private readonly users = [
        {
          username: 'admin',
          password: 'password',
        },
        
      ];
    
      async findOne(username: string): Promise<Admin | undefined> {
        return this.users.find(user => user.username === username);
      }
}

