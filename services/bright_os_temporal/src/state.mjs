export const PREVIEW_TASK_QUEUE = "bright-os-preview";
export const PROMOTION_TASK_QUEUE = "bright-os-promotion";
export const STATE_QUERY = "state";
export const EVENT_SIGNAL = "event";

const MAX_EVENTS = 100;

export function previewWorkflowId(branch) {
  return `bright-os:preview:${branch}`;
}

export function promotionWorkflowId(target, sha) {
  return `bright-os:promotion:${target}:${sha}`;
}

export function createPreviewState(input) {
  const state = {
    type: "branch-preview",
    workflowId: previewWorkflowId(input.branch),
    taskQueue: PREVIEW_TASK_QUEUE,
    branch: input.branch,
    lastSha: input.sha ?? "",
    status: "branch_pushed",
    terminal: false,
    checks: "not_started",
    previewDeploy: "not_started",
    slot: "",
    events: []
  };
  return applyPreviewEvent(state, {
    type: "branch_pushed",
    sha: input.sha,
    source: input.source ?? "workflow-start",
    at: input.at
  });
}

export function applyPreviewEvent(state, rawEvent) {
  const event = normalizeEvent(rawEvent);
  if (event.sha) state.lastSha = event.sha;
  remember(state, event);

  if (event.slot) state.slot = event.slot;

  switch (event.type) {
    case "branch_pushed":
      state.status = "branch_pushed";
      state.terminal = false;
      break;
    case "checks_started":
      state.checks = "running";
      state.status = "checks_started";
      break;
    case "checks_passed":
      state.checks = "passed";
      state.status = state.previewDeploy === "passed" ? "ready_for_review" : "checks_passed";
      break;
    case "checks_failed":
      state.checks = "failed";
      state.status = "waiting_for_fix";
      break;
    case "preview_deploy_started":
      state.previewDeploy = "running";
      state.status = "preview_deploy_started";
      break;
    case "preview_deploy_passed":
      state.previewDeploy = "passed";
      state.status = "ready_for_review";
      break;
    case "preview_deploy_failed":
      state.previewDeploy = "failed";
      state.status = "waiting_for_fix";
      break;
    case "pr_merged":
      state.status = "accepted_for_dev";
      break;
    case "slot_released":
    case "released":
      state.status = "released";
      state.terminal = true;
      break;
    case "branch_deleted":
      state.status = "branch_deleted";
      state.terminal = true;
      break;
    default:
      state.status = event.type;
  }

  return state;
}

export function createPromotionState(input) {
  const state = {
    type: "promotion",
    workflowId: promotionWorkflowId(input.target, input.sha),
    taskQueue: PROMOTION_TASK_QUEUE,
    target: input.target,
    sha: input.sha,
    status: "promotion_started",
    terminal: false,
    deploy: "not_started",
    events: []
  };
  return applyPromotionEvent(state, {
    type: "promotion_started",
    sha: input.sha,
    source: input.source ?? "workflow-start",
    at: input.at
  });
}

export function applyPromotionEvent(state, rawEvent) {
  const event = normalizeEvent(rawEvent);
  remember(state, event);

  switch (event.type) {
    case "promotion_started":
      state.status = "promotion_started";
      break;
    case "dev_deploy_started":
    case "prod_deploy_started":
      state.deploy = "running";
      state.status = event.type;
      break;
    case "dev_deploy_passed":
    case "prod_deploy_passed":
      state.deploy = "passed";
      state.status = event.type;
      break;
    case "dev_deploy_failed":
    case "prod_deploy_failed":
      state.deploy = "failed";
      state.status = "waiting_for_fix";
      break;
    case "released":
      state.status = "released";
      state.terminal = true;
      break;
    default:
      state.status = event.type;
  }

  return state;
}

function normalizeEvent(event) {
  return {
    ...event,
    type: String(event?.type ?? "unknown"),
    at: event?.at ?? ""
  };
}

function remember(state, event) {
  state.events.push(event);
  if (state.events.length > MAX_EVENTS) state.events.shift();
}
