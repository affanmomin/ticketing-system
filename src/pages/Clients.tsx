import { useEffect, useMemo, useState } from "react";
import { Building2, Layers, ListPlus, Plus, Search, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import ClientForm from "@/components/forms/ClientForm";
import { ClientEditForm } from "@/components/forms/ClientEditForm";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import * as clientsApi from "@/api/clients";
import * as streamsApi from "@/api/streams";
import * as subjectsApi from "@/api/subjects";
import type { Client, Stream, Subject } from "@/types/api";

const PAGE_SIZE = 12;

type StreamFormState = {
  name: string;
  description: string;
  saving: boolean;
};

type SubjectFormState = StreamFormState;

export function Clients() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<"streams" | "subjects">("streams");
  const [taxonomyClient, setTaxonomyClient] = useState<Client | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [streamForm, setStreamForm] = useState<StreamFormState>({
    name: "",
    description: "",
    saving: false,
  });
  const [subjectForm, setSubjectForm] = useState<SubjectFormState>({
    name: "",
    description: "",
    saving: false,
  });

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function loadClients() {
    setLoading(true);
    try {
      const { data } = await clientsApi.list({ limit: PAGE_SIZE, offset });
      setClients(data.data);
      setTotal(data.total);
    } catch (error: any) {
      toast({
        title: "Failed to load clients",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.trim().toLowerCase();
    return clients.filter((client) =>
      [client.name, client.email || "", client.phone || ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [clients, search]);

  async function openTaxonomyDialog(client: Client, tab: "streams" | "subjects") {
    setActiveTab(tab);
    setTaxonomyClient(client);
    if (tab === "streams") {
      await fetchStreams(client.id);
    } else {
      await fetchSubjects(client.id);
    }
  }

  async function fetchStreams(clientId: string) {
    setStreamsLoading(true);
    try {
      const { data } = await streamsApi.listForClient(clientId, { limit: 100 });
      setStreams(data.data);
    } catch (error: any) {
      toast({
        title: "Failed to load streams",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setStreamsLoading(false);
    }
  }

  async function fetchSubjects(clientId: string) {
    setSubjectsLoading(true);
    try {
      const { data } = await subjectsApi.listForClient(clientId, { limit: 100 });
      setSubjects(data.data);
    } catch (error: any) {
      toast({
        title: "Failed to load subjects",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSubjectsLoading(false);
    }
  }

  async function handleCreateStream() {
    if (!taxonomyClient || !streamForm.name.trim()) return;
    setStreamForm((prev) => ({ ...prev, saving: true }));
    try {
      await streamsApi.createForClient(taxonomyClient.id, {
        name: streamForm.name.trim(),
        description: streamForm.description.trim() || undefined,
      });
      toast({ title: "Stream created" });
      setStreamForm({ name: "", description: "", saving: false });
      await fetchStreams(taxonomyClient.id);
    } catch (error: any) {
      toast({
        title: "Failed to create stream",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
      setStreamForm((prev) => ({ ...prev, saving: false }));
    }
  }

  async function handleCreateSubject() {
    if (!taxonomyClient || !subjectForm.name.trim()) return;
    setSubjectForm((prev) => ({ ...prev, saving: true }));
    try {
      await subjectsApi.createForClient(taxonomyClient.id, {
        name: subjectForm.name.trim(),
        description: subjectForm.description.trim() || undefined,
      });
      toast({ title: "Subject created" });
      setSubjectForm({ name: "", description: "", saving: false });
      await fetchSubjects(taxonomyClient.id);
    } catch (error: any) {
      toast({
        title: "Failed to create subject",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
      setSubjectForm((prev) => ({ ...prev, saving: false }));
    }
  }

  async function toggleStreamActive(stream: Stream, active: boolean) {
    try {
      await streamsApi.update(stream.id, { active });
      if (taxonomyClient) await fetchStreams(taxonomyClient.id);
    } catch (error: any) {
      toast({
        title: "Failed to update stream",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  async function toggleSubjectActive(subject: Subject, active: boolean) {
    try {
      await subjectsApi.update(subject.id, { active });
      if (taxonomyClient) await fetchSubjects(taxonomyClient.id);
    } catch (error: any) {
      toast({
        title: "Failed to update subject",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage client organizations, contacts, and work taxonomy"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create Client</DialogTitle>
                <DialogDescription>
                  Provide contact details for the organization you want to service.
                </DialogDescription>
              </DialogHeader>
              <ClientForm
                onSuccess={() => {
                  setCreateOpen(false);
                  loadClients();
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Client Directory
          </CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, phone"
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6} className="p-0">
                        <TableRowSkeleton columns={6} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No clients found. Create your first client to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.email || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.active ? "default" : "secondary"}>
                          {client.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.createdAt
                          ? new Date(client.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTaxonomyDialog(client, "streams")}
                          >
                            <Layers className="mr-2 h-4 w-4" />Streams
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTaxonomyDialog(client, "subjects")}
                          >
                            <ListPlus className="mr-2 h-4 w-4" />Subjects
                          </Button>
                          <Dialog open={editClient?.id === client.id} onOpenChange={(open) => !open && setEditClient(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditClient(client)}
                              >
                                <Settings2 className="mr-2 h-4 w-4" />Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Edit Client</DialogTitle>
                                <DialogDescription>
                                  Update general contact information and activation state.
                                </DialogDescription>
                              </DialogHeader>
                              <ClientEditForm
                                client={client}
                                onSuccess={() => {
                                  setEditClient(null);
                                  loadClients();
                                }}
                              />
                            </DialogContent>
                          </Dialog>
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={offset === 0 || loading}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages || loading}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!taxonomyClient}
        onOpenChange={(open) => {
          if (!open) {
            setTaxonomyClient(null);
            setStreams([]);
            setSubjects([]);
            setStreamForm({ name: "", description: "", saving: false });
            setSubjectForm({ name: "", description: "", saving: false });
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {taxonomyClient ? `Work Taxonomy · ${taxonomyClient.name}` : "Work Taxonomy"}
            </DialogTitle>
            <DialogDescription>
              Streams and subjects help categorize tickets for this client.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "streams" | "subjects")}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger
                value="streams"
                onClick={async () => {
                  if (taxonomyClient) await fetchStreams(taxonomyClient.id);
                }}
              >
                Streams
              </TabsTrigger>
              <TabsTrigger
                value="subjects"
                onClick={async () => {
                  if (taxonomyClient) await fetchSubjects(taxonomyClient.id);
                }}
              >
                Subjects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="streams" className="mt-6">
              <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-4 w-4" /> Streams
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[320px] pr-4">
                      {streamsLoading ? (
                        <p className="text-sm text-muted-foreground">Loading streams…</p>
                      ) : streams.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No streams yet. Create one using the form on the right.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {streams.map((stream) => (
                            <div
                              key={stream.id}
                              className="flex items-start justify-between rounded-lg border p-4"
                            >
                              <div>
                                <p className="font-medium">{stream.name}</p>
                                {stream.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {stream.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={stream.active ? "default" : "secondary"}>
                                  {stream.active ? "Active" : "Inactive"}
                                </Badge>
                                <Switch
                                  checked={stream.active}
                                  onCheckedChange={(checked) => toggleStreamActive(stream, checked)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Create Stream</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stream-name">Name</Label>
                      <Input
                        id="stream-name"
                        value={streamForm.name}
                        onChange={(event) =>
                          setStreamForm((prev) => ({ ...prev, name: event.target.value }))
                        }
                        placeholder="Onboarding"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stream-description">Description</Label>
                      <Textarea
                        id="stream-description"
                        value={streamForm.description}
                        onChange={(event) =>
                          setStreamForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                        placeholder="Optional details to help teams understand the stream"
                      />
                    </div>
                    <Button
                      onClick={handleCreateStream}
                      disabled={streamForm.saving || !streamForm.name.trim()}
                      className="w-full"
                    >
                      {streamForm.saving ? "Creating…" : "Create Stream"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subjects" className="mt-6">
              <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListPlus className="h-4 w-4" /> Subjects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[320px] pr-4">
                      {subjectsLoading ? (
                        <p className="text-sm text-muted-foreground">Loading subjects…</p>
                      ) : subjects.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No subjects yet. Create one using the form on the right.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {subjects.map((subject) => (
                            <div
                              key={subject.id}
                              className="flex items-start justify-between rounded-lg border p-4"
                            >
                              <div>
                                <p className="font-medium">{subject.name}</p>
                                {subject.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {subject.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={subject.active ? "default" : "secondary"}>
                                  {subject.active ? "Active" : "Inactive"}
                                </Badge>
                                <Switch
                                  checked={subject.active}
                                  onCheckedChange={(checked) => toggleSubjectActive(subject, checked)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Create Subject</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject-name">Name</Label>
                      <Input
                        id="subject-name"
                        value={subjectForm.name}
                        onChange={(event) =>
                          setSubjectForm((prev) => ({ ...prev, name: event.target.value }))
                        }
                        placeholder="Billing"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject-description">Description</Label>
                      <Textarea
                        id="subject-description"
                        value={subjectForm.description}
                        onChange={(event) =>
                          setSubjectForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                        placeholder="Optional context for the subject"
                      />
                    </div>
                    <Button
                      onClick={handleCreateSubject}
                      disabled={subjectForm.saving || !subjectForm.name.trim()}
                      className="w-full"
                    >
                      {subjectForm.saving ? "Creating…" : "Create Subject"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
