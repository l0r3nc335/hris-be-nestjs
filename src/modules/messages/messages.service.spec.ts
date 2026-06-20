import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';

describe('MessagesService', () => {
  let service: MessagesService;
  const prisma = {
    message: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: EntityNotFoundHelper,
          useValue: { throwNotFound: jest.fn(() => { throw new Error('not found'); }) },
        },
      ],
    }).compile();

    service = module.get(MessagesService);
    jest.clearAllMocks();
  });

  it('returns inbox messages for the current user', async () => {
    prisma.message.findMany.mockResolvedValue([
      {
        id: 'msg-1',
        from: 'HR',
        subject: 'Welcome',
        body: 'Hello',
        read: false,
      },
    ]);

    const result = await service.inbox('tenant-1', 'user-1');

    expect(result).toHaveLength(1);
    expect(result[0].subject).toBe('Welcome');
  });
});
