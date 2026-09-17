import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import config from "../packages.config.mjs";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const MODULES_DIR = resolve(ROOT_DIR, config.modulesDirectory);

const VERSIONS_FILE = resolve(ROOT_DIR, "packages.versions.json");

const PACKAGE_LOCK_FILE = resolve(ROOT_DIR, "package-lock.json");

const BUMP_RANK = {
  patch: 1,
  minor: 2,
  major: 3,
};

const RANK_BUMP = {
  1: "patch",
  2: "minor",
  3: "major",
};

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function getSubdirectories(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(directory, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function isLeafModule(directory) {
  return existsSync(resolve(directory, "src", "index.ts"));
}

function modulePathFromDirectory(directory) {
  return relative(MODULES_DIR, directory).split(sep).join("/");
}

function packageNameFromModulePath(modulePath) {
  const separator = config.naming?.separator ?? "-";

  const slug = modulePath.split("/").join(separator);

  return `${config.scope}/${slug}`;
}

function discoverLeafModules(directory = MODULES_DIR) {
  const modules = [];

  for (const child of getSubdirectories(directory)) {
    if (isLeafModule(child)) {
      const modulePath = modulePathFromDirectory(child);

      modules.push({
        modulePath,
        packageName: packageNameFromModulePath(modulePath),
      });

      continue;
    }

    modules.push(...discoverLeafModules(child));
  }

  return modules.sort((a, b) => a.modulePath.localeCompare(b.modulePath));
}

function getAncestorPackageNames(modulePath) {
  const segments = modulePath.split("/");
  const ancestors = [];

  while (segments.length > 1) {
    segments.pop();

    ancestors.push(packageNameFromModulePath(segments.join("/")));
  }

  return ancestors;
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);

  if (!match) {
    throw new Error(`Unsupported version: ${version}`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function bumpVersion(version, bump) {
  const parsed = parseVersion(version);

  if (bump === "major") {
    return `${parsed.major + 1}.0.0`;
  }

  if (bump === "minor") {
    return `${parsed.major}.${parsed.minor + 1}.0`;
  }

  return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
}

function ensureVersion(versions, packageName) {
  if (!versions[packageName]) {
    versions[packageName] = config.initialVersion ?? "0.0.0";
  }
}

function registerBump(bumps, packageName, bump) {
  const current = bumps.get(packageName);

  if (!current || BUMP_RANK[bump] > BUMP_RANK[current]) {
    bumps.set(packageName, bump);
  }
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed.`);
  }
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

async function selectModules(rl, modules, versions) {
  console.log("");
  console.log("Leaf modules:");
  console.log("");

  for (const [index, module] of modules.entries()) {
    const version =
      versions[module.packageName] ?? config.initialVersion ?? "0.0.0";

    console.log(`  ${index + 1}. ${module.modulePath} (${version})`);
  }

  console.log("");
  console.log("Enter one or more numbers separated by commas.");
  console.log('Enter "q" to cancel.');

  while (true) {
    const answer = (await rl.question("\nModules to release: "))
      .trim()
      .toLowerCase();

    if (answer === "q" || answer === "quit" || answer === "exit") {
      return [];
    }

    const indices = [
      ...new Set(
        answer.split(",").map((value) => Number.parseInt(value.trim(), 10)),
      ),
    ];

    if (
      indices.length === 0 ||
      indices.some(
        (index) =>
          !Number.isInteger(index) || index < 1 || index > modules.length,
      )
    ) {
      console.error("Invalid selection.");

      continue;
    }

    return indices.map((index) => modules[index - 1]);
  }
}

async function chooseBump(rl, module, currentVersion) {
  while (true) {
    console.log("");
    console.log(`${module.packageName}@${currentVersion}`);
    console.log("");
    console.log("  1. patch");
    console.log("  2. minor");
    console.log("  3. major");
    console.log("  q. cancel");

    const answer = (await rl.question("\nChoose bump [1/2/3/q]: "))
      .trim()
      .toLowerCase();

    if (answer === "q" || answer === "quit" || answer === "exit") {
      return null;
    }

    if (answer === "1" || answer === "patch") {
      return "patch";
    }

    if (answer === "2" || answer === "minor") {
      return "minor";
    }

    if (answer === "3" || answer === "major") {
      return "major";
    }

    console.error("Invalid bump.");
  }
}

async function main() {
  if (!existsSync(VERSIONS_FILE)) {
    throw new Error("Could not find packages.versions.json.");
  }

  const modules = discoverLeafModules();

  if (modules.length === 0) {
    throw new Error("No leaf modules found.");
  }

  const versions = readJson(VERSIONS_FILE);

  for (const module of modules) {
    ensureVersion(versions, module.packageName);

    for (const ancestor of getAncestorPackageNames(module.modulePath)) {
      ensureVersion(versions, ancestor);
    }
  }

  ensureVersion(versions, config.umbrella.name);

  const rl = createInterface({
    input,
    output,
  });

  const selected = await selectModules(rl, modules, versions);

  if (selected.length === 0) {
    rl.close();
    console.log("\nCancelled.");
    return;
  }

  const bumps = new Map();

  for (const module of selected) {
    const bump = await chooseBump(rl, module, versions[module.packageName]);

    if (!bump) {
      rl.close();
      console.log("\nCancelled.");
      return;
    }

    registerBump(bumps, module.packageName, bump);

    for (const ancestor of getAncestorPackageNames(module.modulePath)) {
      registerBump(bumps, ancestor, bump);
    }

    registerBump(bumps, config.umbrella.name, bump);
  }

  rl.close();

  console.log("");
  console.log("Release plan:");
  console.log("");

  const changes = [];

  for (const [packageName, bump] of bumps) {
    const oldVersion = versions[packageName];

    const newVersion = bumpVersion(oldVersion, bump);

    changes.push({
      packageName,
      bump,
      oldVersion,
      newVersion,
    });
  }

  changes.sort((a, b) => a.packageName.localeCompare(b.packageName));

  for (const change of changes) {
    console.log(
      `  ${change.packageName}: ${change.oldVersion} → ${change.newVersion} (${change.bump})`,
    );
  }

  console.log("");

  const confirmRl = createInterface({
    input,
    output,
  });

  const confirmation = (await confirmRl.question("Apply release? [y/N]: "))
    .trim()
    .toLowerCase();

  confirmRl.close();

  if (confirmation !== "y" && confirmation !== "yes") {
    console.log("\nCancelled.");
    return;
  }

  const originalVersions = readFileSync(VERSIONS_FILE, "utf8");

  const originalLock = existsSync(PACKAGE_LOCK_FILE)
    ? readFileSync(PACKAGE_LOCK_FILE, "utf8")
    : null;

  try {
    for (const change of changes) {
      versions[change.packageName] = change.newVersion;
    }

    const sortedVersions = Object.fromEntries(
      Object.entries(versions).sort(([a], [b]) => a.localeCompare(b)),
    );

    writeJson(VERSIONS_FILE, sortedVersions);

    console.log("");
    console.log("Reassembling packages...");

    runCommand(npmCommand(), ["run", "assemble"]);

    console.log("");
    console.log("Updating package-lock.json...");

    runCommand(npmCommand(), [
      "install",
      "--package-lock-only",
      "--ignore-scripts",
    ]);
  } catch (error) {
    writeFileSync(VERSIONS_FILE, originalVersions);

    if (originalLock !== null) {
      writeFileSync(PACKAGE_LOCK_FILE, originalLock);
    }

    console.error("");
    console.error("Release failed. Version files were restored.");

    throw error;
  }

  const umbrellaVersion = versions[config.umbrella.name];

  console.log("");
  console.log("Release prepared successfully.");
  console.log("");
  console.log("Next:");
  console.log("  npm run test");
  console.log("  npm run build");
  console.log("");
  console.log("Then commit and tag:");
  console.log("");
  console.log(`  git add .`);
  console.log(`  git commit -m "Release ${umbrellaVersion}"`);
  console.log(`  git tag v${umbrellaVersion}`);
  console.log(`  git push && git push --tags`);
  console.log("");
}

try {
  await main();
} catch (error) {
  console.error("");
  console.error("Failed to prepare release.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
}
