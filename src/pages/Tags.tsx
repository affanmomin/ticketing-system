import { useEffect, useMemo, useState } from "react";
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
import { Tag as TagIcon, Plus, Pencil, Trash2, Search } from "lucide-react";
import { TagBadge } from "@/components/TagBadge";
import * as tagsApi from "@/api/tags";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";

type TagItem = { id: string; name: string; color: string };

export function Tags() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TagItem | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await tagsApi.list();
      setTags(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return tags;
    return tags.filter((t) =>
      t.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, tags]);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setColor("#3B82F6");
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (t: TagItem) => {
    setEditing(t);
    setName(t.name);
    setColor(t.color);
    setOpen(true);
  };

  const saveTag = async () => {
    if (!name.trim()) return;
    try {
      if (editing) {
        // No PATCH endpoint provided; simulate by delete+create or just create anew (skipping edit)
        toast({ title: "Editing tags is not supported yet" });
      } else {
        await tagsApi.create({ name, color });
      }
      setOpen(false);
      resetForm();
      await load();
    } catch (e: any) {
      toast({
        title: "Failed to save tag",
        description: e?.response?.data?.message || "Error",
      });
    }
  };

  const removeTag = async (id: string) => {
    await tagsApi.remove(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tags"
        description="Manage labels to organize tickets"
        actions={
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                New Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Tag" : "Create Tag"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tag-name">Name</Label>
                  <Input
                    id="tag-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. bug"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag-color">Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="tag-color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-12 rounded border border-border bg-transparent p-1"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <TagBadge name={name || "preview"} color={color} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={saveTag}>{editing ? "Save" : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between w-full text-muted-foreground">
            <span className="flex items-center gap-2 text-muted-foreground">
              <TagIcon className="w-4 h-4" />
              All Tags
            </span>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                className="pl-8 w-56"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading && (
              <div className="col-span-full text-sm text-muted-foreground">
                Loading…
              </div>
            )}
            {!loading &&
              filtered.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-5 w-5 rounded"
                      style={{ backgroundColor: t.color }}
                    />
                    <TagBadge name={t.name} color={t.color} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(t)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeTag(t.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            {!loading && filtered.length === 0 && (
              <div className="col-span-full text-sm text-muted-foreground">
                No tags found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
