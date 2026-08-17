/** Entropia Riko app shell — Blender-style workspaces of resizable panels. */
import { useEffect, useState } from "react";
import { MenuBar } from "./components/MenuBar";
import { Titlebar } from "./components/Titlebar";
import { VSplitter, HSplitter } from "./components/Splitter";
import { PanelSlot, type DragPreview } from "./components/Panel";
import { WelcomePanel } from "./components/WelcomePanel";
import { PreferencesPanel } from "./components/PreferencesPanel";
import { AboutPanel } from "./components/AboutPanel";
import { ImportFolderPanel } from "./components/ImportFolderPanel";
import { FilePickerHost } from "./components/FilePicker";
import { ToastStack } from "./components/ToastStack";
import {
  WORKSPACE_PRESETS,
  splitLeaf,
  mergeLeaf,
  closeLeaf,
  siblingNodeId,
  resizeSplit,
  setLeafType,
  countLeaves,
  type AreaNode,
  type WorkspaceInstance,
} from "./areas";
import { useGraphStore } from "./store/graphStore";

// Monotonic counter for unique workspace instance ids.
let wsUid = 0;
const newWsId = () => `ws_${++wsUid}`;

/** Starting tabs, Blender-style: each is a real workflow with a default graph.
 * Train / Inference / Layout map to the most useful presets. */
const DEFAULT_TABS: { preset: string; graph: string }[] = [
  { preset: "training", graph: "examples/models/mnist_cnn.riko" },
  { preset: "inference", graph: "examples/models/mnist_infer.riko" },
  { preset: "layout", graph: "examples/models/mnist.riko" },
];

export default function App() {
  const loadNodeDefs = useGraphStore((s) => s.loadNodeDefs);
  const openFile = useGraphStore((s) => s.openFile);
  const welcomeOpen = useGraphStore((s) => s.welcomeOpen);
  const setWelcomeOpen = useGraphStore((s) => s.setWelcomeOpen);
  const prefsOpen = useGraphStore((s) => s.prefsOpen);
  const setPrefsOpen = useGraphStore((s) => s.setPrefsOpen);
  const aboutOpen = useGraphStore((s) => s.aboutOpen);
  const setAboutOpen = useGraphStore((s) => s.setAboutOpen);
  const importFolderOpen = useGraphStore((s) => s.importFolderOpen);
  const setImportFolderOpen = useGraphStore((s) => s.setImportFolderOpen);
  // Load the live node registry, then open the first workflow's graph so the
  // canvas starts with a real (trainable) root flow instead of an empty sheet.
  useEffect(() => {
    (async () => {
      await loadNodeDefs();
      await openFile(DEFAULT_TABS[0].graph);
    })();
  }, [loadNodeDefs, openFile]);

  // Build one workflow tab per default entry as the starting tabs.
  const [workspaces, setWorkspaces] = useState<WorkspaceInstance[]>(() =>
    DEFAULT_TABS.map((t) => {
      const preset = WORKSPACE_PRESETS.find((p) => p.id === t.preset)!;
      return { id: newWsId(), name: preset.label, root: preset.build(), graph: t.graph };
    })
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [preview, setPreview] = useState<(DragPreview & { leafId: string }) | null>(null);

  // Fall back to the first workspace when none is explicitly active.
  const effectiveActiveId = activeId ?? workspaces[0]?.id ?? "";
  const active = workspaces.find((w) => w.id === effectiveActiveId) ?? workspaces[0];
  const root = active.root;
  // Merging is only allowed while more than one leaf panel remains.
  const canMerge = countLeaves(root) > 1;

  // Apply a mutation to the active workspace's area tree only.
  const updateActiveRoot = (fn: (r: AreaNode) => AreaNode) => {
    setWorkspaces((ws) => ws.map((w) => (w.id === effectiveActiveId ? { ...w, root: fn(w.root) } : w)));
  };

  const switchWorkspace = (id: string) => {
    setActiveId(id);
    // Each workflow tab carries its own default graph (Blender-style modes).
    const ws = workspaces.find((w) => w.id === id);
    if (ws?.graph) void openFile(ws.graph);
  };

  const addWorkspace = (presetId: string) => {
    const preset = WORKSPACE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const ws: WorkspaceInstance = { id: newWsId(), name: preset.label, root: preset.build() };
    setWorkspaces((w) => [...w, ws]);
    setActiveId(ws.id);
  };

  const removeWorkspace = (id: string) => {
    setWorkspaces((ws) => {
      if (ws.length <= 1) return ws;
      const next = ws.filter((w) => w.id !== id);
      if (id === effectiveActiveId) setActiveId(next[0].id);
      return next;
    });
  };

  const renameWorkspace = (id: string, name: string) => {
    setWorkspaces((ws) => ws.map((w) => (w.id === id ? { ...w, name } : w)));
  };

  const duplicateWorkspace = (id: string) => {
    const src = workspaces.find((w) => w.id === id);
    if (!src) return;
    const copy: WorkspaceInstance = {
      id: newWsId(),
      name: `${src.name} copy`,
      root: JSON.parse(JSON.stringify(src.root)),
    };
    const idx = workspaces.findIndex((w) => w.id === id);
    const next = [...workspaces];
    next.splice(idx + 1, 0, copy);
    setWorkspaces(next);
    setActiveId(copy.id);
  };

  const moveWorkspace = (id: string, delta: number) => {
    setWorkspaces((ws) => {
      const idx = ws.findIndex((w) => w.id === id);
      const target = idx + delta;
      if (idx < 0 || target < 0 || target >= ws.length) return ws;
      const next = [...ws];
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  // When dragging a merge, highlight the sibling that will absorb the panel.
  const mergeTargetId =
    preview?.mode === "merge" ? siblingNodeId(root, preview.leafId) : null;

  /** Recursively renders the area tree: leaves become panels, inner nodes
   * become row (side-by-side) or column (stacked) splits with a drag splitter. */
  const renderArea = (node: AreaNode): React.ReactElement => {
    if (node.kind === "leaf") {
      const activePreview =
        preview && preview.leafId === node.id && preview.mode !== "merge" ? preview : null;
      return (
        <PanelSlot
          key={node.id}
          id={node.id}
          type={node.type}
          canMerge={canMerge}
          mergeTarget={node.id === mergeTargetId}
          preview={activePreview}
          onType={(t) => updateActiveRoot((r) => setLeafType(r, node.id, t))}
          onSplitRow={() => updateActiveRoot((r) => splitLeaf(r, node.id, "row"))}
          onSplitColumn={() => updateActiveRoot((r) => splitLeaf(r, node.id, "column"))}
          onMerge={() => updateActiveRoot((r) => mergeLeaf(r, node.id))}
          onClose={() => updateActiveRoot((r) => closeLeaf(r, node.id))}
          onPreview={(p) => setPreview(p ? { ...p, leafId: node.id } : null)}
        />
      );
    }

    // Row splits lay the two children out horizontally.
    if (node.direction === "row") {
      return (
        <div
          key={node.id}
          className={node.id === mergeTargetId ? "merge-target" : undefined}
          style={{ display: "flex", flex: "1 1 0", minWidth: 0, minHeight: 0 }}
        >
          <div style={{ flex: node.ratio, minWidth: 0, minHeight: 0, display: "flex" }}>
            {renderArea(node.first)}
          </div>
          <VSplitter
            onDrag={(dx, total) => updateActiveRoot((r) => resizeSplit(r, node.id, dx / total))}
          />
          <div style={{ flex: 1 - node.ratio, minWidth: 0, minHeight: 0, display: "flex" }}>
            {renderArea(node.second)}
          </div>
        </div>
      );
    }

    // Column splits stack the two children vertically.
    return (
      <div
        key={node.id}
        className={node.id === mergeTargetId ? "merge-target" : undefined}
        style={{ display: "flex", flexDirection: "column", flex: "1 1 0", minWidth: 0, minHeight: 0 }}
      >
        <div style={{ flex: node.ratio, minWidth: 0, minHeight: 0, display: "flex" }}>
          {renderArea(node.first)}
        </div>
        <HSplitter
          onDrag={(dy, total) => updateActiveRoot((r) => resizeSplit(r, node.id, dy / total))}
        />
        <div style={{ flex: 1 - node.ratio, minWidth: 0, minHeight: 0, display: "flex" }}>
          {renderArea(node.second)}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <Titlebar />
      <MenuBar
        workspaces={workspaces}
        activeWorkspaceId={effectiveActiveId}
        onSwitchWorkspace={switchWorkspace}
        onAddWorkspace={addWorkspace}
        onRemoveWorkspace={removeWorkspace}
        onRenameWorkspace={renameWorkspace}
        onDuplicateWorkspace={duplicateWorkspace}
        onMoveWorkspace={moveWorkspace}
      />
      <div className="app-body">{renderArea(root)}</div>
      {welcomeOpen && <WelcomePanel onClose={() => setWelcomeOpen(false)} />}
      {prefsOpen && <PreferencesPanel onClose={() => setPrefsOpen(false)} />}
      {aboutOpen && <AboutPanel onClose={() => setAboutOpen(false)} />}
      {importFolderOpen && <ImportFolderPanel onClose={() => setImportFolderOpen(false)} />}
      <FilePickerHost />
      <ToastStack />
    </div>
  );
}
