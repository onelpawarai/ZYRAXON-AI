import path from "path"

process.env.ZYRAXON_DB = ":memory:"
process.env.ZYRAXON_MODELS_PATH = path.join(import.meta.dir, "plugin", "fixtures", "models-dev.json")
process.env.ZYRAXON_DISABLE_MODELS_FETCH = "true"
