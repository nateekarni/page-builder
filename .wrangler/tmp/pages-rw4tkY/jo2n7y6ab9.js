// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/*"
  ],
  exclude: [
    "/_astro/*",
    "/.assetsignore",
    "/favicon.ico",
    "/favicon.svg",
    "/llms.txt",
    "/robots.txt"
  ]
};

// node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "D:\\Projects\\portfolio-builder\\.wrangler\\tmp\\pages-rw4tkY\\bundledWorker-0.07805460649282647.mjs";
import { isRoutingRuleMatch } from "D:\\Projects\\portfolio-builder\\node_modules\\wrangler\\templates\\pages-dev-util.ts";
export * from "D:\\Projects\\portfolio-builder\\.wrangler\\tmp\\pages-rw4tkY\\bundledWorker-0.07805460649282647.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=jo2n7y6ab9.js.map
