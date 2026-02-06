import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function useCV(id: string) {
  return useQuery(api.cvs.getCVById, id ? { id: id as any } : "skip");
}
