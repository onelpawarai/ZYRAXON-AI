import { A as useSync, u as useLanguage, ag as useMutation, ah as showToast } from "./main-D3v0Qciw.js";
function useMcpToggle() {
  const sync = useSync();
  const language = useLanguage();
  return useMutation(() => ({
    mutationFn: sync().mcp.toggle,
    onError: (error) => showToast({
      variant: "error",
      title: language.t("common.requestFailed"),
      description: error instanceof Error ? error.message : String(error)
    })
  }));
}
export {
  useMcpToggle as u
};
//# sourceMappingURL=mcp-RYhh16q-.js.map
