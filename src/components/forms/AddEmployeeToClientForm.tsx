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
  const [employee, setEmployee] = useState("");
  const [client, setClient] = useState(CLIENTS[0].id);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Add Employee to Client</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Employee <span aria-hidden className="text-red-400">*</span>
          </Label>
          <Select value={employee} onValueChange={(v) => setEmployee(v)}>
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
            Client <span aria-hidden className="text-red-400">*</span>
          </Label>
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
      </form>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost">Cancel</Button>
        <Button>Add</Button>
      </div>
    </div>
  );
}

export default AddEmployeeToClientForm;
