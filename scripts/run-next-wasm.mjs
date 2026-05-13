import { existsSync } from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const nextCliPath = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const wasmBindingsPath = path.join(
  projectRoot,
  "node_modules",
  "@next",
  "swc-wasm-nodejs",
);

const nextArgs = process.argv.slice(2);

if (nextArgs.length === 0) {
  console.error("Missing Next.js command. Use dev, build, or start.");
  process.exit(1);
}

const env = { ...process.env };

// Next.js 15 + current Windows host Node can fail to load the native SWC addon.
// When the official wasm package is present, point Next to it before boot.
if (
  process.platform === "win32" &&
  !env.NEXT_TEST_WASM_DIR &&
  existsSync(path.join(wasmBindingsPath, "wasm.js"))
) {
  env.NEXT_TEST_WASM_DIR = wasmBindingsPath;
}

const child = spawn(process.execPath, [nextCliPath, ...nextArgs], {
  cwd: projectRoot,
  env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
