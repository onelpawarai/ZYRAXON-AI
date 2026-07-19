import { o as onCleanup, bO as projectForSession, k as displayName, y as getFilename, V as useCommand, bD as useGlobal, u as useLanguage, bP as useFile, U as useDialog, af as useServerSDK, bQ as useTabs, bR as useSessionLayout, G as createMemo, bS as commandPaletteOptions, bT as createSessionTabs, b0 as ServerConnection, bU as useLayout, d as createComponent, f as createSignal, a5 as createResource, g as createEffect, ar as DialogBody, i as insert, aA as TextInputV2, w as Icon, bV as ScrollView, S as Show, F as For, m as memo, aX as Dialog, t as template, ad as addEventListener, as as Match, bW as KeybindV2, bX as formatKeybindParts, bY as SessionTabAvatar, c as createRenderEffect, bZ as FileIcon, b_ as getDirectory, at as Switch, s as setAttribute, x as delegateEvents } from "./main-D3v0Qciw.js";
function getRelativeTime(dateString, t) {
  const date = new Date(dateString);
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1e3);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffSeconds < 60) return t("common.time.justNow");
  if (diffMinutes < 60) return t("common.time.minutesAgo.short", { count: diffMinutes });
  if (diffHours < 24) return t("common.time.hoursAgo.short", { count: diffHours });
  return t("common.time.daysAgo.short", { count: diffDays });
}
const ENTRY_LIMIT = 5;
const COMMON_COMMAND_IDS = [
  "session.new",
  "workspace.new",
  "session.previous",
  "session.next",
  "terminal.toggle",
  "review.toggle"
];
function uniqueCommandPaletteEntries(items) {
  const seen = /* @__PURE__ */ new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
function createCommandPaletteFileEntry(path, category) {
  return {
    id: "file:" + path,
    type: "file",
    title: path,
    category,
    path
  };
}
function createCommandPaletteFileOpener(onOpenFile) {
  const file = useFile();
  const layout = useLayout();
  const { tabs, view } = useSessionLayout();
  return (path) => {
    const value = file.tab(path);
    void tabs().open(value);
    void file.load(path);
    if (!view().reviewPanel.opened()) view().reviewPanel.open();
    layout.fileTree.setTab("all");
    onOpenFile?.(path);
    tabs().setActive(value);
  };
}
function createCommandPaletteModel(props) {
  const command = useCommand();
  const global = useGlobal();
  const language = useLanguage();
  const file = useFile();
  const dialog = useDialog();
  const serverSDK = useServerSDK()();
  const serverCtx = global.ensureServerCtx(serverSDK.server);
  const appTabs = useTabs();
  const { tabs: sessionTabs } = useSessionLayout();
  const openFile = createCommandPaletteFileOpener(props.onOpenFile);
  const state = { cleanup: void 0, committed: false };
  const filesOnly = () => props.filesOnly?.() ?? false;
  const allowedCommands = createMemo(() => {
    if (filesOnly()) return [];
    return commandPaletteOptions(command.options);
  });
  const commandEntries = createMemo(() => {
    const category = language.t("palette.group.commands");
    return allowedCommands().map((option) => createCommandPaletteCommandEntry(option, category));
  });
  const preferredCommandEntries = createMemo(() => {
    const all = allowedCommands();
    const order = new Map(COMMON_COMMAND_IDS.map((id, index) => [id, index]));
    const picked = all.filter((option) => order.has(option.id));
    const base = picked.length ? picked : all.slice(0, ENTRY_LIMIT);
    const sorted = picked.length ? [...base].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)) : base;
    const category = language.t("palette.group.commands");
    return sorted.map((option) => createCommandPaletteCommandEntry(option, category));
  });
  const tabState = createSessionTabs({
    tabs: sessionTabs,
    pathFromTab: file.pathFromTab,
    normalizeTab: (tab) => tab.startsWith("file://") ? file.tab(tab) : tab
  });
  const recentFileEntries = createMemo(() => {
    const all = tabState.openedTabs();
    const active = tabState.activeFileTab();
    const order = active ? [active, ...all.filter((item) => item !== active)] : all;
    const seen = /* @__PURE__ */ new Set();
    const category = language.t("palette.group.files");
    return order.map((item) => file.pathFromTab(item)).filter((path) => {
      if (!path || seen.has(path)) return false;
      seen.add(path);
      return true;
    }).slice(0, ENTRY_LIMIT).map((path) => createCommandPaletteFileEntry(path, category));
  });
  const rootFileEntries = createMemo(() => {
    const category = language.t("palette.group.files");
    return file.tree.children("").filter((node) => node.type === "file").map((node) => node.path).sort((a, b) => a.localeCompare(b)).slice(0, ENTRY_LIMIT).map((path) => createCommandPaletteFileEntry(path, category));
  });
  const sessions = createServerSessionEntries({
    server: ServerConnection.key(serverSDK.server),
    opened: serverCtx.projects.list,
    stored: () => serverCtx.sync.data.project,
    load: (search, signal) => serverSDK.client.experimental.session.list({ roots: true, search, limit: 50 }, { signal }),
    untitled: () => language.t("command.session.new"),
    category: () => language.t("command.category.session")
  });
  const highlight = (item) => {
    state.cleanup?.();
    state.cleanup = void 0;
    if (item?.type !== "command") return;
    state.cleanup = item.option?.onHighlight?.();
  };
  const select = (item) => {
    if (!item) return;
    state.committed = true;
    state.cleanup = void 0;
    dialog.close();
    if (item.type === "command") {
      item.option?.onSelect?.("palette");
      return;
    }
    if (item.type === "session") {
      if (!item.sessionID || !item.server) return;
      const directory = item.project?.worktree ?? item.directory;
      if (directory) {
        serverCtx.projects.open(directory);
        serverCtx.projects.touch(directory);
      }
      const tab = appTabs.addSessionTab({
        server: item.server,
        sessionId: item.sessionID
      });
      appTabs.select(tab);
      return;
    }
    if (!item.path) return;
    openFile(item.path);
  };
  onCleanup(() => {
    if (state.committed) return;
    state.cleanup?.();
  });
  return {
    language,
    file,
    commandEntries,
    preferredCommandEntries,
    recentFileEntries,
    rootFileEntries,
    sessions,
    highlight,
    select,
    close: () => dialog.close()
  };
}
function createCommandPaletteCommandEntry(option, category) {
  return {
    id: "command:" + option.id,
    type: "command",
    title: option.title,
    description: option.description,
    keybind: option.keybind,
    category,
    option
  };
}
function createServerSessionEntries(props) {
  let abort;
  onCleanup(() => abort?.abort());
  return async (text) => {
    const search = text.trim();
    if (!search) {
      abort?.abort();
      return [];
    }
    abort?.abort();
    const current = new AbortController();
    abort = current;
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 100);
      current.signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true }
      );
    });
    if (current.signal.aborted) return [];
    const opened = props.opened();
    const openedByID = new Map(opened.flatMap((project) => project.id ? [[project.id, project]] : []));
    const stored = props.stored().map((project) => ({ ...project, expanded: false }));
    const storedByID = new Map(stored.map((project) => [project.id, project]));
    return props.load(search, current.signal).then(
      (result) => (result.data ?? []).filter((session) => !session.time.archived).map((session) => {
        const project = projectForSession(session, opened, openedByID) ?? projectForSession(session, stored, storedByID);
        return {
          id: `session:${props.server}:${session.id}`,
          type: "session",
          title: session.title || props.untitled(),
          description: project ? displayName(project) : session.project?.name || getFilename(session.directory),
          category: props.category(),
          directory: session.directory,
          sessionID: session.id,
          server: props.server,
          project,
          updated: session.time.updated
        };
      })
    ).catch(() => []);
  };
}
var _tmpl$ = /* @__PURE__ */ template(`<div class=command-palette-v2-search>`), _tmpl$2 = /* @__PURE__ */ template(`<div class=command-palette-v2-results role=listbox>`), _tmpl$3 = /* @__PURE__ */ template(`<div class=command-palette-v2-state>`), _tmpl$4 = /* @__PURE__ */ template(`<div class=command-palette-v2-group-title>`), _tmpl$5 = /* @__PURE__ */ template(`<div class=command-palette-v2-group>`), _tmpl$6 = /* @__PURE__ */ template(`<span class=command-palette-v2-description>`), _tmpl$7 = /* @__PURE__ */ template(`<div class=command-palette-v2-row-main><div class=command-palette-v2-row-text><span class=command-palette-v2-title>`), _tmpl$8 = /* @__PURE__ */ template(`<span aria-hidden=true class="pointer-events-none absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-[2px] bg-v2-background-bg-layer-04"style="right:calc(100% + 4px)">`), _tmpl$9 = /* @__PURE__ */ template(`<div class=command-palette-v2-row-main><div class="relative shrink-0"></div><div class=command-palette-v2-row-text><span class=command-palette-v2-title>`), _tmpl$0 = /* @__PURE__ */ template(`<span class=command-palette-v2-meta>`), _tmpl$1 = /* @__PURE__ */ template(`<button type=button class="command-palette-v2-row group"role=option>`), _tmpl$10 = /* @__PURE__ */ template(`<div class=command-palette-v2-row-main><div class=command-palette-v2-file-path><span class=command-palette-v2-file-dir></span><span class=command-palette-v2-file-name>`);
function groups(entries) {
  const map = /* @__PURE__ */ new Map();
  for (const entry of entries) map.set(entry.category, [...map.get(entry.category) ?? [], entry]);
  return Array.from(map.entries()).map(([category, entries2]) => ({
    category,
    entries: entries2
  }));
}
function matchesEntry(entry, query) {
  const value = query.toLowerCase();
  return [entry.title, entry.description, entry.category].some((text) => text?.toLowerCase().includes(value));
}
function DialogCommandPaletteV2(props) {
  const palette = createCommandPaletteModel(props);
  const loadItems = async (text) => {
    const q = text.trim();
    if (!q) return [...palette.preferredCommandEntries(), ...palette.recentFileEntries()];
    const [files, nextSessions] = await Promise.all([palette.file.searchFiles(q), Promise.resolve(palette.sessions(q))]);
    const category = palette.language.t("palette.group.files");
    return [...palette.commandEntries().filter((entry) => matchesEntry(entry, q)), ...nextSessions, ...files.map((path) => createCommandPaletteFileEntry(path, category))];
  };
  return createComponent(CommandPaletteView, {
    get placeholder() {
      return palette.language.t("palette.search.placeholder");
    },
    loadItems,
    get highlight() {
      return palette.highlight;
    },
    get select() {
      return palette.select;
    },
    get close() {
      return palette.close;
    }
  });
}
function DialogHomeCommandPaletteV2(props) {
  const command = useCommand();
  const dialog = useDialog();
  const global = useGlobal();
  const language = useLanguage();
  const serverCtx = global.ensureServerCtx(props.server);
  const state = {
    cleanup: void 0,
    committed: false
  };
  const commandEntries = createMemo(() => {
    const category = language.t("palette.group.commands");
    return commandPaletteOptions(command.options).map((option) => createCommandPaletteCommandEntry(option, category));
  });
  const sessions = createServerSessionEntries({
    server: ServerConnection.key(props.server),
    opened: serverCtx.projects.list,
    stored: () => serverCtx.sync.data.project,
    load: (search, signal) => serverCtx.sdk.client.experimental.session.list({
      roots: true,
      search,
      limit: 50
    }, {
      signal
    }),
    untitled: () => language.t("command.session.new"),
    category: () => language.t("command.category.session")
  });
  const highlight = (item) => {
    state.cleanup?.();
    state.cleanup = void 0;
    if (item?.type !== "command") return;
    state.cleanup = item.option?.onHighlight?.();
  };
  const select = (item) => {
    if (!item) return;
    state.committed = true;
    state.cleanup = void 0;
    dialog.close();
    if (item.type === "command") {
      item.option?.onSelect?.("palette");
      return;
    }
    if (item.type === "session") props.onSelectSession(item);
  };
  const loadItems = async (text) => {
    const query = text.trim();
    if (!query) return commandEntries().slice(0, 5);
    return [...commandEntries().filter((entry) => matchesEntry(entry, query)), ...await sessions(query)];
  };
  onCleanup(() => {
    if (state.committed) return;
    state.cleanup?.();
  });
  return createComponent(CommandPaletteView, {
    get placeholder() {
      return language.t("palette.search.placeholder.home");
    },
    loadItems,
    highlight,
    select,
    close: () => dialog.close()
  });
}
function CommandPaletteView(props) {
  const language = useLanguage();
  const tabs = useTabs();
  const [query, setQuery] = createSignal("");
  const [active, setActive] = createSignal(0);
  const [entries] = createResource(query, props.loadItems, {
    initialValue: []
  });
  const visibleEntries = createMemo(() => uniqueCommandPaletteEntries(entries.latest ?? []));
  const groupedEntries = createMemo(() => groups(visibleEntries()));
  const activeEntry = createMemo(() => visibleEntries()[active()]);
  const openSessions = createMemo(() => new Set(tabs.store.flatMap((tab) => tab.type === "session" ? [`${tab.server}\0${tab.sessionId}`] : [])));
  createEffect(() => {
    query();
    visibleEntries();
    setActive(0);
  });
  createEffect(() => {
    props.highlight(activeEntry());
  });
  let resultsRef;
  const move = (delta) => {
    const count = visibleEntries().length;
    if (count === 0) return;
    setActive((index) => (index + delta + count) % count);
    requestAnimationFrame(() => {
      resultsRef?.querySelector("[data-active]")?.scrollIntoView({
        block: "nearest"
      });
    });
  };
  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      props.select(activeEntry());
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      props.close();
    }
  };
  return createComponent(Dialog, {
    "class": "command-palette-v2",
    size: "large",
    get children() {
      return createComponent(DialogBody, {
        "class": "command-palette-v2-body",
        get children() {
          return [(() => {
            var _el$ = _tmpl$();
            insert(_el$, createComponent(TextInputV2, {
              get value() {
                return query();
              },
              autofocus: true,
              autocomplete: "off",
              spellcheck: false,
              appearance: "large",
              get placeholder() {
                return props.placeholder;
              },
              get leadingIcon() {
                return createComponent(Icon, {
                  name: "magnifying-glass"
                });
              },
              onInput: (event) => setQuery(event.currentTarget.value),
              onKeyDown: handleKeyDown
            }));
            return _el$;
          })(), createComponent(ScrollView, {
            "class": "command-palette-v2-scroll",
            viewportRef: (el) => resultsRef = el,
            get children() {
              var _el$2 = _tmpl$2();
              insert(_el$2, createComponent(Show, {
                get when() {
                  return visibleEntries().length > 0;
                },
                get fallback() {
                  return (() => {
                    var _el$3 = _tmpl$3();
                    insert(_el$3, (() => {
                      var _c$ = memo(() => !!entries.loading);
                      return () => _c$() ? language.t("common.loading") : language.t("palette.empty");
                    })());
                    return _el$3;
                  })();
                },
                get children() {
                  return createComponent(For, {
                    get each() {
                      return groupedEntries();
                    },
                    children: (group) => (() => {
                      var _el$4 = _tmpl$5();
                      insert(_el$4, createComponent(Show, {
                        get when() {
                          return group.category;
                        },
                        get children() {
                          var _el$5 = _tmpl$4();
                          insert(_el$5, () => group.category);
                          return _el$5;
                        }
                      }), null);
                      insert(_el$4, createComponent(For, {
                        get each() {
                          return group.entries;
                        },
                        children: (item) => createComponent(PaletteRow, {
                          item,
                          get active() {
                            return activeEntry()?.id === item.id;
                          },
                          language,
                          get sessionOpen() {
                            return memo(() => !!(item.server && item.sessionID))() ? openSessions().has(`${item.server}\0${item.sessionID}`) : false;
                          },
                          onActive: () => setActive(visibleEntries().findIndex((entry) => entry.id === item.id)),
                          onSelect: () => props.select(item)
                        })
                      }), null);
                      return _el$4;
                    })()
                  });
                }
              }));
              return _el$2;
            }
          })];
        }
      });
    }
  });
}
function PaletteRow(props) {
  const session = () => props.item.server && props.item.directory && props.item.sessionID ? {
    server: props.item.server,
    directory: props.item.directory,
    sessionID: props.item.sessionID
  } : void 0;
  return (() => {
    var _el$6 = _tmpl$1();
    addEventListener(_el$6, "click", props.onSelect, true);
    _el$6.$$mousedown = (event) => event.preventDefault();
    _el$6.$$mousemove = (event) => {
      if (event.movementX === 0 && event.movementY === 0) return;
      props.onActive();
    };
    insert(_el$6, createComponent(Switch, {
      get fallback() {
        return (() => {
          var _el$16 = _tmpl$10(), _el$17 = _el$16.firstChild, _el$18 = _el$17.firstChild, _el$19 = _el$18.nextSibling;
          insert(_el$16, createComponent(FileIcon, {
            get node() {
              return {
                path: props.item.path ?? "",
                type: "file"
              };
            },
            "class": "command-palette-v2-row-icon size-4"
          }), _el$17);
          insert(_el$18, () => getDirectory(props.item.path ?? ""));
          insert(_el$19, () => getFilename(props.item.path ?? ""));
          return _el$16;
        })();
      },
      get children() {
        return [createComponent(Match, {
          get when() {
            return props.item.type === "command";
          },
          get children() {
            return [(() => {
              var _el$7 = _tmpl$7(), _el$8 = _el$7.firstChild, _el$9 = _el$8.firstChild;
              insert(_el$9, () => props.item.title);
              insert(_el$8, createComponent(Show, {
                get when() {
                  return props.item.description;
                },
                get children() {
                  var _el$0 = _tmpl$6();
                  insert(_el$0, () => props.item.description);
                  return _el$0;
                }
              }), null);
              return _el$7;
            })(), createComponent(Show, {
              get when() {
                return props.item.keybind;
              },
              get children() {
                return createComponent(KeybindV2, {
                  get keys() {
                    return formatKeybindParts(props.item.keybind ?? "", props.language.t);
                  },
                  variant: "neutral"
                });
              }
            })];
          }
        }), createComponent(Match, {
          get when() {
            return props.item.type === "session";
          },
          get children() {
            return [(() => {
              var _el$1 = _tmpl$9(), _el$10 = _el$1.firstChild, _el$12 = _el$10.nextSibling, _el$13 = _el$12.firstChild;
              insert(_el$10, createComponent(Show, {
                get when() {
                  return props.sessionOpen;
                },
                get children() {
                  return _tmpl$8();
                }
              }), null);
              insert(_el$10, createComponent(Show, {
                get when() {
                  return session();
                },
                children: (session2) => createComponent(SessionTabAvatar, {
                  get project() {
                    return props.item.project;
                  },
                  get directory() {
                    return session2().directory;
                  },
                  get sessionId() {
                    return session2().sessionID;
                  },
                  get server() {
                    return session2().server;
                  }
                })
              }), null);
              insert(_el$13, () => props.item.title);
              insert(_el$12, createComponent(Show, {
                get when() {
                  return props.item.description;
                },
                get children() {
                  var _el$14 = _tmpl$6();
                  insert(_el$14, () => props.item.description);
                  createRenderEffect(() => _el$14.classList.toggle("opacity-70", !!props.item.archived));
                  return _el$14;
                }
              }), null);
              createRenderEffect(() => _el$13.classList.toggle("opacity-70", !!props.item.archived));
              return _el$1;
            })(), createComponent(Show, {
              get when() {
                return props.item.updated;
              },
              get children() {
                var _el$15 = _tmpl$0();
                insert(_el$15, () => getRelativeTime(new Date(props.item.updated).toISOString(), props.language.t));
                return _el$15;
              }
            })];
          }
        })];
      }
    }));
    createRenderEffect((_p$) => {
      var _v$ = props.active, _v$2 = props.active ? "" : void 0;
      _v$ !== _p$.e && setAttribute(_el$6, "aria-selected", _p$.e = _v$);
      _v$2 !== _p$.t && setAttribute(_el$6, "data-active", _p$.t = _v$2);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$6;
  })();
}
delegateEvents(["mousemove", "mousedown", "click"]);
const dialogCommandPaletteV2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DialogCommandPaletteV2,
  DialogHomeCommandPaletteV2
}, Symbol.toStringTag, { value: "Module" }));
export {
  DialogCommandPaletteV2 as D,
  createCommandPaletteModel as a,
  createCommandPaletteFileEntry as b,
  createCommandPaletteFileOpener as c,
  dialogCommandPaletteV2 as d,
  getRelativeTime as g,
  uniqueCommandPaletteEntries as u
};
//# sourceMappingURL=dialog-command-palette-v2-CG4GafBl.js.map
