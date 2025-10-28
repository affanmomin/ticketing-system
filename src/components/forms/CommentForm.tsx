import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CommentForm() {
  const [text, setText] = useState("");
  // file preview not used in static UI

  return (
    <form className="flex items-start gap-3">
      <div className="flex-1">
        <Label>
          Comment{" "}
          <span aria-hidden className="text-red-400">
            *
          </span>
        </Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-required="true"
        />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Input type="file" />
        <Button>Add comment</Button>
      </div>
    </form>
  );
}

export default CommentForm;
