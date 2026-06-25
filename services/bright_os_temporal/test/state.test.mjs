import test from "node:test";
import assert from "node:assert/strict";
import { applyPreviewEvent, applyPromotionEvent, createPreviewState, createPromotionState } from "../src/state.mjs";

test("preview deploy failure is retained as waiting_for_fix", () => {
  const state = createPreviewState({ branch: "codex/fake", sha: "a1" });
  applyPreviewEvent(state, { type: "checks_started", sha: "a1" });
  applyPreviewEvent(state, { type: "checks_passed", sha: "a1" });
  applyPreviewEvent(state, { type: "preview_deploy_started", sha: "a1", slot: "A" });
  applyPreviewEvent(state, { type: "preview_deploy_failed", sha: "a1" });

  assert.equal(state.status, "waiting_for_fix");
  assert.equal(state.checks, "passed");
  assert.equal(state.previewDeploy, "failed");
  assert.equal(state.slot, "A");
});

test("promotion failure does not complete workflow", () => {
  const state = createPromotionState({ target: "dev", sha: "b1" });
  applyPromotionEvent(state, { type: "dev_deploy_started", sha: "b1" });
  applyPromotionEvent(state, { type: "dev_deploy_failed", sha: "b1" });

  assert.equal(state.status, "waiting_for_fix");
  assert.equal(state.deploy, "failed");
  assert.equal(state.terminal, false);
});
