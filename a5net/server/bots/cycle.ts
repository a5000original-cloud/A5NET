import Profiles from "../../tables/profiles.table";
import Runs from "../../tables/runs.table";
import type { FleetSettings } from "../../shared/types";
import { acceptFriendship, getViewerSocial } from "../social";
import Messages from "../../tables/messages.table";
import { sendMessage } from "../messages";
import { createNotification } from "../notifications";
import Comments from "../../tables/comments.table";
import Posts from "../../tables/posts.table";
import { perceive } from "./perception";
import { formatMemory, recall, remember } from "./memory";
import { decide } from "./decision";
import { executeAction } from "./act";
import { localReply, reflectionText, type LocalDecision } from "./local";

// Bot question templates
const BOT_QUESTIONS: string[] = [
  "А какой софт/инструмент юзал для этого?",
  "Как тебе новый трек в этом стиле?",
  "Что вдохновило на такую идею?",
  "Сложно было это сделать?",
  "А есть планы на продолжение?",
  "Какой бит использовал?",
  "Расскажи подробнее про процесс.",
  "Это твой первый раз в этом жанре?",
  "Как думаешь, что дальше будет?",
  "А можно спросить про идею?",
];

export interface CycleResult {
  botId: string;
  name: string;
  action: string;
  status: "done" | "wait" | "skipped" | "fumbled" | "failed";
  detail: string;
  provider: string;
  latencyMs: number;
}

export function moscowHour(date = new Date()): number {
  const formatted = new Intl.DateTimeFormat("ru-RU", {
    hour: "numeric",
    hour12: false,
    timeZone: "Europe/Moscow",
  }).format(date);
  const value = Number(formatted);
  return Number.isFinite(value) ? value % 24 : date.getUTCHours();
}

export function awakeScore(
  chronotype: "lark" | "nightowl" | "steady",
  hour: number,
): number {
  if (chronotype === "lark") {
    if (hour >= 6 && hour < 12) return 0.95;
    if (hour >= 12 && hour < 22) return 0.4;
    return 0.08;
  }
  if (chronotype === "nightowl") {
    if (hour >= 19 || hour < 2) return 0.95;
    if (hour >= 2 && hour < 6) return 0.25;
    return 0.3;
  }
  if (hour >= 9 && hour < 23) return 0.85;
  return 0.15;
}

function nextDelayMinutes(action: string, aggressiveness: number): number {
  if (action === "WAIT") return 1 + Math.random() * 5;
  const base = action === "COMMENT" || action === "POST" ? 6 : 3;
  return base + Math.random() * 8 * (1.2 - aggressiveness);
}

export async function runBotCycle(
  ctx: app.Ctx,
  profile: typeof Profiles.T,
  fleet: FleetSettings,
): Promise<CycleResult | null> {
  const now = new Date();
  if (profile.nextActionAt && profile.nextActionAt.getTime() > now.getTime())
    return null;

  const hour = moscowHour(now);
  const awake = awakeScore(profile.chronotype, hour);
  if (Math.random() > awake) return null;

  const social = await getViewerSocial(ctx, profile.id);

  // Check for human replies to bot's comments (80% chance to respond)
  const botComments = await Comments.findAll(ctx, {
    where: { authorId: profile.id, visibility: "visible" },
    limit: 20,
    order: [{ publishedAt: "desc" }],
  });
  for (const botComment of botComments) {
    const replies = await Comments.findAll(ctx, {
      where: { postId: botComment.postId, parentId: botComment.id },
      limit: 5,
      order: [{ publishedAt: "desc" }],
    });
    for (const reply of replies) {
      if (reply.authorId === profile.id) continue;
      const replier = await Profiles.findById(ctx, reply.authorId);
      if (!replier || replier.kind !== "human") continue;
      // Check if we already responded to this reply
      const ourResponse = await Comments.findOneBy(ctx, {
        postId: reply.postId,
        parentId: reply.id,
        authorId: profile.id,
      });
      if (ourResponse) continue;
      // 80% chance to respond
      if (Math.random() < 0.8) {
        const response = localReply(profile, reply.text);
        await Comments.create(ctx, {
          postId: reply.postId,
          authorId: profile.id,
          text: response,
          likes: 0,
          visibility: "visible",
          parentId: reply.id,
          publishedAt: new Date(),
        });
        await createNotification(ctx, {
          recipientId: replier.id,
          actorId: profile.id,
          type: "reply",
          postId: reply.postId,
          commentId: reply.id,
          text: `ответил(а) на твой ответ`,
        });
        // Update comments count on the post
        const post = await Posts.findById(ctx, reply.postId);
        if (post)
          await Posts.update(ctx, {
            id: post.id,
            commentsCount: post.commentsCount + 1,
          });
      }
    }
  }

  const incoming = await Messages.findAll(ctx, {
    where: { toId: profile.id, read: false },
    limit: 4,
    order: [{ createdAt: "asc" }],
  });
  for (const message of incoming) {
    if (message.fromId === profile.id) continue;
    const sender = await Profiles.findById(ctx, message.fromId);
    if (!sender) {
      await Messages.update(ctx, { id: message.id, read: true });
      continue;
    }
    if (sender.kind === "human") {
      await sendMessage(
        ctx,
        profile,
        sender.id,
        localReply(profile, message.text),
      );
    }
    await Messages.update(ctx, { id: message.id, read: true });
  }

  if (social.pendingIn.size && Math.random() < 0.3) {
    const candidate = [...social.pendingIn][0];
    if (candidate) {
      const accepted = await acceptFriendship(ctx, profile.id, candidate);
      if (accepted) {
        social.friendIds.add(candidate);
        social.pendingIn.delete(candidate);
        await remember(
          ctx,
          profile,
          "action",
          "Принял входящую заявку в друзья — совпало по вкусу.",
          profile.interests.slice(0, 2),
          1.1,
        );
      }
    }
  }

  const recentPosts = await Posts.findAll(ctx, {
    where: { authorId: profile.id, visibility: "visible" },
    limit: 8,
    order: [{ publishedAt: "desc" }],
  });
  if (recentPosts.length && Math.random() < 0.7) {
    const postIds = recentPosts.map((post) => post.id);
    const comments = await Comments.findAll(ctx, {
      where: { postId: postIds, visibility: "visible" },
      limit: 40,
      order: [{ publishedAt: "desc" }],
    });
    for (const comment of comments) {
      if (comment.authorId === profile.id || comment.parentId) continue;
      const author = await Profiles.findById(ctx, comment.authorId);
      if (!author) continue;
      if (author.kind !== "human" && Math.random() > 0.18) continue;
      const replied = await Comments.findOneBy(ctx, {
        postId: comment.postId,
        parentId: comment.id,
        authorId: profile.id,
      });
      if (replied) continue;
      const reply = localReply(profile, comment.text);
      await Comments.create(ctx, {
        postId: comment.postId,
        authorId: profile.id,
        text: reply,
        likes: 0,
        visibility: "visible",
        parentId: comment.id,
        publishedAt: new Date(),
      });
      const post = recentPosts.find((item) => item.id === comment.postId);
      if (post)
        await Posts.update(ctx, {
          id: post.id,
          commentsCount: post.commentsCount + 1,
        });
      await createNotification(ctx, {
        recipientId: author.id,
        actorId: profile.id,
        type: "reply",
        postId: comment.postId,
        commentId: comment.id,
        text: `ответил(а) на твой комментарий под «${post?.title ?? "постом"}»`,
      });

      // 30% chance bot asks a follow-up question after commenting
      if (Math.random() < 0.3 && post) {
        const question =
          BOT_QUESTIONS[Math.floor(Math.random() * BOT_QUESTIONS.length)] ??
          "Интересно, расскажи подробнее.";
        await Comments.create(ctx, {
          postId: post.id,
          authorId: profile.id,
          text: question,
          likes: 0,
          visibility: "visible",
          parentId: comment.id,
          publishedAt: new Date(),
        });
        await Posts.update(ctx, {
          id: post.id,
          commentsCount: post.commentsCount + 1,
        });
        await createNotification(ctx, {
          recipientId: author.id,
          actorId: profile.id,
          type: "reply",
          postId: post.id,
          commentId: comment.id,
          text: `задал(а) вопрос под «${post.title}»`,
        });
      }

      await finish(
        ctx,
        profile,
        { action: "COMMENT", content: reply, reason: "ответил на комментарий" },
        "done",
        "ответил(а) на комментарий",
        "local",
        0,
        "ответ на комментарий",
        fleet.aggressiveness,
        post?.title,
      );
      return {
        botId: profile.id,
        name: profile.name,
        action: "COMMENT",
        status: "done",
        detail: "ответил(а) на комментарий",
        provider: "local",
        latencyMs: 0,
      };
    }
  }

  const perception = await perceive(ctx, profile, social);
  if (!perception.items.length) {
    const next = new Date(now.getTime() + 30 * 60000);
    await Profiles.update(ctx, {
      id: profile.id,
      nextActionAt: next,
      lastActionAt: now,
    });
    return {
      botId: profile.id,
      name: profile.name,
      action: "WAIT",
      status: "wait",
      detail: "лента пуста",
      provider: "local",
      latencyMs: 0,
    };
  }

  const anchor = perception.items[0]!;
  const memories = await recall(
    ctx,
    profile,
    `${anchor.title} ${anchor.body}`,
    anchor.topics,
    5,
  );
  const friendProfiles = social.friendIds.size
    ? await Profiles.findAll(ctx, {
        where: { id: [...social.friendIds].slice(0, 12) },
        limit: 12,
      })
    : [];
  const friendNames = friendProfiles.map((friend) => friend.name).join(", ");

  const outcome = await decide(
    ctx,
    profile,
    perception.items,
    social,
    formatMemory(memories),
    friendNames,
    perception.authorInterests,
    perception.likeCounts,
    fleet.aggressiveness,
    true,
  );

  const planned: LocalDecision = outcome.decision;
  if (Math.random() < 0.07) {
    await finish(
      ctx,
      profile,
      planned,
      "fumbled",
      "передумал в последний момент",
      outcome.provider,
      outcome.latencyMs,
      outcome.perception,
      fleet.aggressiveness,
    );
    return {
      botId: profile.id,
      name: profile.name,
      action: planned.action,
      status: "fumbled",
      detail: "передумал",
      provider: outcome.provider,
      latencyMs: outcome.latencyMs,
    };
  }
  if (planned.action !== "WAIT" && Math.random() < 0.05) {
    await finish(
      ctx,
      profile,
      { action: "WAIT", content: "", reason: "отвлёкся" },
      "fumbled",
      "отвлёкся и закрыл ленту",
      outcome.provider,
      outcome.latencyMs,
      outcome.perception,
      fleet.aggressiveness,
    );
    return {
      botId: profile.id,
      name: profile.name,
      action: "WAIT",
      status: "fumbled",
      detail: "отвлёкся",
      provider: outcome.provider,
      latencyMs: outcome.latencyMs,
    };
  }

  try {
    const result = await executeAction(
      ctx,
      profile,
      planned,
      perception.items,
      social,
    );
    const target = perception.items.find(
      (item) => item.id === planned.targetId,
    );
    const topics = target?.topics ?? profile.interests.slice(0, 2);
    const memoryText = reflectionText(
      result.status === "wait" ? "WAIT" : planned.action,
      result.targetTitle ? `«${result.targetTitle}»` : "",
      profile,
    );
    await remember(
      ctx,
      profile,
      "action",
      `${memoryText} ${result.detail}`.trim(),
      topics,
      planned.action === "COMMENT" ? 2 : 1,
    );
    if (planned.action === "COMMENT" && target) {
      await remember(
        ctx,
        profile,
        "impression",
        `Мне запомнилось «${target.title}» — ${target.topics.map((topic) => topic).join(", ")}.`,
        target.topics,
        1.2,
      );
    }
    await finish(
      ctx,
      profile,
      planned,
      result.status === "wait" ? "wait" : "done",
      result.detail,
      outcome.provider,
      outcome.latencyMs,
      outcome.perception,
      fleet.aggressiveness,
      result.targetTitle,
    );
    return {
      botId: profile.id,
      name: profile.name,
      action: planned.action,
      status: result.status,
      detail: result.detail,
      provider: outcome.provider,
      latencyMs: outcome.latencyMs,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    await finish(
      ctx,
      profile,
      planned,
      "failed",
      message.slice(0, 200),
      outcome.provider,
      outcome.latencyMs,
      outcome.perception,
      fleet.aggressiveness,
    );
    return {
      botId: profile.id,
      name: profile.name,
      action: planned.action,
      status: "failed",
      detail: message,
      provider: outcome.provider,
      latencyMs: outcome.latencyMs,
    };
  }
}

async function finish(
  ctx: app.Ctx,
  profile: typeof Profiles.T,
  decision: LocalDecision,
  status: "done" | "wait" | "fumbled" | "failed",
  detail: string,
  provider: string,
  latencyMs: number,
  perception: string,
  aggressiveness: number,
  targetTitle?: string,
): Promise<void> {
  await Runs.create(ctx, {
    profileId: profile.id,
    action: decision.action,
    targetId: decision.targetId,
    content: (decision.content || detail).slice(0, 500),
    provider,
    latencyMs,
    status,
    perception: perception.slice(0, 900),
  });
  const now = new Date();
  const delay = nextDelayMinutes(decision.action, aggressiveness);
  const next = new Date(now.getTime() + delay * 60000);
  await Profiles.update(ctx, {
    id: profile.id,
    lastActionAt: now,
    nextActionAt: next,
  });
  if (targetTitle) {
    await remember(
      ctx,
      profile,
      "reflection",
      `Мой след в «${targetTitle}»: ${detail}.`,
      profile.interests.slice(0, 2),
      0.8,
    );
  }
}
