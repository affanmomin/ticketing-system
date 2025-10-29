import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@/test/utils";
import { TicketCreateForm } from "../TicketCreateForm";
import { getInMemory, resetInMemory } from "@/test/handlers";

describe("TicketCreateForm", () => {
  it("creates a ticket with minimal fields", async () => {
    resetInMemory();
    render(<TicketCreateForm />);

    // Wait for inputs to render
    const textboxes = await screen.findAllByRole("textbox");
    const title = textboxes[0];
    const desc =
      textboxes.find((el) => el.tagName.toLowerCase() === "textarea") ||
      textboxes[1];
    await userEvent.type(title, "Broken link");
    await userEvent.type(desc, "The homepage link is broken");

    // Select explicit client and project to satisfy required fields
    const comboBoxes = screen.getAllByRole("combobox");
    const clientTrigger = comboBoxes[0];
    await userEvent.click(clientTrigger);
    const clientOption = await screen.findByRole("option", { name: "Acme Co" });
    await userEvent.click(clientOption);

    const projectTrigger = comboBoxes[1];
    await userEvent.click(projectTrigger);
    const projectOption = await screen.findByRole("option", {
      name: /Website \(WEB\)/i,
    });
    await userEvent.click(projectOption);

    const save = screen.getByRole("button", { name: /save/i });
    await waitFor(() => expect(save).toBeEnabled());
    await userEvent.click(save);

    await waitFor(() => {
      expect(getInMemory().ticketsCreated.length).toBe(1);
    });
  });
});
