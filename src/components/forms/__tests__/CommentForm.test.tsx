import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@/test/utils";
import { CommentForm } from "../CommentForm";
import { getInMemory, resetInMemory } from "@/test/handlers";

describe("CommentForm", () => {
  it("posts a comment", async () => {
    resetInMemory();
    render(<CommentForm ticketId="tk_1" />);

    const textarea = await screen.findByRole("textbox");
    await userEvent.type(textarea, "Nice work");
    const button = screen.getByRole("button", { name: /add comment/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(getInMemory().commentsCreated.length).toBe(1);
    });
  });
});
