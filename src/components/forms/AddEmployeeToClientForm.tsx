import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const USERS = [
  { id: "u1", name: "Dev One" },
  { id: "u2", name: "Dev Two" },
];
const CLIENTS = [
  { id: "c1", name: "Acme Co" },
  { id: "c2", name: "Globex" },
];

export function AddEmployeeToClientForm() {
  const [formState, setFormState] = useState({
    employee: "",
    client: CLIENTS[0].id,
    saving: false,
  });

  async function handleSave() {
    if (!formState.employee) return;
    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      // Add API call here when available
      console.log("Adding employee to client:", formState);
    } finally {
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Add Employee to Client</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Employee{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Select
            value={formState.employee}
            onValueChange={(v) =>
              setFormState((prev) => ({ ...prev, employee: v }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select employee</SelectItem>
              {USERS.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>
            Client{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
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
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" disabled={formState.saving}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!formState.employee || formState.saving}
        >
          {formState.saving ? "Adding…" : "Add"}
        </Button>
      </div>
    </div>
  );
}

export default AddEmployeeToClientForm;
