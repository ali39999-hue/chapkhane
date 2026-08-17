"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext, isStaff } from "@/lib/auth";
import { relationId } from "@/lib/relations";
import { transitionOrderState } from "@/modules/workflow/state-machine";

export async function approveProof(proofId: string, orderId: string, signedText: string) {
  const { payload, user } = await getAuthContext();
  if (!user) throw new Error("ابتدا وارد حساب کاربری خود شوید.");

  const proof = await payload.findByID({ collection: "proofs", id: proofId, depth: 0 });
  if (!proof) throw new Error("تأییدیه یافت نشد.");

  // Only the proof owner (or staff) may approve it
  if (!isStaff(user) && relationId(proof.customer) !== user.id) {
    throw new Error("شما به این تأییدیه دسترسی ندارید.");
  }

  // Update Proof status
  await payload.update({
    collection: "proofs",
    id: proofId,
    depth: 0,
    data: {
      status: "approved",
      approvalDate: new Date().toISOString(),
      signedAgreementText: signedText,
    },
  });

  // Advance Order state machine (audit actor is resolved by the hook)
  await transitionOrderState(orderId, 'proof_approved', { payload });

  revalidatePath(`/proofs/${proofId}`);
  revalidatePath(`/dashboard`);
  return { success: true };
}

export async function rejectProof(proofId: string, orderId: string, feedback: string) {
  const { payload, user } = await getAuthContext();
  if (!user) throw new Error("ابتدا وارد حساب کاربری خود شوید.");

  const proof = await payload.findByID({ collection: "proofs", id: proofId, depth: 0 });
  if (!proof) throw new Error("تأییدیه یافت نشد.");

  if (!isStaff(user) && relationId(proof.customer) !== user.id) {
    throw new Error("شما به این تأییدیه دسترسی ندارید.");
  }

  // Update Proof status
  await payload.update({
    collection: "proofs",
    id: proofId,
    depth: 0,
    data: {
      status: "rejected",
      customerFeedback: feedback,
    },
  });

  // Revert Order state machine back to needing action
  await transitionOrderState(orderId, 'needs_customer_action', { payload });

  revalidatePath(`/proofs/${proofId}`);
  revalidatePath(`/dashboard`);
  return { success: true };
}
