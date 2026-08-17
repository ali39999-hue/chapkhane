"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { revalidatePath } from "next/cache";
import { getAuthContext, isStaff } from "@/lib/auth";
import { relationId } from "@/lib/relations";

export async function submitFeedback(projectId: string, feedback: string, isApproved: boolean) {
  const payload = await getPayload({ config: configPromise });

  const project = await payload.findByID({
    collection: "design-projects",
    id: projectId,
    depth: 0,
  });

  if (!project) throw new Error("پروژه یافت نشد");

  // Only the owner customer or staff may act on a design project
  const { user } = await getAuthContext();
  if (!user || (!isStaff(user) && relationId(project.customer) !== user.id)) {
    throw new Error("شما به این پروژه دسترسی ندارید.");
  }

  try {
    if (isApproved) {
      // 1. Mark as approved
      await payload.update({
        collection: "design-projects",
        id: projectId,
        depth: 0,
        data: {
          status: "final_approval",
          finalApprovalSignature: feedback || "تأیید شده توسط مشتری",
        },
      });

      // 2. Link artwork to orderItem if exists
      const orderItemId = relationId(project.orderItem);

      // Find the latest round file
      let finalArtworkId = null;
      if (project.rounds && project.rounds.length > 0) {
        const lastRound = project.rounds[project.rounds.length - 1];
        if (lastRound.files && lastRound.files.length > 0) {
          finalArtworkId = relationId(lastRound.files[0]);
        }
      }

      if (orderItemId !== undefined && finalArtworkId) {
        await payload.update({
          collection: "order-items",
          id: orderItemId,
          depth: 0,
          data: {
            artwork: finalArtworkId,
          },
        });
      }
    } else {
      // Reject / Request Revision
      await payload.update({
        collection: "design-projects",
        id: projectId,
        depth: 0,
        data: {
          status: "revision",
        },
      });
      // Optionally add a new empty round with the feedback
      const currentRounds = project.rounds || [];
      await payload.update({
        collection: "design-projects",
        id: projectId,
        depth: 0,
        data: {
          rounds: [
            ...currentRounds,
            { feedback },
          ],
        },
      });
    }

    revalidatePath(`/design/${projectId}`);
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "خطای نامشخص";
    return { success: false, error: message };
  }
}
