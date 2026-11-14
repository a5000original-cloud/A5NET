import Profiles from "../tables/profiles.table";
import Runs from "../tables/runs.table";
import Friendships from "../tables/friendships.table";
import Reports from "../tables/reports.table";
import Posts from "../tables/posts.table";
import Comments from "../tables/comments.table";
import type {
  BotRow,
  ControlData,
  GraphEdge,
  GraphNode,
  ReportRow,
  RunRow,
} from "../shared/types";
import {
  getFleet,
  getLlmConfig,
  getSetting,
  publicLlm,
  SEED_KEY,
} from "./settings";
import { getStats } from "./feed";
import { listSubscriberTransfers } from "./subscribers";
import { listStickers } from "./stickers";
import { topicById } from "./taxonomy";
import { timeAgo } from "../shared/format";
import { awakeScore, moscowHour } from "./bots/cycle";

export async function getControlData(ctx: app.Ctx): Promise<ControlData> {
  const [fleet, llmConfig, bots, runs, friendships, stats, seed, openReports] =
    await Promise.all([
      getFleet(ctx),
      getLlmConfig(ctx),
      Profiles.findAll(ctx, {
        where: { kind: "bot" },
        limit: 120,
        order: [{ createdAt: "asc" }],
      }),
      Runs.findAll(ctx, {
        limit: 60,
        order: [{ createdAt: "desc" }, { id: "asc" }],
      }),
      Friendships.findAll(ctx, { where: { status: "accepted" }, limit: 500 }),
      getStats(ctx),
      getSetting<{ version?: number }>(ctx, SEED_KEY, {}),
      Reports.findAll(ctx, {
        where: { status: "open" },
        limit: 40,
        order: [{ createdAt: "desc" }, { id: "asc" }],
      }),
    ]);

  const botMap = new Map(bots.map((bot) => [bot.id, bot]));
  const now = Date.now();
  const hour = moscowHour(new Date());

  const rows: BotRow[] = bots.map((bot) => {
    const next =
      bot.nextActionAt instanceof Date ? bot.nextActionAt.getTime() : 0;
    let statusLabel = "в сети";
    if (!bot.enabled) statusLabel = "на паузе";
    else if (next > now + 60000) {
      statusLabel = `спит до ${new Date(next).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" })}`;
    } else if (awakeScore(bot.chronotype, hour) < 0.35)
      statusLabel = "не в сети";

    return {
      id: bot.id,
      handle: bot.handle,
      name: bot.name,
      city: bot.city,
      kind: bot.kind,
      isSynthetic: bot.isSynthetic,
      avatarHue: bot.avatarHue,
      avatarAccent: bot.avatarAccent,
      avatarUrl: bot.avatarUrl ?? null,
      initials: bot.name
        .split(/\s+/)
        .map((part) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      voiceTone: bot.voiceTone,
      enabled: bot.enabled,
      interests: bot.interests.slice(0, 4).map((id) => {
        const topic = topicById(id);
        return { id: topic.id, label: topic.label, hue: topic.hue };
      }),
      friendsCount: bot.friendsCount,
      postsCount: bot.postsCount,
      lastActionAt:
        bot.lastActionAt instanceof Date
          ? bot.lastActionAt.toISOString()
          : null,
      nextActionAt:
        bot.nextActionAt instanceof Date
          ? bot.nextActionAt.toISOString()
          : null,
      statusLabel,
      streakDays: bot.streakDays,
    };
  });

  const nodes: GraphNode[] = bots.map((bot) => ({
    id: bot.id,
    name: bot.name.split(" ")[0] ?? bot.name,
    hue: bot.avatarHue,
    degree: 0,
  }));
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const edges: GraphEdge[] = [];
  for (const friendship of friendships) {
    if (!nodeMap.has(friendship.aId) || !nodeMap.has(friendship.bId)) continue;
    edges.push({ a: friendship.aId, b: friendship.bId });
    const a = nodeMap.get(friendship.aId);
    const b = nodeMap.get(friendship.bId);
    if (a) a.degree += 1;
    if (b) b.degree += 1;
  }

  const logs: RunRow[] = runs.map((run) => {
    const bot = botMap.get(run.profileId);
    const created =
      run.createdAt instanceof Date ? run.createdAt : new Date(run.createdAt);
    return {
      id: run.id,
      botName: bot?.name ?? "Неизвестный",
      botHue: bot?.avatarHue ?? 120,
      action: run.action,
      content: run.content,
      provider: run.provider,
      latencyMs: run.latencyMs,
      status: run.status,
      ago: timeAgo(created.toISOString(), now),
    };
  });

  const dayAgo = now - 24 * 3600000;
  const actions24h = runs.filter((run) => {
    const created =
      run.createdAt instanceof Date
        ? run.createdAt.getTime()
        : new Date(run.createdAt).getTime();
    return created >= dayAgo;
  }).length;
  const latencies = runs
    .filter((run) => run.provider !== "local" && run.latencyMs > 0)
    .map((run) => run.latencyMs);
  const avgLatency = latencies.length
    ? Math.round(
        latencies.reduce((sum, value) => sum + value, 0) / latencies.length,
      )
    : 0;

  const reportPostIds = [
    ...new Set(
      openReports
        .filter((report) => report.targetType === "post")
        .map((report) => report.targetId),
    ),
  ];
  const reportCommentIds = [
    ...new Set(
      openReports
        .filter((report) => report.targetType === "comment")
        .map((report) => report.targetId),
    ),
  ];
  const reportProfileIds = [
    ...new Set(
      openReports
        .filter((report) => report.targetType === "profile")
        .map((report) => report.targetId),
    ),
  ];
  const [reportPosts, reportComments, reportProfiles] = await Promise.all([
    reportPostIds.length
      ? Posts.findAll(ctx, {
          where: { id: reportPostIds },
          limit: reportPostIds.length,
        })
      : [],
    reportCommentIds.length
      ? Comments.findAll(ctx, {
          where: { id: reportCommentIds },
          limit: reportCommentIds.length,
        })
      : [],
    reportProfileIds.length
      ? Profiles.findAll(ctx, {
          where: { id: reportProfileIds },
          limit: reportProfileIds.length,
        })
      : [],
  ]);
  const labelMap = new Map<string, string>();
  for (const post of reportPosts) labelMap.set(`post:${post.id}`, post.title);
  for (const comment of reportComments)
    labelMap.set(`comment:${comment.id}`, comment.text.slice(0, 80));
  for (const profile of reportProfiles)
    labelMap.set(`profile:${profile.id}`, profile.name);

  const reporterIds = [
    ...new Set(openReports.map((report) => report.reporterId)),
  ];
  const reporters = reporterIds.length
    ? await Profiles.findAll(ctx, {
        where: { id: reporterIds },
        limit: reporterIds.length,
      })
    : [];
  const reporterMap = new Map(
    reporters.map((profile) => [profile.id, profile.name]),
  );

  const reports: ReportRow[] = openReports.map((report) => {
    const created =
      report.createdAt instanceof Date
        ? report.createdAt
        : new Date(report.createdAt);
    return {
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      targetLabel:
        labelMap.get(`${report.targetType}:${report.targetId}`) ??
        report.targetId,
      reason: report.reason,
      note: report.note,
      reporterName: reporterMap.get(report.reporterId) ?? "Участник",
      ago: timeAgo(created.toISOString(), now),
    };
  });

  const subscriberTransfers = await listSubscriberTransfers(ctx);
  const pendingStickers = await listStickers(ctx, undefined, "pending");

  const lastRun = runs[0];
  const jobsLagSec = lastRun
    ? Math.max(
        0,
        Math.round(
          (now -
            (lastRun.createdAt instanceof Date
              ? lastRun.createdAt.getTime()
              : new Date(lastRun.createdAt).getTime())) /
            1000,
        ),
      )
    : 0;
  const fallbackRate = runs.length
    ? Math.round(
        (runs.filter((run) => run.provider === "local").length / runs.length) *
          100,
      )
    : 0;

  return {
    fleet,
    stats,
    bots: rows,
    logs,
    nodes,
    edges,
    llm: publicLlm(llmConfig),
    seeded: Boolean(seed.version) || bots.length > 0,
    onlineNow: bots.filter((bot) => {
      const last =
        bot.lastActionAt instanceof Date ? bot.lastActionAt.getTime() : 0;
      return bot.enabled && last > now - 90 * 60000;
    }).length,
    actions24h,
    avgLatency,
    reports,
    subscriberTransfers,
    pendingStickers,
    jobsLagSec,
    fallbackRate,
    now: new Date(now).toISOString(),
  };
}
