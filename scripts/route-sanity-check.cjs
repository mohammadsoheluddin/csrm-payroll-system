#!/usr/bin/env node
/*
 * CSRM Payroll System Route Sanity Check
 *
 * Purpose:
 * - Detect duplicate route declarations.
 * - Detect static endpoint shadowing by earlier dynamic endpoints, e.g. GET /:id before GET /deleted.
 * - Produce a quick route inventory for backend stabilization work.
 *
 * Usage from project root:
 *   node scripts/route-sanity-check.cjs
 *
 * Usage from server folder:
 *   node ../scripts/route-sanity-check.cjs
 */

const fs = require('fs');
const path = require('path');

const ROUTE_PATTERN = /router\.(get|post|patch|delete|put)\s*\(\s*([`"'])([^`"']+)\2/g;

function findProjectRoot(startDir) {
  let current = path.resolve(startDir);

  for (let i = 0; i < 8; i += 1) {
    if (fs.existsSync(path.join(current, 'server', 'src', 'modules'))) {
      return current;
    }

    if (fs.existsSync(path.join(current, 'src', 'modules')) && path.basename(current) === 'server') {
      return path.dirname(current);
    }

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  throw new Error('Could not locate project root. Run this script from the project root or server folder.');
}

function walk(dir, predicate, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, predicate, results);
      continue;
    }

    if (predicate(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

function normalizeRoute(routePath) {
  if (!routePath || routePath === '/') return '/';
  return routePath.startsWith('/') ? routePath : `/${routePath}`;
}

function splitSegments(routePath) {
  return normalizeRoute(routePath)
    .split('/')
    .filter(Boolean);
}

function isDynamicSegment(segment) {
  return segment.startsWith(':') || segment === '*';
}

function shadowsRoute(earlier, later) {
  if (earlier.method !== later.method) return false;

  const earlierSegments = splitSegments(earlier.path);
  const laterSegments = splitSegments(later.path);

  if (earlierSegments.length !== laterSegments.length) return false;
  if (earlierSegments.length === 0) return false;

  let hasDynamicCapture = false;

  for (let i = 0; i < earlierSegments.length; i += 1) {
    const a = earlierSegments[i];
    const b = laterSegments[i];

    if (a === b) continue;

    if (isDynamicSegment(a) && !isDynamicSegment(b)) {
      hasDynamicCapture = true;
      continue;
    }

    return false;
  }

  return hasDynamicCapture;
}

function parseRoutes(filePath, projectRoot) {
  const source = fs.readFileSync(filePath, 'utf8');
  const routes = [];
  let match;

  while ((match = ROUTE_PATTERN.exec(source)) !== null) {
    const before = source.slice(0, match.index);
    const line = before.split('\n').length;

    routes.push({
      method: match[1].toUpperCase(),
      path: normalizeRoute(match[3]),
      line,
      file: path.relative(projectRoot, filePath).replace(/\\/g, '/'),
    });
  }

  return routes;
}

function main() {
  const projectRoot = findProjectRoot(process.cwd());
  const modulesDir = path.join(projectRoot, 'server', 'src', 'modules');
  const routeFiles = walk(modulesDir, (file) => file.endsWith('.route.ts')).sort();
  const allRoutes = [];
  const duplicates = [];
  const conflicts = [];
  const routeKeyMap = new Map();

  for (const file of routeFiles) {
    const routes = parseRoutes(file, projectRoot);
    allRoutes.push(...routes);

    for (const route of routes) {
      const key = `${route.file}::${route.method} ${route.path}`;
      if (routeKeyMap.has(key)) {
        duplicates.push({ first: routeKeyMap.get(key), duplicate: route });
      } else {
        routeKeyMap.set(key, route);
      }
    }

    for (let i = 0; i < routes.length; i += 1) {
      for (let j = i + 1; j < routes.length; j += 1) {
        if (shadowsRoute(routes[i], routes[j])) {
          conflicts.push({ earlier: routes[i], later: routes[j] });
        }
      }
    }
  }

  console.log('CSRM Payroll System - Route Sanity Check');
  console.log('========================================');
  console.log(`Project root     : ${projectRoot}`);
  console.log(`Route files      : ${routeFiles.length}`);
  console.log(`Route declarations: ${allRoutes.length}`);
  console.log(`Duplicates       : ${duplicates.length}`);
  console.log(`Order conflicts  : ${conflicts.length}`);
  console.log('');

  if (duplicates.length > 0) {
    console.log('Duplicate route declarations:');
    for (const item of duplicates) {
      console.log(`- ${item.duplicate.file}:${item.duplicate.line} duplicates ${item.first.method} ${item.first.path} first declared at line ${item.first.line}`);
    }
    console.log('');
  }

  if (conflicts.length > 0) {
    console.log('Potential route order conflicts:');
    for (const item of conflicts) {
      console.log(`- ${item.later.file}:${item.later.line} ${item.later.method} ${item.later.path} may be shadowed by earlier ${item.earlier.method} ${item.earlier.path} at line ${item.earlier.line}`);
    }
    console.log('');
  }

  console.log('Route inventory:');
  let currentFile = '';
  for (const route of allRoutes) {
    if (route.file !== currentFile) {
      currentFile = route.file;
      console.log(`\n${currentFile}`);
    }
    console.log(`  ${route.method.padEnd(6)} ${route.path.padEnd(36)} line ${route.line}`);
  }

  console.log('');

  if (duplicates.length > 0 || conflicts.length > 0) {
    console.error('Route sanity check failed. Fix duplicate or shadowed endpoints before continuing.');
    process.exit(1);
  }

  console.log('Route sanity check passed. No duplicate or shadowed endpoints detected.');
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
