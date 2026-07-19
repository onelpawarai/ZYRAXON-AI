const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./dialog-select-directory-v2-DacvQ0JK.js","./main-D3v0Qciw.js","./main-BnGEmXwC.css","./dialog-select-directory-v2-DEAodoq0.css"])))=>i.map(i=>d[i]);
import { ae as usePlatform, R as useSettings, d as createComponent, u as useLanguage, af as useServerSDK, bR as useSessionLayout, G as createMemo, bB as decode64, f as createSignal, ax as List, at as Switch, as as Match, i as insert, S as Show, cg as Keybind, b9 as formatKeybind, I as Icon, c as createRenderEffect, bZ as FileIcon, b_ as getDirectory, y as getFilename, am as Dialog, ba as lazy, a3 as __vitePreload, t as template } from "./main-D3v0Qciw.js";
import { D as DialogCommandPaletteV2, c as createCommandPaletteFileOpener, a as createCommandPaletteModel, g as getRelativeTime, u as uniqueCommandPaletteEntries, b as createCommandPaletteFileEntry } from "./dialog-command-palette-v2-CG4GafBl.js";
var _tmpl$ = /* @__PURE__ */ template(`<span class="text-14-regular text-text-weak truncate">`), _tmpl$2 = /* @__PURE__ */ template(`<div class="w-full flex items-center justify-between gap-4"><div class="flex items-center gap-2 min-w-0"><span class="text-14-regular text-text-strong whitespace-nowrap">`), _tmpl$3 = /* @__PURE__ */ template(`<span class="text-12-regular text-text-weak whitespace-nowrap ml-2">`), _tmpl$4 = /* @__PURE__ */ template(`<div class="w-full flex items-center justify-between rounded-md pl-1"><div class="flex items-center gap-x-3 grow min-w-0"><div class="flex items-center gap-2 min-w-0"><span class="text-14-regular text-text-strong truncate">`), _tmpl$5 = /* @__PURE__ */ template(`<div class="w-full flex items-center justify-between rounded-md pl-1"><div class="flex items-center gap-x-3 grow min-w-0"><div class="flex items-center text-14-regular"><span class="text-text-weak whitespace-nowrap overflow-hidden overflow-ellipsis truncate min-w-0"></span><span class="text-text-strong whitespace-nowrap">`);
const DialogSelectFileV2 = lazy(() => __vitePreload(() => import("./dialog-select-directory-v2-DacvQ0JK.js"), true ? __vite__mapDeps([0,1,2,3]) : void 0, import.meta.url).then((module) => ({
  default: module.DialogSelectDirectoryV2
})));
function DialogSelectFile(props) {
  const platform = usePlatform();
  const settings = useSettings();
  const filesOnly = () => props.mode === "files";
  if (!filesOnly() && settings.general.newLayoutDesigns()) {
    return createComponent(DialogCommandPaletteV2, {
      get onOpenFile() {
        return props.onOpenFile;
      }
    });
  }
  if (filesOnly() && platform.platform === "desktop" && settings.general.newLayoutDesigns()) {
    return createComponent(DialogSelectFileDesktopV2, {
      get onOpenFile() {
        return props.onOpenFile;
      }
    });
  }
  return createComponent(DialogSelectFileLegacy, {
    filesOnly,
    get onOpenFile() {
      return props.onOpenFile;
    }
  });
}
function DialogSelectFileDesktopV2(props) {
  const language = useLanguage();
  const serverSDK = useServerSDK();
  const {
    params
  } = useSessionLayout();
  const projectDirectory = createMemo(() => decode64(params.dir) ?? "");
  const openFile = createCommandPaletteFileOpener(props.onOpenFile);
  return createComponent(DialogSelectFileV2, {
    get server() {
      return serverSDK().server;
    },
    mode: "file",
    get start() {
      return projectDirectory();
    },
    get title() {
      return language.t("session.header.searchFiles");
    },
    onSelect: (result) => {
      if (typeof result !== "string") return;
      openFile(result);
    }
  });
}
function DialogSelectFileLegacy(props) {
  const palette = createCommandPaletteModel(props);
  const [grouped, setGrouped] = createSignal(false);
  const items = async (text) => {
    const query = text.trim();
    setGrouped(query.length > 0);
    if (!query && props.filesOnly()) {
      const loaded = palette.file.tree.state("")?.loaded;
      const pending = loaded ? Promise.resolve() : palette.file.tree.list("");
      const next = uniqueCommandPaletteEntries([...palette.recentFileEntries(), ...palette.rootFileEntries()]);
      if (loaded || next.length > 0) {
        return next;
      }
      await pending;
      return uniqueCommandPaletteEntries([...palette.recentFileEntries(), ...palette.rootFileEntries()]);
    }
    if (!query) return [...palette.preferredCommandEntries(), ...palette.recentFileEntries()];
    if (props.filesOnly()) {
      const files2 = await palette.file.searchFiles(query);
      const category2 = palette.language.t("palette.group.files");
      return files2.map((path) => createCommandPaletteFileEntry(path, category2));
    }
    const [files, nextSessions] = await Promise.all([palette.file.searchFiles(query), Promise.resolve(palette.sessions(query))]);
    const category = palette.language.t("palette.group.files");
    const entries = files.map((path) => createCommandPaletteFileEntry(path, category));
    return [...palette.commandEntries(), ...nextSessions, ...entries];
  };
  return createComponent(Dialog, {
    "class": "pt-3 pb-0 !max-h-[480px]",
    transition: true,
    get children() {
      return createComponent(List, {
        "class": "px-3",
        get search() {
          return {
            placeholder: props.filesOnly() ? palette.language.t("session.header.searchFiles") : palette.language.t("palette.search.placeholder"),
            autofocus: true,
            hideIcon: true
          };
        },
        get emptyMessage() {
          return palette.language.t("palette.empty");
        },
        get loadingMessage() {
          return palette.language.t("common.loading");
        },
        items,
        key: (item) => item.id,
        filterKeys: ["title", "description", "category"],
        skipFilter: (item) => item.type === "file",
        get groupBy() {
          return grouped() ? (item) => item.category : () => "";
        },
        onMove: (item) => palette.highlight(item),
        onSelect: (item) => palette.select(item),
        children: (item) => createComponent(Switch, {
          get fallback() {
            return (() => {
              var _el$1 = _tmpl$5(), _el$10 = _el$1.firstChild, _el$11 = _el$10.firstChild, _el$12 = _el$11.firstChild, _el$13 = _el$12.nextSibling;
              insert(_el$10, createComponent(FileIcon, {
                get node() {
                  return {
                    path: item.path ?? "",
                    type: "file"
                  };
                },
                "class": "shrink-0 size-4"
              }), _el$11);
              insert(_el$12, () => getDirectory(item.path ?? ""));
              insert(_el$13, () => getFilename(item.path ?? ""));
              return _el$1;
            })();
          },
          get children() {
            return [createComponent(Match, {
              get when() {
                return item.type === "command";
              },
              get children() {
                var _el$ = _tmpl$2(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
                insert(_el$3, () => item.title);
                insert(_el$2, createComponent(Show, {
                  get when() {
                    return item.description;
                  },
                  get children() {
                    var _el$4 = _tmpl$();
                    insert(_el$4, () => item.description);
                    return _el$4;
                  }
                }), null);
                insert(_el$, createComponent(Show, {
                  get when() {
                    return item.keybind;
                  },
                  get children() {
                    return createComponent(Keybind, {
                      "class": "rounded-[4px]",
                      get children() {
                        return formatKeybind(item.keybind ?? "", palette.language.t);
                      }
                    });
                  }
                }), null);
                return _el$;
              }
            }), createComponent(Match, {
              get when() {
                return item.type === "session";
              },
              get children() {
                var _el$5 = _tmpl$4(), _el$6 = _el$5.firstChild, _el$7 = _el$6.firstChild, _el$8 = _el$7.firstChild;
                insert(_el$6, createComponent(Icon, {
                  name: "bubble-5",
                  size: "small",
                  "class": "shrink-0 text-icon-weak"
                }), _el$7);
                insert(_el$8, () => item.title);
                insert(_el$7, createComponent(Show, {
                  get when() {
                    return item.description;
                  },
                  get children() {
                    var _el$9 = _tmpl$();
                    insert(_el$9, () => item.description);
                    createRenderEffect(() => _el$9.classList.toggle("opacity-70", !!item.archived));
                    return _el$9;
                  }
                }), null);
                insert(_el$5, createComponent(Show, {
                  get when() {
                    return item.updated;
                  },
                  get children() {
                    var _el$0 = _tmpl$3();
                    insert(_el$0, () => getRelativeTime(new Date(item.updated).toISOString(), palette.language.t));
                    return _el$0;
                  }
                }), null);
                createRenderEffect(() => _el$8.classList.toggle("opacity-70", !!item.archived));
                return _el$5;
              }
            })];
          }
        })
      });
    }
  });
}
export {
  DialogSelectFile
};
//# sourceMappingURL=dialog-select-file-Db1eET53.js.map
