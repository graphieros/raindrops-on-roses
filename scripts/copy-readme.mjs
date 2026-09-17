import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("..", "..", "README.md");
const destination = resolve("README.md");
copyFileSync(source, destination);
console.log("Copied root README.md into raindrops-on-roses package.");
