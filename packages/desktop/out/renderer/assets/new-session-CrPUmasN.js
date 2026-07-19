const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./dialog-connect-provider-BamXKthB.js","./main-D3v0Qciw.js","./main-BnGEmXwC.css","./dialog-select-file-Db1eET53.js","./dialog-command-palette-v2-CG4GafBl.js","./dialog-command-palette-v2-CuBkeDNG.css"])))=>i.map(i=>d[i]);
import { c as createRenderEffect, a as classList, t as template, b as className, i as insert, d as createComponent, u as useLanguage, e as createStore, h as handleDocumentSearchKeydown, I as Icon, f as createSignal, o as onCleanup, g as createEffect, D as DropdownMenu, j as use, S as Show, s as setAttribute, F as For, m as memo, k as displayName, p as pathKey, l as splitProps, n as spread, q as mergeProps, P as ProjectAvatar, r as getProjectAvatarVariant, v as getProjectAvatarSource, w as Icon$1, x as delegateEvents, M as MenuV2, y as getFilename, T as TooltipV2, z as useSDK, A as useSync, B as useModels, C as usePrompt, E as useProviders, G as createMemo, H as cycleModelVariant, J as startTransition, K as batch, L as resolveModelVariant, N as getConfiguredAgentVariant, O as useServerSync, Q as useComments, R as useSettings, U as useDialog, V as useCommand, W as useSettingsCommand, X as useSessionKey, Y as useSearchParams, Z as useLocal, _ as useComposerCommands, $ as createPromptInputController, a0 as createPromptProjectControls, a1 as useTitlebarRightMount, a2 as usePromptInputV2Controller, a3 as __vitePreload, a4 as untrack, a5 as createResource, a6 as Portal, a7 as Tooltip, a8 as StatusPopoverV2, a9 as PromptInputV2Composer, aa as persisted, ab as Persist, ac as index_default, ad as addEventListener } from "./main-D3v0Qciw.js";
var _tmpl$$4 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg viewBox="0 0 900 129"fill=none><g opacity=0.6><g mask=url(#zyraxon-wordmark-mask)><text x=50% y=85 text-anchor=middle font-family="'Inter', 'SF Pro Display', 'Segoe UI', system-ui, sans-serif"font-size=110 font-weight=800 letter-spacing=18 fill=currentColor opacity=0.7>ZYRAXON</text></g></g><defs><mask id=zyraxon-wordmark-mask maskUnits=userSpaceOnUse x=0 y=0 width=900 height=129 style=mask-type:alpha><rect width=900 height=129 fill=url(#zyraxon-wordmark-gradient)></rect></mask><linearGradient id=zyraxon-wordmark-gradient x1=450 y1=68 x2=450 y2=129 gradientUnits=userSpaceOnUse><stop stop-color=white stop-opacity=0.7></stop><stop offset=1 stop-color=white stop-opacity=0>`);
function WordmarkV2(props) {
  return (() => {
    var _el$ = _tmpl$$4(), _el$2 = _el$.firstChild;
    _el$2.firstChild;
    var _el$4 = _el$2.nextSibling, _el$5 = _el$4.firstChild;
    _el$5.firstChild;
    _el$5.nextSibling;
    createRenderEffect((_$p) => classList(_el$, {
      [props.class ?? ""]: !!props.class
    }, _$p));
    return _el$;
  })();
}
const NEW_SESSION_CONTENT_WIDTH = "w-full max-w-[720px] px-0";
var _tmpl$$3 = /* @__PURE__ */ template(`<div data-component=session-new-design class="relative size-full overflow-hidden bg-v2-background-bg-deep "><div class="absolute inset-x-0 top-[25.375%] flex justify-center px-6"><div><div class=mt-8>`);
function NewSessionDesignView(props) {
  return (() => {
    var _el$ = _tmpl$$3(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild;
    className(_el$3, NEW_SESSION_CONTENT_WIDTH);
    insert(_el$3, createComponent(WordmarkV2, {
      "class": "h-auto w-full text-v2-background-bg-inverse"
    }), _el$4);
    insert(_el$4, () => props.children);
    return _el$;
  })();
}
var _tmpl$$2 = /* @__PURE__ */ template(`<button type=button class="flex size-5 items-center justify-center rounded-sm text-v2-icon-icon-muted hover:bg-v2-overlay-simple-overlay-hover">`), _tmpl$2$2 = /* @__PURE__ */ template(`<div class="flex flex-col p-0.5"><div class="flex h-7 items-center gap-2 rounded-sm pl-3 pr-2.5 text-v2-icon-icon-muted"><input aria-autocomplete=list aria-controls=prompt-project-menu class="h-7 min-w-0 flex-1 border-0 bg-transparent text-[13px] font-[440] leading-5 tracking-[-0.04px] text-v2-text-text-base outline-none placeholder:text-v2-text-text-faint">`), _tmpl$3$2 = /* @__PURE__ */ template(`<div class="h-px bg-v2-border-border-muted">`), _tmpl$4$2 = /* @__PURE__ */ template(`<span data-slot=dropdown-menu-item-label class="min-w-0 flex-1 truncate leading-5">`), _tmpl$5$1 = /* @__PURE__ */ template(`<div class="flex flex-col p-0.5">`), _tmpl$6 = /* @__PURE__ */ template(`<div><div class="flex h-7 select-none items-center pl-1.5 pr-3 text-[11px] font-[530] leading-none tracking-[0.05px] text-v2-text-text-faint">`), _tmpl$7 = /* @__PURE__ */ template(`<button data-action=prompt-project type=button class="flex h-7 min-w-0 max-w-[160px] items-center gap-1.5 rounded-sm px-2 text-[13px] font-[440] leading-5 tracking-[-0.04px] text-v2-text-text-faint transition-colors hover:bg-v2-overlay-simple-overlay-hover focus-visible:bg-v2-overlay-simple-overlay-hover focus-visible:outline-none"><span class="min-w-0 truncate leading-5">`), _tmpl$8 = /* @__PURE__ */ template(`<button><span class="min-w-0 truncate leading-5">`);
const actionPrefix = "action:";
const projectPrefix = "project:";
function projectKey(project) {
  return `${projectPrefix}${encodeURIComponent(project.server?.key ?? "")}:${encodeURIComponent(project.worktree)}`;
}
function actionKey(server) {
  return `${actionPrefix}${encodeURIComponent(server ?? "")}`;
}
function createPromptProjectController(input) {
  const language = useLanguage();
  const [store, setStore] = createStore({
    open: false,
    search: "",
    active: ""
  });
  let searchRef;
  const current = () => {
    const key = pathKey(input.controls().directory);
    return input.controls().available.find((project) => (!project.server || project.server.key === input.controls().server) && (pathKey(project.worktree) === key || project.sandboxes?.some((sandbox) => pathKey(sandbox) === key)));
  };
  const selected = () => current() ?? input.controls().available[0];
  const projects = () => {
    const search = store.search.trim().toLowerCase();
    if (!search) return input.controls().available;
    return input.controls().available.filter((project) => displayName(project).toLowerCase().includes(search));
  };
  const servers = () => input.controls().available.map((project) => project.server).filter((server, index, all) => server && all.findIndex((item) => item?.key === server.key) === index);
  const keys = () => {
    if (servers().length <= 1) {
      return [...projects().map(projectKey), actionKey(servers()[0]?.key)];
    }
    return [...servers().flatMap((server) => projects().filter((project) => project.server?.key === server.key).map(projectKey)), actionKey()];
  };
  const initialActive = () => {
    const selectedKey = selected() ? projectKey(selected()) : void 0;
    const options = keys();
    if (selectedKey && options.includes(selectedKey)) return selectedKey;
    return options[0] ?? "";
  };
  const close = () => {
    setStore({
      open: false,
      search: "",
      active: ""
    });
    input.onDone();
  };
  const select = (project) => {
    if (pathKey(project.worktree) !== pathKey(current()?.worktree ?? "") || project.server?.key !== current()?.server?.key) {
      input.controls().select(project.worktree, project.server?.key);
    }
    close();
  };
  const add = (server) => {
    setStore({
      open: false,
      search: "",
      active: ""
    });
    input.controls().add(language.t("command.project.open"), server);
  };
  const setSearch = (value) => {
    const search = value.trim().toLowerCase();
    const first = input.controls().available.find((project) => !search || displayName(project).toLowerCase().includes(search));
    setStore({
      search: value,
      active: first ? projectKey(first) : actionKey(servers().length > 1 ? void 0 : servers()[0]?.key)
    });
  };
  return {
    selected,
    empty: () => input.controls().available.length === 0,
    projects,
    servers,
    projectKey,
    actionKey,
    open: () => store.open,
    search: () => store.search,
    active: () => store.active,
    labels: {
      add: () => language.t("session.new.project.add"),
      clear: () => language.t("common.clear"),
      new: () => language.t("session.new.project.new"),
      search: () => language.t("session.new.project.search")
    },
    add,
    select,
    setOpen(open) {
      if (open) {
        setStore({
          open: true,
          active: initialActive()
        });
        setTimeout(() => requestAnimationFrame(() => searchRef?.focus()));
        return;
      }
      setStore({
        open: false,
        search: "",
        active: ""
      });
    },
    setSearch,
    clearSearch() {
      setStore({
        search: "",
        active: initialActive()
      });
      setTimeout(() => searchRef?.focus());
    },
    setActive(key) {
      setStore("active", key);
    },
    moveActive(delta) {
      const options = keys();
      if (options.length === 0) return;
      const index = options.indexOf(store.active);
      const start = index === -1 ? 0 : index;
      setStore("active", options[(start + delta + options.length) % options.length]);
    },
    activeProject() {
      return store.active.startsWith(projectPrefix) ? projects().find((project) => projectKey(project) === store.active) : void 0;
    },
    activeServer() {
      return store.active.startsWith(actionPrefix) ? decodeURIComponent(store.active.slice(actionPrefix.length)) || void 0 : void 0;
    },
    activeAction() {
      return store.active.startsWith(actionPrefix);
    },
    setSearchRef(el) {
      searchRef = el;
    },
    focusSearch() {
      setTimeout(() => requestAnimationFrame(() => searchRef?.focus()));
    },
    handleSearchKeydown(event) {
      return handleDocumentSearchKeydown(searchRef, event, store.search, setSearch);
    }
  };
}
function PromptProjectSelector(props) {
  const [triggerReady, setTriggerReady] = createSignal(false);
  let contentRef;
  let triggerFrame;
  let restoreTrigger = true;
  const setTriggerRef = (element) => {
    const ready = () => {
      if (!element.isConnected) {
        triggerFrame = requestAnimationFrame(ready);
        return;
      }
      triggerFrame = void 0;
      setTriggerReady(true);
    };
    ready();
  };
  onCleanup(() => {
    if (triggerFrame !== void 0) cancelAnimationFrame(triggerFrame);
  });
  const activeItem = () => props.controller.active() ? contentRef?.querySelector(`[data-option-key="${CSS.escape(props.controller.active())}"]`) : void 0;
  const afterClose = (callback) => {
    const complete = () => {
      if (contentRef?.isConnected) {
        requestAnimationFrame(complete);
        return;
      }
      requestAnimationFrame(() => requestAnimationFrame(callback));
    };
    requestAnimationFrame(complete);
  };
  const selectProject = (project) => {
    restoreTrigger = false;
    props.controller.setOpen(false);
    afterClose(() => props.controller.select(project));
  };
  const selectAction = (server) => {
    restoreTrigger = false;
    props.controller.setOpen(false);
    afterClose(() => props.controller.add(server));
  };
  const selectActive = () => {
    const project = props.controller.activeProject();
    if (project) {
      selectProject(project);
      return;
    }
    if (props.controller.activeAction() && props.controller.servers().length > 1) {
      const item = activeItem();
      item?.focus();
      item?.dispatchEvent(new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true
      }));
      return;
    }
    selectAction(props.controller.activeServer());
  };
  const moveActive = (delta) => {
    props.controller.moveActive(delta);
    queueMicrotask(() => activeItem()?.scrollIntoView({
      block: "nearest"
    }));
  };
  const focusPreviousControl = () => {
    const target = Array.from(document.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((element) => !contentRef?.contains(element) && !element.hasAttribute("data-focus-trap")).findLast((element) => element.offsetParent !== null);
    restoreTrigger = false;
    target?.focus();
    queueMicrotask(() => {
      if (props.controller.open()) props.controller.setOpen(false);
    });
  };
  const selectedValue = () => {
    const project = props.controller.selected();
    return project ? props.controller.projectKey(project) : void 0;
  };
  createEffect(() => {
    if (!props.controller.open()) return;
    const handler = (event) => props.controller.handleSearchKeydown(event);
    document.addEventListener("keydown", handler, true);
    onCleanup(() => document.removeEventListener("keydown", handler, true));
  });
  return createComponent(DropdownMenu, {
    get open() {
      return memo(() => !!triggerReady())() && props.controller.open();
    },
    get placement() {
      return props.placement ?? "bottom";
    },
    gutter: 4,
    modal: false,
    onOpenChange: (open) => props.controller.setOpen(open),
    get children() {
      return [createComponent(DropdownMenu.Trigger, {
        as: ProjectTrigger,
        ref: setTriggerRef,
        get controller() {
          return props.controller;
        }
      }), createComponent(DropdownMenu.Portal, {
        get children() {
          return createComponent(DropdownMenu.Content, {
            ref(r$) {
              var _ref$ = contentRef;
              typeof _ref$ === "function" ? _ref$(r$) : contentRef = r$;
            },
            id: "prompt-project-menu",
            "class": "w-[243px] overflow-hidden rounded-md border-0 bg-v2-background-bg-layer-01 p-0 shadow-[var(--v2-elevation-floating)] focus:outline-none [&[data-closed]]:!animate-none",
            onOpenAutoFocus: (event) => event.preventDefault(),
            onPointerDownOutside: () => restoreTrigger = false,
            onFocusOutside: () => restoreTrigger = false,
            onCloseAutoFocus: (event) => {
              if (!restoreTrigger) event.preventDefault();
            },
            get children() {
              return [(() => {
                var _el$ = _tmpl$2$2(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
                insert(_el$2, createComponent(Icon, {
                  name: "magnifying-glass",
                  size: "small",
                  "class": "shrink-0"
                }), _el$3);
                _el$3.$$keydown = (event) => {
                  if (event.key === "Tab") {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.shiftKey) {
                      focusPreviousControl();
                      return;
                    }
                    activeItem()?.focus();
                    return;
                  }
                  event.stopPropagation();
                  if (event.key === "Escape") {
                    event.preventDefault();
                    props.controller.setOpen(false);
                    return;
                  }
                  if (event.altKey || event.metaKey) return;
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    moveActive(1);
                    return;
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    moveActive(-1);
                    return;
                  }
                  if (event.key === "Enter" && !event.isComposing) {
                    event.preventDefault();
                    selectActive();
                  }
                };
                _el$3.$$input = (event) => props.controller.setSearch(event.currentTarget.value);
                use((el) => props.controller.setSearchRef(el), _el$3);
                insert(_el$2, createComponent(Show, {
                  get when() {
                    return props.controller.search().trim();
                  },
                  get children() {
                    var _el$4 = _tmpl$$2();
                    _el$4.$$click = () => props.controller.clearSearch();
                    _el$4.$$pointerdown = (event) => event.preventDefault();
                    insert(_el$4, createComponent(Icon, {
                      name: "close-small",
                      size: "small"
                    }));
                    createRenderEffect(() => setAttribute(_el$4, "aria-label", props.controller.labels.clear()));
                    return _el$4;
                  }
                }), null);
                insert(_el$, createComponent(Show, {
                  get when() {
                    return props.controller.servers().length > 1;
                  },
                  get fallback() {
                    return createComponent(DropdownMenu.RadioGroup, {
                      get value() {
                        return selectedValue();
                      },
                      get children() {
                        return createComponent(For, {
                          get each() {
                            return props.controller.projects();
                          },
                          children: (project) => createComponent(ProjectItem, {
                            project,
                            get controller() {
                              return props.controller;
                            },
                            onSelect: selectProject
                          })
                        });
                      }
                    });
                  },
                  get children() {
                    return createComponent(For, {
                      get each() {
                        return props.controller.servers().filter((server) => props.controller.projects().some((project) => project.server?.key === server.key));
                      },
                      children: (server) => (() => {
                        var _el$8 = _tmpl$6(), _el$9 = _el$8.firstChild;
                        insert(_el$9, () => server.name);
                        insert(_el$8, createComponent(DropdownMenu.RadioGroup, {
                          get value() {
                            return selectedValue();
                          },
                          get children() {
                            return createComponent(For, {
                              get each() {
                                return props.controller.projects().filter((project) => project.server?.key === server.key);
                              },
                              children: (project) => createComponent(ProjectItem, {
                                project,
                                get controller() {
                                  return props.controller;
                                },
                                onSelect: selectProject
                              })
                            });
                          }
                        }), null);
                        return _el$8;
                      })()
                    });
                  }
                }), null);
                createRenderEffect((_p$) => {
                  var _v$ = props.controller.labels.search(), _v$2 = props.controller.active() || void 0;
                  _v$ !== _p$.e && setAttribute(_el$3, "placeholder", _p$.e = _v$);
                  _v$2 !== _p$.t && setAttribute(_el$3, "aria-activedescendant", _p$.t = _v$2);
                  return _p$;
                }, {
                  e: void 0,
                  t: void 0
                });
                createRenderEffect(() => _el$3.value = props.controller.search());
                return _el$;
              })(), _tmpl$3$2(), (() => {
                var _el$6 = _tmpl$5$1();
                insert(_el$6, createComponent(Show, {
                  get when() {
                    return props.controller.servers().length > 1;
                  },
                  get fallback() {
                    return createComponent(ProjectAction, {
                      get server() {
                        return props.controller.servers()[0]?.key;
                      },
                      get controller() {
                        return props.controller;
                      },
                      onSelect: selectAction
                    });
                  },
                  get children() {
                    return createComponent(DropdownMenu.Sub, {
                      get children() {
                        return [createComponent(DropdownMenu.SubTrigger, {
                          get id() {
                            return props.controller.actionKey();
                          },
                          get ["data-option-key"]() {
                            return props.controller.actionKey();
                          },
                          "class": projectActionClass,
                          get classList() {
                            return {
                              "!bg-v2-overlay-simple-overlay-hover": props.controller.active() === props.controller.actionKey()
                            };
                          },
                          onMouseEnter: () => props.controller.setActive(props.controller.actionKey()),
                          get children() {
                            return [createComponent(Icon, {
                              name: "plus",
                              size: "small"
                            }), (() => {
                              var _el$7 = _tmpl$4$2();
                              insert(_el$7, () => props.controller.labels.add());
                              return _el$7;
                            })(), createComponent(Icon, {
                              name: "chevron-right",
                              size: "small",
                              "class": "shrink-0 text-v2-icon-icon-muted"
                            })];
                          }
                        }), createComponent(DropdownMenu.Portal, {
                          get children() {
                            return createComponent(DropdownMenu.SubContent, {
                              "class": "min-w-[180px] overflow-hidden rounded-md border-0 bg-v2-background-bg-layer-01 p-0.5 shadow-[var(--v2-elevation-floating)] focus:outline-none",
                              get children() {
                                return createComponent(For, {
                                  get each() {
                                    return props.controller.servers();
                                  },
                                  children: (server) => createComponent(ServerAction, {
                                    server,
                                    onSelect: selectAction
                                  })
                                });
                              }
                            });
                          }
                        })];
                      }
                    });
                  }
                }));
                return _el$6;
              })()];
            }
          });
        }
      })];
    }
  });
}
function PromptProjectAddButton(props) {
  return (() => {
    var _el$0 = _tmpl$7(), _el$1 = _el$0.firstChild;
    _el$0.$$click = () => props.controller.add();
    insert(_el$0, createComponent(Icon, {
      name: "folder-add-left",
      size: "small",
      "class": "shrink-0 text-v2-icon-icon-muted"
    }), _el$1);
    insert(_el$1, () => props.controller.labels.new());
    insert(_el$0, createComponent(Icon, {
      name: "chevron-down",
      size: "small",
      "class": "shrink-0 text-v2-icon-icon-muted"
    }), null);
    return _el$0;
  })();
}
function ProjectTrigger(props) {
  const [local, rest] = splitProps(props, ["controller", "class", "classList", "onClick", "onKeyDown"]);
  const project = () => local.controller.selected();
  return (() => {
    var _el$10 = _tmpl$8(), _el$11 = _el$10.firstChild;
    spread(_el$10, mergeProps(rest, {
      "data-action": "prompt-project",
      "type": "button",
      "class": "flex h-7 min-w-0 max-w-[203px] items-center gap-1.5 rounded-sm px-1.5 transition-colors focus-visible:bg-v2-overlay-simple-overlay-hover focus-visible:outline-none",
      get classList() {
        return {
          ...local.classList,
          "hover:bg-v2-overlay-simple-overlay-hover": !local.controller.open(),
          "bg-v2-overlay-simple-overlay-pressed": local.controller.open(),
          "text-v2-text-text-muted": local.controller.open()
        };
      },
      get onClick() {
        return local.onClick ?? (() => local.controller.setOpen(true));
      },
      "onKeyDown": (event) => {
        if (!local.controller.open() && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        if (typeof local.onKeyDown === "function") local.onKeyDown(event);
      }
    }), false, true);
    insert(_el$10, createComponent(Show, {
      get when() {
        return project();
      },
      get fallback() {
        return createComponent(Icon, {
          name: "folder-add-left",
          size: "small",
          "class": "shrink-0 text-v2-icon-icon-muted"
        });
      },
      children: (item) => createComponent(ProjectAvatar, {
        get fallback() {
          return displayName(item());
        },
        get src() {
          return getProjectAvatarSource(item().id, item().icon);
        },
        get variant() {
          return getProjectAvatarVariant(item().icon?.color);
        }
      })
    }), _el$11);
    insert(_el$11, (() => {
      var _c$ = memo(() => !!project());
      return () => _c$() ? displayName(project()) : local.controller.labels.new();
    })());
    insert(_el$10, createComponent(Icon, {
      name: "chevron-down",
      size: "small",
      "class": "shrink-0 text-v2-icon-icon-muted"
    }), null);
    return _el$10;
  })();
}
function ProjectItem(props) {
  const key = () => props.controller.projectKey(props.project);
  return createComponent(DropdownMenu.RadioItem, {
    get id() {
      return key();
    },
    get value() {
      return key();
    },
    get ["data-option-key"]() {
      return key();
    },
    "class": "h-7 gap-2 rounded-sm px-3 text-[13px] font-[440] leading-5 tracking-[-0.04px] text-v2-text-text-base data-[highlighted]:!bg-v2-overlay-simple-overlay-hover",
    get classList() {
      return {
        "!bg-v2-overlay-simple-overlay-hover": props.controller.active() === key()
      };
    },
    style: {
      "font-family": "var(--v2-font-family-sans)",
      "font-size": "13px",
      "font-weight": 440,
      "line-height": "20px",
      "letter-spacing": "-0.04px",
      color: "var(--v2-text-text-base)",
      padding: "0 12px"
    },
    closeOnSelect: true,
    onMouseEnter: () => {
      props.controller.setActive(key());
      props.controller.focusSearch();
    },
    onSelect: () => props.onSelect(props.project),
    get children() {
      return [createComponent(ProjectAvatar, {
        get fallback() {
          return displayName(props.project);
        },
        get src() {
          return getProjectAvatarSource(props.project.id, props.project.icon);
        },
        get variant() {
          return getProjectAvatarVariant(props.project.icon?.color);
        }
      }), createComponent(DropdownMenu.ItemLabel, {
        "class": "min-w-0 truncate leading-5",
        get children() {
          return displayName(props.project);
        }
      }), createComponent(DropdownMenu.ItemIndicator, {
        style: {
          width: "14px",
          height: "14px",
          right: "12px"
        },
        get children() {
          return createComponent(Icon$1, {
            name: "check",
            size: "small",
            "class": "shrink-0 text-v2-icon-icon-base"
          });
        }
      })];
    }
  });
}
const projectActionClass = "h-7 gap-2 rounded-sm px-3 text-[13px] font-[440] leading-5 tracking-[-0.04px] text-v2-text-text-base [font-family:var(--v2-font-family-sans)] data-[highlighted]:!bg-v2-overlay-simple-overlay-hover";
function ProjectAction(props) {
  const key = () => props.controller.actionKey(props.server);
  return createComponent(DropdownMenu.Item, {
    get id() {
      return key();
    },
    get ["data-option-key"]() {
      return key();
    },
    "class": "h-7 gap-2 rounded-sm px-3 text-[13px] font-[440] leading-5 tracking-[-0.04px] text-v2-text-text-base data-[highlighted]:!bg-v2-overlay-simple-overlay-hover",
    get classList() {
      return {
        "!bg-v2-overlay-simple-overlay-hover": props.controller.active() === key()
      };
    },
    style: {
      "font-family": "var(--v2-font-family-sans)",
      "font-size": "13px",
      "font-weight": 440,
      "line-height": "20px",
      "letter-spacing": "-0.04px",
      color: "var(--v2-text-text-base)",
      padding: "0 12px"
    },
    onMouseEnter: () => {
      props.controller.setActive(key());
      props.controller.focusSearch();
    },
    onSelect: () => props.onSelect(props.server),
    get children() {
      return [createComponent(Icon, {
        name: "plus",
        size: "small"
      }), createComponent(DropdownMenu.ItemLabel, {
        "class": "min-w-0 truncate leading-5",
        get children() {
          return props.controller.labels.add();
        }
      })];
    }
  });
}
function ServerAction(props) {
  return createComponent(DropdownMenu.Item, {
    "class": projectActionClass,
    onSelect: () => props.onSelect(props.server.key),
    get children() {
      return createComponent(DropdownMenu.ItemLabel, {
        "class": "min-w-0 flex-1 truncate leading-5",
        get children() {
          return props.server.name;
        }
      });
    }
  });
}
delegateEvents(["input", "keydown", "pointerdown", "click"]);
var _tmpl$$1 = /* @__PURE__ */ template(`<span class="hidden select-none opacity-50 sm:inline mx-1">/`), _tmpl$2$1 = /* @__PURE__ */ template(`<span class="min-w-0 truncate">`), _tmpl$3$1 = /* @__PURE__ */ template(`<span class="min-w-0 flex-1 truncate">`), _tmpl$4$1 = /* @__PURE__ */ template(`<div class="flex h-7 min-w-0 max-w-[220px] items-center gap-1.5 px-2 text-[13px] font-[440] leading-5 tracking-[-0.04px]"><span class="min-w-0 truncate">`);
function PromptWorkspaceSelector(props) {
  const language = useLanguage();
  let pending;
  const selected = () => props.value === props.projectRoot ? "main" : props.value;
  const icon = () => {
    if (selected() === "main") return "monitor";
    if (selected() === "create") return "workspace-new";
    return "workspace";
  };
  const select = (value) => {
    pending = value;
  };
  const onOpenChange = (open) => {
    if (open) return;
    const value = pending;
    pending = void 0;
    if (value) props.onChange(value);
    props.onDone();
  };
  const label = () => {
    if (selected() === "main") return language.t("session.new.workspace.triggerLocal");
    if (props.value === "create") return language.t("workspace.new");
    return getFilename(props.value);
  };
  return [_tmpl$$1(), createComponent(MenuV2, {
    placement: "bottom",
    gutter: 4,
    onOpenChange,
    get children() {
      return [createComponent(MenuV2.Trigger, {
        "class": "flex h-7 min-w-0 max-w-[203px] items-center gap-1.5 rounded-sm px-1.5 hover:bg-v2-overlay-simple-overlay-hover focus-visible:bg-v2-overlay-simple-overlay-hover focus-visible:outline-none data-[expanded]:bg-v2-overlay-simple-overlay-pressed data-[expanded]:text-v2-text-text-muted",
        get children() {
          return [createComponent(Icon$1, {
            get name() {
              return icon();
            },
            "class": "shrink-0 text-v2-icon-icon-muted"
          }), (() => {
            var _el$2 = _tmpl$2$1();
            insert(_el$2, label);
            return _el$2;
          })(), createComponent(Icon, {
            name: "chevron-down",
            size: "small",
            "class": "shrink-0 text-v2-icon-icon-muted"
          })];
        }
      }), createComponent(MenuV2.Portal, {
        get children() {
          return createComponent(MenuV2.Content, {
            "class": "w-[180px]",
            get children() {
              return [createComponent(MenuV2.Group, {
                get children() {
                  return [createComponent(MenuV2.GroupLabel, {
                    get children() {
                      return language.t("session.new.workspace.runIn");
                    }
                  }), createComponent(MenuV2.Item, {
                    onSelect: () => select("main"),
                    get children() {
                      return [createComponent(Icon$1, {
                        name: "monitor"
                      }), (() => {
                        var _el$3 = _tmpl$3$1();
                        insert(_el$3, () => language.t("session.new.workspace.local"));
                        return _el$3;
                      })(), createComponent(Show, {
                        get when() {
                          return selected() === "main";
                        },
                        get children() {
                          return createComponent(Icon, {
                            name: "check",
                            size: "small",
                            "class": "shrink-0"
                          });
                        }
                      })];
                    }
                  }), createComponent(MenuV2.Item, {
                    onSelect: () => select("create"),
                    get children() {
                      return [createComponent(Icon$1, {
                        name: "workspace-new"
                      }), (() => {
                        var _el$4 = _tmpl$3$1();
                        insert(_el$4, () => language.t("workspace.new"));
                        return _el$4;
                      })(), createComponent(Show, {
                        get when() {
                          return selected() === "create";
                        },
                        get children() {
                          return createComponent(Icon, {
                            name: "check",
                            size: "small",
                            "class": "shrink-0"
                          });
                        }
                      })];
                    }
                  })];
                }
              }), createComponent(Show, {
                get when() {
                  return props.workspaces.length > 0;
                },
                get children() {
                  return [createComponent(MenuV2.Separator, {}), createComponent(MenuV2.Sub, {
                    gutter: 0,
                    overlap: true,
                    overflowPadding: 8,
                    get children() {
                      return [createComponent(MenuV2.SubTrigger, {
                        get children() {
                          return [createComponent(Icon$1, {
                            name: "workspace"
                          }), memo(() => language.t("session.new.workspace.existing"))];
                        }
                      }), createComponent(MenuV2.Portal, {
                        get children() {
                          return createComponent(MenuV2.SubContent, {
                            "class": "max-w-[200px]",
                            get children() {
                              return createComponent(For, {
                                get each() {
                                  return props.workspaces;
                                },
                                children: (workspace) => createComponent(MenuV2.Item, {
                                  onSelect: () => select(workspace),
                                  get children() {
                                    return [createComponent(Icon$1, {
                                      name: "workspace-isolated"
                                    }), (() => {
                                      var _el$5 = _tmpl$3$1();
                                      insert(_el$5, () => getFilename(workspace));
                                      return _el$5;
                                    })(), createComponent(Show, {
                                      get when() {
                                        return selected() === workspace;
                                      },
                                      get children() {
                                        return createComponent(Icon, {
                                          name: "check",
                                          size: "small",
                                          "class": "shrink-0"
                                        });
                                      }
                                    })];
                                  }
                                })
                              });
                            }
                          });
                        }
                      })];
                    }
                  })];
                }
              })];
            }
          });
        }
      })];
    }
  }), createComponent(Show, {
    get when() {
      return props.branch;
    },
    children: (branch) => [_tmpl$$1(), createComponent(TooltipV2, {
      placement: "top",
      get value() {
        return branch();
      },
      "class": "min-w-0 max-w-[220px]",
      contentClass: "max-w-[calc(100vw-32px)] break-all",
      get children() {
        var _el$7 = _tmpl$4$1(), _el$8 = _el$7.firstChild;
        insert(_el$7, createComponent(Icon, {
          name: "branch",
          size: "small",
          "class": "shrink-0 text-v2-icon-icon-muted"
        }), _el$8);
        insert(_el$8, branch);
        return _el$7;
      }
    })]
  })];
}
function createPromptModelSelection(input) {
  const sdk = useSDK();
  const sync = useSync();
  const models = useModels();
  const prompt = usePrompt();
  const providers = useProviders(() => sdk().directory);
  const connected = createMemo(() => new Set(providers.connected().map((item) => item.id)));
  const valid = (model) => {
    const provider = providers.all().get(model.providerID);
    return !!provider?.models[model.modelID] && connected().has(model.providerID);
  };
  const configured = () => {
    const value = sync().data.config.model;
    if (!value) return;
    const [providerID, modelID] = value.split("/");
    const model = { providerID, modelID };
    if (valid(model)) return model;
  };
  const recent = () => models.recent.list().find(valid);
  const fallback = () => {
    const defaults = providers.default();
    return providers.connected().flatMap((provider) => {
      const modelID = defaults[provider.id] ?? Object.values(provider.models)[0]?.id;
      return modelID ? [{ providerID: provider.id, modelID }] : [];
    })[0];
  };
  const current = () => {
    const key = [prompt.model.current(), input.agent()?.model, configured(), recent(), fallback()].find(
      (item) => !!item && valid(item)
    );
    if (!key) return;
    return models.find(key);
  };
  const recentModels = createMemo(
    () => models.recent.list().map(models.find).filter((item) => !!item)
  );
  const selection = {
    ready: models.ready,
    current,
    recent: recentModels,
    list: models.list,
    cycle(direction) {
      const items = recentModels();
      const item = current();
      if (!item) return;
      const index = items.findIndex((entry) => entry.provider.id === item.provider.id && entry.id === item.id);
      if (index === -1) return;
      const next = items[(index + direction + items.length) % items.length];
      if (next) selection.set({ providerID: next.provider.id, modelID: next.id });
    },
    set(item, options) {
      startTransition(
        () => batch(() => {
          prompt.model.set(item ? { ...item, variant: prompt.model.current()?.variant } : void 0);
          if (!item) return;
          models.setVisibility(item, true);
          if (options?.recent) models.recent.push(item);
        })
      );
    },
    visible: models.visible,
    setVisibility: models.setVisibility,
    variant: {
      configured() {
        const item = input.agent();
        const model = current();
        if (!item || !model) return;
        return getConfiguredAgentVariant({
          agent: { model: item.model, variant: item.variant },
          model: { providerID: model.provider.id, modelID: model.id, variants: model.variants }
        });
      },
      selected() {
        return prompt.model.current()?.variant;
      },
      current() {
        const resolved = resolveModelVariant({
          variants: this.list(),
          selected: this.selected(),
          configured: this.configured()
        });
        if (resolved) return resolved;
        const model = current();
        if (!model) return;
        const saved = models.variant.get({ providerID: model.provider.id, modelID: model.id });
        if (saved && this.list().includes(saved)) return saved;
      },
      list() {
        return Object.keys(current()?.variants ?? {});
      },
      set(value) {
        startTransition(
          () => batch(() => {
            const model = current();
            if (!model) return;
            prompt.model.set({ providerID: model.provider.id, modelID: model.id, variant: value ?? null });
            models.variant.set({ providerID: model.provider.id, modelID: model.id }, value);
          })
        );
      },
      cycle() {
        const variants = this.list();
        if (variants.length === 0) return;
        this.set(
          cycleModelVariant({
            variants,
            selected: this.selected(),
            configured: this.configured()
          })
        );
      }
    }
  };
  return selection;
}
var _tmpl$ = /* @__PURE__ */ template(`<div class="flex min-h-7 min-w-0 items-center gap-0 text-v2-text-text-faint">`), _tmpl$2 = /* @__PURE__ */ template(`<div><div class="flex flex-col">`), _tmpl$3 = /* @__PURE__ */ template(`<div class="relative size-full overflow-hidden flex flex-col"><div class="flex-1 min-h-0 flex flex-col gap-2 p-2"><div class="@container relative flex flex-col min-h-0 h-full flex-1"><div class="flex-1 min-h-0 overflow-hidden rounded-[10px]">`), _tmpl$4 = /* @__PURE__ */ template(`<button type=button class="flex size-6 items-center justify-center rounded-[4px] text-v2-icon-icon-muted transition-[background-color,color] duration-150 ease-in-out hover:bg-v2-overlay-simple-overlay-hover hover:text-v2-icon-icon-base focus-visible:bg-v2-overlay-simple-overlay-hover focus-visible:text-v2-icon-icon-base focus-visible:outline-none">`), _tmpl$5 = /* @__PURE__ */ template(`<div class="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-10"><div data-component=provider-tip class="group/provider-tip pointer-events-auto relative flex h-6 max-w-full items-center transition-[opacity,transform] duration-[250ms] ease-[cubic-bezier(0.215,0.61,0.355,1)] motion-reduce:transition-none"><button type=button class="flex h-6 min-w-0 items-center rounded-[4px] pl-1.5 text-[13px] leading-none tracking-[-0.04px] text-v2-text-text-faint transition-[background-color,color] duration-150 ease-in-out hover:bg-v2-overlay-simple-overlay-hover hover:text-v2-text-text-muted focus-visible:bg-v2-overlay-simple-overlay-hover focus-visible:text-v2-text-text-muted focus-visible:outline-none"><span class=truncate></span><span class="flex size-6 shrink-0 items-center justify-center"aria-hidden=true>`);
const providerTipDismissalDuration = 30 * 24 * 60 * 60 * 1e3;
function NewSessionPage() {
  const prompt = usePrompt();
  const sdk = useSDK();
  const sync = useSync();
  const serverSync = useServerSync();
  const comments = useComments();
  const language = useLanguage();
  const settings = useSettings();
  const dialog = useDialog();
  const command = useCommand();
  const providers = useProviders(() => sdk().directory);
  const openProviders = () => {
    void __vitePreload(async () => {
      const { DialogConnectProvider } = await import("./dialog-connect-provider-BamXKthB.js").then((n) => n.d);
      return { DialogConnectProvider };
    }, true ? __vite__mapDeps([0,1,2]) : void 0, import.meta.url).then(({
      DialogConnectProvider
    }) => {
      void dialog.show(() => createComponent(DialogConnectProvider, {
        directory: () => sdk().directory
      }));
    });
  };
  useSettingsCommand();
  const route = useSessionKey();
  const [searchParams, setSearchParams] = useSearchParams();
  const local = useLocal();
  const model = createPromptModelSelection({
    agent: local.agent.current
  });
  useComposerCommands({
    model
  });
  const inputController = createPromptInputController({
    sessionKey: route.sessionKey,
    sessionID: () => route.params.id,
    queryOptions: serverSync().queryOptions,
    model
  });
  const projectControls = createPromptProjectControls();
  const [store, setStore] = createStore({});
  const rightMount = useTitlebarRightMount();
  const showWorkspaceBar = createMemo(() => sync().project?.vcs === "git");
  const newSessionWorktree = createMemo(() => {
    if (!showWorkspaceBar()) return "main";
    if (store.worktree) return store.worktree;
    const project = sync().project;
    if (project && sdk().directory !== project.worktree) return sdk().directory;
    return "main";
  });
  const projectRoot = createMemo(() => sync().project?.worktree ?? sdk().directory);
  const localBranch = createMemo(() => serverSync().child(projectRoot())[0].vcs?.branch);
  const selectedBranch = createMemo(() => {
    const worktree = newSessionWorktree();
    if (worktree === "main" || worktree === "create") return localBranch();
    return serverSync().child(worktree)[0].vcs?.branch ?? localBranch();
  });
  const promptInputV2Controller = usePromptInputV2Controller({
    get controls() {
      return inputController();
    },
    get newSessionWorktree() {
      return newSessionWorktree();
    },
    onNewSessionWorktreeReset: () => setStore("worktree", void 0),
    onSubmit: () => comments.clear()
  });
  const projectController = createPromptProjectController({
    controls: projectControls,
    onDone: promptInputV2Controller.restoreFocus
  });
  command.register("new-session", () => [{
    id: "command.palette",
    title: language.t("command.palette"),
    hidden: true,
    onSelect: async () => {
      const {
        DialogSelectFile
      } = await __vitePreload(async () => {
        const {
          DialogSelectFile: DialogSelectFile2
        } = await import("./dialog-select-file-Db1eET53.js");
        return {
          DialogSelectFile: DialogSelectFile2
        };
      }, true ? __vite__mapDeps([3,1,2,4,5]) : void 0, import.meta.url);
      void dialog.show(() => createComponent(DialogSelectFile, {}));
    }
  }, {
    id: "input.focus",
    title: language.t("command.input.focus"),
    category: language.t("command.category.view"),
    keybind: "ctrl+l",
    onSelect: () => promptInputV2Controller.restoreFocus()
  }]);
  createEffect(() => {
    if (!prompt.ready()) return;
    untrack(() => {
      const text = searchParams.prompt;
      if (!text) return;
      prompt.set([{
        type: "text",
        content: text,
        start: 0,
        end: text.length
      }], text.length);
      setSearchParams({
        ...searchParams,
        prompt: void 0
      });
    });
  });
  createEffect(() => {
    if (!prompt.ready()) return;
    promptInputV2Controller.restoreFocus();
  });
  const ready = Promise.resolve();
  const [suspendUntilPromptReady] = createResource(() => prompt.ready.promise ?? ready, (promise) => promise.then(() => true));
  return (() => {
    var _el$ = _tmpl$3(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild;
    insert(_el$, suspendUntilPromptReady, _el$2);
    insert(_el$, createComponent(Show, {
      get when() {
        return rightMount();
      },
      children: (mount) => createComponent(Portal, {
        get mount() {
          return mount();
        },
        get children() {
          return createComponent(Show, {
            get when() {
              return settings.visibility.status();
            },
            get children() {
              return createComponent(Tooltip, {
                placement: "bottom",
                get value() {
                  return language.t("status.popover.trigger");
                },
                get children() {
                  return createComponent(StatusPopoverV2, {});
                }
              });
            }
          });
        }
      })
    }), _el$2);
    insert(_el$4, createComponent(NewSessionDesignView, {
      get children() {
        var _el$5 = _tmpl$2(), _el$6 = _el$5.firstChild;
        className(_el$5, NEW_SESSION_CONTENT_WIDTH);
        insert(_el$6, createComponent(PromptInputV2Composer, {
          controller: promptInputV2Controller
        }), null);
        insert(_el$6, createComponent(Show, {
          get when() {
            return projectController.empty();
          },
          get children() {
            return createComponent(PromptProjectAddButton, {
              controller: projectController
            });
          }
        }), null);
        insert(_el$6, createComponent(Show, {
          get when() {
            return projectController.selected();
          },
          get children() {
            var _el$7 = _tmpl$();
            insert(_el$7, createComponent(PromptProjectSelector, {
              controller: projectController,
              get placement() {
                return showWorkspaceBar() ? "bottom" : "bottom-start";
              }
            }), null);
            insert(_el$7, createComponent(Show, {
              get when() {
                return showWorkspaceBar();
              },
              get children() {
                return createComponent(PromptWorkspaceSelector, {
                  get value() {
                    return newSessionWorktree();
                  },
                  get projectRoot() {
                    return projectRoot();
                  },
                  get workspaces() {
                    return sync().project?.sandboxes ?? [];
                  },
                  get branch() {
                    return selectedBranch();
                  },
                  onChange: (value) => setStore("worktree", value === "main" && sync().project?.worktree !== sdk().directory ? sync().project?.worktree : value),
                  get onDone() {
                    return promptInputV2Controller.restoreFocus;
                  }
                });
              }
            }), null);
            createRenderEffect((_$p) => classList(_el$7, {
              "flex-col justify-center sm:flex-row": showWorkspaceBar(),
              "justify-start": !showWorkspaceBar()
            }, _$p));
            return _el$7;
          }
        }), null);
        createRenderEffect((_p$) => {
          var _v$ = !!showWorkspaceBar(), _v$2 = !showWorkspaceBar();
          _v$ !== _p$.e && _el$6.classList.toggle("gap-8", _p$.e = _v$);
          _v$2 !== _p$.t && _el$6.classList.toggle("gap-3", _p$.t = _v$2);
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$5;
      }
    }), null);
    insert(_el$4, createComponent(ProviderTip, {
      ready: () => serverSync().child(sdk().directory)[0].provider_ready,
      connected: () => providers.paid().length > 0,
      openProviders
    }), null);
    return _el$;
  })();
}
function ProviderTip(props) {
  const language = useLanguage();
  const [persistedState, setPersistedState, , persistedReady] = persisted(Persist.global("new-session.provider-tip"), createStore({
    dismissedAt: 0
  }));
  const visible = createMemo(() => props.ready() && persistedReady() && !props.connected() && Date.now() - persistedState.dismissedAt >= providerTipDismissalDuration);
  function dismiss() {
    setPersistedState("dismissedAt", Date.now());
  }
  const [ref, setRef] = createSignal();
  const presence = index_default({
    show: () => visible(),
    element: () => ref() ?? null
  });
  return createComponent(Show, {
    get when() {
      return presence.present();
    },
    get children() {
      var _el$8 = _tmpl$5(), _el$9 = _el$8.firstChild, _el$0 = _el$9.firstChild, _el$1 = _el$0.firstChild, _el$10 = _el$1.nextSibling;
      use(setRef, _el$9);
      classList(_el$9, {
        "data-[visible=false]:animate-out fade-out slide-out-to-bottom-4": true
      });
      addEventListener(_el$0, "click", props.openProviders, true);
      insert(_el$1, () => language.t("home.providerTip"));
      insert(_el$10, createComponent(Icon$1, {
        name: "chevron-down",
        size: "small",
        "class": "-rotate-90"
      }));
      insert(_el$9, createComponent(TooltipV2, {
        "class": "hover-reveal absolute left-full top-0 flex h-6 w-7 items-center justify-end delay-0 duration-0 group-hover/provider-tip:delay-[250ms] group-hover/provider-tip:duration-150 group-hover/provider-tip:opacity-100 focus-within:delay-0 focus-within:duration-0 focus-within:opacity-100",
        placement: "top",
        openDelay: 1e3,
        get value() {
          return language.t("common.dismiss");
        },
        get children() {
          var _el$11 = _tmpl$4();
          _el$11.$$click = dismiss;
          insert(_el$11, createComponent(Icon$1, {
            name: "xmark-small"
          }));
          createRenderEffect(() => setAttribute(_el$11, "aria-label", language.t("common.dismiss")));
          return _el$11;
        }
      }), null);
      createRenderEffect(() => setAttribute(_el$9, "data-visible", visible()));
      return _el$8;
    }
  });
}
delegateEvents(["click"]);
export {
  NewSessionPage as default
};
//# sourceMappingURL=new-session-CrPUmasN.js.map
