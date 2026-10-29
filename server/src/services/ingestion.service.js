import { githubRequest, githubError } from "./github.service.js";

const ignoredFolders = new Set([
  "node_modules",
  "dist",
  "build",
  "coverage",
  "vendor",
  "out",
  "secrets",
  "credentials",
]);

const isSourceFile = (file) => {
  if (file.type !== "blob" || !["100644", "100755"].includes(file.mode)) {
    return false;
  }

  const parts = file.path.toLowerCase().split("/");
  const name = parts.at(-1);

  if (parts.some((part) => part.startsWith(".") || ignoredFolders.has(part))) {
    return false;
  }

  if (/(\.min\.|\.bundle\.|secret|credential)/i.test(name)) {
    return false;
  }

  return /\.(js|mjs|cjs)$/.test(name) || name === "package.json";
};

export const fetchSourceFiles = async (scan) => {
  const startedAt = Date.now();

  const repository = scan.repository
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const base = `/repos/${repository}/git`;

  const commit = await githubRequest(
    `${base}/commits/${scan.commitSha}`
  );

  const tree = await githubRequest(
    `${base}/trees/${commit.tree.sha}?recursive=1`
  );

  if (tree.truncated || !Array.isArray(tree.tree)) {
    throw githubError(413, "Repository tree is too large for this version.");
  }

  const candidates = tree.tree.filter(isSourceFile);

  const skippedFileCount =
    tree.tree.filter((file) => file.type !== "tree").length -
    candidates.length;

  if (!candidates.length) {
    throw githubError(
      422,
      "No supported JavaScript files or package.json found."
    );
  }

  if (
    candidates.length > 40 ||
    candidates.some((file) => file.size > 100 * 1024)
  ) {
    throw githubError(
      413,
      "Limit: 40 eligible files and 100 KB per file. Use a smaller repository."
    );
  }

  const files = [];

  for (const file of candidates) {
    if (Date.now() - startedAt > 120000) {
      throw githubError(
        504,
        "Ingestion took too long. Please retry later."
      );
    }

    const blob = await githubRequest(`${base}/blobs/${file.sha}`);

    if (
      blob.encoding !== "base64" ||
      typeof blob.content !== "string" ||
      blob.sha !== file.sha
    ) {
      throw githubError(
        502,
        "GitHub returned an unexpected file response."
      );
    }

    const buffer = Buffer.from(blob.content, "base64");

    if (buffer.length !== file.size || buffer.length > 100 * 1024) {
      throw githubError(
        502,
        "Downloaded file size did not match the repository tree."
      );
    }

    let content;

    try {
      if (buffer.includes(0)) {
        throw new Error("Binary file");
      }

      content = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
      throw githubError(
        422,
        `File is not valid UTF-8 text: ${file.path}`
      );
    }

    files.push({
      path: file.path,
      sha: file.sha,
      size: buffer.length,
      content,
    });
  }

  return { files, skippedFileCount };
};