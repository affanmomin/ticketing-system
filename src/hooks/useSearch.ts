import { useState, useEffect, useMemo } from "react";
import * as ticketsApi from "@/api/tickets";
import * as projectsApi from "@/api/projects";
import * as usersApi from "@/api/users";
import type { Ticket, Project, AuthUser } from "@/types/api";

export type SearchResult = {
  type: "ticket" | "project" | "user";
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon?: React.ReactNode;
};

export function useSearch(query: string) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setTickets([]);
      setProjects([]);
      setUsers([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const [ticketsRes, projectsRes, usersRes] = await Promise.all([
          ticketsApi.list({ limit: 10, offset: 0 }),
          projectsApi.list({ limit: 10, offset: 0 }),
          usersApi.list({ limit: 10, offset: 0 }),
        ]);

        const searchLower = query.toLowerCase();

        // Filter tickets
        const filteredTickets = ticketsRes.data.data.filter(
          (ticket) =>
            ticket.title.toLowerCase().includes(searchLower) ||
            ticket.id.toLowerCase().includes(searchLower)
        );

        // Filter projects
        const filteredProjects = projectsRes.data.data.filter(
          (project) =>
            project.name.toLowerCase().includes(searchLower) ||
            (project.description || "").toLowerCase().includes(searchLower)
        );

        // Filter users
        const filteredUsers = usersRes.data.data.filter(
          (user) =>
            (user.fullName || "").toLowerCase().includes(searchLower) ||
            (user.email || "").toLowerCase().includes(searchLower)
        );

        setTickets(filteredTickets.slice(0, 5));
        setProjects(filteredProjects.slice(0, 5));
        setUsers(filteredUsers.slice(0, 5));
      } catch (error) {
        console.warn("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const results: SearchResult[] = useMemo(() => {
    const results: SearchResult[] = [];

    tickets.forEach((ticket) => {
      results.push({
        type: "ticket",
        id: ticket.id,
        title: ticket.title,
        subtitle: `Ticket #${ticket.id.substring(0, 8)}`,
        url: `/tickets?ticketId=${ticket.id}`,
      });
    });

    projects.forEach((project) => {
      results.push({
        type: "project",
        id: project.id,
        title: project.name,
        subtitle: project.description || undefined,
        url: `/projects/${project.id}`,
      });
    });

    users.forEach((user) => {
      results.push({
        type: "user",
        id: user.id,
        title: user.fullName || user.email || user.id,
        subtitle:
          user.email !== user.fullName ? user.email || undefined : undefined,
        url: `/users`,
      });
    });

    return results;
  }, [tickets, projects, users]);

  return { results, loading };
}
