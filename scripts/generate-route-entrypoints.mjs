import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const indexPath = path.join(distDir, "index.html");

const routeFolders = ["projects", "research", "cv", "about", "resume"];

const main = async () => {
  const rootHtml = await readFile(indexPath, "utf8");
  const routeHtml = rootHtml
    .replace(/(src|href)="\.\/assets\//g, '$1="../assets/')
    .replace(/(src|href)="\.\/favicon\.ico"/g, '$1="../favicon.ico"')
    .replace(/(src|href)="\.\/robots\.txt"/g, '$1="../robots.txt"')
    .replace(/(src|href)="\.\/placeholder\.svg"/g, '$1="../placeholder.svg"');

  for (const route of routeFolders) {
    const routeDir = path.join(distDir, route);
    await mkdir(routeDir, { recursive: true });
    await writeFile(path.join(routeDir, "index.html"), routeHtml, "utf8");
  }
};

main().catch((error) => {
  console.error("Failed to generate route entrypoints:", error);
  process.exitCode = 1;
});
