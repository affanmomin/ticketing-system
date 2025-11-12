import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import * as streamsApi from "@/api/streams";
import type { Stream } from "@/types/api";

interface StreamSelectorProps {
  projectId: string;
  value: string;
  onValueChange: (streamId: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function StreamSelector({
  projectId,
  value,
  onValueChange,
  disabled = false,
  required = false,
}: StreamSelectorProps) {
  const [parentStreams, setParentStreams] = useState<Stream[]>([]);
  const [childStreams, setChildStreams] = useState<Stream[]>([]);
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [loadingParents, setLoadingParents] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load parent streams on mount
  useEffect(() => {
    if (!projectId) return;

    const fetchParents = async () => {
      setLoadingParents(true);
      setError(null);
      try {
        const { data } = await streamsApi.listParentsForProject(projectId);
        setParentStreams(data);
      } catch (err: any) {
        console.error("Failed to fetch parent streams:", err);
        setError("Failed to load stream categories");
      } finally {
        setLoadingParents(false);
      }
    };

    fetchParents();
  }, [projectId]);

  // Load child streams when parent changes
  useEffect(() => {
    if (!selectedParent) {
      setChildStreams([]);
      return;
    }

    const fetchChildren = async () => {
      setLoadingChildren(true);
      setError(null);
      try {
        const { data } = await streamsApi.listChildren(selectedParent);
        setChildStreams(data);

        // If no children, automatically use parent as the value
        if (data.length === 0) {
          onValueChange(selectedParent);
        }
      } catch (err: any) {
        console.error("Failed to fetch child streams:", err);
        setError("Failed to load stream types");
        setChildStreams([]);
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildren();
  }, [selectedParent]); // Removed onValueChange from dependencies

  // Initialize from value prop
  useEffect(() => {
    if (!value || parentStreams.length === 0) return;

    // Find if value is a parent or child
    const isParent = parentStreams.some((p) => p.id === value);

    if (isParent) {
      setSelectedParent(value);
      setSelectedChild("");
    } else {
      // Need to find parent for this child
      parentStreams.forEach((parent) => {
        streamsApi.listChildren(parent.id).then(({ data: children }) => {
          const isChild = children.some((c) => c.id === value);
          if (isChild) {
            setSelectedParent(parent.id);
            setSelectedChild(value);
          }
        });
      });
    }
  }, [value, parentStreams]);

  // Update parent component when selection changes
  useEffect(() => {
    if (selectedChild) {
      onValueChange(selectedChild);
    } else if (
      selectedParent &&
      childStreams.length === 0 &&
      !loadingChildren
    ) {
      onValueChange(selectedParent);
    }
  }, [selectedChild, selectedParent, childStreams.length, loadingChildren]); // Removed onValueChange, use length instead of array

  const handleParentChange = (parentId: string) => {
    setSelectedParent(parentId);
    setSelectedChild("");
  };

  const handleChildChange = (childId: string) => {
    setSelectedChild(childId);
  };

  const selectedParentStream = parentStreams.find(
    (s) => s.id === selectedParent
  );
  const selectedChildStream = childStreams.find((s) => s.id === selectedChild);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Dropdown 1: Parent Streams */}
      <div className="space-y-2">
        <Label htmlFor="parent-stream">Stream Category {required && "*"}</Label>
        <Select
          value={selectedParent}
          onValueChange={handleParentChange}
          disabled={disabled || loadingParents}
        >
          <SelectTrigger id="parent-stream">
            {loadingParents ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading categories...</span>
              </div>
            ) : (
              <SelectValue placeholder="-- Select Category --" />
            )}
          </SelectTrigger>
          <SelectContent>
            {parentStreams.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                No streams found. Create streams in the project workspace first.
              </div>
            ) : (
              parentStreams.map((stream) => (
                <SelectItem key={stream.id} value={stream.id}>
                  {stream.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {selectedParentStream?.description && (
          <p className="text-xs text-muted-foreground">
            {selectedParentStream.description}
          </p>
        )}
      </div>

      {/* Dropdown 2: Child Streams (conditional) */}
      {selectedParent && (
        <div className="space-y-2">
          <Label htmlFor="child-stream">
            Stream Type{" "}
            {childStreams.length > 0 && required ? "*" : "(Optional)"}
          </Label>
          {loadingChildren ? (
            <div className="flex items-center gap-2 p-3 border rounded-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Loading options...
              </span>
            </div>
          ) : childStreams.length > 0 ? (
            <>
              <Select
                value={selectedChild}
                onValueChange={handleChildChange}
                disabled={disabled}
              >
                <SelectTrigger id="child-stream">
                  <SelectValue placeholder="-- Select Type --" />
                </SelectTrigger>
                <SelectContent>
                  {childStreams.map((stream) => (
                    <SelectItem key={stream.id} value={stream.id}>
                      {stream.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedChildStream?.description && (
                <p className="text-xs text-muted-foreground">
                  {selectedChildStream.description}
                </p>
              )}
            </>
          ) : (
            <div className="p-3 border rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">
                No sub-categories available. Using "{selectedParentStream?.name}
                " directly.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Visual indicator of selected stream path */}
      {selectedParent && (selectedChild || childStreams.length === 0) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Selected:</span>
          <span>
            {selectedParentStream?.name}
            {selectedChild &&
              selectedChildStream &&
              ` > ${selectedChildStream.name}`}
          </span>
        </div>
      )}
    </div>
  );
}
