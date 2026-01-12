import { mastersHandlers } from "./masters.handlers";
import { tasksHandlers } from "./tasks.handlers";

export const handlers = [...mastersHandlers, ...tasksHandlers];
