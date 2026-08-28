"use server";

import { cookies } from "next/headers";
import type { Market } from "@/lib/estimator/types";
import { MARKET_COOKIE } from "./market";

export async function setAdminMarket(market: Market) {
  const store = await cookies();
  store.set(MARKET_COOKIE, market === "US" ? "US" : "IN", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}
