import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT_DIR = resolve(".");
const PACKAGES_DIR = resolve(ROOT_DIR, "packages");

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function discoverPackages(directory) {
  const packages = [];

  if (!existsSync(directory)) {
    return packages;
  }

  for (const entry of readdirSync(directory, {
    withFileTypes: true,
  })) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (entry.name === "node_modules" || entry.name === "dist") {
      continue;
    }

    const child = resolve(directory, entry.name);
    const packageJsonFile = resolve(child, "package.json");

    if (existsSync(packageJsonFile)) {
      const packageJson = readJson(packageJsonFile);

      if (packageJson.name) {
        packages.push({
          directory: child,
          packageJson,
          name: packageJson.name,
        });

        continue;
      }
    }

    packages.push(...discoverPackages(child));
  }

  return packages;
}

function getWorkspaceDependencies(pkg, packageNames) {
  const dependencyGroups = [
    pkg.packageJson.dependencies,
    pkg.packageJson.devDependencies,
    pkg.packageJson.peerDependencies,
    pkg.packageJson.optionalDependencies,
  ];

  const dependencies = new Set();

  for (const group of dependencyGroups) {
    if (!group) {
      continue;
    }

    for (const name of Object.keys(group)) {
      if (packageNames.has(name)) {
        dependencies.add(name);
      }
    }
  }

  return [...dependencies];
}

function sortPackages(packages) {
  const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));

  const packageNames = new Set(byName.keys());

  const temporary = new Set();
  const permanent = new Set();
  const sorted = [];

  function visit(pkg) {
    if (permanent.has(pkg.name)) {
      return;
    }

    if (temporary.has(pkg.name)) {
      throw new Error(
        `Circular workspace dependency detected involving ${pkg.name}.`,
      );
    }

    temporary.add(pkg.name);

    const dependencies = getWorkspaceDependencies(pkg, packageNames);

    for (const dependencyName of dependencies) {
      const dependency = byName.get(dependencyName);

      if (dependency) {
        visit(dependency);
      }
    }

    temporary.delete(pkg.name);
    permanent.add(pkg.name);

    sorted.push(pkg);
  }

  for (const pkg of packages) {
    visit(pkg);
  }

  return sorted;
}

function buildPackage(pkg) {
  if (!pkg.packageJson.scripts?.build) {
    return;
  }

  console.log("");
  console.log(`Building ${pkg.name}...`);
  console.log("");

  const result = spawnSync("npm", ["run", "build", `--workspace=${pkg.name}`], {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  const packages = discoverPackages(PACKAGES_DIR);

  if (packages.length === 0) {
    throw new Error("No workspace packages were found.");
  }

  const sorted = sortPackages(packages);

  console.log("");
  console.log("Build order:");
  console.log("");

  for (const pkg of sorted) {
    if (pkg.packageJson.scripts?.build) {
      console.log(`  ${pkg.name}`);
    }
  }

  for (const pkg of sorted) {
    buildPackage(pkg);
  }

  console.log("");
  console.log("Build complete.");
  console.log("");
}

try {
  main();
} catch (error) {
  console.error("");
  console.error("Build failed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
}
