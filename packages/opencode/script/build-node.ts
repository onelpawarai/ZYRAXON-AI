#!/usr/bin/env bun
import { $ } from "bun"

console.log("Building opencode node binary...")

const buildScript = "./script/build.ts"
await $`bun ${buildScript}`

console.log("Node binary build complete!")
