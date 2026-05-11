#!/usr/bin/env node

/**
 * CSRM Payroll System
 * Part-50.1 — Backend Build Health Final Pass
 *
 * Safe checks only:
 * - Detect project root/server folder
 * - Verify important backend paths
 * - Run existing npm scripts if available
 * - Warn about known local-only/stray paths
 *
 * Usage from project root:
 *   node scripts/backend-health-check.cjs
 *
 * Usage from server folder:
 *   node ../scripts/backend-health-check.cjs
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const startedAt = Date.now();

const log = (message = "") => console.log(message);
const ok = (message) => console.log(`✅ ${message}`);
const warn = (message) => console.warn(`⚠️  ${message}`);
const fail = (message) => {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
};

const fileExists = (target) => fs.existsSync(target);
const readJson = (target) => JSON.parse(fs.readFileSync(target, "utf8"));

const findProjectRoot = () => {
  const cwd = process.cwd();

  if (fileExists(path.join(cwd, "server", "package.json"))) {
    return cwd;
  }

  if (path.basename(cwd) === "server" && fileExists(path.join(cwd, "package.json"))) {
    return path.dirname(cwd);
  }

  let current = cwd;
  for (let i = 0; i < 5; i += 1) {
    if (fileExists(path.join(current, "server", "package.json"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return cwd;
};

const projectRoot = findProjectRoot();
const serverDir = path.join(projectRoot, "server");
const serverPackagePath = path.join(serverDir, "package.json");

log("");
log("CSRM Payroll System — Backend Health Check");
log("================================================");
log(`Project root : ${projectRoot}`);
log(`Server dir   : ${serverDir}`);
log("");

if (!fileExists(serverPackagePath)) {
  fail("server/package.json was not found. Run this script from project root or server folder.");
  process.exit(1);
}

const serverPkg = readJson(serverPackagePath);
const scripts = serverPkg.scripts || {};

const requiredPaths = [
  "server/src",
  "server/src/routes/index.ts",
  "server/src/middleware/globalErrorHandler.ts",
  "server/src/middleware/requirePermission.ts",
  "server/src/utils/sendResponse.ts",
  "server/src/modules/auditLog/auditLog.route.ts",
];

log("1) Project structure checks");
for (const relativePath of requiredPaths) {
  const fullPath = path.join(projectRoot, relativePath);
  if (fileExists(fullPath)) {
    ok(`${relativePath} exists`);
  } else {
    fail(`${relativePath} is missing`);
  }
}

const gitattributesPath = path.join(projectRoot, ".gitattributes");
if (fileExists(gitattributesPath)) {
  ok(".gitattributes exists");
} else {
  warn(".gitattributes is missing. Line-ending warnings may return.");
}

const strayCommonTypes = path.join(projectRoot, "server", "srccommontypes.ts");
if (fileExists(strayCommonTypes)) {
  warn("server/srccommontypes.ts still exists. Consider removing it if it is a stray file.");
} else {
  ok("No stray server/srccommontypes.ts file found");
}

const localPostmanDir = path.join(projectRoot, ".postman");
if (fileExists(localPostmanDir)) {
  warn(".postman folder exists. Do not commit app-local Postman workspace files unless intentional.");
}

log("");
log("2) Available server npm scripts");
for (const scriptName of ["typecheck", "route:sanity", "build:clean", "build", "dev"]) {
  if (scripts[scriptName]) {
    ok(`npm run ${scriptName} -> ${scripts[scriptName]}`);
  } else {
    warn(`npm run ${scriptName} is not defined`);
  }
}

const runNpmScript = (scriptName, options = {}) => {
  if (!scripts[scriptName]) {
    if (options.required) {
      fail(`Required npm script missing: ${scriptName}`);
    } else {
      warn(`Skipped missing npm script: ${scriptName}`);
    }
    return false;
  }

  log("");
  log(`Running: npm run ${scriptName}`);
  log("------------------------------------------------");

  const result = spawnSync("npm", ["run", scriptName], {
    cwd: serverDir,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  if (result.status !== 0) {
    fail(`npm run ${scriptName} failed with exit code ${result.status}`);
    return false;
  }

  ok(`npm run ${scriptName} passed`);
  return true;
};

log("");
log("3) Backend command checks");

runNpmScript("typecheck", { required: false });
runNpmScript("route:sanity", { required: false });

if (scripts["build:clean"]) {
  runNpmScript("build:clean", { required: true });
} else {
  runNpmScript("build", { required: true });
}

log("");
log("4) Build output check");

const distDir = path.join(serverDir, "dist");
if (fileExists(distDir)) {
  ok("server/dist exists after build");
} else {
  warn("server/dist was not found after build. Check your build output directory if this is unexpected.");
}

const totalSeconds = ((Date.now() - startedAt) / 1000).toFixed(2);

log("");
log("================================================");
if (process.exitCode && process.exitCode !== 0) {
  log(`Backend health check completed with issues in ${totalSeconds}s.`);
  process.exit(process.exitCode);
}

log(`Backend health check passed in ${totalSeconds}s.`);
log("Next: run npm run dev manually and do final Postman smoke testing.");
