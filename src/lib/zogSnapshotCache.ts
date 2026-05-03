import type { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import type { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";

export interface CachedZogSnapshot {
    profileId: string;
    appleseedData: AppleseedData | null;
    excaliburData: ExcaliburData | null;
    archetypeTitle: string | null;
    corePattern: string | null;
    topThreeTalents: string[] | null;
}

let cache: CachedZogSnapshot | null = null;

export const getCachedZogSnapshot = (
    profileId?: string,
): CachedZogSnapshot | null => {
    if (!cache) return null;
    if (profileId && cache.profileId !== profileId) return null;
    return cache;
};

export const setCachedZogSnapshot = (snapshot: CachedZogSnapshot): void => {
    cache = snapshot;
};

export const clearCachedZogSnapshot = (): void => {
    cache = null;
};
