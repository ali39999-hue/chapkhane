"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { getAuthContext } from "@/lib/auth";

export async function submitTemplateRequest(message: string) {
  if (!message || message.trim().length < 5) {
    throw new Error("متن درخواست بسیار کوتاه است.");
  }

  const payload = await getPayload({ config: configPromise });
  const { user } = await getAuthContext();

  try {
    await payload.create({
      collection: "template-requests",
      data: {
        message: message.trim(),
        status: "pending",
        user: user ? user.id : null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving template request:", error);
    throw new Error("متاسفانه در ثبت درخواست خطایی رخ داد. لطفا دوباره تلاش کنید.");
  }
}
