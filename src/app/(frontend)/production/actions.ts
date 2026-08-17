"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext, isStaff } from "@/lib/auth";
import { transitionOrderState, type OrderStatus } from "@/modules/workflow/state-machine";
import { ORDER_STATUS_LABELS } from "@/modules/workflow/labels";

function isOrderStatus(value: string): value is OrderStatus {
  return value in ORDER_STATUS_LABELS;
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const { payload, user } = await getAuthContext();

  // Only admin/operator can move orders through production stages
  if (!user || !isStaff(user)) {
    return { success: false, error: "عدم دسترسی به این عملیات." };
  }

  if (!isOrderStatus(newStatus)) {
    return { success: false, error: "وضعیت درخواستی نامعتبر است." };
  }

  try {
    // The current status is read from the database rather than trusted from the
    // client, so a stale board cannot force an illegal transition.
    await transitionOrderState(orderId, newStatus, { payload });

    revalidatePath("/production");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا در تغییر وضعیت";
    return {
      success: false,
      error: message.startsWith("Invalid transition")
        ? "انتقال غیرمجاز وضعیت با توجه به ماشین حالت."
        : message,
    };
  }
}
