import { spawnSync } from "node:child_process";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

import config from "../packages.config.mjs";

const DRY_RUN = process.argv.includes("--dry-run");

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function run(args, options = {}) {
  return spawnSync(npmCommand(), args, {
    encoding: "utf8",
    ...options,
  });
}

function runInteractive(args) {
  return spawnSync(npmCommand(), args, {
    stdio: "inherit",
  });
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);

  if (!match) {
    throw new Error(`Could not parse npm version "${version}".`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function verifyNpmVersion() {
  const result = run(["--version"]);

  if (result.status !== 0) {
    throw new Error("Could not determine npm version.");
  }

  const version = result.stdout.trim();

  const parsed = parseVersion(version);

  const supported =
    parsed.major > 11 || (parsed.major === 11 && parsed.minor >= 15);

  if (!supported) {
    throw new Error(
      `npm ${version} is installed, but npm >= 11.15.0 is required for npm trust commands.`,
    );
  }

  console.log(`npm ${version}`);
}

function getWorkspaces() {
  const result = run(["query", ".workspace", "--json"]);

  if (result.status !== 0) {
    process.stderr.write(result.stderr ?? "");

    throw new Error("Could not discover npm workspaces.");
  }

  const workspaces = JSON.parse(result.stdout);

  return workspaces.filter(
    (workspace) =>
      workspace.name && workspace.version && workspace.private !== true,
  );
}

function getWorkspaceDependencies(workspace, workspaceNames) {
  const groups = [
    workspace.dependencies,
    workspace.optionalDependencies,
    workspace.peerDependencies,
  ];

  const dependencies = new Set();

  for (const group of groups) {
    if (!group) {
      continue;
    }

    for (const name of Object.keys(group)) {
      if (workspaceNames.has(name)) {
        dependencies.add(name);
      }
    }
  }

  return [...dependencies];
}

function sortTopologically(workspaces) {
  const byName = new Map(
    workspaces.map((workspace) => [workspace.name, workspace]),
  );

  const workspaceNames = new Set(byName.keys());

  const temporary = new Set();

  const permanent = new Set();

  const sorted = [];

  function visit(workspace) {
    if (permanent.has(workspace.name)) {
      return;
    }

    if (temporary.has(workspace.name)) {
      throw new Error(`Circular dependency involving ${workspace.name}.`);
    }

    temporary.add(workspace.name);

    const dependencies = getWorkspaceDependencies(workspace, workspaceNames);

    for (const dependencyName of dependencies) {
      const dependency = byName.get(dependencyName);

      if (dependency) {
        visit(dependency);
      }
    }

    temporary.delete(workspace.name);

    permanent.add(workspace.name);

    sorted.push(workspace);
  }

  for (const workspace of workspaces) {
    visit(workspace);
  }

  return sorted;
}

function packageExists(name) {
  const result = run(["view", name, "name", "--json"]);

  if (result.status === 0) {
    return true;
  }

  const text = [result.stdout, result.stderr].filter(Boolean).join("\n");

  if (
    text.includes("E404") ||
    text.includes("404 Not Found") ||
    text.includes("No match found")
  ) {
    return false;
  }

  process.stderr.write(text);

  throw new Error(`Could not check ${name} on npm.`);
}

function publishPackage(workspace) {
  const access = config.publish?.access ?? "public";

  console.log("");
  console.log(`Publishing ${workspace.name}@${workspace.version}...`);
  console.log("");

  const result = runInteractive([
    "publish",
    `--workspace=${workspace.name}`,
    `--access=${access}`,
  ]);

  if (result.status !== 0) {
    throw new Error(`Failed to publish ${workspace.name}.`);
  }
}

function configureTrust(packageName) {
  const trusted = config.publish?.trustedPublisher;

  if (!trusted) {
    throw new Error(
      "Missing publish.trustedPublisher configuration in packages.config.mjs.",
    );
  }

  if (trusted.provider !== "github") {
    throw new Error(
      `Unsupported Trusted Publisher provider: ${trusted.provider}`,
    );
  }

  const args = [
    "trust",
    "github",
    packageName,
    "--file",
    trusted.workflow,
    "--repo",
    trusted.repository,
    "--allow-publish",
    "--yes",
  ];

  if (trusted.environment) {
    args.push("--env", trusted.environment);
  }

  console.log("");
  console.log(`Configuring Trusted Publisher for ${packageName}...`);
  console.log("");

  const result = runInteractive(args);

  if (result.status !== 0) {
    throw new Error(
      `Failed to configure Trusted Publisher for ${packageName}.`,
    );
  }
}

function sleep(milliseconds) {
  return new Promise((resolvePromise) =>
    setTimeout(resolvePromise, milliseconds),
  );
}

async function getPlan(workspaces) {
  const plan = [];

  console.log("");
  console.log("Checking npm registry...");
  console.log("");

  for (const workspace of workspaces) {
    const exists = packageExists(workspace.name);

    plan.push({
      workspace,
      exists,
    });

    console.log(
      `  ${workspace.name}@${workspace.version} — ${
        exists ? "exists — skipped" : "NEW — requires bootstrap"
      }`,
    );
  }

  return plan;
}

async function main() {
  verifyNpmVersion();

  const workspaces = sortTopologically(getWorkspaces());

  if (workspaces.length === 0) {
    throw new Error("No publishable workspaces found.");
  }

  console.log("");
  console.log("Bootstrap order:");
  console.log("");

  for (const workspace of workspaces) {
    console.log(`  ${workspace.name}@${workspace.version}`);
  }

  const plan = await getPlan(workspaces);

  const required = plan.filter((item) => !item.exists);

  if (required.length === 0) {
    console.log("");
    console.log("No new npm package names require bootstrapping.");

    return;
  }

  if (DRY_RUN) {
    console.log("");
    console.log("Dry run complete.");
    console.log("");
    console.log(
      "No packages were published and no trust settings were changed.",
    );

    return;
  }

  console.log("");
  console.log("Actions required:");
  console.log("");

  for (const item of required) {
    console.log(`  publish ${item.workspace.name}@${item.workspace.version}`);

    console.log(`  configure trust for ${item.workspace.name}`);
  }

  const rl = createInterface({
    input,
    output,
  });

  const confirmation = (await rl.question("\nContinue? [y/N]: "))
    .trim()
    .toLowerCase();

  rl.close();

  if (confirmation !== "y" && confirmation !== "yes") {
    console.log("\nCancelled.");

    return;
  }

  for (const item of required) {
    const { workspace } = item;

    publishPackage(workspace);

    configureTrust(workspace.name);

    await sleep(2000);

    console.log(`Ready: ${workspace.name}`);
  }

  console.log("");
  console.log("Bootstrap complete.");
  console.log("");
  console.log("Future versions can now be published through GitHub Actions.");
  console.log("");
}

try {
  await main();
} catch (error) {
  console.error("");
  console.error("Bootstrap failed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
}
