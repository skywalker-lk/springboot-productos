// Sale Types (Gentleman Programming - Const Types Pattern)

// Sale status
export const SALE_STATUS = {
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
} as const;

export type SaleStatus = (typeof SALE_STATUS)[keyof typeof SALE_STATUS];

// Flat Interfaces
export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  date: string; // ISO string
  userId: string;
  userName: string;
  items: SaleItem[];
  total: number;
  status: SaleStatus;
}

// Type Guards
export function isSale(value: unknown): value is Sale {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'userId' in value &&
    'items' in value &&
    'total' in value
  );
}
