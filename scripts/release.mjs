import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

const PACKAGES_DIR = resolve("packages");
const UMBRELLA_DIR = resolve(PACKAGES_DIR, "raindrops-on-roses");
const PACKAGE_LOCK = resolve("package-lock.json");

const PACKAGE_TYPES = ["pure", "composed"];

const DEPENDENCY_SECTIONS = [
  "dependencies",
  "optionalDependencies",
  "peerDependencies",
];

const BUMP_RANK = {
  patch: 1,
  minor: 2,
  major: 3,
};

let rl = null;

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
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function getWorkspacePackages() {
  const packages = [];

  for (const type of PACKAGE_TYPES) {
    const typeDirectory = resolve(PACKAGES_DIR, type);

    for (const category of getSubdirectories(typeDirectory)) {
      const categoryDirectory = resolve(typeDirectory, category);

      for (const packageDirectoryName of getSubdirectories(categoryDirectory)) {
        const directory = resolve(categoryDirectory, packageDirectoryName);

        const packageJsonFile = resolve(directory, "package.json");

        if (!existsSync(packageJsonFile)) {
          continue;
        }

        const manifest = readJson(packageJsonFile);

        if (!manifest.name || !manifest.version) {
          throw new Error(`Missing name or version in ${packageJsonFile}.`);
        }

        packages.push({
          name: manifest.name,
          version: manifest.version,
          type,
          category,
          directory,
          packageJsonFile,
          manifest,
          isUmbrella: false,
        });
      }
    }
  }

  const umbrellaPackageJson = resolve(UMBRELLA_DIR, "package.json");

  if (!existsSync(umbrellaPackageJson)) {
    throw new Error("Could not find packages/raindrops-on-roses/package.json.");
  }

  const umbrellaManifest = readJson(umbrellaPackageJson);

  if (!umbrellaManifest.name || !umbrellaManifest.version) {
    throw new Error("The umbrella package is missing its name or version.");
  }

  packages.push({
    name: umbrellaManifest.name,
    version: umbrellaManifest.version,
    type: null,
    category: null,
    directory: UMBRELLA_DIR,
    packageJsonFile: umbrellaPackageJson,
    manifest: umbrellaManifest,
    isUmbrella: true,
  });

  const names = new Set();

  for (const workspacePackage of packages) {
    if (names.has(workspacePackage.name)) {
      throw new Error(
        `Duplicate workspace package name: ${workspacePackage.name}`,
      );
    }

    names.add(workspacePackage.name);
  }

  return packages;
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    throw new Error(
      `Unsupported version "${version}". release.mjs currently expects stable x.y.z versions.`,
    );
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function bumpVersion(version, bumpType) {
  const parsed = parseVersion(version);

  if (bumpType === "major") {
    return `${parsed.major + 1}.0.0`;
  }

  if (bumpType === "minor") {
    return `${parsed.major}.${parsed.minor + 1}.0`;
  }

  return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
}

function getBumpTypeFromRank(rank) {
  if (rank === BUMP_RANK.major) {
    return "major";
  }

  if (rank === BUMP_RANK.minor) {
    return "minor";
  }

  return "patch";
}

function getManagedDependencyPrefix(spec, version) {
  const supportedPrefixes = [
    "",
    "^",
    "~",
    "workspace:",
    "workspace:^",
    "workspace:~",
  ];

  return (
    supportedPrefixes.find((prefix) => spec === `${prefix}${version}`) ?? null
  );
}

function dependencyTracksVersion(spec, version) {
  return getManagedDependencyPrefix(spec, version) !== null;
}

function updateDependencySpec(spec, oldVersion, newVersion) {
  const prefix = getManagedDependencyPrefix(spec, oldVersion);

  if (prefix === null) {
    return spec;
  }

  return `${prefix}${newVersion}`;
}

function cloneManifest(manifest) {
  return JSON.parse(JSON.stringify(manifest));
}

function buildReleasePlan(packages, selectedBumps) {
  const packageByName = new Map(
    packages.map((workspacePackage) => [
      workspacePackage.name,
      workspacePackage,
    ]),
  );

  const bumpRanks = new Map();
  const reasons = new Map();

  for (const [name, bumpType] of selectedBumps) {
    bumpRanks.set(name, BUMP_RANK[bumpType]);
    reasons.set(name, new Set(["selected"]));
  }

  let changed = true;

  while (changed) {
    changed = false;

    for (const workspacePackage of packages) {
      for (const section of DEPENDENCY_SECTIONS) {
        const dependencies = workspacePackage.manifest[section];

        if (!dependencies) {
          continue;
        }

        for (const [dependencyName, spec] of Object.entries(dependencies)) {
          const dependencyPackage = packageByName.get(dependencyName);

          const dependencyRank = bumpRanks.get(dependencyName);

          if (!dependencyPackage || !dependencyRank) {
            continue;
          }

          if (!dependencyTracksVersion(spec, dependencyPackage.version)) {
            continue;
          }

          const currentRank = bumpRanks.get(workspacePackage.name) ?? 0;

          if (dependencyRank > currentRank) {
            bumpRanks.set(workspacePackage.name, dependencyRank);

            changed = true;
          }

          if (!reasons.has(workspacePackage.name)) {
            reasons.set(workspacePackage.name, new Set());
          }

          reasons
            .get(workspacePackage.name)
            .add(`depends on ${dependencyName}`);
        }
      }
    }
  }

  const versionChanges = new Map();

  for (const workspacePackage of packages) {
    const rank = bumpRanks.get(workspacePackage.name);

    if (!rank) {
      continue;
    }

    const bumpType = getBumpTypeFromRank(rank);

    const newVersion = bumpVersion(workspacePackage.version, bumpType);

    versionChanges.set(workspacePackage.name, {
      oldVersion: workspacePackage.version,
      newVersion,
      bumpType,
      reasons: [...(reasons.get(workspacePackage.name) ?? [])],
    });
  }

  const manifests = new Map();

  for (const workspacePackage of packages) {
    const nextManifest = cloneManifest(workspacePackage.manifest);

    const versionChange = versionChanges.get(workspacePackage.name);

    if (versionChange) {
      nextManifest.version = versionChange.newVersion;
    }

    for (const section of DEPENDENCY_SECTIONS) {
      const dependencies = nextManifest[section];

      if (!dependencies) {
        continue;
      }

      for (const [dependencyName, spec] of Object.entries(dependencies)) {
        const dependencyPackage = packageByName.get(dependencyName);

        const dependencyChange = versionChanges.get(dependencyName);

        if (!dependencyPackage || !dependencyChange) {
          continue;
        }

        dependencies[dependencyName] = updateDependencySpec(
          spec,
          dependencyPackage.version,
          dependencyChange.newVersion,
        );
      }
    }

    manifests.set(workspacePackage.name, nextManifest);
  }

  return {
    versionChanges,
    manifests,
  };
}

function printPackages(packages) {
  console.log("\nPackages:");

  for (const [index, workspacePackage] of packages.entries()) {
    const suffix = workspacePackage.isUmbrella ? " (umbrella)" : "";

    console.log(
      `  ${index + 1}. ${workspacePackage.name}@${workspacePackage.version}${suffix}`,
    );
  }

  console.log("  a. all utility packages");
  console.log("  q. quit");
}

function parsePackageSelection(answer, packages) {
  const normalized = answer.trim().toLowerCase();

  if (["q", "quit", "exit"].includes(normalized)) {
    return null;
  }

  if (normalized === "a" || normalized === "all") {
    return packages.filter((workspacePackage) => !workspacePackage.isUmbrella);
  }

  const tokens = answer
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return [];
  }

  const selected = [];
  const seen = new Set();

  for (const token of tokens) {
    const index = Number.parseInt(token, 10);

    let workspacePackage = null;

    if (Number.isInteger(index) && index >= 1 && index <= packages.length) {
      workspacePackage = packages[index - 1];
    } else {
      workspacePackage = packages.find(
        (candidate) => candidate.name.toLowerCase() === token.toLowerCase(),
      );
    }

    if (!workspacePackage) {
      throw new Error(`Unknown package selection: "${token}".`);
    }

    if (!seen.has(workspacePackage.name)) {
      selected.push(workspacePackage);
      seen.add(workspacePackage.name);
    }
  }

  return selected;
}

async function choosePackages(packages) {
  while (true) {
    printPackages(packages);

    const answer = await rl.question(
      "\nSelect packages that changed (comma-separated): ",
    );

    try {
      const selected = parsePackageSelection(answer, packages);

      if (selected === null) {
        return null;
      }

      if (selected.length === 0) {
        console.error("Select at least one package.");

        continue;
      }

      return selected;
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
    }
  }
}

async function chooseBumpType(workspacePackage) {
  while (true) {
    const answer = (
      await rl.question(
        `Bump ${workspacePackage.name}@${workspacePackage.version} [patch/minor/major] (patch): `,
      )
    )
      .trim()
      .toLowerCase();

    if (!answer || answer === "p" || answer === "patch") {
      return "patch";
    }

    if (answer === "m" || answer === "minor") {
      return "minor";
    }

    if (answer === "major") {
      return "major";
    }

    if (["q", "quit", "exit"].includes(answer)) {
      return null;
    }

    console.error('Enter "patch", "minor", "major", or "q".');
  }
}

function printPlan(packages, plan) {
  console.log("\nRelease plan:\n");

  for (const workspacePackage of packages) {
    const change = plan.versionChanges.get(workspacePackage.name);

    if (!change) {
      continue;
    }

    const reason =
      change.reasons.length > 0 ? ` — ${change.reasons.join(", ")}` : "";

    console.log(
      `  ${workspacePackage.name}: ${change.oldVersion} -> ${change.newVersion} (${change.bumpType})${reason}`,
    );
  }
}

function backupFiles(files) {
  const backups = new Map();

  for (const file of files) {
    backups.set(file, existsSync(file) ? readFileSync(file, "utf8") : null);
  }

  return backups;
}

function restoreFiles(backups) {
  for (const [file, contents] of backups) {
    if (contents === null) {
      if (existsSync(file)) {
        rmSync(file, {
          force: true,
        });
      }

      continue;
    }

    writeFileSync(file, contents);
  }
}

function updatePackageLock() {
  const result = spawnSync(
    "npm",
    ["install", "--package-lock-only", "--ignore-scripts"],
    {
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    throw new Error("Failed to update package-lock.json.");
  }
}

async function confirmRelease() {
  const answer = (await rl.question("\nApply this release plan? [y/N]: "))
    .trim()
    .toLowerCase();

  return answer === "y" || answer === "yes";
}

async function main() {
  const packages = getWorkspacePackages();

  const selectedPackages = await choosePackages(packages);

  if (selectedPackages === null) {
    console.log("\nCancelled.");
    return;
  }

  const selectedBumps = new Map();

  console.log("");

  for (const workspacePackage of selectedPackages) {
    const bumpType = await chooseBumpType(workspacePackage);

    if (bumpType === null) {
      console.log("\nCancelled.");
      return;
    }

    selectedBumps.set(workspacePackage.name, bumpType);
  }

  const plan = buildReleasePlan(packages, selectedBumps);

  printPlan(packages, plan);

  if (!(await confirmRelease())) {
    console.log("\nCancelled.");
    return;
  }

  const filesToBackup = [
    ...packages.map((workspacePackage) => workspacePackage.packageJsonFile),
    PACKAGE_LOCK,
  ];

  const backups = backupFiles(filesToBackup);

  try {
    for (const workspacePackage of packages) {
      const nextManifest = plan.manifests.get(workspacePackage.name);

      if (!nextManifest) {
        continue;
      }

      const currentContents = `${JSON.stringify(
        workspacePackage.manifest,
        null,
        2,
      )}\n`;

      const nextContents = `${JSON.stringify(nextManifest, null, 2)}\n`;

      if (currentContents === nextContents) {
        continue;
      }

      writeJson(workspacePackage.packageJsonFile, nextManifest);
    }

    updatePackageLock();
  } catch (error) {
    restoreFiles(backups);
    throw error;
  }

  const umbrella = packages.find(
    (workspacePackage) => workspacePackage.isUmbrella,
  );

  const umbrellaChange = plan.versionChanges.get(umbrella.name);

  console.log("\nRelease files updated successfully.");

  console.log("\nNext:");
  console.log("  npm run test");
  console.log("  npm run build");
  console.log("  git diff");

  if (umbrellaChange) {
    console.log("  git add .");
    console.log(`  git commit -m "release: v${umbrellaChange.newVersion}"`);
    console.log(`  git tag v${umbrellaChange.newVersion}`);
    console.log("  git push");
    console.log(`  git push origin v${umbrellaChange.newVersion}`);
  } else {
    console.log("");
    console.log("The umbrella version did not change.");

    console.log("Choose an appropriate release tag before publishing.");
  }
}

rl = createInterface({
  input,
  output,
});

try {
  await main();
} catch (error) {
  console.error("\nFailed to prepare release.");

  console.error(error instanceof Error ? error.message : error);

  process.exitCode = 1;
} finally {
  rl.close();
}
