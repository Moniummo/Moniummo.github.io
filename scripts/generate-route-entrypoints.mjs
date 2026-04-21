import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const indexPath = path.join(distDir, "index.html");

const routeFolders = ["projects", "research", "cv", "about", "resume", "cv/app-development"];

const buildRouteHtml = (rootHtml, route) => {
  const depth = route.split("/").length;
  const assetPrefix = "../".repeat(depth);

  return rootHtml
    .replace(/(src|href)="\.\/assets\//g, `$1="${assetPrefix}assets/`)
    .replace(/(src|href)="\.\/favicon\.svg([^"]*)"/g, `$1="${assetPrefix}favicon.svg$2"`)
    .replace(/(src|href)="\.\/favicon\.ico([^"]*)"/g, `$1="${assetPrefix}favicon.ico$2"`)
    .replace(/(src|href)="\.\/robots\.txt"/g, `$1="${assetPrefix}robots.txt"`)
    .replace(/(src|href)="\.\/placeholder\.svg"/g, `$1="${assetPrefix}placeholder.svg"`);
};

const main = async () => {
  const rootHtml = await readFile(indexPath, "utf8");

  for (const route of routeFolders) {
    const routeDir = path.join(distDir, route);
    const routeHtml = buildRouteHtml(rootHtml, route);
    await mkdir(routeDir, { recursive: true });
    await writeFile(path.join(routeDir, "index.html"), routeHtml, "utf8");
  }
};

main().catch((error) => {
  console.error("Failed to generate route entrypoints:", error);
  process.exitCode = 1;
});
