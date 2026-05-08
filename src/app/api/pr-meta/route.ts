import { Octokit } from "@octokit/rest";

function parsePrUrl(url: string): { owner: string; repo: string; pull_number: number } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2], pull_number: parseInt(match[3], 10) };
}

function parseSection(body: string, names: string[]): string {
  const pattern = new RegExp(
    `##\\s+(?:${names.join("|")})\\s*\\n([\\s\\S]*?)(?=##|$)`,
    "i"
  );
  const match = body.match(pattern);
  return match ? match[1].trim() : "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prUrl = searchParams.get("url");

  if (!prUrl) {
    return Response.json({ error: "url required" }, { status: 400 });
  }

  const parsed = parsePrUrl(prUrl);
  if (!parsed) {
    return Response.json({ error: "invalid PR URL" }, { status: 400 });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    const pr = await octokit.pulls.get({
      owner: parsed.owner,
      repo: parsed.repo,
      pull_number: parsed.pull_number,
    });

    const body = pr.data.body ?? "";
    const goal = parseSection(body, ["Goal"]);
    const constraints = parseSection(body, ["Constraints", "Constraint"]);
    const riskAreas = parseSection(body, ["Risk Areas", "Risk Area", "Risks", "Risk"]);

    return Response.json({ title: pr.data.title, goal, constraints, riskAreas });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 404) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ error: "github api error" }, { status: 500 });
  }
}
