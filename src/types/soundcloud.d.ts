/**
 * Shared SoundCloud Widget API types (ambient, project-wide).
 *
 * Day 58+ (Sasha 2026-05-03): consolidated from two parallel
 * `declare global` blocks (MusicPlayer + SoundCloudMinimalPlayer)
 * that were merging incompatibly. One source of truth, superset
 * of every method either consumer needs.
 *
 * No `import`/`export` in this file — that keeps it ambient so the
 * declared types are globally visible without an explicit import.
 *
 * Public Widget API docs: https://developers.soundcloud.com/docs/api/html5-widget
 */

interface SCSound {
    title?: string;
    user?: { username?: string };
}

interface SCWidget {
    bind: (event: string, handler: (...args: unknown[]) => void) => void;
    unbind: (event: string) => void;
    play: () => void;
    pause: () => void;
    toggle: () => void;
    next: () => void;
    skip: (index: number) => void;
    getSounds: (cb: (sounds: SCSound[]) => void) => void;
    getCurrentSound: (cb: (sound: SCSound | null) => void) => void;
}

interface SCWidgetEvents {
    READY: string;
    PLAY: string;
    PAUSE: string;
    FINISH: string;
    PLAY_PROGRESS: string;
}

interface Window {
    SC?: {
        Widget: ((iframe: HTMLIFrameElement | string) => SCWidget) & {
            Events: SCWidgetEvents;
        };
    };
}
