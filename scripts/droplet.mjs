import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import config from "../packages.config.mjs";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const MODULES_DIR = resolve(ROOT_DIR, config.modulesDirectory);

const FUNCTION_NAME = process.argv[2];

const PACKAGE_SEPARATOR = config.naming?.separator ?? "-";

if (!FUNCTION_NAME) {
  console.error("Usage: npm run add:function -- <functionName>");
  process.exit(1);
}

if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(FUNCTION_NAME)) {
  console.error(`Invalid JavaScript function name: "${FUNCTION_NAME}"`);
  process.exit(1);
}

if (!existsSync(MODULES_DIR)) {
  console.error(`Could not find ${config.modulesDirectory}/.`);
  process.exit(1);
}

function toKebabCase(value) {
  return value
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_$]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

const FUNCTION_SLUG = toKebabCase(FUNCTION_NAME);

if (!FUNCTION_SLUG || !/^[a-z0-9][a-z0-9-]*$/.test(FUNCTION_SLUG)) {
  console.error(
    `Could not derive a valid module name from "${FUNCTION_NAME}".`,
  );
  process.exit(1);
}

let rl = null;
let quitting = false;
let moduleCreated = false;

const createdFiles = [];
const createdDirectories = [];

function cleanupCreatedResources() {
  for (const file of [...createdFiles].reverse()) {
    if (existsSync(file)) {
      rmSync(file, {
        force: true,
      });
    }
  }

  for (const directory of [...createdDirectories].reverse()) {
    if (existsSync(directory)) {
      rmSync(directory, {
        recursive: true,
        force: true,
      });
    }
  }
}

function quit() {
  if (quitting) {
    return;
  }

  quitting = true;

  if (!moduleCreated) {
    cleanupCreatedResources();
  }

  if (rl) {
    rl.close();
  }

  console.log("\nCancelled.");
  process.exit(0);
}

function isQuitCommand(value) {
  return ["q", "quit", "exit"].includes(value.trim().toLowerCase());
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

function modulePathFromDirectory(directory) {
  return relative(MODULES_DIR, directory).split(sep).join("/");
}

function isLeafModule(directory) {
  return existsSync(resolve(directory, "src", "index.ts"));
}

function discoverModulePaths(directory = MODULES_DIR) {
  const paths = [];

  for (const child of getSubdirectories(directory)) {
    if (isLeafModule(child)) {
      continue;
    }

    paths.push(modulePathFromDirectory(child));

    paths.push(...discoverModulePaths(child));
  }

  return paths.sort((a, b) => a.localeCompare(b));
}

function validateModuleSegment(segment) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment);
}

function normalizeModulePath(value) {
  return value
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "");
}

function createTrackedDirectory(directory) {
  if (existsSync(directory)) {
    return;
  }

  mkdirSync(directory);

  createdDirectories.push(directory);
}

function createTrackedPath(segments) {
  let directory = MODULES_DIR;

  for (const segment of segments) {
    directory = resolve(directory, segment);

    createTrackedDirectory(directory);
  }

  return directory;
}

function writeTrackedFile(file, contents) {
  if (existsSync(file)) {
    throw new Error(`Refusing to overwrite existing file: ${file}`);
  }

  writeFileSync(file, contents);

  createdFiles.push(file);
}

async function createNewModulePath() {
  while (true) {
    const answer = (
      await rl.question("\nNew module path, e.g. vector/poor (or q to quit): ")
    ).trim();

    if (isQuitCommand(answer)) {
      quit();
    }

    const modulePath = normalizeModulePath(answer);

    if (!modulePath) {
      console.error("Module path cannot be empty.");
      continue;
    }

    const segments = modulePath.split("/");

    if (segments.some((segment) => !validateModuleSegment(segment))) {
      console.error(
        "Module paths must use lowercase letters, numbers, and hyphens, separated by /.",
      );
      continue;
    }

    let current = MODULES_DIR;
    let invalidAncestor = null;

    for (const segment of segments) {
      current = resolve(current, segment);

      if (existsSync(current) && isLeafModule(current)) {
        invalidAncestor = modulePathFromDirectory(current);

        break;
      }
    }

    if (invalidAncestor) {
      console.error(
        `"${invalidAncestor}" is a leaf module and cannot contain child modules.`,
      );
      continue;
    }

    const target = resolve(MODULES_DIR, ...segments);

    if (existsSync(target)) {
      console.error(
        `"${modulePath}" already exists. Select it from the existing module paths.`,
      );
      continue;
    }

    createTrackedPath(segments);

    console.log("");
    console.log(`Created module path: ${modulePath}`);

    return modulePath;
  }
}

async function chooseModulePath() {
  while (true) {
    const modulePaths = discoverModulePaths();

    console.log("");
    console.log("Available module paths:");
    console.log("");

    if (modulePaths.length === 0) {
      console.log("  No module paths found.");
    } else {
      for (const [index, modulePath] of modulePaths.entries()) {
        console.log(`  ${index + 1}. ${modulePath}`);
      }
    }

    console.log("  n. create a new module path");
    console.log("  q. quit");

    const answer = (await rl.question("\nChoose a module path: "))
      .trim()
      .toLowerCase();

    if (isQuitCommand(answer)) {
      quit();
    }

    if (answer === "n" || answer === "new") {
      return createNewModulePath();
    }

    const selectedIndex = Number.parseInt(answer, 10);

    if (
      Number.isInteger(selectedIndex) &&
      selectedIndex >= 1 &&
      selectedIndex <= modulePaths.length
    ) {
      return modulePaths[selectedIndex - 1];
    }

    const selectedByName = modulePaths.find(
      (modulePath) => modulePath.toLowerCase() === answer,
    );

    if (selectedByName) {
      return selectedByName;
    }

    console.error(
      'Invalid choice. Select a module path, "n" to create one, or "q" to quit.',
    );
  }
}

function packageNameFromModulePath(modulePath) {
  const slug = modulePath.split("/").join(PACKAGE_SEPARATOR);

  return `${config.scope}/${slug}`;
}

function createSource() {
  return `/**
 * TODO: documentation. Tests will fail if a function is not documented.
 */
export function ${FUNCTION_NAME}(): void {
  // TODO: implement
}
`;
}

function createTest() {
  return `import { readFileSync } from "node:fs";

import { describe, it } from "vitest";

import { ${FUNCTION_NAME} } from "../src/index.js";

describe("${FUNCTION_NAME}", () => {
  // NOTE: do not delete this test
  it("has valid documentation", () => {
    const source = readFileSync(
      new URL("../src/index.ts", import.meta.url),
      "utf8",
    );

    const declaration = "export function ${FUNCTION_NAME}";
    const declarationIndex = source.indexOf(declaration);

    if (declarationIndex === -1) {
      throw new Error(
        'Could not find "${FUNCTION_NAME}" function declaration.',
      );
    }

    const beforeDeclaration = source.slice(
      0,
      declarationIndex,
    );

    const match = beforeDeclaration.match(
      /\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*$/,
    );

    if (!match) {
      throw new Error(
        'Missing JSDoc documentation above "${FUNCTION_NAME}".',
      );
    }

    const documentation = match[1]
      .replace(/^\\s*\\*\\s?/gm, "")
      .trim();

    if (!documentation) {
      throw new Error(
        'Documentation for "${FUNCTION_NAME}" cannot be empty.',
      );
    }

    if (/\\bTODO\\b/i.test(documentation)) {
      throw new Error(
        'Invalid documentation for "${FUNCTION_NAME}": replace the TODO placeholder with a description of the function.',
      );
    }
  });

  // ---------------------------------- START YOUR TESTS HERE --------------------------------------

  it("should be tested", () => {
    throw new Error(
      'Missing test implementation: replace the "should be tested" placeholder with real test cases.',
    );
  });
});
`;
}

function createReadme(packageName) {
  return `# ${packageName}

\`${FUNCTION_NAME}\` utility from [raindrops-on-roses](https://www.npmjs.com/package/${config.umbrella.name}).

## Install

\`\`\`sh
npm install ${packageName}
\`\`\`

## Usage

\`\`\`ts
import { ${FUNCTION_NAME} } from "${packageName}";
\`\`\`

## With the complete library

You can also install the complete library:

\`\`\`sh
npm install ${config.umbrella.name}
\`\`\`

and import the utility from the umbrella package:

\`\`\`ts
import { ${FUNCTION_NAME} } from "${config.umbrella.name}";
\`\`\`

## Repository

[graphieros/raindrops-on-roses](https://github.com/graphieros/raindrops-on-roses)
`;
}

function runAssemble() {
  console.log("");
  console.log("Assembling packages...");
  console.log("");

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

  const result = spawnSync(npmCommand, ["run", "assemble"], {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(
      'The module was created, but package assembly failed. Fix the error and run "npm run assemble" again.',
    );
  }
}

process.on("SIGINT", quit);
process.on("SIGTERM", quit);

rl = createInterface({
  input,
  output,
});

rl.on("SIGINT", quit);

async function main() {
  const parentModulePath = await chooseModulePath();

  const leafModulePath = `${parentModulePath}/${FUNCTION_SLUG}`;

  const moduleDirectory = resolve(MODULES_DIR, ...leafModulePath.split("/"));

  if (existsSync(moduleDirectory)) {
    throw new Error(`Module already exists: modules/${leafModulePath}`);
  }

  const packageName = packageNameFromModulePath(leafModulePath);

  const srcDirectory = resolve(moduleDirectory, "src");

  const testDirectory = resolve(moduleDirectory, "test");

  createTrackedDirectory(moduleDirectory);

  createTrackedDirectory(srcDirectory);

  createTrackedDirectory(testDirectory);

  writeTrackedFile(resolve(srcDirectory, "index.ts"), createSource());

  writeTrackedFile(resolve(testDirectory, "index.test.ts"), createTest());

  writeTrackedFile(
    resolve(moduleDirectory, "README.md"),
    createReadme(packageName),
  );

  rl.close();
  rl = null;

  // The authored module is now valid source-of-truth.
  // Do not roll it back if package assembly fails.
  createdFiles.length = 0;
  createdDirectories.length = 0;
  moduleCreated = true;

  console.log("");
  console.log(`Created module: ${leafModulePath}`);
  console.log("");

  console.log(`  modules/${leafModulePath}/src/index.ts`);
  console.log(`  modules/${leafModulePath}/test/index.test.ts`);
  console.log(`  modules/${leafModulePath}/README.md`);
  console.log("");

  console.log(`Package: ${packageName}`);

  runAssemble();

  console.log("");
  console.log("Next:");
  console.log("  npm install");
  console.log("  npm run test");
  console.log("  npm run build");
  console.log("");
  console.log("The generated test is expected to fail until:");
  console.log("  - the function is documented");
  console.log("  - real test cases replace the placeholder test");
}

try {
  await main();
} catch (error) {
  if (!moduleCreated) {
    cleanupCreatedResources();
  }

  if (rl) {
    rl.close();
  }

  console.error("");

  if (moduleCreated) {
    console.error("Module created, but a later step failed.");
  } else {
    console.error("Failed to create droplet.");
  }

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
}
