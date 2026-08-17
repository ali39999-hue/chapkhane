"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext, isStaff } from "@/lib/auth";
import { parsePreflightResult } from "@/modules/preflight/result";

export async function forcePassPreflight(artworkId: string) {
  const { payload, user } = await getAuthContext();
  if (!user) {
    return { error: "ابتدا وارد حساب کاربری خود شوید." };
  }

  try {
    const artwork = await payload.findByID({
      collection: "artworks",
      id: artworkId,
      depth: 0,
    });

    if (!artwork) {
      return { error: "فایل یافت نشد." };
    }

    const ownerId = typeof artwork.owner === 'object' ? artwork.owner?.id : artwork.owner;
    if (!isStaff(user) && ownerId !== user.id) {
      return { error: "شما به این فایل دسترسی ندارید." };
    }

    const current = parsePreflightResult(artwork.preflightResult);

    // Force-pass is only meaningful for a warning. Failing files (wrong
    // dimensions, unsupported format) must not be pushed into production.
    if (current?.status !== 'warning') {
      return { error: "این فایل قابل تأیید دستی نیست." };
    }

    await payload.update({
      collection: "artworks",
      id: artworkId,
      depth: 0,
      data: {
        preflightResult: {
          ...current,
          status: 'pass',
          issues: [...current.issues, '(تأیید شده با مسئولیت مشتری)'],
        },
      },
    });

    revalidatePath("/files");
    revalidatePath("/orders");

    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "خطا در ثبت تأییدیه" };
  }
}
