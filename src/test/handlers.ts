// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { http, HttpResponse } from "msw";

const API = (path: string) =>
  `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}${path}`;

type AuthUserMock = {
  id: string;
  organizationId: string;
  role: "ADMIN" | "EMPLOYEE" | "CLIENT";
  clientId: string | null;
  fullName: string;
  email: string;
  isActive: boolean;
};

type ClientMock = {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type StreamMock = {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type SubjectMock = StreamMock;

type ProjectMock = {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProjectMemberMock = {
  projectId: string;
  userId: string;
  role: "MEMBER" | "MANAGER" | "VIEWER";
  canRaise: boolean;
  canBeAssigned: boolean;
  createdAt: string;
};

type TicketMock = {
  id: string;
  projectId: string;
  streamId: string;
  subjectId: string;
  priorityId: string;
  statusId: string;
  title: string;
  descriptionMd: string | null;
  raisedByUserId: string;
  assignedToUserId: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
};

type CommentMock = {
  id: string;
  ticketId: string;
  authorId: string;
  visibility: "PUBLIC" | "INTERNAL";
  bodyMd: string;
  createdAt: string;
};

type AttachmentMock = {
  id: string;
  ticketId: string;
  uploadedBy: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageUrl: string;
  createdAt: string;
};

const priorities = [
  { id: "pri-1", name: "Critical", rank: 1, colorHex: "#ef4444", active: true },
  { id: "pri-2", name: "High", rank: 2, colorHex: "#f97316", active: true },
  { id: "pri-3", name: "Medium", rank: 3, colorHex: "#f59e0b", active: true },
  { id: "pri-4", name: "Low", rank: 4, colorHex: "#3b82f6", active: true },
];

const statuses = [
  {
    id: "stat-todo",
    name: "To Do",
    isClosed: false,
    sequence: 1,
    active: true,
  },
  {
    id: "stat-progress",
    name: "In Progress",
    isClosed: false,
    sequence: 2,
    active: true,
  },
  {
    id: "stat-review",
    name: "Review",
    isClosed: false,
    sequence: 3,
    active: true,
  },
  { id: "stat-done", name: "Done", isClosed: true, sequence: 4, active: true },
];

let users: AuthUserMock[] = [
  {
    id: "u1",
    organizationId: "org-1",
    role: "ADMIN",
    clientId: null,
    fullName: "Test Admin",
    email: "admin@example.com",
    isActive: true,
  },
  {
    id: "u2",
    organizationId: "org-1",
    role: "EMPLOYEE",
    clientId: null,
    fullName: "Employee One",
    email: "employee1@example.com",
    isActive: true,
  },
  {
    id: "u3",
    organizationId: "org-1",
    role: "CLIENT",
    clientId: "client-1",
    fullName: "Client Contact",
    email: "client@example.com",
    isActive: true,
  },
];

let clients: ClientMock[] = [
  {
    id: "client-1",
    organizationId: "org-1",
    name: "Acme Co",
    email: "ops@acme.com",
    phone: "+1-202-555-0122",
    address: "100 Main Street, Springfield",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "client-2",
    organizationId: "org-1",
    name: "Globex Inc",
    email: "support@globex.com",
    phone: null,
    address: null,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let streams: StreamMock[] = [
  {
    id: "stream-1",
    clientId: "client-1",
    name: "Onboarding",
    description: "Customer onboarding requests",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "stream-2",
    clientId: "client-1",
    name: "Support",
    description: "General support",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let subjects: SubjectMock[] = [
  {
    id: "subject-1",
    clientId: "client-1",
    name: "Billing",
    description: null,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "subject-2",
    clientId: "client-1",
    name: "Technical",
    description: null,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let projects: ProjectMock[] = [
  {
    id: "project-1",
    clientId: "client-1",
    name: "Website (WEB)",
    description: "External customer portal build",
    startDate: "2025-01-01",
    endDate: null,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "project-2",
    clientId: "client-1",
    name: "Internal Tools (INT)",
    description: null,
    startDate: null,
    endDate: null,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultProjectMembers: ProjectMemberMock[] = [
  {
    projectId: "project-1",
    userId: "u1",
    role: "MANAGER",
    canRaise: true,
    canBeAssigned: true,
    createdAt: new Date().toISOString(),
  },
  {
    projectId: "project-1",
    userId: "u2",
    role: "MEMBER",
    canRaise: true,
    canBeAssigned: true,
    createdAt: new Date().toISOString(),
  },
];

const defaultTickets: TicketMock[] = [
  {
    id: "ticket-1",
    projectId: "project-1",
    streamId: "stream-1",
    subjectId: "subject-1",
    priorityId: "pri-3",
    statusId: "stat-todo",
    title: "Set up billing webhook",
    descriptionMd: "Need webhook for Stripe events",
    raisedByUserId: "u1",
    assignedToUserId: "u2",
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    closedAt: null,
  },
  {
    id: "ticket-2",
    projectId: "project-1",
    streamId: "stream-2",
    subjectId: "subject-2",
    priorityId: "pri-2",
    statusId: "stat-progress",
    title: "Fix login timeout",
    descriptionMd: "Users from EU experiencing timeouts",
    raisedByUserId: "u3",
    assignedToUserId: null,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    closedAt: null,
  },
];

const defaultComments: CommentMock[] = [
  {
    id: "comment-1",
    ticketId: "ticket-1",
    authorId: "u1",
    visibility: "PUBLIC",
    bodyMd: "We'll get this scheduled this week.",
    createdAt: new Date().toISOString(),
  },
];

let projectMembers: ProjectMemberMock[] = defaultProjectMembers.map(
  (member) => ({ ...member })
);
let tickets: TicketMock[] = defaultTickets.map((ticket) => ({ ...ticket }));
let comments: CommentMock[] = defaultComments.map((comment) => ({
  ...comment,
}));
let attachments: AttachmentMock[] = [];

let projectsCreated: ProjectMock[] = [];
let ticketsCreated: TicketMock[] = [];
let commentsCreated: CommentMock[] = [];
let attachmentsUploaded: AttachmentMock[] = [];

export const getInMemory = () => ({
  tickets,
  comments,
  attachments,
  projectMembers,
  projectsCreated,
  ticketsCreated,
  commentsCreated,
  attachmentsUploaded,
});

export const resetInMemory = () => {
  projectMembers = defaultProjectMembers.map((member) => ({ ...member }));
  tickets = defaultTickets.map((ticket) => ({ ...ticket }));
  comments = [];
  attachments = [];
  projectsCreated = [];
  ticketsCreated = [];
  commentsCreated = [];
  attachmentsUploaded = [];
};

export const handlers = [
  // Auth
  http.post(API("/auth/login"), async ({ request }) => {
    const body = await request.json();
    if (body.email?.includes("fail")) {
      return HttpResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
    return HttpResponse.json({
      accessToken: "test-token",
      user: users[0],
    });
  }),

  http.post(API("/auth/signup"), async ({ request }) => {
    const body = await request.json();
    if (
      !body.email ||
      !body.password ||
      !body.fullName ||
      !body.organizationName
    ) {
      return HttpResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const newUser = {
      id: `user-${Date.now()}`,
      organizationId: `org-${Date.now()}`,
      role: "ADMIN" as const,
      clientId: null,
      fullName: body.fullName,
      email: body.email,
      isActive: true,
    };
    return HttpResponse.json({
      accessToken: "test-token-signup",
      user: newUser,
      organizationId: newUser.organizationId,
    });
  }),

  http.get(API("/auth/me"), () => HttpResponse.json(users[0])),
  http.post(API("/auth/logout"), () => new HttpResponse(null, { status: 200 })),

  // Dashboard
  http.get(API("/dashboard/metrics"), ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          code: "UNAUTHORIZED",
          message: "Missing or invalid Authorization header",
        },
        { status: 401 }
      );
    }

    // Get user role from token (simplified - in real app, decode JWT)
    // For testing, we'll use the first user's role or check a header
    const user = users[0];
    const role = user?.role || "ADMIN";

    if (role === "ADMIN") {
      return HttpResponse.json({
        tickets: {
          total: 150,
          open: 45,
          closed: 105,
          byStatus: [
            { statusId: "stat-todo", statusName: "New", count: 20 },
            { statusId: "stat-progress", statusName: "In Progress", count: 15 },
            { statusId: "stat-review", statusName: "Resolved", count: 10 },
            { statusId: "stat-done", statusName: "Closed", count: 105 },
          ],
          byPriority: [
            { priorityId: "pri-4", priorityName: "Low", count: 30 },
            { priorityId: "pri-3", priorityName: "Medium", count: 50 },
            { priorityId: "pri-2", priorityName: "High", count: 40 },
            { priorityId: "pri-1", priorityName: "Urgent", count: 30 },
          ],
        },
        projects: {
          total: 25,
          active: 20,
        },
        clients: {
          total: 10,
          active: 8,
        },
        users: {
          total: 50,
          active: 45,
        },
      });
    } else if (role === "EMPLOYEE") {
      return HttpResponse.json({
        tickets: {
          total: 12,
          open: 8,
          closed: 4,
          byStatus: [
            { statusId: "stat-todo", statusName: "New", count: 3 },
            { statusId: "stat-progress", statusName: "In Progress", count: 5 },
            { statusId: "stat-done", statusName: "Closed", count: 4 },
          ],
          byPriority: [
            { priorityId: "pri-3", priorityName: "Medium", count: 5 },
            { priorityId: "pri-2", priorityName: "High", count: 4 },
            { priorityId: "pri-1", priorityName: "Urgent", count: 3 },
          ],
          assignedToMe: 8,
        },
        projects: {
          total: 5,
          active: 4,
        },
      });
    } else {
      // CLIENT
      return HttpResponse.json({
        tickets: {
          total: 25,
          open: 10,
          closed: 15,
          byStatus: [
            { statusId: "stat-todo", statusName: "New", count: 5 },
            { statusId: "stat-progress", statusName: "In Progress", count: 5 },
            { statusId: "stat-done", statusName: "Closed", count: 15 },
          ],
          byPriority: [
            { priorityId: "pri-4", priorityName: "Low", count: 8 },
            { priorityId: "pri-3", priorityName: "Medium", count: 10 },
            { priorityId: "pri-2", priorityName: "High", count: 7 },
          ],
        },
        projects: {
          total: 3,
          active: 3,
        },
      });
    }
  }),

  http.get(API("/dashboard/activity"), ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          code: "UNAUTHORIZED",
          message: "Missing or invalid Authorization header",
        },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 10;

    if (limit > 100) {
      return HttpResponse.json(
        {
          code: "BAD_REQUEST",
          message: "limit must be less than or equal to 100",
        },
        { status: 400 }
      );
    }

    // Get user role
    const user = users[0];
    const role = user?.role || "ADMIN";

    const activities = [
      {
        id: "act-1",
        type: "COMMENT_ADDED",
        ticketId: "ticket-1",
        ticketTitle: "Fix login bug",
        actorId: "u1",
        actorName: "John Doe",
        actorEmail: "john@example.com",
        projectId: "project-1",
        projectName: "Website Redesign",
        clientId: "client-1",
        clientName: "Acme Corp",
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        metadata: {
          commentBody: "I've fixed the login issue. Please test and confirm.",
          visibility: "PUBLIC",
        },
      },
      {
        id: "act-2",
        type: "STATUS_CHANGED",
        ticketId: "ticket-2",
        ticketTitle: "Add new feature",
        actorId: "u2",
        actorName: "Jane Smith",
        actorEmail: "jane@example.com",
        projectId: "project-1",
        projectName: "Mobile App",
        clientId: "client-1",
        clientName: "Tech Solutions Inc",
        createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
        metadata: {
          oldValue: { statusId: "stat-todo", statusName: "New" },
          newValue: { statusId: "stat-progress", statusName: "In Progress" },
        },
      },
      {
        id: "act-3",
        type: "ASSIGNEE_CHANGED",
        ticketId: "ticket-3",
        ticketTitle: "Update documentation",
        actorId: "u1",
        actorName: "Admin User",
        actorEmail: "admin@example.com",
        projectId: "project-2",
        projectName: "Internal Tools",
        clientId: "client-1",
        clientName: "Internal",
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        metadata: {
          oldValue: { assignedToUserId: null, assignedToName: null },
          newValue: { assignedToUserId: "u1", assignedToName: "John Doe" },
        },
      },
      {
        id: "act-4",
        type: "TICKET_CREATED",
        ticketId: "ticket-4",
        ticketTitle: "New bug report",
        actorId: "u3",
        actorName: "Client User",
        actorEmail: "client@example.com",
        projectId: "project-1",
        projectName: "Client Portal",
        clientId: "client-1",
        clientName: "Client Corp",
        createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
        metadata: {
          newValue: {
            title: "New bug report",
            description: "Found an issue with the login page",
          },
        },
      },
      {
        id: "act-5",
        type: "COMMENT_ADDED",
        ticketId: "ticket-1",
        ticketTitle: "Fix login bug",
        actorId: "u2",
        actorName: "Employee User",
        actorEmail: "employee@example.com",
        projectId: "project-1",
        projectName: "Website Redesign",
        clientId: "client-1",
        clientName: "Acme Corp",
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
        metadata: {
          commentBody:
            "Internal note: This is a critical bug, needs immediate attention.",
          visibility: "INTERNAL",
        },
      },
    ];

    // Filter activities based on role
    let filteredActivities = activities;
    if (role === "CLIENT") {
      // Clients only see PUBLIC comments
      filteredActivities = activities.filter(
        (act) =>
          act.type !== "COMMENT_ADDED" || act.metadata.visibility === "PUBLIC"
      );
    }

    return HttpResponse.json(filteredActivities.slice(0, limit));
  }),

  http.get(API("/dashboard/users/:id/activity"), ({ request, params }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { code: "UNAUTHORIZED", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin (simplified - in real app, decode JWT)
    const user = users[0];
    const role = user?.role || "ADMIN";

    if (role !== "ADMIN") {
      return HttpResponse.json(
        { code: "FORBIDDEN", message: "Only admins can view user activity" },
        { status: 403 }
      );
    }

    // Find the user by ID
    const targetUser = users.find((u) => u.id === params.id);
    if (!targetUser) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "User not found" },
        { status: 404 }
      );
    }

    // Get tickets for this user
    const userTickets = tickets.filter(
      (t) => t.raisedByUserId === params.id || t.assignedToUserId === params.id
    );
    const createdTickets = tickets.filter(
      (t) => t.raisedByUserId === params.id
    );
    const assignedTickets = tickets.filter(
      (t) => t.assignedToUserId === params.id
    );
    const closedTickets = assignedTickets.filter(
      (t) => statuses.find((s) => s.id === t.statusId)?.isClosed
    );
    const openTickets = assignedTickets.filter(
      (t) => !statuses.find((s) => s.id === t.statusId)?.isClosed
    );

    // Get user's project memberships
    const userProjects = projectMembers.filter((m) => m.userId === params.id);
    const projectIds = new Set(userProjects.map((m) => m.projectId));
    const userProjectList = projects.filter((p) => projectIds.has(p.id));
    const activeProjects = userProjectList.filter((p) => p.active);
    const managerProjects = userProjects.filter((m) => m.role === "MANAGER");
    const memberProjects = userProjects.filter((m) => m.role === "MEMBER");

    // Get user's comments
    const userComments = comments.filter((c) => c.authorId === params.id);

    // Calculate activity metrics
    const statusCounts = new Map<string, number>();
    const priorityCounts = new Map<string, number>();
    assignedTickets.forEach((t) => {
      statusCounts.set(t.statusId, (statusCounts.get(t.statusId) || 0) + 1);
      priorityCounts.set(
        t.priorityId,
        (priorityCounts.get(t.priorityId) || 0) + 1
      );
    });

    const byStatus = Array.from(statusCounts.entries()).map(
      ([statusId, count]) => {
        const status = statuses.find((s) => s.id === statusId);
        return {
          statusId,
          statusName: status?.name || "Unknown",
          count,
        };
      }
    );

    const byPriority = Array.from(priorityCounts.entries()).map(
      ([priorityId, count]) => {
        const priority = priorities.find((p) => p.id === priorityId);
        return {
          priorityId,
          priorityName: priority?.name || "Unknown",
          count,
        };
      }
    );

    // Get client name if applicable
    const clientName =
      targetUser.clientId && clients.find((c) => c.id === targetUser.clientId)
        ? clients.find((c) => c.id === targetUser.clientId)!.name
        : null;

    return HttpResponse.json({
      user: {
        id: targetUser.id,
        email: targetUser.email,
        fullName: targetUser.fullName,
        role: targetUser.role,
        clientId: targetUser.clientId,
        clientName,
        isActive: targetUser.isActive,
        createdAt: new Date(
          Date.now() - 90 * 24 * 60 * 60 * 1000
        ).toISOString(), // 90 days ago
      },
      tickets: {
        created: createdTickets.length,
        assigned: assignedTickets.length,
        closed: closedTickets.length,
        open: openTickets.length,
        byStatus,
        byPriority,
      },
      activity: {
        totalEvents: userTickets.length * 2 + userComments.length, // Rough estimate
        totalComments: userComments.length,
        eventsByType: [
          {
            eventType: "STATUS_CHANGED",
            count: Math.floor(userTickets.length * 0.3),
          },
          { eventType: "COMMENT_ADDED", count: userComments.length },
          {
            eventType: "ASSIGNEE_CHANGED",
            count: Math.floor(userTickets.length * 0.2),
          },
        ],
        lastActivityAt:
          userTickets.length > 0
            ? userTickets[userTickets.length - 1].updatedAt
            : new Date().toISOString(),
      },
      performance: {
        averageResponseTime: 2.5,
        averageResolutionTime: 48.5,
        ticketsClosedLast30Days: Math.floor(closedTickets.length * 0.4),
        ticketsCreatedLast30Days: Math.floor(createdTickets.length * 0.3),
        commentsLast30Days: Math.floor(userComments.length * 0.4),
      },
      projects: {
        total: userProjectList.length,
        active: activeProjects.length,
        asManager: managerProjects.length,
        asMember: memberProjects.length,
      },
    });
  }),

  // Taxonomy
  http.get(API("/taxonomy/priority"), () => HttpResponse.json(priorities)),
  http.get(API("/taxonomy/status"), () => HttpResponse.json(statuses)),

  // Clients
  http.get(API("/clients"), ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const activeOnly = url.searchParams.get("active");
    const filtered = activeOnly
      ? clients.filter((client) => client.active)
      : clients;
    const data = filtered.slice(offset, offset + limit);
    return HttpResponse.json({ data, total: filtered.length });
  }),
  http.post(API("/clients"), async ({ request }) => {
    const dto = await request.json();
    const created: ClientMock = {
      id: `client-${clients.length + 1}`,
      organizationId: "org-1",
      name: dto.name,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    clients.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.get(API("/clients/:id"), ({ params }) => {
    const client = clients.find((c) => c.id === params.id);
    if (!client)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(client);
  }),
  http.post(API("/clients/:id"), async ({ params, request }) => {
    const patch = await request.json();
    const idx = clients.findIndex((client) => client.id === params.id);
    if (idx === -1)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    clients[idx] = {
      ...clients[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(clients[idx]);
  }),

  // Streams
  http.get(API("/clients/:clientId/streams"), ({ params }) => {
    const clientStreams = streams.filter(
      (stream) => stream.clientId === params.clientId
    );
    return HttpResponse.json({
      data: clientStreams,
      total: clientStreams.length,
    });
  }),
  http.post(API("/clients/:clientId/streams"), async ({ params, request }) => {
    const dto = await request.json();
    const created: StreamMock = {
      id: `stream-${streams.length + 1}`,
      clientId: params.clientId,
      name: dto.name,
      description: dto.description ?? null,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    streams.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.post(API("/streams/:id"), async ({ params, request }) => {
    const patch = await request.json();
    const idx = streams.findIndex((stream) => stream.id === params.id);
    if (idx === -1)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    streams[idx] = {
      ...streams[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(streams[idx]);
  }),

  // Subjects
  http.get(API("/clients/:clientId/subjects"), ({ params }) => {
    const clientSubjects = subjects.filter(
      (subject) => subject.clientId === params.clientId
    );
    return HttpResponse.json({
      data: clientSubjects,
      total: clientSubjects.length,
    });
  }),
  http.post(API("/clients/:clientId/subjects"), async ({ params, request }) => {
    const dto = await request.json();
    const created: SubjectMock = {
      id: `subject-${subjects.length + 1}`,
      clientId: params.clientId,
      name: dto.name,
      description: dto.description ?? null,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    subjects.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.post(API("/subjects/:id"), async ({ params, request }) => {
    const patch = await request.json();
    const idx = subjects.findIndex((subject) => subject.id === params.id);
    if (idx === -1)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    subjects[idx] = {
      ...subjects[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(subjects[idx]);
  }),

  // Projects
  http.get(API("/projects"), ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const clientId = url.searchParams.get("clientId");
    const filtered = clientId
      ? projects.filter((project) => project.clientId === clientId)
      : projects;
    const data = filtered.slice(offset, offset + limit);
    return HttpResponse.json({ data, total: filtered.length });
  }),
  http.post(API("/projects"), async ({ request }) => {
    const dto = await request.json();
    const created: ProjectMock = {
      id: `project-${projects.length + 1}`,
      clientId: dto.clientId,
      name: dto.name,
      description: dto.description ?? null,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.push(created);
    projectsCreated.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.get(API("/projects/:id"), ({ params }) => {
    const project = projects.find((p) => p.id === params.id);
    if (!project)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(project);
  }),

  // Project members
  http.get(API("/projects/:id/members"), ({ params }) => {
    const membersForProject = projectMembers.filter(
      (member) => member.projectId === params.id
    );
    return HttpResponse.json(membersForProject);
  }),
  http.post(API("/projects/:id/members"), async ({ params, request }) => {
    const dto = await request.json();
    const created: ProjectMemberMock = {
      projectId: params.id,
      userId: dto.userId,
      role: dto.role ?? "MEMBER",
      canRaise: dto.canRaise ?? true,
      canBeAssigned: dto.canBeAssigned ?? true,
      createdAt: new Date().toISOString(),
    };
    projectMembers.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.post(
    API("/projects/:projectId/members/:userId"),
    async ({ params, request }) => {
      const patch = await request.json();
      const idx = projectMembers.findIndex(
        (member) =>
          member.projectId === params.projectId &&
          member.userId === params.userId
      );
      if (idx === -1)
        return HttpResponse.json({ message: "Not found" }, { status: 404 });
      projectMembers[idx] = { ...projectMembers[idx], ...patch };
      return HttpResponse.json(projectMembers[idx]);
    }
  ),
  http.delete(API("/projects/:projectId/members/:userId"), ({ params }) => {
    projectMembers = projectMembers.filter(
      (member) =>
        !(
          member.projectId === params.projectId &&
          member.userId === params.userId
        )
    );
    return new HttpResponse(null, { status: 204 });
  }),

  // Users
  http.get(API("/users"), ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const role = url.searchParams.get("role");
    const active = url.searchParams.get("isActive");
    const search = url.searchParams.get("search")?.toLowerCase();
    const filtered = users.filter((user) => {
      if (role && user.role !== role) return false;
      if (active && String(user.isActive) !== active) return false;
      if (
        search &&
        !user.fullName.toLowerCase().includes(search) &&
        !user.email.toLowerCase().includes(search)
      ) {
        return false;
      }
      return true;
    });
    const data = filtered.slice(offset, offset + limit);
    return HttpResponse.json({ data, total: filtered.length });
  }),
  http.post(API("/employees"), async ({ request }) => {
    const dto = await request.json();
    const created: AuthUserMock = {
      id: `user-${users.length + 1}`,
      organizationId: "org-1",
      role: "EMPLOYEE",
      clientId: null,
      fullName: dto.fullName,
      email: dto.email,
      isActive: true,
    };
    users.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.post(API("/client-users"), async ({ request }) => {
    const dto = await request.json();
    const created: AuthUserMock = {
      id: `user-${users.length + 1}`,
      organizationId: "org-1",
      role: "CLIENT",
      clientId: dto.clientId,
      fullName: dto.fullName,
      email: dto.email,
      isActive: true,
    };
    users.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.get(API("/users/:id"), ({ params }) => {
    const user = users.find((u) => u.id === params.id);
    if (!user)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(user);
  }),
  http.post(API("/users/:id"), async ({ params, request }) => {
    const patch = await request.json();
    const idx = users.findIndex((user) => user.id === params.id);
    if (idx === -1)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    users[idx] = { ...users[idx], ...patch };
    return HttpResponse.json(users[idx]);
  }),
  http.post(
    API("/users/:id/password"),
    () => new HttpResponse(null, { status: 200 })
  ),

  // Tickets
  http.get(API("/tickets"), ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const projectId = url.searchParams.get("projectId");
    const statusId = url.searchParams.get("statusId");
    const priorityId = url.searchParams.get("priorityId");

    const filtered = tickets.filter((ticket) => {
      if (projectId && ticket.projectId !== projectId) return false;
      if (statusId && ticket.statusId !== statusId) return false;
      if (priorityId && ticket.priorityId !== priorityId) return false;
      return true;
    });
    const data = filtered.slice(offset, offset + limit);
    return HttpResponse.json({ data, total: filtered.length });
  }),
  http.get(API("/tickets/:id"), ({ params }) => {
    const ticket = tickets.find((t) => t.id === params.id);
    if (!ticket)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(ticket);
  }),
  http.post(API("/tickets"), async ({ request }) => {
    const dto = await request.json();
    const created: TicketMock = {
      id: `ticket-${tickets.length + 1}`,
      projectId: dto.projectId,
      streamId: dto.streamId,
      subjectId: dto.subjectId,
      priorityId: dto.priorityId,
      statusId: dto.statusId,
      title: dto.title,
      descriptionMd: dto.descriptionMd ?? null,
      raisedByUserId: "u1",
      assignedToUserId: dto.assignedToUserId ?? null,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null,
    };
    tickets.push(created);
    ticketsCreated.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.post(API("/tickets/:id"), async ({ params, request }) => {
    const idx = tickets.findIndex((ticket) => ticket.id === params.id);
    if (idx === -1)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const patch: TicketUpdateRequest = await request.json();
    tickets[idx] = {
      ...tickets[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    } as TicketMock;
    return HttpResponse.json(tickets[idx]);
  }),

  // Comments
  http.get(API("/tickets/:id/comments"), ({ params }) => {
    return HttpResponse.json(
      comments.filter((comment) => comment.ticketId === params.id)
    );
  }),
  http.get(API("/comments/:id"), ({ params }) => {
    const comment = comments.find((c) => c.id === params.id);
    if (!comment)
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(comment);
  }),
  http.post(API("/tickets/:id/comments"), async ({ params, request }) => {
    const dto = await request.json();
    const created: CommentMock = {
      id: `comment-${comments.length + 1}`,
      ticketId: params.id,
      authorId: "u1",
      visibility: dto.visibility ?? "PUBLIC",
      bodyMd: dto.bodyMd,
      createdAt: new Date().toISOString(),
    };
    comments.push(created);
    commentsCreated.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  // Attachments
  http.get(API("/tickets/:id/attachments"), ({ params }) =>
    HttpResponse.json(
      attachments.filter((attachment) => attachment.ticketId === params.id)
    )
  ),
  http.post(
    API("/tickets/:id/attachments/presign"),
    async ({ params, request }) => {
      const dto = await request.json();
      return HttpResponse.json({
        uploadUrl: "https://example.com/upload",
        key: `uploads/${params.id}/${dto.fileName}`,
      });
    }
  ),
  http.post(
    API("/tickets/:id/attachments/confirm"),
    async ({ params, request }) => {
      const dto = await request.json();
      const created: AttachmentMock = {
        id: `attachment-${attachments.length + 1}`,
        ticketId: params.id,
        uploadedBy: "u1",
        fileName: dto.fileName,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        storageUrl: dto.storageUrl,
        createdAt: new Date().toISOString(),
      };
      attachments.push(created);
      attachmentsUploaded.push(created);
      return HttpResponse.json(created, { status: 201 });
    }
  ),
  http.delete(API("/attachments/:id"), ({ params }) => {
    attachments = attachments.filter(
      (attachment) => attachment.id !== params.id
    );
    return new HttpResponse(null, { status: 204 });
  }),
];
