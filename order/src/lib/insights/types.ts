/** Shape returned by the `tenant_insights` RPC. Money values are EGP. */
export type Insights = {
  from: string;
  to: string;
  timezone: string;
  /** Placed orders minus cancelled ones. */
  orders: number;
  placed: number;
  collected: number;
  cancelled: number;
  /** Sum of collected orders' totals (payment is taken at pickup). */
  revenue: number;
  avg_order_value: number;
  /** Average received to ready, in seconds. Null when no order reached ready. */
  avg_prep_seconds: number | null;
  /** cancelled / placed, 0..1. */
  cancellation_rate: number;
  /** Distinct customer phones with a non-cancelled order. */
  customers: number;
  /** Of those, phones with two or more orders in range. */
  repeat_customers: number;
  /** 24 buckets, local hour of day. */
  orders_by_hour: number[];
  top_items: { item_id: string | null; name_en: string; name_ar: string; quantity: number; revenue: number }[];
};
