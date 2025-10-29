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
      // Add API call here when available
      // await tagsApi.create({ ... });
      console.log("Saving tag:", formState);
    } finally {
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Tag</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Name{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Input
            value={formState.name}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, name: e.target.value }))
            }
            aria-required="true"
          />
        </div>

        <div className="space-y-2">
          <Label>
            Color{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Input
            type="color"
            value={formState.color}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, color: e.target.value }))
            }
            aria-required="true"
          />
        </div>

        <div className="space-y-2">
          <Label>Scope</Label>
          <div className="flex items-center gap-4">
            <Checkbox
              checked={formState.global}
              onCheckedChange={(v) =>
                setFormState((prev) => ({ ...prev, global: Boolean(v) }))
              }
            />
            <span>Global</span>
          </div>
        </div>

        {!formState.global && (
          <div className="space-y-2">
            <Label>Client</Label>
            <Select
              value={formState.client}
              onValueChange={(v) =>
                setFormState((prev) => ({ ...prev, client: String(v) }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {CLIENTS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-8 h-6 rounded"
          style={{ background: formState.color }}
        />
        <div className="text-sm text-muted-foreground">Preview</div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" disabled={formState.saving}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!formState.name.trim() || formState.saving}
        >
          {formState.saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default TagForm;
