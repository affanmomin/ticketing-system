import { useEffect, useMemo, useState } from "react";
import { Users as UsersIcon, Plus, Search, Settings2, ToggleLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/PageHeader";
import { InviteUserForm } from "@/components/forms/InviteUserForm";
import { UserEditForm } from "@/components/forms/UserEditForm";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import * as usersApi from "@/api/users";
import * as clientsApi from "@/api/clients";
import type { AuthUser, Client } from "@/types/api";

const PAGE_SIZE = 50;

export function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AuthUser["role"]>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((client) => map.set(client.id, client.name));
    return map;
  }, [clients]);

  async function loadUsers() {
    setLoading(true);
    try {
      const params: usersApi.ListUsersQuery = { limit: PAGE_SIZE, offset };
      if (roleFilter !== "all") params.role = roleFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await usersApi.list(params);
      setUsers(data.data);
      setTotal(data.total);
    } catch (error: any) {
      toast({
        title: "Failed to load users",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadClients() {
    try {
      const { data } = await clientsApi.list({ limit: 200, offset: 0 });
      setClients(data.data);
    } catch (error) {
      console.warn("Failed to load clients", error);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, roleFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setOffset(0);
      loadUsers();
    }, 250);

    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function toggleActive(user: AuthUser, active: boolean) {
    setUpdatingId(user.id);
    try {
      await usersApi.update(user.id, { isActive: active });
      await loadUsers();
    } catch (error: any) {
      toast({
        title: "Failed to update user",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter((user) =>
      [user.fullName ?? "", user.email ?? "", user.id]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [users, search]);

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Administer workspace members and client contacts"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create User</DialogTitle>
              </DialogHeader>
              <InviteUserForm
                onSuccess={() => {
                  setCreateOpen(false);
                  loadUsers();
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <UsersIcon className="h-4 w-4" />
            Workspace Users
          </CardTitle>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Select value={roleFilter} onValueChange={(value) => {
              setRoleFilter(value as "all" | AuthUser["role"]);
              setOffset(0);
            }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Role filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
                <SelectItem value="EMPLOYEE">Employees</SelectItem>
                <SelectItem value="CLIENT">Clients</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={5} className="p-0">
                        <TableRowSkeleton columns={5} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {user.fullName || user.email || user.id}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email || "—"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="uppercase">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.clientId ? clientMap.get(user.clientId) ?? user.clientId : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.isActive === false ? "secondary" : "default"}>
                            {user.isActive === false ? "Inactive" : "Active"}
                          </Badge>
                          <Switch
                            checked={user.isActive !== false}
                            onCheckedChange={(checked) => toggleActive(user, checked)}
                            disabled={updatingId === user.id}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Settings2 className="mr-2 h-4 w-4" />Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(user, !(user.isActive !== false))}
                            disabled={updatingId === user.id}
                          >
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            {user.isActive === false ? "Activate" : "Deactivate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {total} total • Page {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit user details</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserEditForm
              user={editingUser}
              onSuccess={() => {
                setEditingUser(null);
                loadUsers();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
