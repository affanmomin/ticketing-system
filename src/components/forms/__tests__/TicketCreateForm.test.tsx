import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@/test/utils";
import { TicketCreateForm } from "../TicketCreateForm";
import { getInMemory, resetInMemory } from "@/test/handlers";

describe("TicketCreateForm", () => {
  it("creates a ticket with minimal fields", async () => {
    resetInMemory();
    render(<TicketCreateForm />);

    // Wait for clients to load
    await waitFor(() => {
      const comboBoxes = screen.queryAllByRole("combobox");
      expect(comboBoxes.length).toBeGreaterThan(0);
    });

    // Step 1: Select client, project, stream, and subject
    const comboBoxes = screen.getAllByRole("combobox");
    
    // Select client
    const clientTrigger = comboBoxes[0];
    await userEvent.click(clientTrigger);
    const clientOption = await screen.findByRole("option", { name: "Acme Co" });
    await userEvent.click(clientOption);

    // Wait for project combobox to be enabled
    await waitFor(() => {
      const projectComboBoxes = screen.queryAllByRole("combobox");
      expect(projectComboBoxes.length).toBeGreaterThan(1);
    });

    // Select project
    const projectComboBoxes = screen.getAllByRole("combobox");
    const projectTrigger = projectComboBoxes[1];
    await userEvent.click(projectTrigger);
    const projectOption = await screen.findByRole("option", {
      name: /Website \(WEB\)/i,
    });
    await userEvent.click(projectOption);

    // Wait for streams and subjects to load
    await waitFor(() => {
      const allComboBoxes = screen.queryAllByRole("combobox");
      expect(allComboBoxes.length).toBeGreaterThan(2);
    });

    // Select stream
    const allComboBoxes = screen.getAllByRole("combobox");
    const streamTrigger = allComboBoxes[2];
    await userEvent.click(streamTrigger);
    const streamOption = await screen.findByRole("option", { name: /Onboarding/i });
    await userEvent.click(streamOption);

    // Select subject
    await waitFor(() => {
      const subjectComboBoxes = screen.queryAllByRole("combobox");
      expect(subjectComboBoxes.length).toBeGreaterThan(3);
    });
    const subjectComboBoxes = screen.getAllByRole("combobox");
    const subjectTrigger = subjectComboBoxes[3];
    await userEvent.click(subjectTrigger);
    const subjectOption = await screen.findByRole("option", { name: /Billing/i });
    await userEvent.click(subjectOption);

    // Navigate to step 2 (title and description)
    const nextButton = await screen.findByRole("button", { name: /next/i });
    await waitFor(() => expect(nextButton).toBeEnabled());
    await userEvent.click(nextButton);

    // Wait for step 2 inputs
    await waitFor(() => {
      const textboxes = screen.queryAllByRole("textbox");
      expect(textboxes.length).toBeGreaterThan(0);
    });

    // Fill in title and description
    const textboxes = screen.getAllByRole("textbox");
    const title = textboxes.find((el) => {
      const input = el as HTMLInputElement;
      return input.type === "text" || input.tagName.toLowerCase() === "input";
    }) || textboxes[0];
    const desc =
      textboxes.find((el) => el.tagName.toLowerCase() === "textarea") ||
      textboxes[1];
    
    await userEvent.type(title, "Broken link");
    await userEvent.type(desc, "The homepage link is broken");

    // Navigate to step 3 (priority, status, assignee)
    const nextButton2 = await screen.findByRole("button", { name: /next/i });
    await waitFor(() => expect(nextButton2).toBeEnabled());
    await userEvent.click(nextButton2);

    // Wait for step 3 and then finish
    await waitFor(() => {
      const finishButton = screen.queryByRole("button", { name: /create ticket|finish/i });
      expect(finishButton).toBeInTheDocument();
    });

    // Submit the form
    const finishButton = screen.getByRole("button", { name: /create ticket|finish/i });
    await waitFor(() => expect(finishButton).toBeEnabled());
    await userEvent.click(finishButton);

    await waitFor(() => {
      expect(getInMemory().ticketsCreated.length).toBe(1);
    });
  });
});
