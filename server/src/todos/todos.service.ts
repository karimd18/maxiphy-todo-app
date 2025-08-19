import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client'; // types only
import { PrismaService } from '../prisma/prisma.service';
import { addDays, startOfDay } from 'date-fns';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto, SortBy, TodoStatus } from './dto/query-todo.dto';

// Map API status (lowercase) to DB enum strings (UPPERCASE) without importing Prisma enum
type DBStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';
const toDBStatus = (s: TodoStatus): DBStatus =>
  s === 'completed' ? 'COMPLETED' : s === 'active' ? 'ACTIVE' : 'PENDING';

type ListArgs = Omit<QueryTodoDto, 'status'> & {
  statusFilter?: TodoStatus[];
};

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  // NEW: one item, with ownership check
  async getOne(userId: string, id: string) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) throw new NotFoundException('Todo not found');
    if (todo.userId !== userId) throw new NotFoundException('Todo not found');
    return todo;
  }

  async list(userId: string, args: ListArgs) {
    const { q, sortBy, sortDir, page = 1, pageSize = 10, from, to, pinnedOnly, statusFilter } = args;

    const where: Prisma.TodoWhereInput = { userId };

    // status filter
    if (statusFilter && statusFilter.length) {
      const dbStatuses = statusFilter.map(toDBStatus);
      (where as any).status = { in: dbStatuses };
    }

    // pinned only
    if (pinnedOnly === true) where.pinned = true;

    // date range
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    // search
    if (q?.trim()) {
      const qt = q.trim();
      const or: Prisma.TodoWhereInput[] = [
        { description: { contains: qt, mode: 'insensitive' } },
      ];
      if (/^\d{4}-\d{2}-\d{2}$/.test(qt)) {
        const dayStart = startOfDay(new Date(qt));
        const nextDay = addDays(dayStart, 1);
        or.push({ date: { gte: dayStart, lt: nextDay } });
      }
      where.AND = [{ OR: or }];
    }

    // ordering
    const orderBy: Prisma.TodoOrderByWithRelationInput[] = [];
    switch (sortBy) {
      case SortBy.Priority:  orderBy.push({ priority: sortDir }); break;
      case SortBy.Status:    (orderBy as any).push({ status: sortDir }); break;
      case SortBy.CreatedAt: orderBy.push({ createdAt: sortDir }); break;
      case SortBy.Pinned:    orderBy.push({ pinned: sortDir }, { pinnedAt: 'desc' }); break;
      default:               orderBy.push({ date: sortDir }); break; // SortBy.Date
    }
    // stable tiebreakers
    orderBy.push({ pinned: 'desc' }, { pinnedAt: 'desc' }, { createdAt: 'desc' });

    const skip = Math.max(0, (page - 1) * pageSize);
    const take = Math.max(1, pageSize);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.todo.findMany({ where, orderBy, skip, take }),
      this.prisma.todo.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        pageSize: take,
        totalPages: Math.max(1, Math.ceil(total / take)),
      },
    };
  }

  async create(userId: string, dto: CreateTodoDto) {
    const data: Prisma.TodoCreateInput = {
      description: dto.description,
      priority: (dto.priority ?? 'MEDIUM') as any,
      date: dto.date ? new Date(dto.date) : undefined,
      status: (dto.status ? toDBStatus(dto.status) : 'PENDING') as any,
      pinned: dto.pinned ?? false,
      pinnedAt: dto.pinned ? new Date() : undefined,
      user: { connect: { id: userId } },
    };
    return this.prisma.todo.create({ data });
  }

  async update(userId: string, id: string, dto: UpdateTodoDto) {
    const existing = await this.getOne(userId, id); // ownership + existence

    let pinnedAt = existing.pinnedAt;
    if (typeof dto.pinned === 'boolean') {
      if (dto.pinned && !existing.pinned) pinnedAt = new Date();
      if (!dto.pinned && existing.pinned) pinnedAt = null;
    }

    const data: Prisma.TodoUpdateInput = {
      description: dto.description,
      priority: dto.priority as any,
      date: dto.date === null ? null : dto.date ? new Date(dto.date) : undefined,
      status: dto.status ? (toDBStatus(dto.status) as any) : undefined,
      pinned: dto.pinned,
      pinnedAt,
    };

    return this.prisma.todo.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.getOne(userId, id); // throws 404 if not owned/not found
    return this.prisma.todo.delete({ where: { id } });
  }
}
