import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Plus, Search, Mail } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { PageHeader } from "@/components/PageHeader";
import ClientForm from "@/components/forms/ClientForm";
import * as clientsApi from "@/api/clients";

type Client = {
  id: string;
  name: string;
  domain?: string | null;
  active: boolean;
};

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [count, setCount] = useState(0);
  const limit = 12;
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading && (
              <div className="col-span-full text-sm text-muted-foreground">
                Loading…
              </div>
            )}
            {!loading &&
              filtered.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-border p-4 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={c.name}
                      role="client"
                      showTooltip={false}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {c.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.domain || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />{" "}
                      {c.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="outline" className="flex-1">
                      View
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Contact
                    </Button>
                  </div>
                </div>
              ))}
            {!loading && filtered.length === 0 && (
              <div className="col-span-full text-sm text-muted-foreground">
                No clients found.
              </div>
            )}
          </div>
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
    </div>
  );
}
