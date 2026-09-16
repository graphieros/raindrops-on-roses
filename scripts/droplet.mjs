import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

const FUNCTION_NAME = process.argv[2];

const PACKAGES_DIR = resolve("packages");
const UMBRELLA_DIR = resolve(PACKAGES_DIR, "raindrops-on-roses");
const UMBRELLA_PACKAGE_JSON = resolve(UMBRELLA_DIR, "package.json");
const UMBRELLA_INDEX = resolve(UMBRELLA_DIR, "src", "index.ts");

const PACKAGE_SCOPE = "@aleclloydprobert";
const INITIAL_PACKAGE_VERSION = "0.0.0";

if (!FUNCTION_NAME) {
  console.error("Usage: npm run add:function -- <functionName>");
  process.exit(1);
}

if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(FUNCTION_NAME)) {
  console.error(`Invalid JavaScript function name: "${FUNCTION_NAME}"`);
  process.exit(1);
}

if (!existsSync(UMBRELLA_PACKAGE_JSON)) {
  console.error("Could not find packages/raindrops-on-roses/package.json.");
  process.exit(1);
}

if (!existsSync(UMBRELLA_INDEX)) {
  console.error("Could not find packages/raindrops-on-roses/src/index.ts.");
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

const PACKAGE_NAME = toKebabCase(FUNCTION_NAME);
const SCOPED_PACKAGE_NAME = `${PACKAGE_SCOPE}/${PACKAGE_NAME}`;

if (!PACKAGE_NAME || !/^[a-z0-9][a-z0-9-]*$/.test(PACKAGE_NAME)) {
  console.error(
    `Could not derive a valid npm package name from "${FUNCTION_NAME}".`,
  );
  process.exit(1);
}

let rl = null;
let quitting = false;

const createdFiles = [];
const createdDirectories = [];
const modifiedFiles = new Map();

function trackExistingFile(file) {
  if (modifiedFiles.has(file)) {
    return;
  }

  modifiedFiles.set(file, readFileSync(file, "utf8"));
}

function cleanupCreatedResources() {
  for (const [file, contents] of modifiedFiles) {
    writeFileSync(file, contents);
  }

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

function writeTrackedFile(file, contents) {
  if (existsSync(file)) {
    trackExistingFile(file);
  } else {
    createdFiles.push(file);
  }

  writeFileSync(file, contents);
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  writeTrackedFile(file, `${JSON.stringify(value, null, 2)}\n`);
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

async function createNewCategory(typeBaseDir) {
  while (true) {
    const answer = (
      await rl.question("\nNew category name (or q to quit): ")
    ).trim();

    if (isQuitCommand(answer)) {
      quit();
    }

    if (!answer) {
      console.error("Category name cannot be empty.");
      continue;
    }

    if (!validateDirectoryName(answer)) {
      console.error(
        "Category names may only contain letters, numbers, hyphens, and underscores.",
      );
      continue;
    }

    const categoryDirectory = resolve(typeBaseDir, answer);

    if (existsSync(categoryDirectory)) {
      console.error(
        `A "${answer}" category already exists. Select it from the existing categories instead.`,
      );
      continue;
    }

    createTrackedDirectory(categoryDirectory);

    console.log("");
    console.log(`Created category: ${answer}`);

    return answer;
  }
}

async function chooseCategory(type) {
  const typeBaseDir = resolve(PACKAGES_DIR, type);

  if (!existsSync(typeBaseDir)) {
    createTrackedDirectory(typeBaseDir);
  }

  while (true) {
    const categories = getSubdirectories(typeBaseDir);

    console.log(`\nAvailable ${type} categories:`);

    if (categories.length === 0) {
      console.log("  No categories found.");
    } else {
      for (const [index, category] of categories.entries()) {
        console.log(`  ${index + 1}. ${category}`);
      }
    }

    console.log("  n. create a new category");
    console.log("  q. quit");

    const answer = (await rl.question("\nChoose a category: "))
      .trim()
      .toLowerCase();

    if (isQuitCommand(answer)) {
      quit();
    }

    if (answer === "n" || answer === "new") {
      return createNewCategory(typeBaseDir);
    }

    const selectedIndex = Number.parseInt(answer, 10);

    if (
      Number.isInteger(selectedIndex) &&
      selectedIndex >= 1 &&
      selectedIndex <= categories.length
    ) {
      return categories[selectedIndex - 1];
    }

    const selectedByName = categories.find(
      (category) => category.toLowerCase() === answer,
    );

    if (selectedByName) {
      return selectedByName;
    }

    console.error(
      'Invalid choice. Select a category number/name, "n" to create one, or "q" to quit.',
    );
  }
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

    const beforeDeclaration = source.slice(0, declarationIndex);
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

function createPackageJson(type, category) {
  return {
    name: SCOPED_PACKAGE_NAME,
    version: INITIAL_PACKAGE_VERSION,
    type: "module",
    sideEffects: false,
    files: ["dist"],
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
      },
    },
    scripts: {
      build: "vite build && tsc -p tsconfig.json",
    },
    publishConfig: {
      access: "public",
    },
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/graphieros/raindrops-on-roses.git",
      directory: `packages/${type}/${category}/${PACKAGE_NAME}`,
    },
  };
}

function createTsConfig() {
  return {
    extends: "../../../../tsconfig.base.json",
    compilerOptions: {
      rootDir: "./src",
      outDir: "./dist",
      emitDeclarationOnly: true,
    },
    include: ["src/**/*.ts"],
    exclude: ["test", "dist"],
  };
}

function createViteConfig() {
  return `import { createLibraryConfig } from "../../../../config/vite.library.js";

export default createLibraryConfig(import.meta.dirname);
`;
}

function updateUmbrellaPackage() {
  const umbrellaPackage = readJson(UMBRELLA_PACKAGE_JSON);

  umbrellaPackage.dependencies ??= {};

  if (umbrellaPackage.dependencies[SCOPED_PACKAGE_NAME]) {
    throw new Error(
      `${SCOPED_PACKAGE_NAME} is already registered in the umbrella package.`,
    );
  }

  umbrellaPackage.dependencies[SCOPED_PACKAGE_NAME] = INITIAL_PACKAGE_VERSION;

  umbrellaPackage.dependencies = Object.fromEntries(
    Object.entries(umbrellaPackage.dependencies).sort(([a], [b]) =>
      a.localeCompare(b),
    ),
  );

  writeJson(UMBRELLA_PACKAGE_JSON, umbrellaPackage);
}

function updateUmbrellaIndex() {
  const currentIndex = readFileSync(UMBRELLA_INDEX, "utf8");

  const exportStatement = `export { ${FUNCTION_NAME} } from "${SCOPED_PACKAGE_NAME}";`;

  if (currentIndex.includes(exportStatement)) {
    throw new Error(
      `${FUNCTION_NAME} is already exported by the umbrella package.`,
    );
  }

  const updatedIndex = currentIndex.trim()
    ? `${currentIndex.trimEnd()}\n${exportStatement}\n`
    : `${exportStatement}\n`;

  writeTrackedFile(UMBRELLA_INDEX, updatedIndex);
}

async function main() {
  const type = await chooseType();
  const category = await chooseCategory(type);

  rl.close();
  rl = null;

  const packageDirectory = resolve(PACKAGES_DIR, type, category, PACKAGE_NAME);

  if (existsSync(packageDirectory)) {
    throw new Error(
      `Package directory already exists: packages/${type}/${category}/${PACKAGE_NAME}`,
    );
  }

  const umbrellaPackage = readJson(UMBRELLA_PACKAGE_JSON);

  if (umbrellaPackage.dependencies?.[SCOPED_PACKAGE_NAME]) {
    throw new Error(
      `${SCOPED_PACKAGE_NAME} already exists in the umbrella dependencies.`,
    );
  }

  const srcDirectory = resolve(packageDirectory, "src");
  const testDirectory = resolve(packageDirectory, "test");

  createTrackedDirectory(packageDirectory);

  mkdirSync(srcDirectory, {
    recursive: true,
  });

  mkdirSync(testDirectory, {
    recursive: true,
  });

  const sourceFile = resolve(srcDirectory, "index.ts");
  const testFile = resolve(testDirectory, "index.test.ts");
  const packageJsonFile = resolve(packageDirectory, "package.json");
  const tsConfigFile = resolve(packageDirectory, "tsconfig.json");
  const viteConfigFile = resolve(packageDirectory, "vite.config.ts");

  writeTrackedFile(sourceFile, createSource());
  writeTrackedFile(testFile, createTest());

  writeJson(packageJsonFile, createPackageJson(type, category));

  writeJson(tsConfigFile, createTsConfig());

  writeTrackedFile(viteConfigFile, createViteConfig());

  updateUmbrellaPackage();
  updateUmbrellaIndex();

  createdFiles.length = 0;
  createdDirectories.length = 0;
  modifiedFiles.clear();

  console.log("");
  console.log(`Created ${SCOPED_PACKAGE_NAME}`);
  console.log("");
  console.log(`  packages/${type}/${category}/${PACKAGE_NAME}/src/index.ts`);
  console.log(
    `  packages/${type}/${category}/${PACKAGE_NAME}/test/index.test.ts`,
  );
  console.log(`  packages/${type}/${category}/${PACKAGE_NAME}/package.json`);
  console.log(`  packages/${type}/${category}/${PACKAGE_NAME}/tsconfig.json`);
  console.log(`  packages/${type}/${category}/${PACKAGE_NAME}/vite.config.ts`);
  console.log("");
  console.log("Updated:");
  console.log("  packages/raindrops-on-roses/package.json");
  console.log("  packages/raindrops-on-roses/src/index.ts");
  console.log("");
  console.log("Next:");
  console.log("  npm install");
  console.log("  npm run test");
  console.log("  npm run build");
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
