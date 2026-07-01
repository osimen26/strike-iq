"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateProfile(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const emailNotifications = formData.get("emailNotifications") === "true";
  const pushNotifications = formData.get("pushNotifications") === "true";

  try {
    // Update User
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    });

    // Update or Create Preferences
    await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: {
        emailNotifications,
        pushNotifications,
      },
      create: {
        userId: session.user.id,
        emailNotifications,
        pushNotifications,
      },
    });

    return { success: true, message: "Profile updated successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update profile." };
  }
}
