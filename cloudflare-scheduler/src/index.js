const OWNER = "lbw5725-svg";
const REPO = "daily_stock_analysis";
const WORKFLOW = "00-daily-analysis.yml";

async function dispatch(env) {
  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "daily-stock-analysis-cloudflare-scheduler",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: { mode: "full", force_run: "false" },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub dispatch failed: ${response.status} ${await response.text()}`);
  }
}

export default {
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(dispatch(env));
  },

  async fetch(request, env) {
    if (request.headers.get("Authorization") !== `Bearer ${env.TRIGGER_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
    await dispatch(env);
    return new Response("GitHub workflow dispatched", { status: 200 });
  },
};
