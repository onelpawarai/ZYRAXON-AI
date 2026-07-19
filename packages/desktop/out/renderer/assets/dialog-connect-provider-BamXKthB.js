import { ae as usePlatform, l as splitProps, n as spread, q as mergeProps, i as insert, t as template, x as delegateEvents, U as useDialog, O as useServerSync, af as useServerSDK, u as useLanguage, e as createStore, ag as useMutation, ah as showToast, d as createComponent, ai as ProviderIcon, aj as TextField, ak as IconButton, c as createRenderEffect, s as setAttribute, F as For, al as Button, m as memo, am as Dialog, K as batch, an as produce, R as useSettings, ao as DialogV2, ap as DialogHeader, S as Show, I as Icon, aq as DialogTitle, ar as DialogBody, j as use, as as Match, at as Switch, E as useProviders, o as onCleanup, G as createMemo, a5 as createResource, g as createEffect, au as Spinner, b as className, av as Tag, aw as popularProviders, ax as List, ay as createUniqueId, az as onMount, aA as TextInputV2, aB as ButtonV2 } from "./main-D3v0Qciw.js";
var _tmpl$$2 = /* @__PURE__ */ template(`<a>`);
function Link(props) {
  const platform = usePlatform();
  const [local, rest] = splitProps(props, ["href", "children", "class"]);
  return (() => {
    var _el$ = _tmpl$$2();
    _el$.$$click = (event) => {
      if (!local.href) return;
      event.preventDefault();
      platform.openLink(local.href);
    };
    spread(_el$, mergeProps({
      get href() {
        return local.href;
      },
      get ["class"]() {
        return `text-text-strong underline ${local.class ?? ""}`;
      }
    }, rest), false, true);
    insert(_el$, () => local.children);
    return _el$;
  })();
}
delegateEvents(["click"]);
const PROVIDER_ID = /^[a-z0-9][a-z0-9-_]*$/;
const OPENAI_COMPATIBLE = "@ai-sdk/openai-compatible";
function validateCustomProvider(input) {
  const providerID = input.form.providerID.trim();
  const name = input.form.name.trim();
  const baseURL = input.form.baseURL.trim();
  const apiKey = input.form.apiKey.trim();
  const env = apiKey.match(/^\{env:([^}]+)\}$/)?.[1]?.trim();
  const key = apiKey && !env ? apiKey : void 0;
  const idError = !providerID ? input.t("provider.custom.error.providerID.required") : !PROVIDER_ID.test(providerID) ? input.t("provider.custom.error.providerID.format") : void 0;
  const nameError = !name ? input.t("provider.custom.error.name.required") : void 0;
  const urlError = !baseURL ? input.t("provider.custom.error.baseURL.required") : !/^https?:\/\//.test(baseURL) ? input.t("provider.custom.error.baseURL.format") : void 0;
  const disabled = input.disabledProviders.includes(providerID);
  const existsError = idError ? void 0 : input.existingProviderIDs.has(providerID) && !disabled ? input.t("provider.custom.error.providerID.exists") : void 0;
  const seenModels = /* @__PURE__ */ new Set();
  const models = input.form.models.map((m) => {
    const id = m.id.trim();
    const idError2 = !id ? input.t("provider.custom.error.required") : seenModels.has(id) ? input.t("provider.custom.error.duplicate") : (() => {
      seenModels.add(id);
      return void 0;
    })();
    const nameError2 = !m.name.trim() ? input.t("provider.custom.error.required") : void 0;
    return { id: idError2, name: nameError2 };
  });
  const modelsValid = models.every((m) => !m.id && !m.name);
  const modelConfig = Object.fromEntries(input.form.models.map((m) => [m.id.trim(), { name: m.name.trim() }]));
  const seenHeaders = /* @__PURE__ */ new Set();
  const headers = input.form.headers.map((h) => {
    const key2 = h.key.trim();
    const value = h.value.trim();
    if (!key2 && !value) return {};
    const keyError = !key2 ? input.t("provider.custom.error.required") : seenHeaders.has(key2.toLowerCase()) ? input.t("provider.custom.error.duplicate") : (() => {
      seenHeaders.add(key2.toLowerCase());
      return void 0;
    })();
    const valueError = !value ? input.t("provider.custom.error.required") : void 0;
    return { key: keyError, value: valueError };
  });
  const headersValid = headers.every((h) => !h.key && !h.value);
  const headerConfig = Object.fromEntries(
    input.form.headers.map((h) => ({ key: h.key.trim(), value: h.value.trim() })).filter((h) => !!h.key && !!h.value).map((h) => [h.key, h.value])
  );
  const err = {
    providerID: idError ?? existsError,
    name: nameError,
    baseURL: urlError
  };
  const ok = !idError && !existsError && !nameError && !urlError && modelsValid && headersValid;
  if (!ok) return { err, models, headers };
  return {
    err,
    models,
    headers,
    result: {
      providerID,
      name,
      key,
      config: {
        npm: OPENAI_COMPATIBLE,
        name,
        ...env ? { env: [env] } : {},
        options: {
          baseURL,
          ...Object.keys(headerConfig).length ? { headers: headerConfig } : {}
        },
        models: modelConfig
      }
    }
  };
}
let row = 0;
const nextRow = () => `row-${row++}`;
const modelRow = () => ({ row: nextRow(), id: "", name: "", err: {} });
const headerRow = () => ({ row: nextRow(), key: "", value: "", err: {} });
var _tmpl$$1 = /* @__PURE__ */ template(`<div class="flex flex-col gap-6 px-2.5 pb-3 overflow-y-auto max-h-[60vh]"><div class="px-2.5 flex gap-4 items-center"><div class="text-16-medium text-text-strong"></div></div><form class="px-2.5 pb-6 flex flex-col gap-6"><p class="text-14-regular text-text-base"></p><div class="flex flex-col gap-4"></div><div class="flex flex-col gap-3"><label class="text-12-medium text-text-weak"></label></div><div class="flex flex-col gap-3"><label class="text-12-medium text-text-weak">`), _tmpl$2$1 = /* @__PURE__ */ template(`<div class="flex gap-2 items-start"><div class=flex-1></div><div class=flex-1>`);
function DialogCustomProvider(props) {
  const language = useLanguage();
  return createComponent(Dialog, {
    "class": "h-full",
    get title() {
      return createComponent(IconButton, {
        tabIndex: -1,
        icon: "arrow-left",
        variant: "ghost",
        get onClick() {
          return props.onBack;
        },
        get ["aria-label"]() {
          return language.t("common.goBack");
        }
      });
    },
    transition: true,
    get children() {
      return createComponent(CustomProviderForm, {});
    }
  });
}
function CustomProviderForm(props = {}) {
  const dialog = useDialog();
  const serverSync = useServerSync();
  const serverSDK = useServerSDK();
  const language = useLanguage();
  const [form, setForm] = createStore({
    providerID: "",
    name: "",
    baseURL: "",
    apiKey: "",
    models: [modelRow()],
    headers: [headerRow()],
    err: {}
  });
  const addModel = () => {
    setForm("models", produce((rows) => {
      rows.push(modelRow());
    }));
  };
  const removeModel = (index) => {
    if (form.models.length <= 1) return;
    setForm("models", produce((rows) => {
      rows.splice(index, 1);
    }));
  };
  const addHeader = () => {
    setForm("headers", produce((rows) => {
      rows.push(headerRow());
    }));
  };
  const removeHeader = (index) => {
    if (form.headers.length <= 1) return;
    setForm("headers", produce((rows) => {
      rows.splice(index, 1);
    }));
  };
  const setField = (key, value) => {
    setForm(key, value);
    if (key === "apiKey") return;
    setForm("err", key, void 0);
  };
  const setModel = (index, key, value) => {
    batch(() => {
      setForm("models", index, key, value);
      setForm("models", index, "err", key, void 0);
    });
  };
  const setHeader = (index, key, value) => {
    batch(() => {
      setForm("headers", index, key, value);
      setForm("headers", index, "err", key, void 0);
    });
  };
  const validate = () => {
    const output = validateCustomProvider({
      form,
      t: language.t,
      disabledProviders: serverSync().data.config.disabled_providers ?? [],
      existingProviderIDs: new Set(serverSync().data.provider.all.keys())
    });
    batch(() => {
      setForm("err", output.err);
      output.models.forEach((err, index) => setForm("models", index, "err", err));
      output.headers.forEach((err, index) => setForm("headers", index, "err", err));
    });
    return output.result;
  };
  const saveMutation = useMutation(() => ({
    mutationFn: async (result) => {
      const disabledProviders = serverSync().data.config.disabled_providers ?? [];
      const nextDisabled = disabledProviders.filter((id) => id !== result.providerID);
      if (result.key) {
        await serverSDK().client.auth.set({
          providerID: result.providerID,
          auth: {
            type: "api",
            key: result.key
          }
        });
      }
      await serverSync().updateConfig({
        provider: {
          [result.providerID]: result.config
        },
        disabled_providers: nextDisabled
      });
      return result;
    },
    onSuccess: (result) => {
      dialog.close();
      showToast({
        variant: "success",
        icon: "circle-check",
        title: language.t("provider.connect.toast.connected.title", {
          provider: result.name
        }),
        description: language.t("provider.connect.toast.connected.description", {
          provider: result.name
        })
      });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : String(err);
      showToast({
        title: language.t("common.requestFailed"),
        description: message
      });
    }
  }));
  const save = (e) => {
    e.preventDefault();
    if (saveMutation.isPending) return;
    const result = validate();
    if (!result) return;
    saveMutation.mutate(result);
  };
  return (() => {
    var _el$ = _tmpl$$1(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$2.nextSibling, _el$5 = _el$4.firstChild, _el$6 = _el$5.nextSibling, _el$7 = _el$6.nextSibling, _el$8 = _el$7.firstChild, _el$9 = _el$7.nextSibling, _el$0 = _el$9.firstChild;
    insert(_el$2, createComponent(ProviderIcon, {
      id: "synthetic",
      "class": "size-5 shrink-0 icon-strong-base"
    }), _el$3);
    insert(_el$3, () => language.t("provider.custom.title"));
    _el$4.addEventListener("submit", save);
    insert(_el$5, () => language.t("provider.custom.description.prefix"), null);
    insert(_el$5, createComponent(Link, {
      href: "https://zyraxon.ai/docs/providers/#custom-provider",
      tabIndex: -1,
      get children() {
        return language.t("provider.custom.description.link");
      }
    }), null);
    insert(_el$5, () => language.t("provider.custom.description.suffix"), null);
    insert(_el$6, createComponent(TextField, {
      get autofocus() {
        return props.autofocus ?? true;
      },
      get label() {
        return language.t("provider.custom.field.providerID.label");
      },
      get placeholder() {
        return language.t("provider.custom.field.providerID.placeholder");
      },
      get description() {
        return language.t("provider.custom.field.providerID.description");
      },
      get value() {
        return form.providerID;
      },
      onChange: (v) => setField("providerID", v),
      get validationState() {
        return form.err.providerID ? "invalid" : void 0;
      },
      get error() {
        return form.err.providerID;
      }
    }), null);
    insert(_el$6, createComponent(TextField, {
      get label() {
        return language.t("provider.custom.field.name.label");
      },
      get placeholder() {
        return language.t("provider.custom.field.name.placeholder");
      },
      get value() {
        return form.name;
      },
      onChange: (v) => setField("name", v),
      get validationState() {
        return form.err.name ? "invalid" : void 0;
      },
      get error() {
        return form.err.name;
      }
    }), null);
    insert(_el$6, createComponent(TextField, {
      get label() {
        return language.t("provider.custom.field.baseURL.label");
      },
      get placeholder() {
        return language.t("provider.custom.field.baseURL.placeholder");
      },
      get value() {
        return form.baseURL;
      },
      onChange: (v) => setField("baseURL", v),
      get validationState() {
        return form.err.baseURL ? "invalid" : void 0;
      },
      get error() {
        return form.err.baseURL;
      }
    }), null);
    insert(_el$6, createComponent(TextField, {
      get label() {
        return language.t("provider.custom.field.apiKey.label");
      },
      get placeholder() {
        return language.t("provider.custom.field.apiKey.placeholder");
      },
      get description() {
        return language.t("provider.custom.field.apiKey.description");
      },
      get value() {
        return form.apiKey;
      },
      onChange: (v) => setField("apiKey", v)
    }), null);
    insert(_el$8, () => language.t("provider.custom.models.label"));
    insert(_el$7, createComponent(For, {
      get each() {
        return form.models;
      },
      children: (m, i) => (() => {
        var _el$1 = _tmpl$2$1(), _el$10 = _el$1.firstChild, _el$11 = _el$10.nextSibling;
        insert(_el$10, createComponent(TextField, {
          get label() {
            return language.t("provider.custom.models.id.label");
          },
          hideLabel: true,
          get placeholder() {
            return language.t("provider.custom.models.id.placeholder");
          },
          get value() {
            return m.id;
          },
          onChange: (v) => setModel(i(), "id", v),
          get validationState() {
            return m.err.id ? "invalid" : void 0;
          },
          get error() {
            return m.err.id;
          }
        }));
        insert(_el$11, createComponent(TextField, {
          get label() {
            return language.t("provider.custom.models.name.label");
          },
          hideLabel: true,
          get placeholder() {
            return language.t("provider.custom.models.name.placeholder");
          },
          get value() {
            return m.name;
          },
          onChange: (v) => setModel(i(), "name", v),
          get validationState() {
            return m.err.name ? "invalid" : void 0;
          },
          get error() {
            return m.err.name;
          }
        }));
        insert(_el$1, createComponent(IconButton, {
          type: "button",
          icon: "trash",
          variant: "ghost",
          "class": "mt-1.5",
          onClick: () => removeModel(i()),
          get disabled() {
            return form.models.length <= 1;
          },
          get ["aria-label"]() {
            return language.t("provider.custom.models.remove");
          }
        }), null);
        createRenderEffect(() => setAttribute(_el$1, "data-row", m.row));
        return _el$1;
      })()
    }), null);
    insert(_el$7, createComponent(Button, {
      type: "button",
      size: "small",
      variant: "ghost",
      icon: "plus-small",
      onClick: addModel,
      "class": "self-start",
      get children() {
        return language.t("provider.custom.models.add");
      }
    }), null);
    insert(_el$0, () => language.t("provider.custom.headers.label"));
    insert(_el$9, createComponent(For, {
      get each() {
        return form.headers;
      },
      children: (h, i) => (() => {
        var _el$12 = _tmpl$2$1(), _el$13 = _el$12.firstChild, _el$14 = _el$13.nextSibling;
        insert(_el$13, createComponent(TextField, {
          get label() {
            return language.t("provider.custom.headers.key.label");
          },
          hideLabel: true,
          get placeholder() {
            return language.t("provider.custom.headers.key.placeholder");
          },
          get value() {
            return h.key;
          },
          onChange: (v) => setHeader(i(), "key", v),
          get validationState() {
            return h.err.key ? "invalid" : void 0;
          },
          get error() {
            return h.err.key;
          }
        }));
        insert(_el$14, createComponent(TextField, {
          get label() {
            return language.t("provider.custom.headers.value.label");
          },
          hideLabel: true,
          get placeholder() {
            return language.t("provider.custom.headers.value.placeholder");
          },
          get value() {
            return h.value;
          },
          onChange: (v) => setHeader(i(), "value", v),
          get validationState() {
            return h.err.value ? "invalid" : void 0;
          },
          get error() {
            return h.err.value;
          }
        }));
        insert(_el$12, createComponent(IconButton, {
          type: "button",
          icon: "trash",
          variant: "ghost",
          "class": "mt-1.5",
          onClick: () => removeHeader(i()),
          get disabled() {
            return form.headers.length <= 1;
          },
          get ["aria-label"]() {
            return language.t("provider.custom.headers.remove");
          }
        }), null);
        createRenderEffect(() => setAttribute(_el$12, "data-row", h.row));
        return _el$12;
      })()
    }), null);
    insert(_el$9, createComponent(Button, {
      type: "button",
      size: "small",
      variant: "ghost",
      icon: "plus-small",
      onClick: addHeader,
      "class": "self-start",
      get children() {
        return language.t("provider.custom.headers.add");
      }
    }), null);
    insert(_el$4, createComponent(Button, {
      "class": "w-auto self-start",
      type: "submit",
      size: "large",
      variant: "primary",
      get disabled() {
        return saveMutation.isPending;
      },
      get children() {
        return memo(() => !!saveMutation.isPending)() ? language.t("common.saving") : language.t("common.submit");
      }
    }), null);
    return _el$;
  })();
}
var _tmpl$ = /* @__PURE__ */ template(`<button type=button class="flex size-5 items-center justify-center rounded-sm text-v2-icon-icon-muted hover:bg-v2-overlay-simple-overlay-hover focus-visible:bg-v2-overlay-simple-overlay-hover focus-visible:outline-none">`), _tmpl$2 = /* @__PURE__ */ template(`<div tabindex=-1 class="flex min-h-0 flex-1 flex-col outline-none">`), _tmpl$3 = /* @__PURE__ */ template(`<div class="text-14-regular text-text-weak">`), _tmpl$4 = /* @__PURE__ */ template(`<div class="px-1.25 w-full flex items-center gap-x-3"><span>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex h-24 items-center justify-center text-[13px] font-[440] text-v2-text-text-muted">`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex min-h-0 flex-1 flex-col gap-4"><div class="shrink-0 px-1 pt-px"></div><div class="relative min-h-0 flex-1"><div class="flex size-full min-h-0 flex-col gap-4 overflow-y-auto pb-8 [scrollbar-width:none] [&amp;::-webkit-scrollbar]:hidden"></div><div class="pointer-events-none absolute inset-x-0 bottom-0 h-10"style="background:linear-gradient(to bottom, transparent, var(--v2-background-bg-layer-01))">`), _tmpl$7 = /* @__PURE__ */ template(`<section class="flex flex-col"><div class="px-3 pb-2 text-[13px] font-[440] leading-none tracking-[-0.04px] text-v2-text-text-muted">`), _tmpl$8 = /* @__PURE__ */ template(`<span class="min-w-0 truncate font-[440] text-v2-text-text-muted">`), _tmpl$9 = /* @__PURE__ */ template(`<span class="flex h-4 shrink-0 items-center rounded-xs border-[0.5px] border-v2-border-border-base bg-v2-background-bg-layer-03 px-1 text-[11px] font-[530] leading-none tracking-[0.05px] text-v2-text-text-muted">`), _tmpl$0 = /* @__PURE__ */ template(`<button type=button class="flex min-h-9 w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-[13px] leading-none tracking-[-0.04px] hover:bg-v2-overlay-simple-overlay-hover focus:bg-v2-overlay-simple-overlay-hover focus:outline-none"><span class="min-w-0 truncate font-[530] text-v2-text-text-base">`), _tmpl$1 = /* @__PURE__ */ template(`<div class="w-full flex flex-col gap-1.5"><div class="text-14-regular text-text-base"></div><div>`), _tmpl$10 = /* @__PURE__ */ template(`<form class="flex flex-col items-start gap-4">`), _tmpl$11 = /* @__PURE__ */ template(`<div class="w-full flex items-center gap-x-2"><div class="w-4 h-2 rounded-[1px] bg-input-base shadow-xs-border-base flex items-center justify-center"><div class="w-2.5 h-0.5 ml-0 bg-icon-strong-base hidden"data-slot=list-item-extra-icon></div></div><span></span><span class="text-14-regular text-text-weak">`), _tmpl$12 = /* @__PURE__ */ template(`<div class="flex flex-col gap-2"><div class="px-3 text-[13px] font-[440] leading-5 tracking-[-0.04px] text-v2-text-text-muted"></div><div class="flex flex-col">`), _tmpl$13 = /* @__PURE__ */ template(`<button type=button class="group flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-[13px] leading-5 tracking-[-0.04px] hover:bg-v2-overlay-simple-overlay-hover focus-visible:bg-v2-overlay-simple-overlay-hover focus-visible:outline-none"><span class="flex h-2 w-4 shrink-0 items-center justify-center rounded-[1px] bg-v2-background-bg-base shadow-[var(--v2-elevation-button-neutral)]"><span class="hidden h-0.5 w-2.5 bg-v2-icon-icon-base group-hover:block group-focus-visible:block"></span></span><span class="font-[530] text-v2-text-text-base">`), _tmpl$14 = /* @__PURE__ */ template(`<span class="font-[440] text-v2-text-text-muted">`), _tmpl$15 = /* @__PURE__ */ template(`<div class="text-14-regular text-text-base">`), _tmpl$16 = /* @__PURE__ */ template(`<div>`), _tmpl$17 = /* @__PURE__ */ template(`<div class="w-full flex items-center gap-x-2"><div class="w-4 h-2 rounded-[1px] bg-input-base shadow-xs-border-base flex items-center justify-center"><div class="w-2.5 h-0.5 ml-0 bg-icon-strong-base hidden"data-slot=list-item-extra-icon></div></div><span>`), _tmpl$18 = /* @__PURE__ */ template(`<div class="flex flex-col gap-5"><div></div><div></div><div>`), _tmpl$19 = /* @__PURE__ */ template(`<div class="flex flex-col gap-5 px-3 text-[13px] font-[440] leading-5 tracking-[-0.04px] text-v2-text-text-muted"><form class="flex flex-col items-start gap-5 self-stretch"><label class="flex w-full flex-col gap-1 font-[530] leading-4 text-v2-text-text-base">`), _tmpl$20 = /* @__PURE__ */ template(`<div role=alert class="-mt-4 text-xs text-v2-state-fg-danger">`), _tmpl$21 = /* @__PURE__ */ template(`<div class="flex flex-col gap-4"><div class="text-14-regular text-text-base"></div><div class="text-14-regular text-text-base"></div><div class="text-14-regular text-text-base">`), _tmpl$22 = /* @__PURE__ */ template(`<div class="flex flex-col gap-6"><form class="flex flex-col items-start gap-4">`), _tmpl$23 = /* @__PURE__ */ template(`<div class="flex flex-col gap-5 px-3 text-[13px] font-[440] leading-5 tracking-[-0.04px] text-v2-text-text-muted"><div></div><form class="flex flex-col items-start gap-5 self-stretch"><label class="flex w-full flex-col gap-1 font-[530] leading-4 text-v2-text-text-base">`), _tmpl$24 = /* @__PURE__ */ template(`<div class="flex flex-col gap-6"><div class="text-14-regular text-text-base"></div><form class="flex flex-col items-start gap-4">`), _tmpl$25 = /* @__PURE__ */ template(`<div class="flex flex-col gap-6"><div class="text-14-regular text-text-base"></div><div class="text-14-regular text-text-base flex items-center gap-4"><span>`), _tmpl$26 = /* @__PURE__ */ template(`<div class="text-14-regular text-text-base"><div class="flex items-center gap-x-2"><span>`), _tmpl$27 = /* @__PURE__ */ template(`<div><div><div></div></div><div><div>`);
const CUSTOM_ID = "_custom";
function useProviderConnectController(options = {}) {
  const [store, setStore] = createStore({
    selected: void 0
  });
  const reset = () => setStore("selected", void 0);
  return {
    selected: () => store.selected,
    select: (provider) => setStore("selected", provider),
    back: options.onBack ?? reset
  };
}
const DialogConnectProvider = (props) => {
  const fallback = useProviderConnectController();
  const controller = props.controller ?? fallback;
  const language = useLanguage();
  const settings = useSettings();
  const newLayout = settings.general.newLayoutDesigns;
  const reset = controller.back;
  const back = {
    current: reset
  };
  let focusHost;
  const holdFocus = () => focusHost?.focus({
    preventScroll: true
  });
  const select = (provider) => {
    back.current = reset;
    controller.select(provider);
  };
  function Content() {
    return createComponent(Switch, {
      get children() {
        return [createComponent(Match, {
          get when() {
            return controller.selected() === CUSTOM_ID;
          },
          get children() {
            return createComponent(CustomProviderForm, {
              get autofocus() {
                return !newLayout();
              }
            });
          }
        }), createComponent(Match, {
          get when() {
            return memo(() => !!(controller.selected() && controller.selected() !== CUSTOM_ID))() ? controller.selected() : void 0;
          },
          children: (provider) => createComponent(ProviderConnection, {
            get provider() {
              return provider();
            },
            get directory() {
              return props.directory;
            },
            onBack: reset,
            setBack: (handler) => back.current = handler
          })
        }), createComponent(Match, {
          when: true,
          get children() {
            return createComponent(ProviderPicker, {
              get directory() {
                return props.directory;
              },
              onSelect: select,
              get onPrepare() {
                return newLayout() ? holdFocus : void 0;
              }
            });
          }
        })];
      }
    });
  }
  return createComponent(Show, {
    get when() {
      return newLayout();
    },
    get fallback() {
      return createComponent(Dialog, {
        "class": "h-full",
        transition: true,
        get title() {
          return createComponent(Show, {
            get when() {
              return controller.selected();
            },
            get fallback() {
              return language.t("command.provider.connect");
            },
            get children() {
              return createComponent(IconButton, {
                tabIndex: -1,
                icon: "arrow-left",
                variant: "ghost",
                onClick: () => back.current(),
                get ["aria-label"]() {
                  return language.t("common.goBack");
                }
              });
            }
          });
        },
        get children() {
          return createComponent(Content, {});
        }
      });
    },
    get children() {
      return createComponent(DialogV2, {
        containerClass: "!h-[min(calc(100vh_-_16px),512px)] !w-[min(calc(100vw_-_16px),640px)]",
        "class": "[font-family:var(--v2-font-family-sans)] [&_[data-slot=dialog-header]]:!px-5 [&_[data-slot=dialog-header-title]]:!text-[15px] [&_[data-slot=dialog-header-title]]:!tracking-[-0.13px]",
        get children() {
          return [createComponent(DialogHeader, {
            get closeLabel() {
              return language.t("common.close");
            },
            get children() {
              return createComponent(Show, {
                get when() {
                  return controller.selected();
                },
                get fallback() {
                  return createComponent(DialogTitle, {
                    get children() {
                      return language.t("command.provider.connect");
                    }
                  });
                },
                get children() {
                  var _el$ = _tmpl$();
                  _el$.$$click = () => back.current();
                  insert(_el$, createComponent(Icon, {
                    name: "arrow-left",
                    size: "small"
                  }));
                  createRenderEffect(() => setAttribute(_el$, "aria-label", language.t("common.goBack")));
                  return _el$;
                }
              });
            }
          }), createComponent(DialogBody, {
            "class": "min-h-0 flex-1 overflow-hidden px-2 pb-2",
            get children() {
              var _el$2 = _tmpl$2();
              var _ref$ = focusHost;
              typeof _ref$ === "function" ? use(_ref$, _el$2) : focusHost = _el$2;
              insert(_el$2, createComponent(Content, {}));
              return _el$2;
            }
          })];
        }
      });
    }
  });
};
function ProviderPicker(props) {
  const settings = useSettings();
  if (settings.general.newLayoutDesigns()) return createComponent(ProviderPickerV2, {
    get directory() {
      return props.directory;
    },
    get onSelect() {
      return props.onSelect;
    },
    get onPrepare() {
      return props.onPrepare;
    }
  });
  const providers = useProviders(props.directory);
  const language = useLanguage();
  const popularGroup = () => language.t("dialog.provider.group.popular");
  const otherGroup = () => language.t("dialog.provider.group.other");
  const customLabel = () => language.t("settings.providers.tag.custom");
  const note = (id) => {
    if (id === "anthropic") return language.t("dialog.provider.anthropic.note");
    if (id === "openai") return language.t("dialog.provider.openai.note");
    if (id.startsWith("github-copilot")) return language.t("dialog.provider.copilot.note");
    if (id === "opencode-go") return language.t("dialog.provider.opencodeGo.tagline");
    return void 0;
  };
  return createComponent(List, {
    "class": "px-3",
    get search() {
      return {
        placeholder: language.t("dialog.provider.search.placeholder"),
        autofocus: true
      };
    },
    get emptyMessage() {
      return language.t("dialog.provider.empty");
    },
    activeIcon: "plus-small",
    key: (x) => x?.id,
    items: () => {
      language.locale();
      return [{
        id: CUSTOM_ID,
        name: customLabel()
      }, ...providers.all().values()];
    },
    filterKeys: ["id", "name"],
    groupBy: (x) => popularProviders.includes(x.id) ? popularGroup() : otherGroup(),
    sortBy: (a, b) => {
      if (a.id === CUSTOM_ID) return -1;
      if (b.id === CUSTOM_ID) return 1;
      if (popularProviders.includes(a.id) && popularProviders.includes(b.id)) return popularProviders.indexOf(a.id) - popularProviders.indexOf(b.id);
      return a.name.localeCompare(b.name);
    },
    sortGroupsBy: (a, b) => {
      const popular = popularGroup();
      if (a.category === popular && b.category !== popular) return -1;
      if (b.category === popular && a.category !== popular) return 1;
      return 0;
    },
    onSelect: (x) => {
      if (!x) return;
      props.onSelect(x.id);
    },
    children: (i) => (() => {
      var _el$3 = _tmpl$4(), _el$4 = _el$3.firstChild;
      insert(_el$3, createComponent(ProviderIcon, {
        "data-slot": "list-item-extra-icon",
        get id() {
          return i.id;
        }
      }), _el$4);
      insert(_el$4, () => i.name);
      insert(_el$3, createComponent(Show, {
        get when() {
          return i.id === "opencode";
        },
        get children() {
          var _el$5 = _tmpl$3();
          insert(_el$5, () => language.t("dialog.provider.opencode.tagline"));
          return _el$5;
        }
      }), null);
      insert(_el$3, createComponent(Show, {
        get when() {
          return i.id === CUSTOM_ID;
        },
        get children() {
          return createComponent(Tag, {
            get children() {
              return language.t("settings.providers.tag.custom");
            }
          });
        }
      }), null);
      insert(_el$3, createComponent(Show, {
        get when() {
          return i.id === "opencode";
        },
        get children() {
          return createComponent(Tag, {
            get children() {
              return language.t("dialog.provider.tag.recommended");
            }
          });
        }
      }), null);
      insert(_el$3, createComponent(Show, {
        get when() {
          return note(i.id);
        },
        children: (value) => (() => {
          var _el$6 = _tmpl$3();
          insert(_el$6, value);
          return _el$6;
        })()
      }), null);
      insert(_el$3, createComponent(Show, {
        get when() {
          return i.id === "opencode-go";
        },
        get children() {
          return createComponent(Tag, {
            get children() {
              return language.t("dialog.provider.tag.recommended");
            }
          });
        }
      }), null);
      return _el$3;
    })()
  });
}
function ProviderPickerV2(props) {
  const providers = useProviders(props.directory);
  const language = useLanguage();
  const serverSync = useServerSync();
  const serverSDK = useServerSDK();
  const [store, setStore] = createStore({
    filter: "",
    active: void 0,
    connecting: void 0
  });
  const featured = ["opencode", "opencode-go", "anthropic", "openai", "google", "openrouter", "vercel"];
  const custom = () => ({
    id: CUSTOM_ID,
    name: language.t("dialog.provider.custom.label")
  });
  const all = createMemo(() => {
    language.locale();
    const query = store.filter.trim().toLowerCase();
    const values = [custom(), ...providers.all().values()];
    if (!query) return values;
    return values.filter((provider) => `${provider.id} ${provider.name}`.toLowerCase().includes(query));
  });
  const popular = createMemo(() => all().filter((provider) => featured.includes(provider.id)).sort((a, b) => featured.indexOf(a.id) - featured.indexOf(b.id)));
  const other = createMemo(() => all().filter((provider) => !featured.includes(provider.id)).sort((a, b) => {
    if (a.id === CUSTOM_ID) return -1;
    if (b.id === CUSTOM_ID) return 1;
    return a.name.localeCompare(b.name);
  }));
  const rows = createMemo(() => [...popular(), ...other()]);
  let picker;
  let search;
  onMount(() => search?.focus({
    preventScroll: true
  }));
  const connect = (provider) => {
    props.onPrepare?.();
    if (provider === CUSTOM_ID || serverSync().data.provider_auth[provider]) {
      props.onSelect(provider);
      return;
    }
    if (store.connecting) return;
    setStore("connecting", provider);
    void serverSDK().client.provider.auth().then((response) => {
      serverSync().set("provider_auth", response.data ?? {});
      props.onSelect(provider);
    }).catch(() => props.onSelect(provider));
  };
  const move = (event, direction) => {
    const items = rows();
    if (items.length === 0) return;
    const index = items.findIndex((provider) => provider.id === store.active);
    const next = index < 0 ? direction > 0 ? 0 : items.length - 1 : (index + direction + items.length) % items.length;
    setStore("active", items[next].id);
    picker?.querySelector(`[data-provider-id="${CSS.escape(items[next].id)}"]`)?.focus({
      preventScroll: true
    });
    event.preventDefault();
  };
  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") return move(event, 1);
    if (event.key === "ArrowUp") return move(event, -1);
    if (event.key !== "Enter" || !store.active) return;
    connect(store.active);
    event.preventDefault();
  };
  return (() => {
    var _el$7 = _tmpl$6(), _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling, _el$0 = _el$9.firstChild;
    _el$0.nextSibling;
    _el$7.$$keydown = handleKeyDown;
    var _ref$2 = picker;
    typeof _ref$2 === "function" ? use(_ref$2, _el$7) : picker = _el$7;
    insert(_el$8, createComponent(TextInputV2, {
      ref(r$) {
        var _ref$3 = search;
        typeof _ref$3 === "function" ? _ref$3(r$) : search = r$;
      },
      type: "search",
      "class": "!w-full [font-family:var(--v2-font-family-sans)]",
      get leadingIcon() {
        return createComponent(Icon, {
          name: "magnifying-glass",
          size: "small"
        });
      },
      get placeholder() {
        return language.t("dialog.provider.search.placeholder");
      },
      get value() {
        return store.filter;
      },
      onInput: (event) => {
        setStore({
          filter: event.currentTarget.value,
          active: void 0
        });
      }
    }));
    insert(_el$0, createComponent(For, {
      get each() {
        return [{
          title: language.t("dialog.provider.group.popular"),
          items: popular
        }, {
          title: language.t("dialog.provider.group.other"),
          items: other
        }];
      },
      children: (group) => createComponent(Show, {
        get when() {
          return group.items().length > 0;
        },
        get children() {
          var _el$11 = _tmpl$7(), _el$12 = _el$11.firstChild;
          insert(_el$12, () => group.title);
          insert(_el$11, createComponent(For, {
            get each() {
              return group.items();
            },
            children: (provider) => (() => {
              var _el$13 = _tmpl$0(), _el$14 = _el$13.firstChild;
              _el$13.$$click = () => connect(provider.id);
              _el$13.addEventListener("mouseenter", () => setStore("active", provider.id));
              insert(_el$13, createComponent(ProviderIcon, {
                get id() {
                  return provider.id;
                },
                "class": "size-4 shrink-0 text-v2-icon-icon-base"
              }), _el$14);
              insert(_el$14, () => provider.name);
              insert(_el$13, createComponent(Show, {
                get when() {
                  return provider.id === "zyraxon" || provider.id === "opencode-go";
                },
                get children() {
                  return [(() => {
                    var _el$15 = _tmpl$8();
                    insert(_el$15, () => language.t(provider.id === "zyraxon" ? "dialog.provider.opencode.tagline" : "dialog.provider.opencodeGo.tagline"));
                    return _el$15;
                  })(), (() => {
                    var _el$16 = _tmpl$9();
                    insert(_el$16, () => language.t("dialog.provider.tag.recommended"));
                    return _el$16;
                  })()];
                }
              }), null);
              insert(_el$13, createComponent(Show, {
                get when() {
                  return provider.id === CUSTOM_ID;
                },
                get children() {
                  var _el$17 = _tmpl$9();
                  insert(_el$17, () => language.t("settings.providers.tag.custom"));
                  return _el$17;
                }
              }), null);
              insert(_el$13, createComponent(Show, {
                get when() {
                  return store.connecting === provider.id;
                },
                get children() {
                  return createComponent(Spinner, {
                    "class": "ml-auto size-4 shrink-0 text-v2-icon-icon-muted"
                  });
                }
              }), null);
              createRenderEffect((_p$) => {
                var _v$ = provider.id, _v$2 = !!(store.active === provider.id), _v$3 = store.connecting !== void 0, _v$4 = store.connecting === provider.id;
                _v$ !== _p$.e && setAttribute(_el$13, "data-provider-id", _p$.e = _v$);
                _v$2 !== _p$.t && _el$13.classList.toggle("bg-v2-overlay-simple-overlay-hover", _p$.t = _v$2);
                _v$3 !== _p$.a && (_el$13.disabled = _p$.a = _v$3);
                _v$4 !== _p$.o && setAttribute(_el$13, "aria-busy", _p$.o = _v$4);
                return _p$;
              }, {
                e: void 0,
                t: void 0,
                a: void 0,
                o: void 0
              });
              return _el$13;
            })()
          }), null);
          return _el$11;
        }
      })
    }), null);
    insert(_el$0, createComponent(Show, {
      get when() {
        return rows().length === 0;
      },
      get children() {
        var _el$1 = _tmpl$5();
        insert(_el$1, () => language.t("dialog.provider.empty"));
        return _el$1;
      }
    }), null);
    return _el$7;
  })();
}
function ProviderConnection(props) {
  const dialog = useDialog();
  const serverSync = useServerSync();
  const serverSDK = useServerSDK();
  const language = useLanguage();
  const settings = useSettings();
  const newLayout = settings.general.newLayoutDesigns;
  const providers = useProviders(props.directory);
  const alive = {
    value: true
  };
  const timer = {
    current: void 0
  };
  onCleanup(() => {
    alive.value = false;
    if (timer.current === void 0) return;
    clearTimeout(timer.current);
    timer.current = void 0;
  });
  const provider = createMemo(() => providers.all().get(props.provider) ?? serverSync().data.provider.all.get(props.provider));
  const fallback = createMemo(() => [{
    type: "api",
    label: language.t("provider.connect.method.apiKey")
  }]);
  const [auth] = createResource(() => props.provider, async () => {
    const cached = serverSync().data.provider_auth[props.provider];
    if (cached) return cached;
    const res = await serverSDK().client.provider.auth();
    if (!alive.value) return fallback();
    serverSync().set("provider_auth", res.data ?? {});
    return res.data?.[props.provider] ?? fallback();
  });
  const loading = createMemo(() => auth.loading && !serverSync().data.provider_auth[props.provider]);
  const methods = createMemo(() => auth.latest ?? serverSync().data.provider_auth[props.provider] ?? fallback());
  const cachedMethods = serverSync().data.provider_auth[props.provider];
  const directMethod = cachedMethods?.length === 1 && cachedMethods[0].type === "api" && !cachedMethods[0].prompts?.length ? 0 : void 0;
  const [store, setStore] = createStore({
    methodIndex: directMethod,
    authorization: void 0,
    promptInputs: void 0,
    state: directMethod === void 0 ? "pending" : void 0,
    error: void 0
  });
  function dispatch(action) {
    setStore(produce((draft) => {
      if (action.type === "method.select") {
        draft.methodIndex = action.index;
        draft.authorization = void 0;
        draft.promptInputs = void 0;
        draft.state = void 0;
        draft.error = void 0;
        return;
      }
      if (action.type === "method.reset") {
        draft.methodIndex = void 0;
        draft.authorization = void 0;
        draft.promptInputs = void 0;
        draft.state = void 0;
        draft.error = void 0;
        return;
      }
      if (action.type === "auth.prompt") {
        draft.state = "prompt";
        draft.error = void 0;
        return;
      }
      if (action.type === "auth.inputs") {
        draft.promptInputs = action.inputs;
        draft.state = void 0;
        draft.error = void 0;
        return;
      }
      if (action.type === "auth.pending") {
        draft.state = "pending";
        draft.error = void 0;
        return;
      }
      if (action.type === "auth.complete") {
        draft.state = "complete";
        draft.authorization = action.authorization;
        draft.error = void 0;
        return;
      }
      draft.state = "error";
      draft.error = action.error;
    }));
  }
  const method = createMemo(() => store.methodIndex !== void 0 ? methods().at(store.methodIndex) : void 0);
  const methodLabel = (value) => {
    if (!value) return "";
    if (value.type === "api") return language.t("provider.connect.method.apiKey");
    return value.label ?? "";
  };
  const methodDetails = (value) => {
    const label = methodLabel(value);
    const suffix = value?.label?.match(/\s+\((browser|headless)\)$/i);
    const hint = suffix?.[1];
    return {
      label: suffix ? label.slice(0, -suffix[0].length) : label,
      hint: hint ? hint[0].toUpperCase() + hint.slice(1) : value?.type === "api" ? "Browser" : void 0
    };
  };
  function formatError(value, fallback2) {
    if (value && typeof value === "object" && "data" in value) {
      const data = value.data;
      if (typeof data?.message === "string" && data.message) return data.message;
    }
    if (value && typeof value === "object" && "error" in value) {
      const nested = formatError(value.error, "");
      if (nested) return nested;
    }
    if (value && typeof value === "object" && "message" in value) {
      const message = value.message;
      if (typeof message === "string" && message) return message;
    }
    if (value instanceof Error && value.message) return value.message;
    if (typeof value === "string" && value) return value;
    return fallback2;
  }
  async function selectMethod(index, inputs) {
    if (timer.current !== void 0) {
      clearTimeout(timer.current);
      timer.current = void 0;
    }
    const method2 = methods()[index];
    dispatch({
      type: "method.select",
      index
    });
    if (method2.type === "api" && method2.prompts?.length) {
      if (!inputs) {
        dispatch({
          type: "auth.prompt"
        });
        return;
      }
      dispatch({
        type: "auth.inputs",
        inputs
      });
      return;
    }
    if (method2.type === "oauth") {
      if (method2.prompts?.length && !inputs) {
        dispatch({
          type: "auth.prompt"
        });
        return;
      }
      dispatch({
        type: "auth.pending"
      });
      const start = Date.now();
      await serverSDK().client.provider.oauth.authorize({
        providerID: props.provider,
        method: index,
        inputs
      }, {
        throwOnError: true
      }).then((x) => {
        if (!alive.value) return;
        const elapsed = Date.now() - start;
        const delay = 1e3 - elapsed;
        if (delay > 0) {
          if (timer.current !== void 0) clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            timer.current = void 0;
            if (!alive.value) return;
            dispatch({
              type: "auth.complete",
              authorization: x.data
            });
          }, delay);
          return;
        }
        dispatch({
          type: "auth.complete",
          authorization: x.data
        });
      }).catch((e) => {
        if (!alive.value) return;
        dispatch({
          type: "auth.error",
          error: formatError(e, language.t("common.requestFailed"))
        });
      });
    }
  }
  function AuthPromptsView() {
    const [formStore, setFormStore] = createStore({
      value: {},
      index: 0
    });
    const prompts = createMemo(() => {
      const value = method();
      return value?.prompts ?? [];
    });
    const matches = (prompt, value) => {
      if (!prompt.when) return true;
      const actual = value[prompt.when.key];
      if (actual === void 0) return false;
      return prompt.when.op === "eq" ? actual === prompt.when.value : actual !== prompt.when.value;
    };
    const current = createMemo(() => {
      const all = prompts();
      const index = all.findIndex((prompt, index2) => index2 >= formStore.index && matches(prompt, formStore.value));
      if (index === -1) return;
      return {
        index,
        prompt: all[index]
      };
    });
    const valid = createMemo(() => {
      const item2 = current();
      if (!item2 || item2.prompt.type !== "text") return false;
      const value = formStore.value[item2.prompt.key] ?? "";
      return value.trim().length > 0;
    });
    async function next(index, value) {
      if (store.methodIndex === void 0) return;
      const next2 = prompts().findIndex((prompt, i) => i > index && matches(prompt, value));
      if (next2 !== -1) {
        setFormStore("index", next2);
        return;
      }
      if (method()?.type === "api") {
        dispatch({
          type: "auth.inputs",
          inputs: value
        });
        return;
      }
      await selectMethod(store.methodIndex, value);
    }
    async function handleSubmit(e) {
      e.preventDefault();
      const item2 = current();
      if (!item2 || item2.prompt.type !== "text") return;
      if (!valid()) return;
      await next(item2.index, formStore.value);
    }
    const item = () => current();
    const text = createMemo(() => {
      const prompt = item()?.prompt;
      if (!prompt || prompt.type !== "text") return;
      return prompt;
    });
    const select = createMemo(() => {
      const prompt = item()?.prompt;
      if (!prompt || prompt.type !== "select") return;
      return prompt;
    });
    return (() => {
      var _el$18 = _tmpl$10();
      _el$18.addEventListener("submit", handleSubmit);
      insert(_el$18, createComponent(Switch, {
        get children() {
          return [createComponent(Match, {
            get when() {
              return item()?.prompt.type === "text";
            },
            get children() {
              return [createComponent(TextField, {
                type: "text",
                get label() {
                  return text()?.message ?? "";
                },
                get placeholder() {
                  return text()?.placeholder;
                },
                get value() {
                  return memo(() => !!text())() ? formStore.value[text().key] ?? "" : "";
                },
                onChange: (value) => {
                  const prompt = text();
                  if (!prompt) return;
                  setFormStore("value", prompt.key, value);
                }
              }), createComponent(Button, {
                "class": "w-auto",
                type: "submit",
                size: "large",
                variant: "primary",
                get disabled() {
                  return !valid();
                },
                get children() {
                  return language.t("common.continue");
                }
              })];
            }
          }), createComponent(Match, {
            get when() {
              return item()?.prompt.type === "select";
            },
            get children() {
              var _el$19 = _tmpl$1(), _el$20 = _el$19.firstChild, _el$21 = _el$20.nextSibling;
              insert(_el$20, () => select()?.message);
              insert(_el$21, createComponent(List, {
                "class": "px-3",
                get items() {
                  return select()?.options ?? [];
                },
                key: (x) => x.value,
                get current() {
                  return select()?.options.find((x) => x.value === formStore.value[select().key]);
                },
                onSelect: (value) => {
                  if (!value) return;
                  const prompt = select();
                  if (!prompt) return;
                  const nextValue = {
                    ...formStore.value,
                    [prompt.key]: value.value
                  };
                  setFormStore("value", prompt.key, value.value);
                  void next(item().index, nextValue);
                },
                children: (option) => (() => {
                  var _el$22 = _tmpl$11(), _el$23 = _el$22.firstChild, _el$24 = _el$23.nextSibling, _el$25 = _el$24.nextSibling;
                  insert(_el$24, () => option.label);
                  insert(_el$25, () => option.hint);
                  return _el$22;
                })()
              }));
              return _el$19;
            }
          })];
        }
      }));
      return _el$18;
    })();
  }
  let listRef;
  function handleKey(e) {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      return;
    }
    if (e.key === "Escape") return;
    listRef?.onKeyDown(e);
  }
  let auto = false;
  createEffect(() => {
    if (auto) return;
    if (loading()) return;
    if (methods().length === 1) {
      auto = true;
      void selectMethod(0);
    }
  });
  async function complete() {
    await serverSDK().client.global.dispose();
    dialog.close();
    showToast({
      variant: "success",
      icon: "circle-check",
      title: language.t("provider.connect.toast.connected.title", {
        provider: provider().name
      }),
      description: language.t("provider.connect.toast.connected.description", {
        provider: provider().name
      })
    });
  }
  function goBack() {
    if (methods().length > 1 && store.methodIndex !== void 0) {
      dispatch({
        type: "method.reset"
      });
      return;
    }
    props.onBack();
  }
  props.setBack(goBack);
  function MethodSelection() {
    if (newLayout()) return (() => {
      var _el$26 = _tmpl$12(), _el$27 = _el$26.firstChild, _el$28 = _el$27.nextSibling;
      insert(_el$27, () => language.t("provider.connect.selectMethod", {
        provider: provider().name
      }));
      insert(_el$28, createComponent(For, {
        get each() {
          return methods();
        },
        children: (item, index) => {
          const details = () => methodDetails(item);
          return (() => {
            var _el$29 = _tmpl$13(), _el$30 = _el$29.firstChild, _el$31 = _el$30.nextSibling;
            _el$29.$$click = () => void selectMethod(index());
            insert(_el$31, () => details().label);
            insert(_el$29, createComponent(Show, {
              get when() {
                return details().hint;
              },
              children: (hint) => (() => {
                var _el$32 = _tmpl$14();
                insert(_el$32, hint);
                return _el$32;
              })()
            }), null);
            return _el$29;
          })();
        }
      }));
      return _el$26;
    })();
    return [(() => {
      var _el$33 = _tmpl$15();
      insert(_el$33, () => language.t("provider.connect.selectMethod", {
        provider: provider().name
      }));
      return _el$33;
    })(), (() => {
      var _el$34 = _tmpl$16();
      insert(_el$34, createComponent(List, {
        "class": "px-3",
        ref: (ref) => {
          listRef = ref;
        },
        items: methods,
        key: (m) => m?.label,
        onSelect: async (selected, index) => {
          if (!selected) return;
          void selectMethod(index);
        },
        children: (i) => (() => {
          var _el$35 = _tmpl$17(), _el$36 = _el$35.firstChild, _el$37 = _el$36.nextSibling;
          insert(_el$37, () => methodLabel(i));
          return _el$35;
        })()
      }));
      return _el$34;
    })()];
  }
  function ApiAuthView() {
    let apiKey;
    const errorID = createUniqueId();
    const [formStore, setFormStore] = createStore({
      value: "",
      error: void 0
    });
    onMount(() => {
      if (!newLayout()) return;
      apiKey?.focus({
        preventScroll: true
      });
    });
    async function handleSubmit(e) {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const apiKey2 = formData.get("apiKey");
      if (!apiKey2?.trim()) {
        setFormStore("error", language.t("provider.connect.apiKey.required"));
        return;
      }
      setFormStore("error", void 0);
      await serverSDK().client.auth.set({
        providerID: props.provider,
        auth: {
          type: "api",
          key: apiKey2,
          ...store.promptInputs ? {
            metadata: store.promptInputs
          } : {}
        }
      });
      await complete();
    }
    if (newLayout()) return (() => {
      var _el$38 = _tmpl$19(), _el$43 = _el$38.firstChild, _el$44 = _el$43.firstChild;
      insert(_el$38, createComponent(Show, {
        get when() {
          return provider().id === "opencode";
        },
        get fallback() {
          return language.t("provider.connect.apiKey.description", {
            provider: provider().name
          });
        },
        get children() {
          var _el$39 = _tmpl$18(), _el$40 = _el$39.firstChild, _el$41 = _el$40.nextSibling, _el$42 = _el$41.nextSibling;
          insert(_el$40, () => language.t("provider.connect.opencodeZen.line1"));
          insert(_el$41, () => language.t("provider.connect.opencodeZen.line2"));
          insert(_el$42, () => language.t("provider.connect.opencodeZen.visit.prefix"), null);
          insert(_el$42, createComponent(Link, {
            href: "https://zyraxon.ai/zen",
            "class": "text-v2-text-text-base focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-v2-border-border-focus",
            get children() {
              return language.t("provider.connect.opencodeZen.visit.link");
            }
          }), null);
          insert(_el$42, () => language.t("provider.connect.opencodeZen.visit.suffix"), null);
          return _el$39;
        }
      }), _el$43);
      _el$43.addEventListener("submit", handleSubmit);
      insert(_el$44, () => language.t("provider.connect.apiKey.label", {
        provider: provider().name
      }), null);
      insert(_el$44, createComponent(TextInputV2, {
        ref(r$) {
          var _ref$4 = apiKey;
          typeof _ref$4 === "function" ? _ref$4(r$) : apiKey = r$;
        },
        "class": "!w-full",
        name: "apiKey",
        get placeholder() {
          return language.t("provider.connect.apiKey.placeholder");
        },
        get value() {
          return formStore.value;
        },
        get invalid() {
          return formStore.error !== void 0;
        },
        get ["aria-describedby"]() {
          return formStore.error ? errorID : void 0;
        },
        autocomplete: "off",
        spellcheck: false,
        onInput: (event) => setFormStore("value", event.currentTarget.value)
      }), null);
      insert(_el$43, createComponent(Show, {
        get when() {
          return formStore.error;
        },
        children: (error) => (() => {
          var _el$45 = _tmpl$20();
          setAttribute(_el$45, "id", errorID);
          insert(_el$45, error);
          return _el$45;
        })()
      }), null);
      insert(_el$43, createComponent(ButtonV2, {
        type: "submit",
        variant: "contrast",
        get children() {
          return language.t("common.continue");
        }
      }), null);
      return _el$38;
    })();
    return (() => {
      var _el$46 = _tmpl$22(), _el$52 = _el$46.firstChild;
      insert(_el$46, createComponent(Switch, {
        get children() {
          return [createComponent(Match, {
            get when() {
              return provider().id === "opencode";
            },
            get children() {
              var _el$47 = _tmpl$21(), _el$48 = _el$47.firstChild, _el$49 = _el$48.nextSibling, _el$50 = _el$49.nextSibling;
              insert(_el$48, () => language.t("provider.connect.opencodeZen.line1"));
              insert(_el$49, () => language.t("provider.connect.opencodeZen.line2"));
              insert(_el$50, () => language.t("provider.connect.opencodeZen.visit.prefix"), null);
              insert(_el$50, createComponent(Link, {
                href: "https://zyraxon.ai/zen",
                tabIndex: -1,
                get children() {
                  return language.t("provider.connect.opencodeZen.visit.link");
                }
              }), null);
              insert(_el$50, () => language.t("provider.connect.opencodeZen.visit.suffix"), null);
              return _el$47;
            }
          }), createComponent(Match, {
            when: true,
            get children() {
              var _el$51 = _tmpl$15();
              insert(_el$51, () => language.t("provider.connect.apiKey.description", {
                provider: provider().name
              }));
              return _el$51;
            }
          })];
        }
      }), _el$52);
      _el$52.addEventListener("submit", handleSubmit);
      insert(_el$52, createComponent(TextField, {
        get autofocus() {
          return !newLayout();
        },
        ref(r$) {
          var _ref$5 = apiKey;
          typeof _ref$5 === "function" ? _ref$5(r$) : apiKey = r$;
        },
        type: "text",
        get label() {
          return language.t("provider.connect.apiKey.label", {
            provider: provider().name
          });
        },
        get placeholder() {
          return language.t("provider.connect.apiKey.placeholder");
        },
        name: "apiKey",
        get value() {
          return formStore.value;
        },
        onChange: (v) => setFormStore("value", v),
        get validationState() {
          return formStore.error ? "invalid" : void 0;
        },
        get error() {
          return formStore.error;
        }
      }), null);
      insert(_el$52, createComponent(Button, {
        "class": "w-auto",
        type: "submit",
        size: "large",
        variant: "primary",
        get children() {
          return language.t("common.continue");
        }
      }), null);
      return _el$46;
    })();
  }
  function OAuthCodeView() {
    let codeInput;
    const errorID = createUniqueId();
    const [formStore, setFormStore] = createStore({
      value: "",
      error: void 0
    });
    onMount(() => {
      if (!newLayout()) return;
      codeInput?.focus({
        preventScroll: true
      });
    });
    async function handleSubmit(e) {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const code = formData.get("code");
      if (!code?.trim()) {
        setFormStore("error", language.t("provider.connect.oauth.code.required"));
        return;
      }
      setFormStore("error", void 0);
      const result = await serverSDK().client.provider.oauth.callback({
        providerID: props.provider,
        method: store.methodIndex,
        code
      }).then((value) => value.error ? {
        ok: false,
        error: value.error
      } : {
        ok: true
      }).catch((error) => ({
        ok: false,
        error
      }));
      if (result.ok) {
        await complete();
        return;
      }
      setFormStore("error", formatError(result.error, language.t("provider.connect.oauth.code.invalid")));
    }
    if (newLayout()) return (() => {
      var _el$53 = _tmpl$23(), _el$54 = _el$53.firstChild, _el$55 = _el$54.nextSibling, _el$56 = _el$55.firstChild;
      insert(_el$54, () => language.t("provider.connect.oauth.code.visit.prefix"), null);
      insert(_el$54, createComponent(Link, {
        get href() {
          return store.authorization.url;
        },
        "class": "text-v2-text-text-base",
        get children() {
          return language.t("provider.connect.oauth.code.visit.link");
        }
      }), null);
      insert(_el$54, () => language.t("provider.connect.oauth.code.visit.suffix", {
        provider: provider().name
      }), null);
      _el$55.addEventListener("submit", handleSubmit);
      insert(_el$56, () => language.t("provider.connect.oauth.code.label", {
        method: method()?.label ?? ""
      }), null);
      insert(_el$56, createComponent(TextInputV2, {
        ref(r$) {
          var _ref$6 = codeInput;
          typeof _ref$6 === "function" ? _ref$6(r$) : codeInput = r$;
        },
        "class": "!w-full",
        name: "code",
        get placeholder() {
          return language.t("provider.connect.oauth.code.placeholder");
        },
        get value() {
          return formStore.value;
        },
        get invalid() {
          return formStore.error !== void 0;
        },
        get ["aria-describedby"]() {
          return formStore.error ? errorID : void 0;
        },
        autocomplete: "off",
        spellcheck: false,
        onInput: (event) => setFormStore("value", event.currentTarget.value)
      }), null);
      insert(_el$55, createComponent(Show, {
        get when() {
          return formStore.error;
        },
        children: (error) => (() => {
          var _el$57 = _tmpl$20();
          setAttribute(_el$57, "id", errorID);
          insert(_el$57, error);
          return _el$57;
        })()
      }), null);
      insert(_el$55, createComponent(ButtonV2, {
        type: "submit",
        variant: "contrast",
        get children() {
          return language.t("common.continue");
        }
      }), null);
      return _el$53;
    })();
    return (() => {
      var _el$58 = _tmpl$24(), _el$59 = _el$58.firstChild, _el$60 = _el$59.nextSibling;
      insert(_el$59, () => language.t("provider.connect.oauth.code.visit.prefix"), null);
      insert(_el$59, createComponent(Link, {
        get href() {
          return store.authorization.url;
        },
        get children() {
          return language.t("provider.connect.oauth.code.visit.link");
        }
      }), null);
      insert(_el$59, () => language.t("provider.connect.oauth.code.visit.suffix", {
        provider: provider().name
      }), null);
      _el$60.addEventListener("submit", handleSubmit);
      insert(_el$60, createComponent(TextField, {
        get autofocus() {
          return !newLayout();
        },
        ref(r$) {
          var _ref$7 = codeInput;
          typeof _ref$7 === "function" ? _ref$7(r$) : codeInput = r$;
        },
        type: "text",
        get label() {
          return language.t("provider.connect.oauth.code.label", {
            method: method()?.label ?? ""
          });
        },
        get placeholder() {
          return language.t("provider.connect.oauth.code.placeholder");
        },
        name: "code",
        get value() {
          return formStore.value;
        },
        onChange: (v) => setFormStore("value", v),
        get validationState() {
          return formStore.error ? "invalid" : void 0;
        },
        get error() {
          return formStore.error;
        }
      }), null);
      insert(_el$60, createComponent(Button, {
        "class": "w-auto",
        type: "submit",
        size: "large",
        variant: "primary",
        get children() {
          return language.t("common.continue");
        }
      }), null);
      return _el$58;
    })();
  }
  function OAuthAutoView() {
    const code = createMemo(() => {
      const instructions = store.authorization?.instructions;
      if (instructions?.includes(":")) {
        return instructions.split(":").pop()?.trim();
      }
      return instructions;
    });
    onMount(() => {
      void (async () => {
        const result = await serverSDK().client.provider.oauth.callback({
          providerID: props.provider,
          method: store.methodIndex
        }).then((value) => value.error ? {
          ok: false,
          error: value.error
        } : {
          ok: true
        }).catch((error) => ({
          ok: false,
          error
        }));
        if (!alive.value) return;
        if (!result.ok) {
          const message = formatError(result.error, language.t("common.requestFailed"));
          dispatch({
            type: "auth.error",
            error: message
          });
          return;
        }
        await complete();
      })();
    });
    return (() => {
      var _el$61 = _tmpl$25(), _el$62 = _el$61.firstChild, _el$63 = _el$62.nextSibling, _el$64 = _el$63.firstChild;
      insert(_el$62, () => language.t("provider.connect.oauth.auto.visit.prefix"), null);
      insert(_el$62, createComponent(Link, {
        get href() {
          return store.authorization.url;
        },
        get children() {
          return language.t("provider.connect.oauth.auto.visit.link");
        }
      }), null);
      insert(_el$62, () => language.t("provider.connect.oauth.auto.visit.suffix", {
        provider: provider().name
      }), null);
      insert(_el$61, createComponent(TextField, {
        get label() {
          return language.t("provider.connect.oauth.auto.confirmationCode");
        },
        "class": "font-mono",
        get value() {
          return code();
        },
        readOnly: true,
        copyable: true
      }), _el$63);
      insert(_el$63, createComponent(Spinner, {}), _el$64);
      insert(_el$64, () => language.t("provider.connect.status.waiting"));
      return _el$61;
    })();
  }
  return (() => {
    var _el$65 = _tmpl$27(), _el$66 = _el$65.firstChild, _el$67 = _el$66.firstChild, _el$68 = _el$66.nextSibling, _el$69 = _el$68.firstChild;
    insert(_el$66, createComponent(ProviderIcon, {
      get id() {
        return props.provider;
      },
      get ["class"]() {
        return newLayout() ? "mt-0.5 size-4 shrink-0 text-v2-icon-icon-base" : "size-5 shrink-0 icon-strong-base";
      }
    }), _el$67);
    insert(_el$67, createComponent(Switch, {
      get children() {
        return [createComponent(Match, {
          get when() {
            return memo(() => props.provider === "anthropic")() && method()?.label?.toLowerCase().includes("max");
          },
          get children() {
            return language.t("provider.connect.title.anthropicProMax");
          }
        }), createComponent(Match, {
          when: true,
          get children() {
            return language.t("provider.connect.title", {
              provider: provider().name
            });
          }
        })];
      }
    }));
    _el$69.$$keydown = handleKey;
    insert(_el$69, createComponent(Switch, {
      get children() {
        return [createComponent(Match, {
          get when() {
            return loading();
          },
          get children() {
            var _el$70 = _tmpl$26(), _el$71 = _el$70.firstChild, _el$72 = _el$71.firstChild;
            insert(_el$71, createComponent(Spinner, {}), _el$72);
            insert(_el$72, () => language.t("provider.connect.status.inProgress"));
            return _el$70;
          }
        }), createComponent(Match, {
          get when() {
            return store.methodIndex === void 0;
          },
          get children() {
            return createComponent(MethodSelection, {});
          }
        }), createComponent(Match, {
          get when() {
            return store.state === "pending";
          },
          get children() {
            var _el$73 = _tmpl$26(), _el$74 = _el$73.firstChild, _el$75 = _el$74.firstChild;
            insert(_el$74, createComponent(Spinner, {}), _el$75);
            insert(_el$75, () => language.t("provider.connect.status.inProgress"));
            return _el$73;
          }
        }), createComponent(Match, {
          get when() {
            return store.state === "prompt";
          },
          get children() {
            return createComponent(AuthPromptsView, {});
          }
        }), createComponent(Match, {
          get when() {
            return store.state === "error";
          },
          get children() {
            var _el$76 = _tmpl$26(), _el$77 = _el$76.firstChild, _el$78 = _el$77.firstChild;
            insert(_el$77, createComponent(Icon, {
              name: "circle-ban-sign",
              "class": "text-icon-critical-base"
            }), _el$78);
            insert(_el$78, () => language.t("provider.connect.status.failed", {
              error: store.error ?? ""
            }));
            return _el$76;
          }
        }), createComponent(Match, {
          get when() {
            return method()?.type === "api";
          },
          get children() {
            return createComponent(ApiAuthView, {});
          }
        }), createComponent(Match, {
          get when() {
            return method()?.type === "oauth";
          },
          get children() {
            return createComponent(Switch, {
              get children() {
                return [createComponent(Match, {
                  get when() {
                    return store.authorization?.method === "code";
                  },
                  get children() {
                    return createComponent(OAuthCodeView, {});
                  }
                }), createComponent(Match, {
                  get when() {
                    return store.authorization?.method === "auto";
                  },
                  get children() {
                    return createComponent(OAuthAutoView, {});
                  }
                })];
              }
            });
          }
        })];
      }
    }));
    createRenderEffect((_p$) => {
      var _v$5 = newLayout() ? "flex min-h-0 flex-1 flex-col" : "flex flex-col gap-6 px-2.5 pb-3", _v$6 = newLayout() ? "flex h-10 shrink-0 items-start gap-2 px-3" : "flex items-center gap-4 px-2.5", _v$7 = newLayout() ? "text-[15px] font-[530] leading-5 tracking-[-0.13px] text-v2-text-text-base" : "text-16-medium text-text-strong", _v$8 = newLayout() ? "flex min-h-0 flex-1 flex-col" : "flex flex-col gap-6 px-2.5 pb-10", _v$9 = newLayout() ? void 0 : 0, _v$0 = !newLayout() && store.methodIndex === void 0 ? true : void 0;
      _v$5 !== _p$.e && className(_el$65, _p$.e = _v$5);
      _v$6 !== _p$.t && className(_el$66, _p$.t = _v$6);
      _v$7 !== _p$.a && className(_el$67, _p$.a = _v$7);
      _v$8 !== _p$.o && className(_el$68, _p$.o = _v$8);
      _v$9 !== _p$.i && setAttribute(_el$69, "tabindex", _p$.i = _v$9);
      _v$0 !== _p$.n && (_el$69.autofocus = _p$.n = _v$0);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0
    });
    return _el$65;
  })();
}
delegateEvents(["click", "keydown"]);
const dialogConnectProvider = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DialogConnectProvider,
  useProviderConnectController
}, Symbol.toStringTag, { value: "Module" }));
export {
  DialogCustomProvider as D,
  Link as L,
  DialogConnectProvider as a,
  dialogConnectProvider as d,
  useProviderConnectController as u
};
//# sourceMappingURL=dialog-connect-provider-BamXKthB.js.map
