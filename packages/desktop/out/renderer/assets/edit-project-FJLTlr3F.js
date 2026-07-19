import { U as useDialog, bD as useGlobal, G as createMemo, y as getFilename, e as createStore, ag as useMutation } from "./main-D3v0Qciw.js";
function createEditProjectModel(props) {
  const dialog = useDialog();
  const global = useGlobal();
  const serverCtx = createMemo(() => global.ensureServerCtx(props.server));
  const folderName = createMemo(() => getFilename(props.project.worktree));
  const defaultName = createMemo(() => props.project.name || folderName());
  const [store, setStore] = createStore({
    name: defaultName(),
    color: props.project.icon?.color,
    iconOverride: props.project.icon?.override,
    startup: props.project.commands?.start ?? "",
    dragOver: false,
    iconHover: false
  });
  let iconInput;
  function selectFile(file) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== "string") return;
      setStore("iconOverride", result);
      setStore("iconHover", false);
    };
    reader.readAsDataURL(file);
  }
  function drop(event) {
    event.preventDefault();
    setStore("dragOver", false);
    const file = event.dataTransfer?.files[0];
    if (file) selectFile(file);
  }
  function dragOver(event) {
    event.preventDefault();
    setStore("dragOver", true);
  }
  function dragLeave() {
    setStore("dragOver", false);
  }
  function inputChange(event) {
    const file = event.currentTarget.files?.[0];
    if (file) selectFile(file);
  }
  function iconClick() {
    if (store.iconOverride && store.iconHover) {
      setStore("iconOverride", "");
      return;
    }
    iconInput?.click();
  }
  const save = useMutation(() => ({
    mutationFn: async () => {
      const name = store.name.trim() === folderName() ? "" : store.name.trim();
      const start = store.startup.trim();
      if (props.project.id && props.project.id !== "global") {
        await serverCtx().sdk.client.project.update({
          projectID: props.project.id,
          directory: props.project.worktree,
          name,
          icon: { color: store.color || "", override: store.iconOverride || "" },
          commands: { start }
        });
        serverCtx().sync.project.icon(props.project.worktree, store.iconOverride || void 0);
        dialog.close();
        return;
      }
      serverCtx().sync.project.meta(props.project.worktree, {
        name,
        icon: { color: store.color || void 0, override: store.iconOverride || void 0 },
        commands: { start: start || void 0 }
      });
      dialog.close();
    }
  }));
  function submit(event) {
    event.preventDefault();
    if (save.isPending) return;
    save.mutate();
  }
  return {
    store,
    setStore,
    folderName,
    defaultName,
    save,
    submit,
    drop,
    dragOver,
    dragLeave,
    inputChange,
    iconClick,
    close() {
      dialog.close();
    },
    setIconInput(input) {
      iconInput = input;
    }
  };
}
export {
  createEditProjectModel as c
};
//# sourceMappingURL=edit-project-FJLTlr3F.js.map
