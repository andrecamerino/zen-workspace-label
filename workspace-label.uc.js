// workspace-label.uc.js — Sine mod: shows the active workspace's name in the
// top toolbar. Zen's own workspace name/icon indicator only lives inside the
// (collapsible) sidebar, so it disappears whenever the sidebar is hidden.
//
// Zen dispatches "ZenWorkspacesUIUpdate" on window whenever the active
// workspace changes, is renamed, or the workspace list changes (see
// nsZenWorkspaceIcons in zen-browser/desktop's ZenSpaceIcons.mjs).
// event.detail.activeIndex is the active workspace's uuid (despite the
// name) - gZenWorkspaces.getWorkspaces() resolves that uuid to {name, icon}.
(function () {
  if (window.__zenWorkspaceLabelInstalled) return;
  window.__zenWorkspaceLabelInstalled = true;

  function ensureLabel() {
    let label = document.getElementById("zen-workspace-toolbar-label");
    if (label) return label;
    label = document.createXULElement("label");
    label.id = "zen-workspace-toolbar-label";
    const toolbar = document.getElementById("TabsToolbar");
    toolbar.insertBefore(label, toolbar.firstChild);
    return label;
  }

  function setActiveByUuid(uuid) {
    const label = ensureLabel();
    const workspaces = window.gZenWorkspaces?.getWorkspaces?.() ?? [];
    if (workspaces.length <= 1) {
      // Nothing to disambiguate - stay out of the way.
      label.hidden = true;
      return;
    }
    const active = workspaces.find((w) => w.uuid === uuid) ?? workspaces[0];
    label.hidden = false;
    label.textContent = active?.name ?? "";
  }

  window.addEventListener(
    "ZenWorkspacesUIUpdate",
    (event) => setActiveByUuid(event.detail?.activeIndex),
    true
  );

  window.addEventListener(
    "load",
    () => {
      const activeButton = document.querySelector(
        "#zen-workspaces-button toolbarbutton[active]"
      );
      setActiveByUuid(activeButton?.getAttribute("zen-workspace-id"));
    },
    { once: true }
  );
})();
