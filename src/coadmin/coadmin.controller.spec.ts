import { Test, TestingModule } from '@nestjs/testing';
import { CoadminController } from './coadmin.controller';
import { AuthService } from '@/auth/auth.service';

describe('CoadminController', () => {
  let controller: CoadminController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoadminController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            coadminSignIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CoadminController>(CoadminController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access token', async () => {
      const result = { access_token: 'test_token' };
      jest.spyOn(authService, 'coadminSignIn').mockResolvedValue(result);

      expect(await controller.signIn({ username: 'admin', password: 'password' })).toEqual(result);
      expect(authService.coadminSignIn).toHaveBeenCalledWith('admin', 'password');
    });
  });
});
