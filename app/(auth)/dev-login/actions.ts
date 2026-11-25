"use server";

import { redirect } from "next/navigation";
import { startDevLogin } from "@/lib/dev-auth";

export async function devLogin() {
  await startDevLogin();
  redirect("/today");
}
