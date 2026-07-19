import { Config } from "effect"

export function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

const copy = process.env["ZYRAXON_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
const fff = process.env["ZYRAXON_DISABLE_FFF"]

function enabledByExperimental(key: string) {
  return process.env[key] === undefined ? truthy("ZYRAXON_EXPERIMENTAL") : truthy(key)
}

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  ZYRAXON_AUTO_HEAP_SNAPSHOT: truthy("ZYRAXON_AUTO_HEAP_SNAPSHOT"),
  ZYRAXON_GIT_BASH_PATH: process.env["ZYRAXON_GIT_BASH_PATH"],
  ZYRAXON_CONFIG: process.env["ZYRAXON_CONFIG"],
  ZYRAXON_CONFIG_CONTENT: process.env["ZYRAXON_CONFIG_CONTENT"],
  ZYRAXON_DISABLE_AUTOUPDATE: truthy("ZYRAXON_DISABLE_AUTOUPDATE"),
  ZYRAXON_ALWAYS_NOTIFY_UPDATE: truthy("ZYRAXON_ALWAYS_NOTIFY_UPDATE"),
  ZYRAXON_DISABLE_PRUNE: truthy("ZYRAXON_DISABLE_PRUNE"),
  ZYRAXON_DISABLE_TERMINAL_TITLE: truthy("ZYRAXON_DISABLE_TERMINAL_TITLE"),
  ZYRAXON_SHOW_TTFD: truthy("ZYRAXON_SHOW_TTFD"),
  ZYRAXON_DISABLE_AUTOCOMPACT: truthy("ZYRAXON_DISABLE_AUTOCOMPACT"),
  ZYRAXON_DISABLE_MODELS_FETCH: truthy("ZYRAXON_DISABLE_MODELS_FETCH"),
  ZYRAXON_DISABLE_MOUSE: truthy("ZYRAXON_DISABLE_MOUSE"),
  ZYRAXON_FAKE_VCS: process.env["ZYRAXON_FAKE_VCS"],
  ZYRAXON_SERVER_PASSWORD: process.env["ZYRAXON_SERVER_PASSWORD"],
  ZYRAXON_SERVER_USERNAME: process.env["ZYRAXON_SERVER_USERNAME"],
  ZYRAXON_DISABLE_FFF: fff === undefined ? process.platform === "win32" : truthy("ZYRAXON_DISABLE_FFF"),

  // Experimental
  ZYRAXON_EXPERIMENTAL_FILEWATCHER: Config.boolean("ZYRAXON_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  ZYRAXON_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("ZYRAXON_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  ZYRAXON_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("ZYRAXON_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),
  ZYRAXON_MODELS_URL: process.env["ZYRAXON_MODELS_URL"],
  ZYRAXON_MODELS_PATH: process.env["ZYRAXON_MODELS_PATH"],
  ZYRAXON_DB: process.env["ZYRAXON_DB"],

  ZYRAXON_WORKSPACE_ID: process.env["ZYRAXON_WORKSPACE_ID"],
  ZYRAXON_EXPERIMENTAL_WORKSPACES: enabledByExperimental("ZYRAXON_EXPERIMENTAL_WORKSPACES"),

  // Evaluated at access time (not module load) because tests, the CLI, and
  // external tooling set these env vars at runtime.
  get ZYRAXON_DISABLE_PROJECT_CONFIG() {
    return truthy("ZYRAXON_DISABLE_PROJECT_CONFIG")
  },
  get ZYRAXON_EXPERIMENTAL_REFERENCES() {
    return enabledByExperimental("ZYRAXON_EXPERIMENTAL_REFERENCES")
  },
  get ZYRAXON_TUI_CONFIG() {
    return process.env["ZYRAXON_TUI_CONFIG"]
  },
  get ZYRAXON_CONFIG_DIR() {
    return process.env["ZYRAXON_CONFIG_DIR"]
  },
  get ZYRAXON_PURE() {
    return truthy("ZYRAXON_PURE")
  },
  get ZYRAXON_PERMISSION() {
    return process.env["ZYRAXON_PERMISSION"]
  },
  get ZYRAXON_PLUGIN_META_FILE() {
    return process.env["ZYRAXON_PLUGIN_META_FILE"]
  },
  get ZYRAXON_CLIENT() {
    return process.env["ZYRAXON_CLIENT"] ?? "cli"
  },
}
