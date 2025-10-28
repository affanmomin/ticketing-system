import { api } from "@/lib/axios";

export type AssignableUser = { id: string; name: string; email: string };

export const assignableUsers = (clientId: string) =>
  api.get<AssignableUser[]>("/users/assignable", { params: { clientId } });
