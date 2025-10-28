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
  const [name, setName] = useState("");
  const [color, setColor] = useState("#8b5cf6");
  const [global, setGlobal] = useState(false);
  const [client, setClient] = useState(CLIENTS[0].id);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Tag</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Name{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-required="true"
          />
        </div>

        <div className="space-y-2">
          <Label>Scope</Label>
          <div className="flex items-center gap-4">
            <Checkbox
              checked={global}
              onCheckedChange={(v) => setGlobal(Boolean(v))}
            />
            <span>Global</span>
          </div>
        </div>

        {!global && (
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={client} onValueChange={(v) => setClient(String(v))}>
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
      </form>

      <div className="flex items-center gap-3">
        <div className="w-8 h-6 rounded" style={{ background: color }} />
        <div className="text-sm text-muted-foreground">Preview</div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost">Cancel</Button>
        <Button>Save</Button>
      </div>
    </div>
  );
}

export default TagForm;
