// workspace-label.uc.js — Sine mod: shows the active workspace's name (and
// its emoji icon, if it has one) in the nav-bar, just to the right of the
// url bar. Zen's own workspace name/icon indicator only lives inside the
// (collapsible) sidebar, so it disappears whenever the sidebar is hidden.
//
// gZenWorkspaces.getActiveWorkspaceFromCache() is Zen's own source of truth
// for "which workspace is active right now" (see ZenSpaceManager.mjs) - read
// straight from it instead of re-deriving it from event payloads or sidebar
// DOM state, both of which are timing-sensitive. Zen dispatches
// "ZenWorkspacesUIUpdate" on window whenever the active workspace changes,
// is renamed, or the workspace list changes, so that's the refresh signal.
(function () {
  if (window.__zenWorkspaceLabelInstalled) return;
  window.__zenWorkspaceLabelInstalled = true;

  function ensureLabel() {
    let label = document.getElementById("zen-workspace-toolbar-label");
    if (label) return label;
    label = document.createXULElement("label");
    label.id = "zen-workspace-toolbar-label";
    label.setAttribute("crop", "end");
    const urlbarContainer = document.getElementById("urlbar-container");
    urlbarContainer.after(label);
    return label;
  }

  function update() {
    const label = ensureLabel();
    const zenWorkspaces = window.gZenWorkspaces;
    const workspaces = zenWorkspaces?.getWorkspaces?.() ?? [];
    if (!zenWorkspaces || workspaces.length <= 1) {
      // Nothing to disambiguate - stay out of the way.
      label.hidden = true;
      return;
    }
    const active = zenWorkspaces.getActiveWorkspaceFromCache?.();
    if (!active) {
      label.hidden = true;
      return;
    }
    const isSvgIcon = active.icon && active.icon.endsWith(".svg");
    const icon = active.icon && !isSvgIcon ? `${active.icon} ` : "";
    label.hidden = false;
    label.textContent = `${icon}${active.name ?? ""}`;
  }

  window.addEventListener("ZenWorkspacesUIUpdate", update, true);
  window.addEventListener("load", update, { once: true });
})();
