import { Octokit } from "@octokit/rest";

function parsePrUrl(url: string): { owner: string; repo: string; pull_number: number } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2], pull_number: parseInt(match[3], 10) };
}

// Format 1: agent-generated JSON block
// <!-- review-checkpoint
// {"v":1,"goal":"...","constraints":"...","riskAreas":"...","agent":"...","ts":"..."}
// -->
function parseJsonBlock(body: string): { goal: string; constraints: string; riskAreas: string } | null {
  const start = body.indexOf("<!-- review-checkpoint");
  if (start === -1) return null;
  const end = body.indexOf("-->", start);
  if (end === -1) return null;
  const raw = body.slice(start + "<!-- review-checkpoint".length, end).trim();
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (typeof data.goal !== "string" || !data.goal) return null;
    return {
      goal: data.goal,
      constraints: typeof data.constraints === "string" ? data.constraints : "",
      riskAreas: typeof data.riskAreas === "string" ? data.riskAreas : "",
    };
  } catch {
    return null;
  }
}

// Format 2: human-written markdown sections
function parseMarkdownSection(body: string, names: string[]): string {
  const pattern = new RegExp(
    `##\\s+(?:${names.join("|")})\\s*\\n([\\s\\S]*?)(?=\\n##|$)`,
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

    // Try JSON block first (agent-generated), fall back to markdown sections
    const jsonData = parseJsonBlock(body);
    const goal = jsonData?.goal ?? parseMarkdownSection(body, ["Goal"]);
    const constraints = jsonData?.constraints ?? parseMarkdownSection(body, ["Constraints", "Constraint"]);
    const riskAreas = jsonData?.riskAreas ?? parseMarkdownSection(body, ["Risk Areas", "Risk Area", "Risks", "Risk"]);

    return Response.json({
      title: pr.data.title,
      goal,
      constraints,
      riskAreas,
      agentGenerated: jsonData !== null,
    });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 404) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ error: "github api error" }, { status: 500 });
  }
}
