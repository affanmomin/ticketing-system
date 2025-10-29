// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
