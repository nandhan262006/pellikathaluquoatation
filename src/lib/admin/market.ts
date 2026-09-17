import { cookies } from "next/headers";
import type { Market } from "@/lib/estimator/types";

export const MARKET_COOKIE = "stories_by_harsha_admin_market";

export async function getAdminMarket(): Promise<Market> {
  const store = await cookies();
  const value = store.get(MARKET_COOKIE)?.value;
  return value === "US" ? "US" : "IN";
}
