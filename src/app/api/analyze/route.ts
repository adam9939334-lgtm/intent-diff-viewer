import { Octokit } from "@octokit/rest";

interface AnalyzeRequest {
  prUrl: string;
  goal: string;
  constraints?: string;
  riskAreas?: string;
}

interface DiffFile {
  filename: string;
  patch: string | undefined;
  additions: number;
  deletions: number;
}

function parsePrUrl(url: string): { owner: string; repo: string; pull_number: number } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    pull_number: parseInt(match[3], 10),
  };
}

export async function POST(request: Request) {
  let body: AnalyzeRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prUrl, goal, constraints = "", riskAreas = "" } = body;

  if (!prUrl || !goal) {
    return Response.json({ error: "prUrl and goal are required" }, { status: 400 });
  }

  const parsed = parsePrUrl(prUrl);
  if (!parsed) {
    return Response.json(
      { error: "Invalid GitHub PR URL. Expected format: https://github.com/owner/repo/pull/123" },
      { status: 400 }
    );
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  try {
    const [prResponse, filesResponse] = await Promise.all([
      octokit.pulls.get({
        owner: parsed.owner,
        repo: parsed.repo,
        pull_number: parsed.pull_number,
      }),
      octokit.pulls.listFiles({
        owner: parsed.owner,
        repo: parsed.repo,
        pull_number: parsed.pull_number,
        per_page: 100,
      }),
    ]);

    const files: DiffFile[] = filesResponse.data.map((file) => ({
      filename: file.filename,
      patch: file.patch,
      additions: file.additions,
      deletions: file.deletions,
    }));

    return Response.json({
      title: prResponse.data.title,
      description: prResponse.data.body ?? "",
      files,
      intent: { goal, constraints, riskAreas },
    });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      return Response.json(
        { error: "Pull request not found. Make sure the PR URL is correct and the repository is public." },
        { status: 404 }
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: `GitHub API error: ${message}` }, { status: 500 });
  }
}
