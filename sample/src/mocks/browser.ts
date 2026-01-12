import { setupWorker } from "msw/browser";
import { handlers } from "@fe-libs/mocks/handlers";

export const worker = setupWorker(...handlers);
