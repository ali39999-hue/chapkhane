import { getPayload, type Payload } from 'payload';
import configPromise from '@payload-config';
import type { Order } from '../../../payload-types';

export type OrderStatus = NonNullable<Order['status']>;

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  draft: ['awaiting_payment', 'cancelled'],
  awaiting_payment: ['paid', 'cancelled'],
  paid: ['file_review', 'refunded'],
  file_review: ['needs_customer_action', 'awaiting_proof'],
  needs_customer_action: ['file_review', 'cancelled'],
  awaiting_proof: ['proof_approved', 'needs_customer_action', 'cancelled'],
  proof_approved: ['prepress'],
  prepress: ['printing', 'on_hold'],
  printing: ['finishing', 'quality_check', 'on_hold'],
  finishing: ['quality_check', 'on_hold'],
  quality_check: ['ready', 'printing', 'finishing'],
  ready: ['shipped', 'delivered'],
  shipped: ['delivered'],
  delivered: ['closed'],
  closed: [],
  on_hold: ['prepress', 'printing', 'finishing', 'cancelled'],
  cancelled: [],
  refunded: [],
};

/**
 * Checks if a transition between states is valid based on the state machine rules.
 */
export function isValidTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
  if (fromStatus === toStatus) return true;
  return allowedTransitions[fromStatus]?.includes(toStatus) ?? false;
}

/**
 * Validates a whole chain of transitions (e.g. `paid` -> `file_review`) without
 * touching the database.
 */
export function isValidTransitionChain(fromStatus: OrderStatus, chain: OrderStatus[]): boolean {
  let current = fromStatus;
  for (const next of chain) {
    if (!isValidTransition(current, next)) return false;
    current = next;
  }
  return true;
}

/**
 * Returns the statuses an order may legally move to from its current state.
 * Used by the production board to render only valid drop targets.
 */
export function allowedNextStatuses(fromStatus: OrderStatus): OrderStatus[] {
  return allowedTransitions[fromStatus] ?? [];
}

/**
 * Transitions an order through one or more states.
 *
 * Auditing is handled by the `Orders.afterChange` hook, so this function does
 * not write audit logs itself. Passing several statuses validates the full
 * chain first and then applies each step, which keeps the hook-driven side
 * effects (invoice generation, courier dispatch) intact.
 */
export async function transitionOrderState(
  orderId: number | string,
  next: OrderStatus | OrderStatus[],
  options: { payload?: Payload } = {}
): Promise<Order> {
  const payload = options.payload ?? (await getPayload({ config: configPromise }));
  const chain = Array.isArray(next) ? next : [next];

  if (chain.length === 0) {
    throw new Error('No target status supplied.');
  }

  const order = await payload.findByID({
    collection: 'orders',
    id: orderId,
    depth: 0,
  });

  const currentStatus = order.status as OrderStatus;

  if (!isValidTransitionChain(currentStatus, chain)) {
    throw new Error(`Invalid transition from ${currentStatus} to ${chain.join(' -> ')}`);
  }

  let updated = order;
  for (const status of chain) {
    if (updated.status === status) continue;
    updated = await payload.update({
      collection: 'orders',
      id: orderId,
      depth: 0,
      data: { status },
    });
  }

  return updated;
}
