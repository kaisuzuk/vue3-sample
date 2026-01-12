import { setupWorker } from "msw/browser";
import {
  getCurrentScenario,
  getHandlersForScenario,
} from "@fe-libs/mocks/scenarioManager";

// 現在選択されているシナリオの handler を取得
const currentScenario = getCurrentScenario();
const handlers = getHandlersForScenario(currentScenario);

console.log(`[MSW] Starting with scenario: ${currentScenario}`);

export const worker = setupWorker(...handlers);
