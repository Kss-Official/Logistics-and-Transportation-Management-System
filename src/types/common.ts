// Common shared types
export type StatusColor = 'green' | 'amber' | 'red' | 'blue' | 'indigo' | 'purple' | 'slate';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export type Priority = 'Standard' | 'Express' | 'Same Day';
export type PackageType = 'Standard box' | 'Fragile' | 'Pallet' | 'Document' | 'Oversized';
