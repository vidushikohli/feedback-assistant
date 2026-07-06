import { Injectable } from '@nestjs/common';

export type Coadmin = any;

@Injectable()
export class CoadminService {
    private readonly users = [
        {
          username: 'coadmin',
          password: 'password',
        },
        
      ];
    
      async findOne(username: string): Promise<Coadmin | undefined> {
        return this.users.find(user => user.username === username);
      }
}
