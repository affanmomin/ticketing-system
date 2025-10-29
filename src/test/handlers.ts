// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { http, HttpResponse } from "msw";

const API = (path: string) =>
  `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}${path}`;

// In-memory stores for simple assertions
let projectsCreated: any[] = [];
let ticketsCreated: any[] = [];
let commentsCreated: any[] = [];
let attachmentsUploaded: any[] = [];

export const getInMemory = () => ({
  projectsCreated,
  ticketsCreated,
  commentsCreated,
  attachmentsUploaded,
});

export const resetInMemory = () => {
  projectsCreated = [];
  ticketsCreated = [];
  commentsCreated = [];
  attachmentsUploaded = [];
};

export const handlers = [
  // Auth
  http.post(API("/auth/login"), async ({ request }: any) => {
    const body: any = await request.json();
    if (body.email?.includes("fail")) {
      return HttpResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
    return HttpResponse.json({
      accessToken: "test-token",
      user: { id: "u1", tenantId: "t1", role: "ADMIN" },
    });
  }),
  http.get(API("/auth/me"), () =>
    HttpResponse.json({ user: { id: "u1", tenantId: "t1", role: "ADMIN" } })
  ),
  http.get(API("/tenants/me"), () => HttpResponse.json({ id: "t1" })),

  // Clients
  http.get(API("/clients"), ({ request }: any) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || 2);
    const items = [
      {
        id: "c1",
        tenantId: "t1",
        name: "Acme Co",
        active: true,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "c2",
        tenantId: "t1",
        name: "Globex",
        active: true,
        createdAt: "",
        updatedAt: "",
      },
    ].slice(0, limit);
    return HttpResponse.json({ items, count: 2 });
  }),
  http.post(API("/clients"), async ({ request }: any) => {
    const dto: any = await request.json();
    return HttpResponse.json({
      id: "c3",
      tenantId: "t1",
      active: true,
      createdAt: "",
      updatedAt: "",
      ...dto,
    });
  }),
  http.patch(API("/clients/:id"), async ({ params, request }: any) => {
    const patch: any = await request.json();
    return HttpResponse.json({
      id: params.id,
      tenantId: "t1",
      active: true,
      createdAt: "",
      updatedAt: "",
      ...patch,
    });
  }),

  // Projects
  http.get(API("/projects"), ({ request }: any) => {
    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId") || "c1";
    const items = [
      {
        id: "p1",
        tenantId: "t1",
        clientId,
        name: "Website",
        code: "WEB",
        active: true,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "p2",
        tenantId: "t1",
        clientId,
        name: "Mobile",
        code: "MOB",
        active: true,
        createdAt: "",
        updatedAt: "",
      },
    ];
    return HttpResponse.json(items);
  }),
  http.post(API("/projects"), async ({ request }: any) => {
    const dto: any = await request.json();
    const created = {
      id: `p${projectsCreated.length + 3}`,
      tenantId: "t1",
      active: true,
      createdAt: "",
      updatedAt: "",
      ...dto,
    };
    projectsCreated.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.patch(API("/projects/:id"), async ({ params, request }: any) => {
    const patch: any = await request.json();
    return HttpResponse.json({
      id: params.id,
      tenantId: "t1",
      active: true,
      createdAt: "",
      updatedAt: "",
      ...patch,
    });
  }),

  // Streams
  http.get(API("/streams"), ({ request }: any) => {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId") || "p1";
    return HttpResponse.json([
      {
        id: "s1",
        tenantId: "t1",
        projectId,
        name: "Frontend",
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "s2",
        tenantId: "t1",
        projectId,
        name: "Backend",
        createdAt: "",
        updatedAt: "",
      },
    ]);
  }),
  http.post(API("/streams"), async ({ request }: any) => {
    const dto: any = await request.json();
    return HttpResponse.json({
      id: "s3",
      tenantId: "t1",
      createdAt: "",
      updatedAt: "",
      ...dto,
    });
  }),

  // Users
  http.get(API("/users/assignable"), () => {
    return HttpResponse.json([
      { id: "u2", name: "Dev One", email: "dev1@example.com" },
      { id: "u3", name: "Dev Two", email: "dev2@example.com" },
    ]);
  }),

  // Tags
  http.get(API("/tags"), () => {
    return HttpResponse.json([
      { id: "t1", tenantId: "t1", name: "urgent", color: "#ef4444" },
      { id: "t2", tenantId: "t1", name: "ux", color: "#8b5cf6" },
    ]);
  }),
  http.post(API("/tags"), async ({ request }: any) => {
    const dto: any = await request.json();
    return HttpResponse.json({ id: "t3", tenantId: "t1", ...dto });
  }),
  http.delete(API("/tags/:id"), () => new HttpResponse(null, { status: 204 })),

  // Tickets
  http.get(API("/tickets"), ({ request }: any) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || 20);
    const offset = Number(url.searchParams.get("offset") || 0);
    const items = Array.from({ length: limit }).map((_, i) => ({
      id: `tk_${offset + i + 1}`,
      tenantId: "t1",
      clientId: url.searchParams.get("clientId") || "c1",
      projectId: url.searchParams.get("projectId") || "p1",
      reporterId: "u1",
      assigneeId: null,
      title: `Ticket ${offset + i + 1}`,
      descriptionMd: "desc",
      status: "TODO",
      priority: "P2",
      type: "TASK",
      createdAt: "",
      updatedAt: "",
    }));
    return HttpResponse.json({ items, count: 42 });
  }),
  http.get(API("/tickets/:id"), ({ params }: any) => {
    const id = String(params.id);
    return HttpResponse.json({
      id,
      tenantId: "t1",
      clientId: "c1",
      projectId: "p1",
      reporterId: "u1",
      assigneeId: null,
      title: `Ticket ${id}`,
      descriptionMd: "desc",
      status: "TODO",
      priority: "P2",
      type: "TASK",
      createdAt: "",
      updatedAt: "",
      streamId: null,
      dueDate: null,
      points: null,
    });
  }),
  http.post(API("/tickets"), async ({ request }: any) => {
    const dto: any = await request.json();
    const created = {
      id: `tk_${ticketsCreated.length + 100}`,
      tenantId: "t1",
      reporterId: "u1",
      createdAt: "",
      updatedAt: "",
      status: "TODO",
      priority: "P2",
      type: "TASK",
      ...dto,
    };
    ticketsCreated.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.patch(API("/tickets/:id"), async ({ params, request }: any) => {
    const patch: any = await request.json();
    return HttpResponse.json({ id: String(params.id), ...patch });
  }),
  // Support POST-based ticket updates (backend uses POST /tickets/:id)
  http.post(API("/tickets/:id"), async ({ params, request }: any) => {
    const patch: any = await request.json();
    return HttpResponse.json({ id: String(params.id), ...patch });
  }),

  // Comments
  http.post(API("/comments"), async ({ request }: any) => {
    const dto: any = await request.json();
    const created = { id: `cm_${commentsCreated.length + 1}`, ...dto };
    commentsCreated.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  // Attachments
  http.post(API("/attachments"), async ({ request }: any) => {
    const form = await request.formData();
    attachmentsUploaded.push({
      name: form.get("file"),
      ticketId: form.get("ticketId"),
    });
    return HttpResponse.json(
      {
        id: `att_${attachmentsUploaded.length}`,
        ticketId: String(form.get("ticketId")),
      },
      { status: 201 }
    );
  }),
  http.get(API("/tickets/:id/attachments"), () => HttpResponse.json([])),
  http.get(API("/tickets/:id/comments"), () => HttpResponse.json([])),
];
