"use server";

import { cookies } from "next/headers";

export async function removeHeaderCookie(name) {
  cookies().delete(name);
}
