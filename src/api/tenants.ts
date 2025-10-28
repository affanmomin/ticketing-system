import { api } from "@/lib/axios";

export const myTenant = () => api.get<{ id: string }>("/tenants/me");
