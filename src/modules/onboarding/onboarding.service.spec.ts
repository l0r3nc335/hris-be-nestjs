import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingService } from './onboarding.service';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';

describe('OnboardingService', () => {
  let service: OnboardingService;
  const prisma = {
    onboardingTask: {
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
        OnboardingService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: EntityNotFoundHelper,
          useValue: { throwNotFound: jest.fn(() => { throw new Error('not found'); }) },
        },
      ],
    }).compile();

    service = module.get(OnboardingService);
    jest.clearAllMocks();
  });

  it('lists active onboarding tasks', async () => {
    prisma.onboardingTask.findMany.mockResolvedValue([
      {
        id: 'task-1',
        tenantId: 'tenant-1',
        name: 'Welcome packet',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);

    const result = await service.list('tenant-1');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Welcome packet');
  });
});
