/**
 * SITE DOMAIN TOOL
 *
 * Manages custom domains for websites published on GitHub Pages.
 * Handles domain setup, sitemap generation, and SEO meta tags.
 */

import { Effect, Schema } from "effect"
import { Tool } from "../tool/tool"
import { getSiteManager } from "../pro-builder/engine"
import { getDomainManager } from "../pro-builder/domain-manager"
import { getGitHubManager } from "../pro-builder/github-manager"

const DESCRIPTION = `Manage custom domains and SEO for websites.

Actions:
- add_domain: Add a custom domain to a published site
- remove_domain: Remove a custom domain from a site
- list_domains: List all configured domains
- generate_sitemap: Generate sitemap.xml for the site
- generate_robots: Generate robots.txt for the site
- generate_seo: Generate SEO meta tags for the site
- check_status: Check domain and publish status

For custom domains on GitHub Pages:
1. User must own the domain (e.g., zorkson.com)
2. Pro Builder adds a CNAME file to the GitHub repo
3. User points their domain's DNS to GitHub Pages (CNAME record)
4. Website becomes accessible at the custom domain
5. SSL certificate is auto-provisioned by GitHub`

const Parameters = Schema.Struct({
  action: Schema.String.annotate({
    description: "Action: add_domain, remove_domain, list_domains, generate_sitemap, generate_robots, generate_seo, check_status",
  }),
  siteId: Schema.optional(Schema.String).annotate({
    description: "Site ID (required for most actions)",
  }),
  domain: Schema.optional(Schema.String).annotate({
    description: "Domain name (e.g., zorkson.com)",
  }),
  pages: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Page paths for sitemap (for generate_sitemap)",
  }),
  title: Schema.optional(Schema.String).annotate({
    description: "Site title for SEO (for generate_seo)",
  }),
  description: Schema.optional(Schema.String).annotate({
    description: "Site description for SEO (for generate_seo)",
  }),
  url: Schema.optional(Schema.String).annotate({
    description: "Canonical URL for SEO (for generate_seo)",
  }),
  image: Schema.optional(Schema.String).annotate({
    description: "OG image URL for SEO (for generate_seo)",
  }),
})

export const SiteDomainTool = Tool.define<typeof Parameters>(
  "site_domain",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params, ctx) =>
        Effect.gen(function* () {
          const result = yield* Effect.promise(async () => {
            const siteManager = await getSiteManager()
            const domainManager = await getDomainManager()
            const gh = await getGitHubManager()

            switch (params.action) {
              case "add_domain": {
                if (!params.domain || !params.siteId) {
                  return { success: false, output: "", error: "domain and siteId are required" }
                }

                const site = siteManager.getSite(params.siteId)
                if (!site) {
                  return { success: false, output: "", error: `Site not found: ${params.siteId}` }
                }

                if (!site.published || !site.githubRepo) {
                  return { success: false, output: "", error: "Site not published yet. Publish first with site_publish tool." }
                }

                if (!gh.isConnected()) {
                  return { success: false, output: "", error: "GitHub not connected." }
                }

                // Add CNAME to GitHub repo
                const domainResult = await gh.setCustomDomain(site.githubRepo, params.domain)
                if (!domainResult.success) {
                  return { success: false, output: "", error: `Failed: ${domainResult.error}` }
                }

                // Update domain manager
                const domainConfig = await domainManager.addDomain({
                  domain: params.domain,
                  subdomain: params.subdomain,
                  siteId: params.siteId,
                  sitePort: site.port,
                })

                // Get username for instructions
                const user = await gh.getUser()

                return {
                  success: true,
                  output: JSON.stringify({
                    message: `Custom domain "${params.domain}" added for site "${site.name}"`,
                    domain: domainConfig,
                    instructions: [
                      `1. Go to your domain registrar (where you bought ${params.domain})`,
                      `2. Add a CNAME record:`,
                      `   - Name: @ (or www)`,
                      `   - Value: ${user?.username || "username"}.github.io`,
                      `   - Type: CNAME`,
                      `3. Wait 5-30 minutes for DNS propagation`,
                      `4. Your site will be live at https://${params.domain}`,
                    ],
                  }, null, 2),
                }
              }

              case "remove_domain": {
                if (!params.siteId) {
                  return { success: false, output: "", error: "siteId is required" }
                }

                await siteManager.removeCustomDomain(params.siteId)
                await domainManager.removeDomain(params.domain || "")

                return {
                  success: true,
                  output: JSON.stringify({
                    message: `Custom domain removed from site`,
                  }, null, 2),
                }
              }

              case "list_domains": {
                const domains = domainManager.listDomains()
                return {
                  success: true,
                  output: JSON.stringify({
                    message: `Found ${domains.length} domain(s)`,
                    domains: domains.map(d => ({
                      domain: d.domain,
                      subdomain: d.subdomain,
                      fullUrl: d.fullUrl,
                      siteId: d.siteId,
                      verified: d.verified,
                    })),
                  }, null, 2),
                }
              }

              case "generate_sitemap": {
                if (!params.siteId || !params.url) {
                  return { success: false, output: "", error: "siteId and url are required" }
                }

                const site = siteManager.getSite(params.siteId)
                if (!site) {
                  return { success: false, output: "", error: `Site not found: ${params.siteId}` }
                }

                const pages = params.pages || [""]
                const sitemap = domainManager.generateSitemap(site.directory, params.url, pages)

                // Save to site directory
                const fs = await import("fs/promises")
                const sitemapPath = `${site.directory}/sitemap.xml`
                await fs.writeFile(sitemapPath, sitemap)

                return {
                  success: true,
                  output: JSON.stringify({
                    message: "sitemap.xml generated",
                    path: sitemapPath,
                    url: `${params.url}/sitemap.xml`,
                  }, null, 2),
                }
              }

              case "generate_robots": {
                if (!params.url) {
                  return { success: false, output: "", error: "url is required" }
                }

                const robots = domainManager.generateRobotsTxt(params.url)

                let robotsPath = ""
                if (params.siteId) {
                  const site = siteManager.getSite(params.siteId)
                  if (site) {
                    const fs = await import("fs/promises")
                    robotsPath = `${site.directory}/robots.txt`
                    await fs.writeFile(robotsPath, robots)
                  }
                }

                return {
                  success: true,
                  output: JSON.stringify({
                    message: "robots.txt generated",
                    path: robotsPath || "Not saved (no siteId)",
                  }, null, 2),
                }
              }

              case "generate_seo": {
                if (!params.title || !params.description || !params.url) {
                  return { success: false, output: "", error: "title, description, and url are required" }
                }

                const seoMeta = domainManager.generateSeoMeta({
                  title: params.title,
                  description: params.description,
                  url: params.url,
                  image: params.image,
                })

                return {
                  success: true,
                  output: JSON.stringify({
                    message: "SEO meta tags generated",
                    meta: seoMeta,
                    instructions: "Add these tags to the <head> section of your HTML.",
                  }, null, 2),
                }
              }

              case "check_status": {
                if (!params.siteId) {
                  const sites = siteManager.listSites()
                  const domains = domainManager.listDomains()

                  return {
                    success: true,
                    output: JSON.stringify({
                      githubConnected: gh.isConnected(),
                      sites: sites.map(s => ({
                        id: s.id,
                        name: s.name,
                        port: s.port,
                        published: s.published,
                        pagesUrl: s.githubPagesUrl,
                        customDomain: s.customDomain,
                      })),
                      domains: domains.map(d => ({
                        domain: d.fullUrl,
                        siteId: d.siteId,
                        verified: d.verified,
                      })),
                    }, null, 2),
                  }
                }

                const site = siteManager.getSite(params.siteId)
                if (!site) {
                  return { success: false, output: "", error: `Site not found: ${params.siteId}` }
                }

                const domain = domainManager.getDomainForSite(params.siteId)

                return {
                  success: true,
                  output: JSON.stringify({
                    githubConnected: gh.isConnected(),
                    site: {
                      id: site.id,
                      name: site.name,
                      port: site.port,
                      published: site.published,
                      pagesUrl: site.githubPagesUrl,
                      customDomain: site.customDomain,
                      localUrl: `http://localhost:${site.port}`,
                    },
                    domain: domain ? {
                      fullUrl: domain.fullUrl,
                      verified: domain.verified,
                    } : null,
                    status: site.published
                      ? site.customDomain ? "published_with_custom_domain" : "published_on_github_pages"
                      : "local_only",
                  }, null, 2),
                }
              }

              default:
                return { success: false, output: "", error: `Unknown action: ${params.action}` }
            }
          })

          return {
            title: `Domain ${params.action}`,
            metadata: {},
            output: result.output || (result.success ? "Done" : result.error || "Unknown error"),
          }
        }),
    }
  }),
)
