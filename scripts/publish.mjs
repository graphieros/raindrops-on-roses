import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: "utf8",
    ...options,
  });
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function getTag(version) {
  const prerelease = version.match(/-(.+?)(?:\.|$)/);

  return prerelease ? prerelease[1] : "latest";
}

function getWorkspaces() {
  const result = run(npmCommand(), ["query", ".workspace", "--json"]);

  if (result.status !== 0) {
    process.stderr.write(result.stderr ?? "");

    process.exit(result.status ?? 1);
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
      throw new Error(
        `Circular workspace dependency detected involving ${workspace.name}.`,
      );
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

function isPublished(name, version) {
  const result = run(npmCommand(), [
    "view",
    `${name}@${version}`,
    "version",
    "--json",
  ]);

  if (result.status === 0) {
    return true;
  }

  const output = [result.stdout, result.stderr].filter(Boolean).join("\n");

  if (
    output.includes("E404") ||
    output.includes("404 Not Found") ||
    output.includes("No match found")
  ) {
    return false;
  }

  process.stderr.write(output);

  process.exit(result.status ?? 1);
}

function publishWorkspace(name, version) {
  const tag = getTag(version);

  console.log("");
  console.log(`Publishing ${name}@${version}`);
  console.log(`Tag: ${tag}`);
  console.log("");

  const result = spawnSync(
    npmCommand(),
    ["publish", `--workspace=${name}`, `--tag=${tag}`],
    {
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  const workspaces = getWorkspaces();

  if (workspaces.length === 0) {
    throw new Error("No publishable workspaces found.");
  }

  const sorted = sortTopologically(workspaces);

  console.log("");
  console.log("Publish order:");
  console.log("");

  for (const workspace of sorted) {
    console.log(`  ${workspace.name}@${workspace.version}`);
  }

  console.log("");

  for (const workspace of sorted) {
    const { name, version } = workspace;

    if (isPublished(name, version)) {
      console.log(`Skipping ${name}@${version} — already published.`);

      continue;
    }

    publishWorkspace(name, version);
  }

  console.log("");
  console.log("Publishing complete.");
  console.log("");
}

try {
  main();
} catch (error) {
  console.error("");
  console.error("Publishing failed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
}
