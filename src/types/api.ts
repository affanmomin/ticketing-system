// Types derived from the updated OpenAPI specification (openapi.yaml)

export type UserRole = "ADMIN" | "EMPLOYEE" | "CLIENT";

export interface AuthUser {
  id: string;
  organizationId: string;
  role: UserRole;
  clientId: string | null;
  fullName?: string | null;
  email?: string | null;
  isActive?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface SignupRequest {
  organizationName: string;
  fullName: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  accessToken: string;
  user: AuthUser;
  organizationId: string;
}

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  startDate: string | null; // ISO date
  endDate: string | null; // ISO date
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProjectMemberRole = "MEMBER" | "MANAGER" | "VIEWER";

export interface ProjectMember {
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  canRaise: boolean;
  canBeAssigned: boolean;
  createdAt: string;
}

export interface Stream {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Priority {
  id: string;
  name: string;
  rank: number;
  colorHex: string | null;
  active: boolean;
}

export interface Status {
  id: string;
  name: string;
  isClosed: boolean;
  sequence: number;
  active: boolean;
}

export interface Ticket {
  id: string;
  projectId: string;
  raisedByUserId: string;
  assignedToUserId: string | null;
  streamId: string;
  subjectId: string;
  priorityId: string;
  statusId: string;
  title: string;
  descriptionMd: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export type CommentVisibility = "PUBLIC" | "INTERNAL";

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  visibility: CommentVisibility;
  bodyMd: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  ticketId: string;
  uploadedBy: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageUrl: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  clientId?: string;
}

export interface OutboxNotification {
  id: string;
  topic: string;
  ticketId: string;
  recipientUserId: string;
  payload: Record<string, unknown>;
  attempts: number;
  deliveredAt: string | null;
  createdAt: string;
}

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
};

export interface TicketsListQuery {
  projectId?: string;
  statusId?: string;
  priorityId?: string;
  assigneeId?: string;
  streamId?: string;
  subjectId?: string;
  limit?: number;
  offset?: number;
}

export interface TicketCreateRequest {
  projectId: string;
  streamId: string;
  subjectId: string;
  priorityId: string;
  statusId: string;
  title: string;
  descriptionMd?: string | null;
  assignedToUserId?: string | null;
}

export interface TicketUpdateRequest {
  statusId?: string;
  priorityId?: string;
  assignedToUserId?: string | null;
  title?: string;
  descriptionMd?: string | null;
}

export interface AttachmentPresignRequest {
  fileName: string;
  mimeType: string;
}

export interface AttachmentPresignResponse {
  uploadUrl: string;
  key: string;
}

export interface AttachmentConfirmRequest {
  storageUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}
