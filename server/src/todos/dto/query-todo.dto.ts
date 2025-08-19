import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

// API-level status (lowercase for URLs)
export enum TodoStatus {
  Pending = 'pending',
  Active = 'active',
  Completed = 'completed',
}

export enum SortBy {
  Date = 'date',
  Priority = 'priority',
  CreatedAt = 'createdAt',
  Status = 'status',
  Pinned = 'pinned',
}

export enum SortDir {
  Asc = 'asc',
  Desc = 'desc',
}

export class QueryTodoDto {
  /** Debounced search term (description, optional day match) */
  @IsOptional()
  @IsString()
  q?: string;

  /** Exact status filter (if omitted, controller defaults to remaining: pending+active) */
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy: SortBy = SortBy.Date;

  @IsOptional()
  @IsEnum(SortDir)
  sortDir: SortDir = SortDir.Asc;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 10;

  /** Optional ISO date range filters */
  @IsOptional()
  @IsISO8601({ strict: true })
  from?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  to?: string;

  /** Only show pinned items */
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
  pinnedOnly?: boolean;
}
