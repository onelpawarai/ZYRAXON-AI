import { l as splitProps, ay as createUniqueId, f as createSignal, az as onMount, g as createEffect, d as createComponent, n as spread, q as mergeProps, i as insert, j as use, o as onCleanup, T as TooltipV2, c as createRenderEffect, s as setAttribute, S as Show, t as template, bs as createContext, bx as useContext, x as delegateEvents, a as classList, u as useLanguage, ad as addEventListener, ap as DialogHeader, aq as DialogTitle, aY as DividerV2, ar as DialogBody, aA as TextInputV2, P as ProjectAvatar, r as getProjectAvatarVariant, v as getProjectAvatarSource, w as Icon, F as For, b$ as PROJECT_AVATAR_VARIANTS, aZ as DialogFooter, aB as ButtonV2, m as memo, aX as Dialog } from "./main-D3v0Qciw.js";
import { c as createEditProjectModel } from "./edit-project-FJLTlr3F.js";
var _tmpl$$2 = /* @__PURE__ */ template(`<div>`), _tmpl$2$1 = /* @__PURE__ */ template(`<svg width=16 height=16 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg aria-hidden=true><path fill-rule=evenodd clip-rule=evenodd d="M13 13H3V3H13V13ZM6.46777 6.81641V7.81641H7.5791V11.3721H8.5791V6.81641H6.46777ZM7.30078 4.62891V5.62891H8.85645V4.62891H7.30078Z"fill=currentColor>`), _tmpl$3$1 = /* @__PURE__ */ template(`<label><span data-slot=field-v2-label-text>`), _tmpl$4$1 = /* @__PURE__ */ template(`<button type=button data-slot=field-v2-label-info>`);
const FieldContext = createContext();
function useField() {
  const ctx = useContext(FieldContext);
  if (!ctx) {
    throw new Error("Field subcomponents must be used within <Field>");
  }
  return ctx;
}
const CONTROL_SELECTOR = ["[data-slot='text-input-v2-input']", "[data-slot='textarea-v2-textarea']", "[data-slot='inline-input-v2-input']"].join(", ");
function FieldV2Root(props) {
  const [local, rest] = splitProps(props, ["invalid", "class", "classList", "children"]);
  const controlId = `field-control-${createUniqueId()}`;
  const labelId = `field-label-${createUniqueId()}`;
  const prefixId = `field-prefix-${createUniqueId()}`;
  const suffixId = `field-suffix-${createUniqueId()}`;
  const [prefixCount, setPrefixCount] = createSignal(0);
  const [suffixCount, setSuffixCount] = createSignal(0);
  let rootRef;
  const ctx = {
    controlId,
    labelId,
    prefixId,
    suffixId,
    invalid: () => !!local.invalid,
    registerPrefix: () => setPrefixCount((n) => n + 1),
    unregisterPrefix: () => setPrefixCount((n) => Math.max(0, n - 1)),
    registerSuffix: () => setSuffixCount((n) => n + 1),
    unregisterSuffix: () => setSuffixCount((n) => Math.max(0, n - 1)),
    getDescribedBy: () => {
      const ids = [];
      if (prefixCount() > 0) ids.push(prefixId);
      if (suffixCount() > 0) ids.push(suffixId);
      return ids.length > 0 ? ids.join(" ") : void 0;
    }
  };
  const syncControlA11y = () => {
    const root = rootRef;
    if (!root) return;
    const control = root.querySelector(CONTROL_SELECTOR);
    if (!control) return;
    const shell = control.closest("[data-component='text-input-v2'], [data-component='textarea-v2'], [data-component='inline-input-v2']");
    control.id = controlId;
    control.setAttribute("aria-labelledby", labelId);
    const describedBy = ctx.getDescribedBy();
    if (describedBy) {
      control.setAttribute("aria-describedby", describedBy);
    } else {
      control.removeAttribute("aria-describedby");
    }
    if (ctx.invalid()) {
      control.setAttribute("aria-invalid", "true");
      shell?.setAttribute("data-invalid", "");
    } else {
      control.removeAttribute("aria-invalid");
      shell?.removeAttribute("data-invalid");
    }
  };
  onMount(() => {
    syncControlA11y();
  });
  createEffect(() => {
    prefixCount();
    suffixCount();
    local.invalid;
    syncControlA11y();
  });
  return createComponent(FieldContext.Provider, {
    value: ctx,
    get children() {
      var _el$ = _tmpl$$2();
      var _ref$ = rootRef;
      typeof _ref$ === "function" ? use(_ref$, _el$) : rootRef = _el$;
      spread(_el$, mergeProps(rest, {
        "data-component": "field-v2",
        get ["data-invalid"]() {
          return local.invalid ? "" : void 0;
        },
        get classList() {
          return {
            ...local.classList,
            [local.class ?? ""]: !!local.class
          };
        }
      }), false, true);
      insert(_el$, () => local.children);
      return _el$;
    }
  });
}
function FieldLabelInfoIcon() {
  return _tmpl$2$1();
}
function FieldLabel(props) {
  const [local, rest] = splitProps(props, ["class", "classList", "children", "tooltip"]);
  const field = useField();
  return (() => {
    var _el$3 = _tmpl$3$1(), _el$4 = _el$3.firstChild;
    spread(_el$3, mergeProps(rest, {
      get id() {
        return field.labelId;
      },
      get ["for"]() {
        return field.controlId;
      },
      "data-slot": "field-v2-label",
      get classList() {
        return {
          ...local.classList,
          [local.class ?? ""]: !!local.class
        };
      }
    }), false, true);
    insert(_el$4, () => local.children);
    insert(_el$3, createComponent(Show, {
      get when() {
        return local.tooltip;
      },
      children: (tooltip) => createComponent(TooltipV2, {
        get value() {
          return tooltip();
        },
        get children() {
          var _el$5 = _tmpl$4$1();
          _el$5.$$click = (e) => e.stopPropagation();
          insert(_el$5, createComponent(FieldLabelInfoIcon, {}));
          createRenderEffect(() => setAttribute(_el$5, "aria-label", tooltip()));
          return _el$5;
        }
      })
    }), null);
    return _el$3;
  })();
}
function FieldPrefix(props) {
  const [local, rest] = splitProps(props, ["class", "classList", "children"]);
  const field = useField();
  onMount(() => {
    field.registerPrefix();
    onCleanup(() => field.unregisterPrefix());
  });
  return (() => {
    var _el$6 = _tmpl$$2();
    spread(_el$6, mergeProps(rest, {
      get id() {
        return field.prefixId;
      },
      "data-slot": "field-v2-prefix",
      get classList() {
        return {
          ...local.classList,
          [local.class ?? ""]: !!local.class
        };
      }
    }), false, true);
    insert(_el$6, () => local.children);
    return _el$6;
  })();
}
function FieldSuffix(props) {
  const [local, rest] = splitProps(props, ["class", "classList", "children"]);
  const field = useField();
  onMount(() => {
    field.registerSuffix();
    onCleanup(() => field.unregisterSuffix());
  });
  return (() => {
    var _el$7 = _tmpl$$2();
    spread(_el$7, mergeProps(rest, {
      get id() {
        return field.suffixId;
      },
      "data-slot": "field-v2-suffix",
      get classList() {
        return {
          ...local.classList,
          [local.class ?? ""]: !!local.class
        };
      }
    }), false, true);
    insert(_el$7, () => local.children);
    return _el$7;
  })();
}
function FieldControl(props) {
  const [local, rest] = splitProps(props, ["class", "classList", "children"]);
  return (() => {
    var _el$8 = _tmpl$$2();
    spread(_el$8, mergeProps(rest, {
      "data-slot": "field-v2-control",
      get classList() {
        return {
          ...local.classList,
          [local.class ?? ""]: !!local.class
        };
      }
    }), false, true);
    insert(_el$8, () => local.children);
    return _el$8;
  })();
}
const FieldV2 = Object.assign(FieldV2Root, {
  Label: FieldLabel,
  Prefix: FieldPrefix,
  Suffix: FieldSuffix,
  Control: FieldControl
});
const Field = FieldV2;
delegateEvents(["click"]);
var _tmpl$$1 = /* @__PURE__ */ template(`<div data-component=textarea-v2><textarea>`);
function TextareaV2(props) {
  const [local, textareaProps] = splitProps(props, ["class", "classList", "invalid", "disabled", "rows"]);
  return (() => {
    var _el$ = _tmpl$$1(), _el$2 = _el$.firstChild;
    spread(_el$2, mergeProps(textareaProps, {
      get rows() {
        return local.rows ?? 3;
      },
      get disabled() {
        return local.disabled;
      },
      get ["aria-invalid"]() {
        return local.invalid ? true : void 0;
      },
      "data-slot": "textarea-v2-textarea"
    }), false, false);
    createRenderEffect((_p$) => {
      var _v$ = local.disabled ? "" : void 0, _v$2 = local.invalid ? "" : void 0, _v$3 = {
        ...local.classList,
        [local.class ?? ""]: !!local.class
      };
      _v$ !== _p$.e && setAttribute(_el$, "data-disabled", _p$.e = _v$);
      _v$2 !== _p$.t && setAttribute(_el$, "data-invalid", _p$.t = _v$2);
      _p$.a = classList(_el$, _v$3, _p$.a);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    });
    return _el$;
  })();
}
var _tmpl$ = /* @__PURE__ */ template(`<div class="flex w-full flex-col gap-2"><div class="select-none text-[13px] font-[530] leading-none tracking-[-0.04px] text-v2-text-text-base"></div><div class="flex items-center gap-3"><button type=button class="relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-[6px] outline outline-1 outline-transparent transition-[background-color,outline-color] focus-visible:outline-v2-border-border-focus"><span class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[6px] bg-v2-background-bg-contrast/80 text-v2-icon-icon-contrast backdrop-blur-[2px] transition-opacity"></span></button><input type=file accept=image/* class=hidden><div class="flex select-none flex-col gap-[6px] text-[11px] font-[440] leading-none tracking-[0.05px] text-v2-text-text-muted"><span></span><span>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex w-full flex-col gap-2"><div class="select-none text-[13px] font-[530] leading-none tracking-[-0.04px] text-v2-text-text-base"></div><div class="-ml-1 flex gap-1.5">`), _tmpl$3 = /* @__PURE__ */ template(`<form class=contents>`), _tmpl$4 = /* @__PURE__ */ template(`<button type=button class="flex size-8 items-center justify-center rounded-[10px] p-1 outline outline-1 outline-transparent transition-[background-color,outline-color] hover:bg-v2-overlay-simple-overlay-hover focus-visible:outline-v2-border-border-focus">`);
function DialogEditProjectV2(props) {
  const language = useLanguage();
  const model = createEditProjectModel(props);
  return createComponent(Dialog, {
    fit: true,
    get children() {
      var _el$ = _tmpl$3();
      addEventListener(_el$, "submit", model.submit);
      insert(_el$, createComponent(DialogHeader, {
        get children() {
          return createComponent(DialogTitle, {
            get children() {
              return language.t("dialog.project.edit.title");
            }
          });
        }
      }), null);
      insert(_el$, createComponent(DividerV2, {}), null);
      insert(_el$, createComponent(DialogBody, {
        "class": "flex max-h-[min(560px,calc(100vh-160px))] w-full flex-col gap-6 overflow-y-auto px-4 pt-4 pb-1",
        get children() {
          return [createComponent(Field, {
            get children() {
              return [createComponent(Field.Label, {
                get children() {
                  return language.t("dialog.project.edit.name");
                }
              }), createComponent(TextInputV2, {
                autofocus: true,
                appearance: "large",
                "class": "!w-full",
                get value() {
                  return model.store.name;
                },
                get placeholder() {
                  return model.folderName();
                },
                onInput: (event) => model.setStore("name", event.currentTarget.value)
              })];
            }
          }), (() => {
            var _el$2 = _tmpl$(), _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild, _el$7 = _el$5.nextSibling, _el$8 = _el$7.nextSibling, _el$9 = _el$8.firstChild, _el$0 = _el$9.nextSibling;
            insert(_el$3, () => language.t("dialog.project.edit.icon"));
            addEventListener(_el$5, "click", model.iconClick, true);
            addEventListener(_el$5, "dragleave", model.dragLeave);
            addEventListener(_el$5, "dragover", model.dragOver);
            addEventListener(_el$5, "drop", model.drop);
            _el$5.addEventListener("mouseleave", () => model.setStore("iconHover", false));
            _el$5.addEventListener("mouseenter", () => model.setStore("iconHover", true));
            insert(_el$5, createComponent(ProjectAvatar, {
              get fallback() {
                return model.store.name || model.defaultName();
              },
              get src() {
                return getProjectAvatarSource(props.project.id, {
                  color: model.store.color,
                  url: props.project.icon?.url,
                  override: model.store.iconOverride
                });
              },
              get variant() {
                return getProjectAvatarVariant(model.store.color);
              },
              "class": "!size-16 [&_[data-slot=project-avatar-surface]]:!rounded-[6px] [&_[data-slot=project-avatar-surface]]:!text-[32px]"
            }), _el$6);
            insert(_el$6, createComponent(Icon, {
              get name() {
                return model.store.iconOverride ? "close" : "outline-share";
              }
            }));
            addEventListener(_el$7, "change", model.inputChange);
            use((element) => {
              model.setIconInput(element);
            }, _el$7);
            insert(_el$9, () => language.t("dialog.project.edit.icon.hint"));
            insert(_el$0, () => language.t("dialog.project.edit.icon.recommended"));
            createRenderEffect((_p$) => {
              var _v$ = language.t("dialog.project.edit.icon.alt"), _v$2 = {
                "bg-v2-overlay-simple-overlay-hover outline-v2-border-border-focus": model.store.dragOver
              }, _v$3 = !!model.store.iconHover, _v$4 = !model.store.iconHover;
              _v$ !== _p$.e && setAttribute(_el$5, "aria-label", _p$.e = _v$);
              _p$.t = classList(_el$5, _v$2, _p$.t);
              _v$3 !== _p$.a && _el$6.classList.toggle("opacity-100", _p$.a = _v$3);
              _v$4 !== _p$.o && _el$6.classList.toggle("opacity-0", _p$.o = _v$4);
              return _p$;
            }, {
              e: void 0,
              t: void 0,
              a: void 0,
              o: void 0
            });
            return _el$2;
          })(), createComponent(Show, {
            get when() {
              return !model.store.iconOverride;
            },
            get children() {
              var _el$1 = _tmpl$2(), _el$10 = _el$1.firstChild, _el$11 = _el$10.nextSibling;
              insert(_el$10, () => language.t("dialog.project.edit.color"));
              insert(_el$11, createComponent(For, {
                each: PROJECT_AVATAR_VARIANTS,
                children: (color) => (() => {
                  var _el$12 = _tmpl$4();
                  _el$12.$$click = () => {
                    if (getProjectAvatarVariant(model.store.color) === color && !props.project.icon?.url) return;
                    model.setStore("color", getProjectAvatarVariant(model.store.color) === color ? void 0 : color);
                  };
                  insert(_el$12, createComponent(ProjectAvatar, {
                    get fallback() {
                      return model.store.name || model.defaultName();
                    },
                    get variant() {
                      return getProjectAvatarVariant(color);
                    },
                    "class": "!size-6 [&_[data-slot=project-avatar-surface]]:!rounded-[6px]"
                  }));
                  createRenderEffect((_p$) => {
                    var _v$5 = language.t("dialog.project.edit.color.select", {
                      color
                    }), _v$6 = getProjectAvatarVariant(model.store.color) === color, _v$7 = {
                      "bg-v2-overlay-simple-overlay-hover [box-shadow:inset_0_0_0_2px_var(--v2-border-border-focus)]": getProjectAvatarVariant(model.store.color) === color
                    };
                    _v$5 !== _p$.e && setAttribute(_el$12, "aria-label", _p$.e = _v$5);
                    _v$6 !== _p$.t && setAttribute(_el$12, "aria-pressed", _p$.t = _v$6);
                    _p$.a = classList(_el$12, _v$7, _p$.a);
                    return _p$;
                  }, {
                    e: void 0,
                    t: void 0,
                    a: void 0
                  });
                  return _el$12;
                })()
              }));
              return _el$1;
            }
          }), createComponent(Field, {
            get children() {
              return [createComponent(Field.Label, {
                get children() {
                  return language.t("dialog.project.edit.worktree.startup");
                }
              }), createComponent(Field.Prefix, {
                get children() {
                  return language.t("dialog.project.edit.worktree.startup.description");
                }
              }), createComponent(TextareaV2, {
                "class": "!w-full [&_[data-slot=textarea-v2-textarea]]:font-mono",
                rows: 3,
                get value() {
                  return model.store.startup;
                },
                get placeholder() {
                  return language.t("dialog.project.edit.worktree.startup.placeholder");
                },
                spellcheck: false,
                onInput: (event) => model.setStore("startup", event.currentTarget.value)
              })];
            }
          })];
        }
      }), null);
      insert(_el$, createComponent(DialogFooter, {
        get children() {
          return [createComponent(ButtonV2, {
            type: "button",
            variant: "neutral",
            get disabled() {
              return model.save.isPending;
            },
            get onClick() {
              return model.close;
            },
            get children() {
              return language.t("common.cancel");
            }
          }), createComponent(ButtonV2, {
            type: "submit",
            variant: "contrast",
            get disabled() {
              return model.save.isPending;
            },
            get children() {
              return memo(() => !!model.save.isPending)() ? language.t("common.saving") : language.t("common.save");
            }
          })];
        }
      }), null);
      return _el$;
    }
  });
}
delegateEvents(["click"]);
export {
  DialogEditProjectV2
};
//# sourceMappingURL=dialog-edit-project-v2-eCelM2wC.js.map
