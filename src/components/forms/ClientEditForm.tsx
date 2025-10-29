import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import * as clientsApi from "@/api/clients";

type Client = {
  id: string;
  name: string;
  domain?: string | null;
  active: boolean;
};

type ClientEditFormProps = {
  client: Client;
  onSuccess?: () => void;
};

export function ClientEditForm({ client, onSuccess }: ClientEditFormProps) {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    name: "",
    domain: "",
    active: true,
    saving: false,
  });

  useEffect(() => {
    setFormState({
      name: client.name,
      domain: client.domain || "",
      active: client.active,
      saving: false,
    });
  }, [client]);

  const handleUpdate = async () => {
    if (!formState.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Client name is required",
        variant: "destructive",
      });
      return;
    }

    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      await clientsApi.update(client.id, {
        name: formState.name,
        domain: formState.domain || undefined,
        active: formState.active,
      });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update client",
        variant: "destructive",
      });
    } finally {
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Client Name</Label>
        <Input
          id="name"
          value={formState.name}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter client name"
        />
      </div>

      <div>
        <Label htmlFor="domain">Domain</Label>
        <Input
          id="domain"
          value={formState.domain}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, domain: e.target.value }))
          }
          placeholder="example.com"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="active">Active Status</Label>
        <Switch
          id="active"
          checked={formState.active}
          onCheckedChange={(checked) =>
            setFormState((prev) => ({ ...prev, active: checked }))
          }
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button onClick={handleUpdate} disabled={formState.saving}>
          {formState.saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
