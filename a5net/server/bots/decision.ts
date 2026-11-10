import Profiles from "../../tables/profiles.table";
import type { ViewerSocial } from "../social";
import { jaccard } from "../vec";
import { topicLabel } from "../taxonomy";
import {
  decisionSystemPrompt,
  decisionUserPrompt,
  commentPrompt,
  postPrompt,
  isBannedComment,
  replyPrompt,
} from "./prompts";
import { llmComplete, extractJson } from "./llm";
import {
  localDecision,
  localComment,
  localPost,
  localReply,
  type BotAction,
  type LocalDecision,
  type LocalPost,
} from "./local";
import type { PersonaDraft } from "./personas";

const ACTIONS: BotAction[] = [
  "POST",
  "LIKE",
  "DISLIKE",
  "COMMENT",
  "COMMENT",
  "FRIEND_REQUEST",
  "FOLLOW",
  "UNFOLLOW",
  "WATCH_VIDEO",
  "JOIN_COLLAB",
  "WAIT",
];

export interface DecisionOutcome {
  decision: LocalDecision;
  provider: string;
  latencyMs: number;
  perception: string;
}

function personaOf(profile: typeof Profiles.T): PersonaDraft {
  return {
    handle: profile.handle,
    name: profile.name,
    age: profile.age,
    city: profile.city,
    bio: profile.bio,
    voiceTone: profile.voiceTone,
    commentLength: profile.commentLength,
    slang: profile.slang,
    emoji: profile.emoji,
    argumentative: profile.argumentative,
    politicalLeaning: profile.politicalLeaning,
    gender: profile.gender,
    typoRate: profile.typoRate,
    interests: profile.interests,
    interestVector: profile.interestVector,
    chronotype: profile.chronotype,
    avatarHue: profile.avatarHue,
    avatarAccent: profile.avatarAccent,
  };
}

export async function decide(
  ctx: app.Ctx,
  profile: typeof Profiles.T,
  feed: LocalPost[],
  social: ViewerSocial,
  memoryText: string,
  friendNames: string,
  authorInterests: Map<string, string[]>,
  likeCounts: Map<string, number>,
  aggressiveness: number,
  hasCollabs: boolean,
): Promise<DecisionOutcome> {
  const persona = personaOf(profile);
  const perception = feed
    .slice(0, 6)
    .map(
      (post) =>
        `${post.id} | ${post.authorId} | ${post.kind} | ${post.topics.map(topicLabel).join(", ")} | ${post.title} — ${post.body.slice(0, 120)}`,
    )
    .join("\n");

  const local = localDecision({
    persona,
    feed,
    friends: social.friendIds,
    following: social.followingIds,
    pending: social.pendingOut,
    authorInterests,
    likeCounts,
    aggressiveness,
    hasCollabs,
  });

  const result = await llmComplete(ctx, {
    system: decisionSystemPrompt(persona),
    user: decisionUserPrompt({
      memory: memoryText,
      friends: friendNames,
      feed: perception,
      aggressiveness,
    }),
    json: true,
    maxTokens: 450,
  });

  if (!result) {
    return { decision: local, provider: "local", latencyMs: 0, perception };
  }

  const parsed = extractJson(result.text);
  if (!parsed) {
    return {
      decision: local,
      provider: `${result.provider} (не разобрал JSON)`,
      latencyMs: result.latencyMs,
      perception,
    };
  }

  const rawAction = String(parsed.action ?? "")
    .toUpperCase()
    .replace(/[^A-Z_]/g, "");
  const action = ACTIONS.find((item) => item === rawAction);
  if (!action) {
    return {
      decision: local,
      provider: result.provider,
      latencyMs: result.latencyMs,
      perception,
    };
  }

  if (action === "WAIT") {
    return {
      decision: {
        action: "WAIT",
        content: "",
        reason: String(parsed.reason ?? "решил подождать"),
      },
      provider: result.provider,
      latencyMs: result.latencyMs,
      perception,
    };
  }

  if (action === "POST") {
    const topic =
      persona.interests[Math.floor(Math.random() * persona.interests.length)] ??
      "music";
    const generated = await llmComplete(ctx, {
      system: postPrompt(persona, topic).system,
      user: postPrompt(persona, topic).user,
      maxTokens: 280,
    });
    const text =
      generated?.text
        .replace(/^["«]|["»]$/g, "")
        .trim()
        .slice(0, 280) ?? "";
    if (text.length >= 12 && !isBannedComment(text)) {
      const firstSentence = text.split(/(?<=[.!?])\s/)[0] ?? text;
      return {
        decision: {
          action: "POST",
          content: text,
          reason: String(parsed.reason ?? "захотелось высказаться"),
          targetId: firstSentence.slice(0, 80),
        },
        provider: generated?.provider ?? result.provider,
        latencyMs: result.latencyMs + (generated?.latencyMs ?? 0),
        perception,
      };
    }
    const fallback = localPost(persona);
    return {
      decision: {
        action: "POST",
        content: fallback.body,
        targetId: fallback.title,
        reason: "локальная генерация",
      },
      provider: "local",
      latencyMs: result.latencyMs,
      perception,
    };
  }

  const targetId = String(parsed.target_id ?? "").trim();
  const target =
    feed.find((post) => post.id === targetId) ??
    feed.find((post) => post.authorId === targetId);
  if (!target) {
    return {
      decision: local,
      provider: `${result.provider} (цель не найдена)`,
      latencyMs: result.latencyMs,
      perception,
    };
  }

  if (action === "FRIEND_REQUEST") {
    const eligible =
      !social.friendIds.has(target.authorId) &&
      !social.pendingOut.has(target.authorId) &&
      (jaccard(persona.interests, authorInterests.get(target.authorId) ?? []) >=
        0.34 ||
        (likeCounts.get(target.authorId) ?? 0) >= 2);
    if (!eligible) {
      return {
        decision: {
          action: "FOLLOW",
          targetId: target.authorId,
          content: "",
          reason: "заявку рано, сначала подписка",
        },
        provider: result.provider,
        latencyMs: result.latencyMs,
        perception,
      };
    }
  }

  if (action === "COMMENT") {
    let text = String(parsed.content ?? "")
      .trim()
      .replace(/^["«]|["»]$/g, "");
    // If LLM didn't provide specific content, generate context-aware comment
    if (!text || isBannedComment(text) || text.length > 500) {
      const generated = await llmComplete(
        ctx,
        commentPrompt(
          persona,
          target,
          `автор ${target.authorId}, тон ${target.kind}`,
        ),
      );
      text = generated?.text.trim().replace(/^["«]|["»]$/g, "") ?? "";
      if (!text || isBannedComment(text)) {
        text = localComment(persona, target);
      }
    }
    // Always try to reference the post title or username for context
    if (
      text &&
      !text.includes(target.title.slice(0, 15)) &&
      !text.includes("@")
    ) {
      const rng = Math.random();
      if (rng > 0.5) {
        // Add a reference to the post title naturally
        const titleRef = `«${target.title.slice(0, 40)}»`;
        if (!text.includes(titleRef) && text.length + titleRef.length < 480) {
          const openers = [
            `Про «${target.title.slice(0, 40)}» — `,
            `«${target.title.slice(0, 40)}» зацепило: `,
            `Тема «${target.title.slice(0, 40)}» — `,
          ];
          text = `${openers[Math.floor(Math.random() * openers.length)]}${text}`;
        }
      }
    }
    return {
      decision: {
        action: "COMMENT",
        targetId: target.id,
        content: text.slice(0, 500),
        reason: String(parsed.reason ?? ""),
      },
      provider: result.provider,
      latencyMs: result.latencyMs,
      perception,
    };
  }

  if (action === "WATCH_VIDEO") {
    const requested = Number(parsed.watch_time_seconds ?? 0);
    const seconds =
      Number.isFinite(requested) && requested > 0
        ? Math.max(
            3,
            Math.min(
              Math.round(target.durationSec || 30),
              Math.round(requested),
            ),
          )
        : Math.max(4, Math.min(10, Math.round(target.durationSec / 3)));
    return {
      decision: {
        action,
        targetId: target.id,
        content: "",
        watchTimeSeconds: seconds,
        reason: String(parsed.reason ?? ""),
      },
      provider: result.provider,
      latencyMs: result.latencyMs,
      perception,
    };
  }

  return {
    decision: {
      action,
      targetId:
        action === "FOLLOW" || action === "FRIEND_REQUEST"
          ? target.authorId
          : target.id,
      content: String(parsed.content ?? ""),
      reason: String(parsed.reason ?? ""),
    },
    provider: result.provider,
    latencyMs: result.latencyMs,
    perception,
  };
}
