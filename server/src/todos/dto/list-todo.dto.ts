import { IsOptional, IsIn } from 'class-validator';

export class ListTodosDto {
  @IsOptional()
  @IsIn(['active','completed','all'])
  status?: 'active' | 'completed' | 'all' = 'active';

  @IsOptional() q?: string;
  @IsOptional() sortBy?: 'date' | 'priority' = 'date';
  @IsOptional() sortDir?: 'asc' | 'desc' = 'asc';
  @IsOptional() page?: number = 1;
  @IsOptional() pageSize?: number = 10;
}