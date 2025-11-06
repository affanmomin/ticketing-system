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
import { toast } from "@/hooks/use-toast";

const USERS = [
  { id: "u1", name: "Dev One" },
  { id: "u2", name: "Dev Two" },
];
const CLIENTS = [
  { id: "c1", name: "Acme Co" },
  { id: "c2", name: "Globex" },
];

export function AddEmployeeToClientForm({
  onCancel,
}: {
  onCancel?: () => void;
}) {
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
      toast({
        title: "Success",
        description: "Employee assigned to client successfully",
      });
    } catch (e: any) {
      toast({
        title: "Failed to assign employee",
        description: e?.response?.data?.message || "Error",
        variant: "destructive",
      });
    } finally {
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">
          Assign Employee to Client
        </h2>
        <p className="text-sm text-muted-foreground">
          Grant an employee access to a specific client
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Form Fields */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="employee-select" className="text-sm font-medium">
              Employee
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              value={formState.employee}
              onValueChange={(v) =>
                setFormState((prev) => ({ ...prev, employee: v }))
              }
            >
              <SelectTrigger id="employee-select" className="w-full h-10">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {USERS.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-select" className="text-sm font-medium">
              Client
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              value={formState.client}
              onValueChange={(v) =>
                setFormState((prev) => ({ ...prev, client: String(v) }))
              }
            >
              <SelectTrigger id="client-select" className="w-full h-10">
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
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={formState.saving}
          className="min-w-[80px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!formState.employee || formState.saving}
          className="min-w-[100px]"
        >
          {formState.saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Adding
            </span>
          ) : (
            "Assign Employee"
          )}
        </Button>
      </div>
    </div>
  );
}

export default AddEmployeeToClientForm;
