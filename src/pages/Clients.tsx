import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Search, Edit, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import ClientForm from "@/components/forms/ClientForm";
import { ClientEditForm } from "@/components/forms/ClientEditForm";
import * as clientsApi from "@/api/clients";
import { useToast } from "@/hooks/use-toast";

type Client = {
  id: string;
  tenantId: string;
  name: string;
  domain?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export function Clients() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [count, setCount] = useState(0);
  const limit = 12;
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await clientsApi.list({ limit, offset });
      setClients(data.items);
      setCount(data.count);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    setDeleting(true);
    try {
      await clientsApi.remove(clientToDelete.id);
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      setClientToDelete(null);
      load();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete client",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setClientToEdit(null);
    load();
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const filtered = useMemo(() => {
    if (!query) return clients;
    const q = query.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.domain ?? "").toLowerCase().includes(q)
    );
  }, [clients, query]);

  const totalPages = Math.ceil(count / limit) || 1;
  const page = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Admin view of client accounts"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Client</DialogTitle>
              </DialogHeader>
              <ClientForm
                onSuccess={() => {
                  setOpen(false);
                  load();
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between w-full text-muted-foreground">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              All Clients
            </span>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-8 w-64"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="p-0">
                        <TableRowSkeleton columns={5} />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.domain || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.active ? "default" : "secondary"}>
                        {c.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setClientToEdit(c)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setClientToDelete(c)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              {count} total • Page {page} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setOffset(offset + limit)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!clientToEdit}
        onOpenChange={(open) => !open && setClientToEdit(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          {clientToEdit && (
            <ClientEditForm
              client={clientToEdit}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!clientToDelete}
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{clientToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
