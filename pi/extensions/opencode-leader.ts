/**
 * opencode-leader.ts — OpenCode-style leader-key bindings for pi.
 *
 * OpenCode uses a "leader" prefix (default ctrl+x): you press the leader,
 * release, then press a chord key (e.g. ctrl+x then m = model picker).
 * pi has no native leader/chord support, so this extension installs a custom
 * editor that implements the leader state machine and dispatches chords to
 * pi's built-in app actions (via the editor's actionHandlers map) or to
 * ExtensionContext APIs for the things that have no built-in action.
 *
 * Global (non-leader) overrides:
 *   ctrl+t        cycle reasoning effort   (pi default used this for thinking toggle)
 *   ctrl+p        open the commands menu   (pi default used this for model cycle / path toggle)
 *   f2 / shift+f2 cycle models forward/back
 *
 * Everything else falls through to pi's normal editor/app keybindings, so all
 * of pi's defaults keep working underneath the OpenCode layer.
 *
 * Chord map (leader = ctrl+x):
 *   m  model picker            l  session picker       n  new session
 *   g  session tree/timeline   f  fork session         e  external editor
 *   y  copy last message       h  toggle thinking display
 *   d  toggle tool details     c  compact session       s  status
 *   t  theme picker            q  quit
 *   p  mcp config (mcp.json)
 *   a  agents (n/a in pi)      x  export (n/a)          u/r  undo/redo (n/a)
 *   b  sidebar (n/a)
 *
 * Press leader then leader (or escape) to cancel. Leader auto-cancels after
 * LEADER_TIMEOUT_MS (mirrors OpenCode's leader_timeout).
 */

import {
	CustomEditor,
	type ExtensionAPI,
	type ExtensionContext,
	type AppKeybinding,
} from "@earendil-works/pi-coding-agent";
import { matchesKey, parseKey, truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const LEADER_KEY = "ctrl+x";

function mcpConfigPath(): string {
	return join(homedir(), ".pi", "agent", "mcp.json");
}
const LEADER_TIMEOUT_MS = 2000;

type Chord =
	| { action: AppKeybinding; desc: string }
	| { custom: CustomOp; desc: string };

type CustomOp =
	| "compact"
	| "quit"
	| "status"
	| "theme"
	| "mcp"
	| "agents"
	| "export"
	| "undo"
	| "redo"
	| "sidebar";

// OpenCode default leader chords mapped onto pi.
const CHORDS: Record<string, Chord> = {
	m: { action: "app.model.select", desc: "models" },
	l: { action: "app.session.resume", desc: "sessions" },
	n: { action: "app.session.new", desc: "new session" },
	g: { action: "app.session.tree", desc: "timeline" },
	f: { action: "app.session.fork", desc: "fork" },
	e: { action: "app.editor.external", desc: "external editor" },
	y: { action: "app.message.copy", desc: "copy message" },
	h: { action: "app.thinking.toggle", desc: "thinking display" },
	d: { action: "app.tools.expand", desc: "tool details" },
	c: { custom: "compact", desc: "compact" },
	q: { custom: "quit", desc: "quit" },
	s: { custom: "status", desc: "status" },
	t: { custom: "theme", desc: "themes" },
	p: { custom: "mcp", desc: "mcp config" },
	a: { custom: "agents", desc: "agents" },
	x: { custom: "export", desc: "export" },
	u: { custom: "undo", desc: "undo" },
	r: { custom: "redo", desc: "redo" },
	b: { custom: "sidebar", desc: "sidebar" },
};

const HINT =
	"leader: m models · l sessions · n new · g tree · f fork · e editor · y copy · " +
	"h thinking · d tools · p mcp · c compact · t theme · s status · q quit";

class LeaderEditor extends CustomEditor {
	private leaderPending = false;
	private leaderTimer: ReturnType<typeof setTimeout> | undefined;
	private ctx: ExtensionContext;
	/** Draft stashed while the ctrl+p command menu is open, restored on cancel. */
	private paletteSaved: string | undefined;

	constructor(tui: any, theme: any, kb: any, ctx: ExtensionContext) {
		super(tui, theme, kb);
		this.ctx = ctx;
	}

	private notify(msg: string, type?: "info" | "warning" | "error"): void {
		try {
			this.ctx.ui.notify(msg, type);
		} catch {
			/* ui may be gone during teardown */
		}
	}

	private requestRender(): void {
		(this as any).tui?.requestRender?.();
	}

	private enterLeader(): void {
		this.leaderPending = true;
		clearTimeout(this.leaderTimer);
		this.leaderTimer = setTimeout(() => {
			this.leaderPending = false;
			this.requestRender();
		}, LEADER_TIMEOUT_MS);
		this.requestRender();
	}

	private clearLeader(): void {
		this.leaderPending = false;
		clearTimeout(this.leaderTimer);
		this.requestRender();
	}

	private runAction(id: AppKeybinding): boolean {
		const handler = this.actionHandlers.get(id);
		if (!handler) {
			this.notify(`leader: '${id}' not available here`, "warning");
			return false;
		}
		handler();
		return true;
	}

	private async runCustom(op: CustomOp): Promise<void> {
		const ui = this.ctx.ui;
		switch (op) {
			case "compact":
				this.notify("Compacting session…");
				this.ctx.compact();
				return;
			case "quit":
				this.ctx.shutdown();
				return;
			case "status": {
				const usage = this.ctx.getContextUsage();
				const model = this.ctx.model?.name ?? this.ctx.model?.id ?? "unknown";
				const thinking = this.ctx.thinkingLevel ?? "?";
				let msg = `model: ${model} · thinking: ${thinking}`;
				if (usage?.percent != null) {
					msg += ` · ctx: ${usage.percent}% (${usage.tokens ?? "?"}/${usage.contextWindow})`;
				}
				this.notify(msg);
				return;
			}
			case "theme": {
				const themes = ui.getAllThemes().map((t) => t.name);
				if (themes.length === 0) {
					this.notify("No themes available", "warning");
					return;
				}
				const choice = await ui.select("Theme", themes);
				if (choice) {
					const res = ui.setTheme(choice);
					if (!res.success) this.notify(`Theme failed: ${res.error}`, "error");
				}
				return;
			}
			case "mcp": {
				// pi has no MCP picker UI; edit the config file instead.
				const path = mcpConfigPath();
				let contents: string;
				try {
					contents = readFileSync(path, "utf8");
				} catch {
					contents = '{\n  "mcpServers": {}\n}\n';
				}
				const edited = await ui.editor(`MCP config — ${path}`, contents);
				if (edited !== undefined) {
					try {
						writeFileSync(path, edited);
						this.notify("Saved mcp.json — restart pi to apply");
					} catch (err) {
						this.notify(`Save failed: ${err instanceof Error ? err.message : String(err)}`, "error");
					}
				}
				return;
			}
			case "agents":
				this.notify("pi has no agents — use leader+m for models", "info");
				return;
			case "export":
				this.notify("Session export isn't wired to a key in pi (try /export)", "info");
				return;
			case "undo":
			case "redo":
				this.notify("pi has no message undo/redo", "info");
				return;
			case "sidebar":
				this.notify("pi has no sidebar", "info");
				return;
		}
	}

	private dispatch(key: string): void {
		const chord = CHORDS[key];
		if (!chord) {
			this.notify(`leader: no command for '${key}' — ${HINT}`, "warning");
			return;
		}
		if ("action" in chord) {
			this.runAction(chord.action);
		} else {
			void this.runCustom(chord.custom).catch((err) =>
				this.notify(`leader: ${err instanceof Error ? err.message : String(err)}`, "error"),
			);
		}
	}

	handleInput(data: string): void {
		const key = parseKey(data) ?? (data.length === 1 ? data : undefined);

		// --- command menu open over a stashed draft ---
		if (this.paletteSaved !== undefined) {
			if (matchesKey(data, "escape")) {
				const wasShowing = this.isShowingAutocomplete();
				super.handleInput(data); // closes the autocomplete if it is open
				if (wasShowing) this.setText(this.paletteSaved); // cancelled -> restore draft
				this.paletteSaved = undefined;
				return;
			}
			super.handleInput(data);
			// a submitted command clears the editor -> drop the stash
			if (this.getText() === "" && !this.isShowingAutocomplete()) {
				this.paletteSaved = undefined;
			}
			return;
		}

		// --- leader pending: interpret the chord ---
		if (this.leaderPending) {
			this.clearLeader();
			// cancel on escape or a repeated leader
			if (key === "escape" || matchesKey(data, LEADER_KEY)) return;
			if (key !== undefined) this.dispatch(key);
			return;
		}

		// --- leader trigger ---
		if (matchesKey(data, LEADER_KEY)) {
			this.enterLeader();
			return;
		}

		// --- global (non-leader) overrides ---
		if (matchesKey(data, "ctrl+p")) {
			// Open the commands menu without losing the current draft: stash it,
			// then prime "/" to trigger pi's searchable slash autocomplete.
			// (setText("/") alone doesn't trigger autocomplete, so synthesize a
			// real keystroke through the parent editor.) Esc restores the draft.
			this.paletteSaved = this.getText();
			this.setText("");
			super.handleInput("/");
			return;
		}
		if (matchesKey(data, "ctrl+t")) {
			this.runAction("app.thinking.cycle"); // reasoning effort, like OpenCode variant_cycle
			return;
		}
		if (key === "f2") {
			this.runAction("app.model.cycleForward");
			return;
		}
		if (key === "shift+f2") {
			this.runAction("app.model.cycleBackward");
			return;
		}

		// --- everything else: pi defaults ---
		super.handleInput(data);
	}

	render(width: number): string[] {
		const lines = super.render(width);
		if (!this.leaderPending || lines.length === 0) return lines;
		const label = " LEADER ";
		const last = lines.length - 1;
		if (visibleWidth(lines[last]!) >= label.length) {
			lines[last] = truncateToWidth(lines[last]!, width - label.length, "") + label;
		}
		return lines;
	}
}

export default function (pi: ExtensionAPI) {
	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;
		ctx.ui.setEditorComponent(
			(tui, theme, kb) => new LeaderEditor(tui, theme, kb, ctx),
		);
	});
}
