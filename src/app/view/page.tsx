import { Octokit } from "@octokit/rest";
import DiffViewer, { CheckpointIntent } from "@/components/DiffViewer";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ pr?: string; data?: string }>;
}

const GRAIN = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")";

function ErrorPage({ message }: { message: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#060606", fontFamily: "var(--font-mono)" }}>
      <p className="text-sm text-red-400 border-l-2 border-red-500 pl-3 py-1 mb-6">{message}</p>
      <Link href="/" className="text-xs text-zinc-500 hover:text-lime-400 transition-colors">
        ← create a new checkpoint
      </Link>
    </main>
  );
}

export default async function ViewPage({ searchParams }: PageProps) {
  const { pr: prUrl, data: dataParam } = await searchParams;

  if (!prUrl || !dataParam) {
    return <ErrorPage message="Invalid share link — missing parameters." />;
  }

  let intent: CheckpointIntent;
  try {
    intent = JSON.parse(Buffer.from(dataParam, "base64").toString("utf-8"));
    if (!intent.goal) throw new Error("missing goal");
  } catch {
    return <ErrorPage message="Invalid share link — could not decode checkpoint data." />;
  }

  const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) {
    return <ErrorPage message="Invalid GitHub PR URL in share link." />;
  }

  const [, owner, repo, pull_number_str] = match;
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    const [prResponse, filesResponse] = await Promise.all([
      octokit.pulls.get({ owner, repo, pull_number: parseInt(pull_number_str, 10) }),
      octokit.pulls.listFiles({ owner, repo, pull_number: parseInt(pull_number_str, 10), per_page: 100 }),
    ]);

    const files = filesResponse.data.map((f) => ({
      filename: f.filename,
      patch: f.patch,
      additions: f.additions,
      deletions: f.deletions,
    }));

    return (
      <main className="min-h-screen px-6 py-12" style={{ background: "#060606", fontFamily: "var(--font-mono)" }}>
        <div className="pointer-events-none fixed inset-0 z-50" style={{
          backgroundImage: GRAIN,
          backgroundRepeat: "repeat", backgroundSize: "128px 128px", opacity: 0.025,
        }} />
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 text-sm text-zinc-500 hover:text-lime-400 transition-colors group"
            >
              <span className="text-lime-400">←</span>
              <span className="tracking-widest uppercase text-xs">create your own</span>
            </Link>
            <span className="text-xs text-zinc-700 font-mono">// intent-diff-viewer</span>
          </div>
          <DiffViewer
            title={prResponse.data.title}
            description={prResponse.data.body ?? ""}
            files={files}
            intent={intent}
          />
        </div>
      </main>
    );
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      return <ErrorPage message="Pull request not found. It may be private or the URL is incorrect." />;
    }
    return <ErrorPage message="Failed to load PR data from GitHub." />;
  }
}
