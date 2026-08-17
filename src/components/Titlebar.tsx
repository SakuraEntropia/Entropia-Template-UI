/** Window-style title bar above the menu bar.
 * Shows `*` while the document is unsaved, then `[filename] - <appName>` and
 * the app version on the right (macOS window-title convention).
 * Consumers can rebrand via optional props (defaults keep the original
 * "Riko" behavior). */
import { useGraphStore } from "../store/graphStore";
import { APP_VERSION } from "../version";

export function Titlebar({ title, appName = "Riko" }: { title?: string; appName?: string }) {
  const dirty = useGraphStore((s) => s.dirty);
  const activeFileName = useGraphStore((s) => s.activeFileName);

  return (
    <div className="titlebar">
      <span className={`titlebar-dirty ${dirty ? "visible" : ""}`} aria-hidden={!dirty}>
        *
      </span>
      <span className="titlebar-file">{title ?? activeFileName ?? "Untitled"}</span>
      <span className="titlebar-app"> - {appName}</span>
      <span className="spacer" />
      <span className="titlebar-version">v{APP_VERSION}</span>
    </div>
  );
}
