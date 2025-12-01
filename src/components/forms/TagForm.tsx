import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const CLIENTS = [
  { id: "c1", name: "Acme Co" },
  { id: "c2", name: "Globex" },
];

export function TagForm() {
  const [formState, setFormState] = useState({
    name: "",
    color: "#8b5cf6",
    global: false,
    client: CLIENTS[0].id,
    saving: false,
  });

  async function handleSave() {
    if (!formState.name.trim()) return;
    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      console.log("Saving tag:", formState);
    } finally {
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Create Tag</h2>
        <p className="text-sm text-muted-foreground">
          Add a new tag for organizing and categorizing tickets
        </p>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tag-name" className="text-sm font-medium">
              Tag Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="tag-name"
              placeholder="e.g., Bug, Feature, Enhancement"
              value={formState.name}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, name: e.target.value }))
              }
              aria-required="true"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag-color" className="text-sm font-medium">
              Color
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="flex gap-3 items-center">
              <Input
                id="tag-color"
                type="color"
                value={formState.color}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, color: e.target.value }))
                }
                aria-required="true"
                className="h-10 w-20 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-md border shadow-sm"
                  style={{ background: formState.color }}
                />
                <span className="text-sm text-muted-foreground font-mono">
                  {formState.color}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="space-y-0.5">
            <Label htmlFor="tag-global" className="text-sm font-medium">
              Global Tag
            </Label>
            <p className="text-xs text-muted-foreground">
              Make this tag available across all clients
            </p>
          </div>
          <Checkbox
            id="tag-global"
            checked={formState.global}
            onCheckedChange={(v) =>
              setFormState((prev) => ({ ...prev, global: Boolean(v) }))
            }
          />
        </div>

        {!formState.global && (
          <div className="space-y-2">
            <Label htmlFor="tag-client" className="text-sm font-medium">
              Client
            </Label>
            <Select
              value={formState.client}
              onValueChange={(v) =>
                setFormState((prev) => ({ ...prev, client: String(v) }))
              }
            >
              <SelectTrigger id="tag-client" className="w-full h-10">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {CLIENTS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This tag will only be available for the selected client
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={formState.saving}
          className="min-w-[80px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!formState.name.trim() || formState.saving}
          className="min-w-[80px]"
        >
          {formState.saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving
            </span>
          ) : (
            "Create Tag"
          )}
        </Button>
      </div>
    </div>
  );
}

export default TagForm;
