import { IsBoolean, IsIn, IsISO8601, IsOptional, IsString, Length, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { TodoStatus } from './query-todo.dto';

type PriorityLiteral = 'LOW' | 'MEDIUM' | 'HIGH';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  priority?: PriorityLiteral;

  @IsOptional()
  @IsISO8601({ strict: true })
  date?: string | null;

  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    const v = String(value).toLowerCase();
    if (v === 'true' || v === '1') return true;
    if (v === 'false' || v === '0') return false;
    return undefined;
  })
  @IsBoolean()
  pinned?: boolean;
}
