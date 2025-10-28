import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TicketEditForm from "@/components/forms/TicketEditForm";
import CommentForm from "@/components/forms/CommentForm";
import AttachmentUpload from "@/components/forms/AttachmentUpload";

export default function TicketDrawer({
  role = "ADMIN" as "ADMIN" | "EMPLOYEE" | "CLIENT",
  ticketId,
}: {
  role?: "ADMIN" | "EMPLOYEE" | "CLIENT";
  ticketId?: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full md:w-2/3 lg:w-1/2">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <TicketEditForm role={role} />
          </TabsContent>
          <TabsContent value="comments">
            <div className="space-y-4">
              <div className="space-y-2">
                {/* mock comments */}
                <div className="text-sm">John: Looks good</div>
                <div className="text-sm">Jane: Please add tests</div>
              </div>
              <CommentForm ticketId={ticketId} />
            </div>
          </TabsContent>
          <TabsContent value="attachments">
            <AttachmentUpload ticketId={ticketId} />
          </TabsContent>
          <TabsContent value="activity">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>2025-10-22 — Ticket created</div>
              <div>2025-10-23 — Assigned to Dev One</div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
