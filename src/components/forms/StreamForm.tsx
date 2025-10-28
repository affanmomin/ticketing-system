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

const PROJECTS = [
  { id: "p1", name: "Website", code: "ACM" },
  { id: "p2", name: "Mobile", code: "MOB" },
];

export function StreamForm() {
  const [name, setName] = useState("");
  const [project, setProject] = useState(PROJECTS[0].id);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Stream</h2>
        <p className="text-sm text-muted-foreground">Create or edit a stream</p>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Stream name{" "}
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
          <Label>Project</Label>
          <Select value={project} onValueChange={(v) => setProject(String(v))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {PROJECTS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost">Cancel</Button>
        <Button>Save</Button>
      </div>
    </div>
  );
}

export default StreamForm;
