import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Users as UsersIcon, Plus, Search } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { InviteUserForm } from "@/components/forms/InviteUserForm";

type Role = "admin" | "employee" | "client";
type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "suspended";
};

const initialUsers: UserRow[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "admin",
    status: "active",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "employee",
    status: "active",
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@example.com",
    role: "employee",
    status: "suspended",
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david@example.com",
    role: "client",
    status: "active",
  },
];

export function Users() {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    let data = users;
    if (roleFilter !== "all") data = data.filter((u) => u.role === roleFilter);
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    return data;
  }, [users, query, roleFilter]);

  // Static UI: invite flow handled inside InviteUserForm (no data mutation here)

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      )
    );
  };

  const changeRole = (id: string, newRole: Role) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Admin management of users"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <InviteUserForm />
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between w-full text-muted-foreground">
            <span className="flex items-center gap-2 text-muted-foreground">
              <UsersIcon className="w-4 h-4" />
              All Users
            </span>
            <div className="flex items-center gap-3">
              <Select
                value={roleFilter}
                onValueChange={(v: Role | "all") => setRoleFilter(v)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8 w-64"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 p-4"
              >
                <div className="sm:col-span-4 flex items-center gap-3">
                  <UserAvatar name={u.name} role={u.role} showTooltip={false} />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {u.email}
                    </p>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Badge variant="secondary" className="capitalize">
                    {u.role}
                  </Badge>
                </div>
                <div className="sm:col-span-2">
                  <Badge
                    className={
                      u.status === "active"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }
                  >
                    {u.status}
                  </Badge>
                </div>
                <div className="sm:col-span-2">
                  <Select
                    value={u.role}
                    onValueChange={(v: Role) => changeRole(u.id, v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 flex justify-start sm:justify-end">
                  <Button variant="outline" onClick={() => toggleStatus(u.id)}>
                    {u.status === "active" ? "Suspend" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground">
                No users found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
