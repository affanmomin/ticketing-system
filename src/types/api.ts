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
  projectName?: string;
  clientId?: string;
  clientName?: string;
  raisedByUserId: string;
  raisedByName?: string;
  raisedByEmail?: string;
  assignedToUserId: string | null;
  assignedToName?: string;
  assignedToEmail?: string;
  streamId: string;
  streamName?: string;
  subjectId: string;
  subjectName?: string;
  priorityId: string;
  priorityName?: string;
  statusId: string;
  statusName?: string;
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

// Dashboard types
export interface TicketStatusCount {
  statusId: string;
  statusName: string;
  count: number;
}

export interface TicketPriorityCount {
  priorityId: string;
  priorityName: string;
  count: number;
}

export interface TicketMetrics {
  total: number;
  open: number;
  closed: number;
  byStatus: TicketStatusCount[];
  byPriority: TicketPriorityCount[];
  assignedToMe?: number; // Only for employees
}

export interface ProjectMetrics {
  total: number;
  active: number;
}

export interface ClientMetrics {
  total: number;
  active: number;
}

export interface UserMetrics {
  total: number;
  active: number;
}

export interface DashboardMetrics {
  tickets: TicketMetrics;
  projects: ProjectMetrics;
  clients?: ClientMetrics; // Only for admins
  users?: UserMetrics; // Only for admins
}

export type ActivityType =
  | "COMMENT_ADDED"
  | "STATUS_CHANGED"
  | "ASSIGNEE_CHANGED"
  | "TICKET_CREATED"
  | "PRIORITY_CHANGED";

export interface ActivityMetadata {
  commentBody?: string;
  visibility?: "PUBLIC" | "INTERNAL";
  oldValue?: {
    statusId?: string;
    statusName?: string;
    priorityId?: string;
    priorityName?: string;
    assignedToUserId?: string | null;
    assignedToName?: string | null;
  };
  newValue?: {
    statusId?: string;
    statusName?: string;
    priorityId?: string;
    priorityName?: string;
    assignedToUserId?: string | null;
    assignedToName?: string | null;
    title?: string;
    description?: string;
  };
}

export interface DashboardActivity {
  id: string;
  type: ActivityType;
  ticketId: string;
  ticketTitle: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  createdAt: string;
  metadata: ActivityMetadata;
}

// User Activity & Performance types
export interface UserActivityInfo {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  clientId: string | null;
  clientName: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UserTicketMetrics {
  created: number;
  assigned: number;
  closed: number;
  open: number;
  byStatus: TicketStatusCount[];
  byPriority: TicketPriorityCount[];
}

export interface UserActivityMetrics {
  totalEvents: number;
  totalComments: number;
  eventsByType: Array<{
    eventType: ActivityType;
    count: number;
  }>;
  lastActivityAt: string;
}

export interface UserPerformanceMetrics {
  averageResponseTime?: number; // hours (optional - may not be available)
  averageResolutionTime?: number; // hours (optional - may not be available)
  ticketsClosedLast30Days: number;
  ticketsCreatedLast30Days: number;
  commentsLast30Days: number;
}

export interface UserProjectMetrics {
  total: number;
  active: number;
  asManager: number;
  asMember: number;
}

export interface UserActivityResponse {
  user: UserActivityInfo;
  tickets: UserTicketMetrics;
  activity: UserActivityMetrics;
  performance: UserPerformanceMetrics;
  projects: UserProjectMetrics;
}
