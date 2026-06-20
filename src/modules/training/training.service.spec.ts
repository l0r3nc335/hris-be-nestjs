import { Test, TestingModule } from '@nestjs/testing';
import { TrainingService } from './training.service';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';

describe('TrainingService', () => {
  let service: TrainingService;
  const prisma = {
    trainingCourse: {
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
        TrainingService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: EntityNotFoundHelper,
          useValue: { throwNotFound: jest.fn(() => { throw new Error('not found'); }) },
        },
      ],
    }).compile();

    service = module.get(TrainingService);
    jest.clearAllMocks();
  });

  it('lists active training courses', async () => {
    prisma.trainingCourse.findMany.mockResolvedValue([
      {
        id: 'course-1',
        tenantId: 'tenant-1',
        name: 'Safety Training',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);

    const result = await service.list('tenant-1');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Safety Training');
  });
});
