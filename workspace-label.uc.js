// workspace-label.uc.js — Sine mod: shows the active workspace's name (and
// its emoji icon, if it has one) in the nav-bar, just to the right of the
// url bar. Zen's own workspace name/icon indicator only lives inside the
// (collapsible) sidebar, so it disappears whenever the sidebar is hidden.
//
// gZenWorkspaces.addChangeListeners() is Zen's own hook for "a workspace
// switch just finished" (see #updateWorkspaceState in ZenSpaceManager.mjs) -
// it fires on every switch and hands us the new workspace directly, so
// there's no re-query needed. "ZenWorkspacesUIUpdate", used in an earlier
// version of this mod, looked like the right event but Zen only actually
// dispatches it during session-restore/init - it never fires on a plain
// Ctrl+H/L or icon-click switch, which is why the label used to go stale.
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

  window.addEventListener(
    "load",
    () => {
      update();
      window.gZenWorkspaces?.addChangeListeners(({ workspace }) => {
        render(workspace, window.gZenWorkspaces.getWorkspaces().length);
      });
    },
    { once: true }
  );

  // Safety net for cases that aren't a "switch" but still change what should
  // be displayed - the workspace list changing (add/remove) or a rename.
  window.addEventListener("ZenWorkspacesUIUpdate", update, true);
  window.addEventListener("ZenWorkspaceDataChanged", update, true);
})();
