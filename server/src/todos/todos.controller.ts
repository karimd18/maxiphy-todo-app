import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req, UseGuards
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto, TodoStatus } from './dto/query-todo.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

function getUserIdFromReq(req: any): string {
  const u = req?.user || {};
  return u.id ?? u.sub ?? u.userId ?? u.uid; // support common JWT shapes
}

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  // LIST (filters/paging/sort handled in service)
  @Get()
  async list(@Req() req: any, @Query() q: QueryTodoDto) {
    const userId = getUserIdFromReq(req);
    // “All” (no status) = no status filter; explicit single status if provided
    const statusFilter: TodoStatus[] | undefined = q.status ? [q.status] : undefined;

    return this.todos.list(userId, {
      q: q.q,
      sortBy: q.sortBy,
      sortDir: q.sortDir,
      page: q.page,
      pageSize: q.pageSize,
      from: q.from,
      to: q.to,
      pinnedOnly: q.pinnedOnly,
      statusFilter,
    });
  }

  // NEW: GET /todos/:id
  @Get(':id')
  async getOne(@Req() req: any, @Param('id') id: string) {
    const userId = getUserIdFromReq(req);
    return this.todos.getOne(userId, id);
  }

  // CREATE
  @Post()
  async create(@Req() req: any, @Body() dto: CreateTodoDto) {
    const userId = getUserIdFromReq(req);
    return this.todos.create(userId, dto);
  }

  // UPDATE
  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTodoDto) {
    const userId = getUserIdFromReq(req);
    return this.todos.update(userId, id, dto);
  }

  // DELETE
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const userId = getUserIdFromReq(req);
    return this.todos.remove(userId, id);
  }
}
