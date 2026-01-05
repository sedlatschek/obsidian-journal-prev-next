import {
  readFile, writeFile,
} from "fs/promises";

const VERSIONS_JSON_PATH = "./versions.json";
const PACKAGE_JSON_PATH = "./package.json";
const MANIFEST_JSON_PATH = "./src/manifest.json";

type PackageJson = {
  version: string;
  devDependencies: {
    obsidian: string;
  };
};

function isPackageJson(value: unknown): value is PackageJson {
  return value !== null
    && typeof value === "object"
    && "version" in value
    && typeof value.version === "string"
    && isValidSemver(value.version)
    && "devDependencies" in value
    && typeof value.devDependencies === "object"
    && value.devDependencies !== null
    && "obsidian" in value.devDependencies
    && typeof value.devDependencies.obsidian === "string"
    && isValidSemver(value.devDependencies.obsidian);
}

type VersionsJson = Record<string, string>;

function isVersionsJson(value: unknown): value is VersionsJson {
  return value !== null
    && typeof value === "object"
    && Object.values(value).every((v) => typeof v === "string" && isValidSemver(v));
}

type ManifestJson = {
  version: string;
  minAppVersion: string;
};

function isManifestJson(value: unknown): value is ManifestJson {
  return value !== null
    && typeof value === "object"
    && "version" in value
    && typeof value.version === "string"
    && isValidSemver(value.version)
    && "minAppVersion" in value
    && typeof value.minAppVersion === "string"
    && isValidSemver(value.minAppVersion);
}

function isValidSemver(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version);
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(
    await readFile(new URL(path, import.meta.url), "utf-8"),
  );
}

async function writeJson(path: string, data: unknown): Promise<void> {
  return writeFile(
    path,
    JSON.stringify(data, null, 2) + "\n",
  );
}

async function release() {
  const packageJson = await readJson(PACKAGE_JSON_PATH);
  if (!isPackageJson(packageJson)) {
    console.error("❌ package.json is not valid");
    process.exit(1);
  }

  const versionsJson = await readJson(VERSIONS_JSON_PATH);
  if (!isVersionsJson(versionsJson)) {
    console.error("❌ versions.json is not valid");
    process.exit(1);
  }

  const manifestJson = await readJson(MANIFEST_JSON_PATH);
  if (!isManifestJson(manifestJson)) {
    console.error("❌ manifest.json is not valid");
    process.exit(1);
  }

  const { version } = packageJson;
  console.log(`Releasing version ${version}`);

  const obsidianVersion = packageJson.devDependencies.obsidian;
  console.log(`Using Obsidian version ${obsidianVersion}`);

  if (versionsJson[version] !== undefined) {
    console.error(`❌ Version ${version} already exists in versions.json`);
    process.exit(1);
  }

  versionsJson[version] = obsidianVersion;
  await writeJson(VERSIONS_JSON_PATH, versionsJson);
  console.log(
    `✅ Added version ${version} with Obsidian version ${obsidianVersion} to versions.json`,
  );

  if (manifestJson.version !== version) {
    manifestJson.version = version;
    manifestJson.minAppVersion = obsidianVersion;
    await writeJson(MANIFEST_JSON_PATH, manifestJson);
    console.log(`✅ Updated manifest.json version to ${version}`);
  }
  else {
    console.log(`ℹ️  manifest.json version is already ${version}`);
  }
}

release();
