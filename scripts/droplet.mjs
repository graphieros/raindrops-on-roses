import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
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

function cleanupCreatedFiles() {
  for (const file of createdFiles.reverse()) {
    if (existsSync(file)) {
      rmSync(file);
    }
  }
}

function quit() {
  if (quitting) {
    return;
  }

  quitting = true;

  cleanupCreatedFiles();

  if (rl) {
    rl.close();
  }

  console.log("\nCancelled.");
  process.exit(0);
}

function isQuitCommand(value) {
  return ["q", "quit", "exit"].includes(value.trim().toLowerCase());
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

async function main() {
  const type = await chooseType();

  rl.close();
  rl = null;

  const sourceDir = resolve("src", type);
  const testDir = resolve("test", type);

  const sourceFile = resolve(sourceDir, `${name}.ts`);
  const testFile = resolve(testDir, `${name}.test.ts`);

  if (existsSync(sourceFile)) {
    console.error(`Source file already exists: src/${type}/${name}.ts`);
    process.exit(1);
  }

  if (existsSync(testFile)) {
    console.error(`Test file already exists: test/${type}/${name}.test.ts`);
    process.exit(1);
  }

  mkdirSync(sourceDir, { recursive: true });
  mkdirSync(testDir, { recursive: true });

  const source = `/**
 * TODO: documentation. Tests will fail if a function is not documented.
 */
export function ${name}(): void {
  // TODO: implement
}
`;

  const test = `import { readFileSync } from "node:fs";

import { describe, it } from "vitest";

import { ${name} } from "../../src/${type}/${name}.js";

describe("${name}", () => {
  // NOTE: do not delete this test
  it("has valid documentation", () => {
    const source = readFileSync(
      new URL("../../src/${type}/${name}.ts", import.meta.url),
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
    const match = beforeDeclaration.match(/\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*$/);

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

  console.log("");
  console.log(`Created src/${type}/${name}.ts`);
  console.log(`Created test/${type}/${name}.test.ts`);
  console.log("");
  console.log("The generated tests are expected to fail until:");
  console.log("  - the function is documented");
  console.log("  - real test cases replace the placeholder test");
}

try {
  await main();
} catch (error) {
  cleanupCreatedFiles();

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
