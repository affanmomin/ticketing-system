import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Plus, Search, Mail } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { PageHeader } from "@/components/PageHeader";

type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  projects: number;
  openTickets: number;
  avatar_url?: string | null;
};

const initialClients: Client[] = [
  {
    id: "1",
    name: "Acme Corp",
    company: "Acme Corp",
    email: "owner@acme.com",
    projects: 4,
    openTickets: 12,
  },
  {
    id: "2",
    name: "Globex Inc",
    company: "Globex Inc",
    email: "it@globex.com",
    projects: 2,
    openTickets: 5,
  },
  {
    id: "3",
    name: "Initech",
    company: "Initech",
    email: "cto@initech.com",
    projects: 3,
    openTickets: 9,
  },
  {
    id: "4",
    name: "Umbrella Co",
    company: "Umbrella Co",
    email: "ops@umbrella.com",
    projects: 1,
    openTickets: 1,
  },
];

export function Clients() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");

  const filtered = useMemo(() => {
    if (!query) return clients;
    const q = query.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [clients, query]);

  const addClient = () => {
    if (!name.trim() || !email.trim() || !company.trim()) return;
    setClients((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        name,
        company,
        email,
        projects: 0,
        openTickets: 0,
      },
      ...prev,
    ]);
    setOpen(false);
    setName("");
    setCompany("");
    setEmail("");
  };

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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-company">Company</Label>
                  <Input
                    id="client-company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@company.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addClient}>Create</Button>
              </DialogFooter>
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
            {filtered.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-border p-4 hover:bg-accent/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar name={c.name} role="client" showTooltip={false} />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.company}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {c.email}
                  </p>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Projects</span>
                    <span className="text-foreground font-medium">
                      {c.projects}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Open Tickets</span>
                    <span className="text-foreground font-medium">
                      {c.openTickets}
                    </span>
                  </div>
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
            {filtered.length === 0 && (
              <div className="col-span-full text-sm text-muted-foreground">
                No clients found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
