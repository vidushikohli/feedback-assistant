import { Test, TestingModule } from '@nestjs/testing';
import { CoadminService } from './coadmin.service';

describe('CoadminService', () => {
  let service: CoadminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoadminService],
    }).compile();

    service = module.get<CoadminService>(CoadminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
