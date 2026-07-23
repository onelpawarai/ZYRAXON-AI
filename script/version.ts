#!/usr/bin/env bun

import { Script } from "@opencode-ai/script"
import { $ } from "bun"

const output = [`version=${Script.version}`]
const sha = process.env.GITHUB_SHA ?? (await $`git rev-parse HEAD`.text()).trim()

// ZYRAXON-specific version info
const zyraxonVersion = {
  version: Script.version,
  sha,
  mcpToolsCount: 136,
  streamingEnabled: true,
  selfHealingEnabled: true,
  memorySystemEnabled: true,
  torIntegrationEnabled: true,
  desktopAutomationEnabled: true,
  youtubeStreamingEnabled: true,
  maxQualityEncoding: true,
  crossPlatformSupport: true,
}

if (!Script.preview) {
  await $`bun script/changelog.ts --to ${sha}`.cwd(process.cwd())
  const file = `${process.cwd()}/UPCOMING_CHANGELOG.md`
  const body = await Bun.file(file)
    .text()
    .catch(() => "No notable changes")
  const dir = process.env.RUNNER_TEMP ?? "/tmp"
  const notesFile = `${dir}/opencode-release-notes.txt`
  await Bun.write(notesFile, body)
  await $`gh release create v${Script.version} -d --target ${sha} --title "v${Script.version}" --notes-file ${notesFile}`
  const release = await $`gh release view v${Script.version} --json tagName,databaseId`.json()
  output.push(`release=${release.databaseId}`)
  output.push(`tag=${release.tagName}`)
} else if (Script.channel === "beta") {
  await $`gh release create v${Script.version} -d --title "v${Script.version}" --repo ${process.env.GH_REPO}`
  const release =
    await $`gh release view v${Script.version} --json tagName,databaseId --repo ${process.env.GH_REPO}`.json()
  output.push(`release=${release.databaseId}`)
  output.push(`tag=${release.tagName}`)
}

output.push(`repo=${process.env.GH_REPO}`)

// ZYRAXON-specific output
output.push(`zyraxon_version=${zyraxonVersion.version}`)
output.push(`zyraxon_sha=${zyraxonVersion.sha}`)
output.push(`zyraxon_mcp_tools=${zyraxonVersion.mcpToolsCount}`)
output.push(`zyraxon_streaming=${zyraxonVersion.streamingEnabled}`)
output.push(`zyraxon_self_healing=${zyraxonVersion.selfHealingEnabled}`)
output.push(`zyraxon_memory_system=${zyraxonVersion.memorySystemEnabled}`)
output.push(`zyraxon_tor_integration=${zyraxonVersion.torIntegrationEnabled}`)
output.push(`zyraxon_desktop_automation=${zyraxonVersion.desktopAutomationEnabled}`)
output.push(`zyraxon_youtube_streaming=${zyraxonVersion.youtubeStreamingEnabled}`)
output.push(`zyraxon_max_quality_encoding=${zyraxonVersion.maxQualityEncoding}`)
output.push(`zyraxon_cross_platform_support=${zyraxonVersion.crossPlatformSupport}`)

if (process.env.GITHUB_OUTPUT) {
  await Bun.write(process.env.GITHUB_OUTPUT, output.join("\n"))
}

process.exit(0)
