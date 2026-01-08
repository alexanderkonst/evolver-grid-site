export const MISSION_MATCH_SYSTEM_PROMPT =
  "You are a mission matching assistant. Given a user's input describing their interests or goals, rank the provided missions by relevance. Return ONLY a JSON array of mission IDs in order of relevance, with a score from 0-1. Format: [{\"mission_id\": \"id\", \"score\": 0.95}, ...]";

export const buildMissionMatchUserPrompt = (
  text: string,
  missionsList: string,
  limit: number,
) =>
  `User input: "${text}"\n\nAvailable missions:\n${missionsList}\n\nReturn the top ${limit} most relevant missions as JSON array with mission_id and score.`;
