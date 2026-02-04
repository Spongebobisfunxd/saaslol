export * from '@loyalty/shared';

// ── Frontend-specific types ──────────────────────────────────────────

import type { ReactNode } from 'react';

/** Navigation item used in sidebars and menus */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: NavItem[];
}

/** Breadcrumb trail item */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Generic select / dropdown option */
export interface SelectOption {
  label: string;
  value: string;
}

/** Column definition for data tables */
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
}

/** Single data-point for charts */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}
