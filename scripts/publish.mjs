import { spawnSync } from "node:child_process";

function getTag(version) {
  const prerelease = version.match(/-(.+?)(?:\.|$)/);

  return prerelease ? prerelease[1] : "latest";
}

function getWorkspaces() {
  const result = spawnSync("npm", ["query", ".workspace", "--json"], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  return JSON.parse(result.stdout);
}

function isPublished(name, version) {
  const result = spawnSync(
    "npm",
    ["view", `${name}@${version}`, "version", "--json"],
    {
      encoding: "utf8",
    },
  );

  if (result.status === 0) {
    return true;
  }

  const output = `${result.stdout}\n${result.stderr}`;

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
  console.log(`Publishing ${name}@${version} with tag "${tag}"...`);
  console.log("");

  const result = spawnSync(
    "npm",
    ["publish", `--workspace=${name}`, `--tag=${tag}`],
    {
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const workspaces = getWorkspaces()
  .filter(
    (workspace) =>
      workspace.name && workspace.version && workspace.private !== true,
  )
  .sort((a, b) => {
    if (a.name === "raindrops-on-roses") {
      return 1;
    }

    if (b.name === "raindrops-on-roses") {
      return -1;
    }

    return a.name.localeCompare(b.name);
  });

for (const workspace of workspaces) {
  const { name, version } = workspace;

  if (isPublished(name, version)) {
    console.log(`Skipping ${name}@${version} - already published.`);
    continue;
  }

  publishWorkspace(name, version);
}
