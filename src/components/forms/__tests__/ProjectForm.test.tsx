import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@/test/utils";
import { ProjectForm } from "../ProjectForm";
import { getInMemory, resetInMemory } from "@/test/handlers";

describe("ProjectForm", () => {
  it("loads clients and saves a project", async () => {
    resetInMemory();
    render(<ProjectForm />);

    // waits clients to load and default selected
    // Fill inputs
    const textboxes = await screen.findAllByRole("textbox");
    const name = textboxes[0];
    const code = textboxes[1];
    await userEvent.type(name, "Website Revamp");
    await userEvent.type(code, "WRV");

    // Select a client to ensure form is valid
    const [clientTrigger] = screen.getAllByRole("combobox");
    await userEvent.click(clientTrigger);
    const clientOption = await screen.findByRole("option", { name: "Acme Co" });
    await userEvent.click(clientOption);

    const save = screen.getByRole("button", { name: /save/i });
    await waitFor(() => expect(save).toBeEnabled());
    await userEvent.click(save);

    await waitFor(() => {
      expect(getInMemory().projectsCreated.length).toBe(1);
    });
  });
});
