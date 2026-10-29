const githubError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const githubRequest = async (path) => {
  let response;
  let data;

  try {
    response = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "LOGIX",
        "X-GitHub-Api-Version": "2026-03-10",
      },
      signal: AbortSignal.timeout(10000),
      redirect: "manual",
    });

    data = await response.json().catch(() => null);
  } catch {
    throw githubError(502, "Cannot reach GitHub. Please try again.");
  }

  const rateLimited =
    response.status === 429 ||
    (response.status === 403 &&
      (response.headers.get("x-ratelimit-remaining") === "0" ||
        response.headers.has("retry-after") ||
        /rate limit/i.test(data?.message || "")));

  if (rateLimited) {
    const reset = Number(response.headers.get("x-ratelimit-reset"));

    const retryAfter =
      Number(response.headers.get("retry-after")) ||
      Math.max(60, Math.ceil(reset - Date.now() / 1000));

    const error = githubError(
      429,
      "GitHub request limit reached. Please try again later."
    );

    error.retryAfter = retryAfter;
    throw error;
  }

  if (response.status >= 300 && response.status < 400) {
    throw githubError(
      400,
      "Repository or branch moved. Use its current URL and branch name."
    );
  }

  if (response.status === 404) {
    throw githubError(
      404,
      "Public repository or branch not found. Check the URL and branch."
    );
  }

  if (response.status === 409) {
    throw githubError(422, "This repository has no commits to scan.");
  }

  if (!response.ok || !data) {
    throw githubError(502, "GitHub could not complete this request.");
  }

  return data;
};

export const getRepositoryDetails = async (repositoryUrl, branch) => {
  const parts = new URL(repositoryUrl).pathname.split("/").filter(Boolean);
  const owner = parts[0];
  const name = parts[1].replace(/\.git$/i, "");

  if (!name) {
    throw githubError(400, "Enter a valid repository name.");
  }

  const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
  const repository = await githubRequest(path);

  if (repository.private !== false || repository.disabled) {
    throw githubError(400, "Only accessible public repositories are supported.");
  }

  const selectedBranch = branch || repository.default_branch;

  if (!selectedBranch) {
    throw githubError(422, "This repository has no branch to scan.");
  }

  const branchData = await githubRequest(
    `${path}/branches/${encodeURIComponent(selectedBranch)}`
  );

  if (!branchData.commit?.sha) {
    throw githubError(422, "Cannot identify a commit for this branch.");
  }

  return {
    repository: repository.full_name,
    repositoryUrl: repository.html_url,
    branch: branchData.name,
    commitSha: branchData.commit.sha,
  };
};

export { githubRequest, githubError };