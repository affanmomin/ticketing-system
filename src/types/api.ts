// Types aligned with src/openapi/ticketing.json

export type UserRole = "ADMIN" | "EMPLOYEE" | "CLIENT";

export interface AuthUser {
  id: string;
  tenantId: string;
  role: UserRole;
  clientId?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  domain?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  tenantId: string;
  clientId: string;
  name: string;
  code: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stream {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus =
  | "BACKLOG"
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "DONE"
  | "CANCELLED";
export type TicketPriority = "P0" | "P1" | "P2" | "P3";
export type TicketType = "TASK" | "BUG" | "STORY" | "EPIC";

export interface Ticket {
  id: string;
  tenantId: string;
  clientId: string;
  projectId: string;
  streamId?: string | null;
  reporterId: string;
  assigneeId?: string | null;
  title: string;
  descriptionMd: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  points?: number | null;
  dueDate?: string | null; // ISO
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  tenantId: string;
  ticketId: string;
  authorId: string;
  bodyMd: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  tenantId: string;
  clientId?: string | null;
  name: string;
  color: string;
}

export interface Attachment {
  id: string;
  tenantId: string;
  ticketId: string;
  uploaderId: string;
  filename: string;
  mime: string;
  size: number;
  s3Key: string;
  url?: string;
}

export type Paged<T> = { items: T[]; count: number };

export type TicketsListQuery = {
  clientId?: string;
  projectId?: string;
  streamId?: string;
  status?: string[];
  assigneeId?: string;
  search?: string;
  tagIds?: string[];
  limit?: number;
  offset?: number;
};

// Shape for updating a ticket via POST /tickets/:id
export type UpdateTicketPatch = Partial<{
  title: string;
  descriptionMd: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  assigneeId: string;
  streamId: string;
  dueDate: string; // ISO
  points: number;
  tagIds: string[];
}>;
