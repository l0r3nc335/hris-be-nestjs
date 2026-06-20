import { Test, TestingModule } from '@nestjs/testing';
import { BenefitsService } from './benefits.service';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';

describe('BenefitsService', () => {
  let service: BenefitsService;
  const prisma = {
    benefitPlan: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BenefitsService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: EntityNotFoundHelper,
          useValue: { throwNotFound: jest.fn(() => { throw new Error('not found'); }) },
        },
      ],
    }).compile();

    service = module.get(BenefitsService);
    jest.clearAllMocks();
  });

  it('lists active benefit plans', async () => {
    prisma.benefitPlan.findMany.mockResolvedValue([
      {
        id: 'plan-1',
        tenantId: 'tenant-1',
        name: 'Health Plan',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);

    const result = await service.list('tenant-1');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Health Plan');
  });
});
