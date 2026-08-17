/**
 * Entropia Template UI — public entry point.
 *
 * This module re-exports the reusable node-graph editor building blocks so the
 * template can be consumed as a library:
 *
 *   import { App, GraphCanvas, useGraphStore } from "entropia-template-ui";
 *   import "entropia-template-ui/style.css";
 *   import "@xyflow/react/dist/style.css";
 *
 * The application shell (`App`) is the full editor; individual panels and the
 * zustand store are also exported for custom embedding.
 */
import "./styles.css";

// Application shell
export { default as App } from "./App";

// Canvas + graph building blocks
export { GraphCanvas } from "./components/GraphCanvas";
export { NodeCard } from "./components/NodeCard";
export { NodeLibrary } from "./components/NodeLibrary";
export { SideInspector } from "./components/SideInspector";

// Workspace / layout
export { MenuBar } from "./components/MenuBar";
export { Titlebar } from "./components/Titlebar";
export { StatusPanel } from "./components/StatusPanel";
export { Toolbar } from "./components/Toolbar";
export { ToastStack } from "./components/ToastStack";
export { WorkspaceTabs } from "./components/WorkspaceTabs";
export { FloatingWindow } from "./components/FloatingWindow";
export { PopupMenu } from "./components/PopupMenu";
export { ContextMenu } from "./components/ContextMenu";
export {
  PanelSlot,
  registerPanelContent,
  renderPanelContent,
  panelLabel,
  PANEL_TYPES,
} from "./components/Panel";
export { HSplitter, VSplitter } from "./components/Splitter";

// Panels
export { WelcomePanel } from "./components/WelcomePanel";
export { AboutPanel } from "./components/AboutPanel";
export { PreferencesPanel } from "./components/PreferencesPanel";
export { PluginPanel } from "./components/PluginPanel";
export { ProjectPanel } from "./components/ProjectPanel";
export { ImportFolderPanel } from "./components/ImportFolderPanel";
export { FileManager } from "./components/FileManager";
export { FileExplorer } from "./components/FileExplorer";
export { CodeEditor } from "./components/CodeEditor";
export { CodePreview } from "./components/CodePreview";
export { LossPanel } from "./components/LossPanel";
export { HandwritingPad } from "./components/HandwritingPad";
export { DocsPanel } from "./components/DocsPanel";
export { BrandLogo } from "./components/BrandLogo";

// File picker (promise-based)
export { FilePickerHost, openFilePicker } from "./components/FilePicker";

// State + workspace model + theme
export { useGraphStore } from "./store/graphStore";
export * from "./areas";
export { loadTheme, applyTheme, applyBackground } from "./theme";
export type { ThemeMode } from "./theme";
export { APP_VERSION } from "./version";
