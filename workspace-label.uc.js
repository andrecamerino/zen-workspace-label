// workspace-label.uc.js — Sine mod: shows the active workspace's name (and
// its emoji icon, if it has one) in the nav-bar, just to the right of the
// url bar. Zen's own workspace name/icon indicator only lives inside the
// (collapsible) sidebar, so it disappears whenever the sidebar is hidden.
//
// Update trigger: Zen writes the active workspace's uuid to the
// "zen.workspaces.active" pref on every switch, unconditionally, in the
// `activeWorkspace` setter (ZenSpaceManager.mjs) - unlike its own UI events
// ("ZenWorkspacesUIUpdate" only fires during session-restore/init, and
// gZenWorkspaces.addChangeListeners isn't guaranteed to exist across
// versions), this pref write isn't gated to anything and is stable browser
// plumbing rather than an internal implementation detail, so it's the one
// thing that reliably fires on a plain Ctrl+H/L or icon-click switch.
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

  function render(workspace, workspaceCount) {
    const label = ensureLabel();
    if (!workspace || workspaceCount <= 1) {
      // Nothing to disambiguate - stay out of the way.
      label.hidden = true;
      return;
    }
    const isSvgIcon = workspace.icon && workspace.icon.endsWith(".svg");
    const icon = workspace.icon && !isSvgIcon ? `${workspace.icon} ` : "";
    label.hidden = false;
    label.textContent = `${icon}${workspace.name ?? ""}`;
  }

  function update() {
    const zenWorkspaces = window.gZenWorkspaces;
    const workspaces = zenWorkspaces?.getWorkspaces?.() ?? [];
    render(zenWorkspaces?.getActiveWorkspaceFromCache?.(), workspaces.length);
  }

  const prefObserver = { observe: update };
  Services.prefs.addObserver("zen.workspaces.active", prefObserver);
  window.addEventListener(
    "unload",
    () => Services.prefs.removeObserver("zen.workspaces.active", prefObserver),
    { once: true }
  );

  // Covers list-level changes (rename/add/remove) that don't touch the pref.
  window.addEventListener("ZenWorkspacesUIUpdate", update, true);
  window.addEventListener("ZenWorkspaceDataChanged", update, true);

  window.addEventListener("load", update, { once: true });
})();
