import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// All pages are dynamic, so no incremental cache (R2) is needed.
export default defineCloudflareConfig({});
