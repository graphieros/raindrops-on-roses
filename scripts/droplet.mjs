import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

const name = process.argv[2];

if (!name) {
  console.error("Usage: npm run add:droplet -- <functionName>");
  process.exit(1);
}

if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
  console.error(`Invalid JavaScript function name: "${name}"`);
  process.exit(1);
}

let rl = null;
let quitting = false;

const createdFiles = [];
const createdDirectories = [];

function cleanupCreatedResources() {
  for (const file of [...createdFiles].reverse()) {
    if (existsSync(file)) {
      rmSync(file);
    }
  }

  for (const directory of [...createdDirectories].reverse()) {
    if (existsSync(directory)) {
      try {
        rmSync(directory);
      } catch {
        // not empty dir
      }
    }
  }
}

function quit() {
  if (quitting) {
    return;
  }

  quitting = true;

  cleanupCreatedResources();

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
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function getSharedSubDirectories(sourceBaseDir, testBaseDir) {
  const sourceDirectories = getSubdirectories(sourceBaseDir);
  const testDirectories = new Set(getSubdirectories(testBaseDir));

  return sourceDirectories.filter((directory) =>
    testDirectories.has(directory),
  );
}

function validateDirectoryName(directoryName) {
  return /^[a-zA-Z0-9_-]+$/.test(directoryName);
}

function createTrackedDirectory(directory) {
  if (existsSync(directory)) {
    return;
  }

  mkdirSync(directory, {
    recursive: true,
  });

  createdDirectories.push(directory);
}

process.on("SIGINT", quit);
process.on("SIGTERM", quit);

rl = createInterface({
  input,
  output,
});

rl.on("SIGINT", quit);

async function chooseType() {
  while (true) {
    console.log("\nFunction type:");
    console.log("  1. pure");
    console.log("  2. composed");
    console.log("  q. quit");

    const answer = (await rl.question("\nChoose a type [1/2/q]: "))
      .trim()
      .toLowerCase();

    if (isQuitCommand(answer)) {
      quit();
    }

    if (answer === "1" || answer === "pure") {
      return "pure";
    }

    if (answer === "2" || answer === "composed") {
      return "composed";
    }

    console.error(
      'Invalid choice. Enter "1", "2", "pure", "composed", or "q".',
    );
  }
}

async function createNewDir(sourceBaseDir, testBaseDir) {
  while (true) {
    const answer = (
      await rl.question("\nNew directory name (or q to quit): ")
    ).trim();

    if (isQuitCommand(answer)) {
      quit();
    }

    if (!answer) {
      console.error("directory name cannot be empty.");
      continue;
    }

    if (!validateDirectoryName(answer)) {
      console.error(
        "directory names may only contain letters, numbers, hyphens, and underscores.",
      );
      continue;
    }

    const sourceDirectory = resolve(sourceBaseDir, answer);
    const testDirectory = resolve(testBaseDir, answer);

    if (existsSync(sourceDirectory) || existsSync(testDirectory)) {
      console.error(
        `A "${answer}" directory already exists in src or test. Select it from the existing directorys instead, or choose another name.`,
      );
      continue;
    }

    createTrackedDirectory(sourceDirectory);
    createTrackedDirectory(testDirectory);

    console.log("");
    console.log(`Created src directory:  src/${answer}`);
    console.log(`Created test directory: test/${answer}`);

    return answer;
  }
}

async function chooseDirectory(type) {
  const sourceBaseDir = resolve("src", type);
  const testBaseDir = resolve("test", type);

  const sharedDirectories = getSharedSubDirectories(sourceBaseDir, testBaseDir);

  while (true) {
    console.log(`\nAvailable ${type} directorys:`);

    if (sharedDirectories.length === 0) {
      console.log("  No shared directorys found.");
    } else {
      for (const [index, directory] of sharedDirectories.entries()) {
        console.log(`  ${index + 1}. ${directory}`);
      }
    }

    console.log("  n. create a new directory");
    console.log("  q. quit");

    const answer = (await rl.question("\nChoose a directory: "))
      .trim()
      .toLowerCase();

    if (isQuitCommand(answer)) {
      quit();
    }

    if (answer === "n" || answer === "new") {
      return createNewDir(sourceBaseDir, testBaseDir);
    }

    const selectedIndex = Number.parseInt(answer, 10);

    if (
      Number.isInteger(selectedIndex) &&
      selectedIndex >= 1 &&
      selectedIndex <= sharedDirectories.length
    ) {
      return sharedDirectories[selectedIndex - 1];
    }

    const selectedByName = sharedDirectories.find(
      (directory) => directory.toLowerCase() === answer,
    );

    if (selectedByName) {
      return selectedByName;
    }

    console.error(
      'Invalid choice. Select a directory number/name, "n" to create one, or "q" to quit.',
    );
  }
}

async function main() {
  const type = await chooseType();
  const directory = await chooseDirectory(type);

  rl.close();
  rl = null;

  const sourceDir = resolve("src", type, directory);
  const testDir = resolve("test", type, directory);

  const sourceFile = resolve(sourceDir, `${name}.ts`);
  const testFile = resolve(testDir, `${name}.test.ts`);

  if (existsSync(sourceFile)) {
    throw new Error(
      `Source file already exists: src/${type}/${directory}/${name}.ts`,
    );
  }

  if (existsSync(testFile)) {
    throw new Error(
      `Test file already exists: test/${type}/${directory}/${name}.test.ts`,
    );
  }

  const source = `/**
 * TODO: documentation. Tests will fail if a function is not documented.
 */
export function ${name}(): void {
  // TODO: implement
}
`;

  const test = `import { readFileSync } from "node:fs";

import { describe, it } from "vitest";

import { ${name} } from "../../../src/${type}/${directory}/${name}.js";

describe("${name}", () => {
  // NOTE: do not delete this test
  it("has valid documentation", () => {
    const source = readFileSync(
      new URL(
        "../../../src/${type}/${directory}/${name}.ts",
        import.meta.url,
      ),
      "utf8",
    );

    const declaration = "export function ${name}";
    const declarationIndex = source.indexOf(declaration);

    if (declarationIndex === -1) {
      throw new Error(
        'Could not find "${name}" function declaration.',
      );
    }

    const beforeDeclaration = source.slice(0, declarationIndex);
    const match = beforeDeclaration.match(
      /\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*$/,
    );

    if (!match) {
      throw new Error(
        'Missing JSDoc documentation above "${name}".',
      );
    }

    const documentation = match[1]
      .replace(/^\\s*\\*\\s?/gm, "")
      .trim();

    if (!documentation) {
      throw new Error(
        'Documentation for "${name}" cannot be empty.',
      );
    }

    if (/\\bTODO\\b/i.test(documentation)) {
      throw new Error(
        'Invalid documentation for "${name}": replace the TODO placeholder with a description of the function.',
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

  writeFileSync(sourceFile, source);
  createdFiles.push(sourceFile);

  writeFileSync(testFile, test);
  createdFiles.push(testFile);
  createdFiles.length = 0;
  createdDirectories.length = 0;

  console.log("");
  console.log(`Created src/${type}/${directory}/${name}.ts`);
  console.log(`Created test/${type}/${directory}/${name}.test.ts`);
  console.log("");
  console.log("The generated tests are expected to fail until:");
  console.log("  - the function is documented");
  console.log("  - real test cases replace the placeholder test");
}

try {
  await main();
} catch (error) {
  cleanupCreatedResources();

  if (rl) {
    rl.close();
  }

  console.error("\nFailed to create droplet.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
}
