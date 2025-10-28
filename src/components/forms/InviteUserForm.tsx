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

const CLIENTS = [
  { id: "c1", name: "Acme Co" },
  { id: "c2", name: "Globex" },
];

export function InviteUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "EMPLOYEE" | "CLIENT">("EMPLOYEE");
  const [client, setClient] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Invite User</h2>
        <p className="text-sm text-muted-foreground">
          Invite a new user to the workspace
        </p>
      </div>

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
            Email{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-required="true"
          />
        </div>

        <div className="space-y-2">
          <Label>
            Role <span aria-hidden className="text-red-400">*</span>
          </Label>
          <Select value={role} onValueChange={(v) => setRole(v as any)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
              <SelectItem value="CLIENT">CLIENT</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Role determines permissions.
          </p>
        </div>

        {role === "CLIENT" && (
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

      <div className="flex gap-2 justify-end">
        <Button variant="ghost">Cancel</Button>
        <Button>Invite</Button>
      </div>
    </div>
  );
}

export default InviteUserForm;
