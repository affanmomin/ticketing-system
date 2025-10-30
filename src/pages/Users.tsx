import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRowSkeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users as UsersIcon, Plus, Search, Edit } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { InviteUserForm } from "@/components/forms/InviteUserForm";
import { UserEditForm } from "@/components/forms/UserEditForm";
import { toast } from "@/hooks/use-toast";
import * as usersApi from "@/api/users";
import type { User, UserType } from "@/api/users";

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserType | "all">("all");
  const [open, setOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const params: any = { limit: 100, offset: 0 };
      if (roleFilter !== "all") params.userType = roleFilter;
      if (query) params.search = query;

      const { data } = await usersApi.list(params);
      setUsers(data.data);
    } catch (e: any) {
      toast({
        title: "Failed to load users",
        description: e?.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [roleFilter, query]);

  const handleInviteSuccess = () => {
    setOpen(false);
    loadUsers();
  };

  const handleEditSuccess = () => {
    setUserToEdit(null);
    loadUsers();
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setUpdatingUserId(id);
    try {
      await usersApi.update(id, { active: !currentStatus });
      toast({
        title: currentStatus ? "User deactivated" : "User activated",
        description: "User status updated successfully",
      });
      loadUsers();
    } catch (e: any) {
      toast({
        title: "Failed to update user",
        description: e?.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const changeUserType = async (id: string, newUserType: UserType) => {
    setUpdatingUserId(id);
    try {
      await usersApi.update(id, { userType: newUserType });
      toast({
        title: "User type updated",
        description: "User type changed successfully",
      });
      loadUsers();
    } catch (e: any) {
      toast({
        title: "Failed to update user type",
        description: e?.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await usersApi.remove(userToDelete, false);
      toast({
        title: "User deleted",
        description: "User has been deactivated",
      });
      setUserToDelete(null);
      loadUsers();
    } catch (e: any) {
      toast({
        title: "Failed to delete user",
        description: e?.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    }
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
              <InviteUserForm onSuccess={handleInviteSuccess} />
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
                onValueChange={(v: UserType | "all") => setRoleFilter(v)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="CLIENT">Client</SelectItem>
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
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground text-center">
              Loading users...
            </div>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 p-4"
                >
                  <div className="sm:col-span-4 flex items-center gap-3">
                    <UserAvatar
                      name={u.name}
                      role={
                        u.userType.toLowerCase() as
                          | "admin"
                          | "employee"
                          | "client"
                      }
                      showTooltip={false}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}
                      </p>
                      {u.clientCompanyName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {u.clientCompanyName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Badge variant="secondary" className="capitalize">
                      {u.userType.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="sm:col-span-2">
                    <Badge
                      className={
                        u.active
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }
                    >
                      {u.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="sm:col-span-2">
                    <Select
                      value={u.userType}
                      onValueChange={(v: UserType) => changeUserType(u.id, v)}
                      disabled={updatingUserId === u.id}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                        <SelectItem value="CLIENT">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 flex justify-start sm:justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserToEdit(u)}
                      disabled={updatingUserId === u.id}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(u.id, u.active)}
                      disabled={updatingUserId === u.id}
                    >
                      {u.active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground">
                  No users found.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this user? This action will
              set their status to inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!userToEdit}
        onOpenChange={(open) => !open && setUserToEdit(null)}
      >
        <DialogContent className="max-w-2xl">
          {userToEdit && (
            <UserEditForm user={userToEdit} onSuccess={handleEditSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
