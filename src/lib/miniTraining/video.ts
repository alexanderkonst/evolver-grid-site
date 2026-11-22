import { MINI_TRAINING_VIDEOS } from "@/config/miniTrainingVideos";

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** The embed URL for a micro-module's video, or null while there is no valid id (show nothing). */
export function videoEmbedUrl(
  training: string,
  module: number,
  videos: Record<string, Record<number, string>> = MINI_TRAINING_VIDEOS,
): string | null {
  const id = videos[training]?.[module]?.trim();
  return id && YOUTUBE_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
}
