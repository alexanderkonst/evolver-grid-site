/**
 * Equilibrium — Main Entry
 * 
 * "Your breath is the clock."
 * 
 * A living clock that replaces mechanical time with biological rhythm.
 */

import './style.css';
import { getAllCycles } from './cycles';
import { Clock } from './clock';
import { getGuidance } from './guidance';

// ─── STATE ─────────────────────────────────────────

interface Preferences {
  breathDuration: number;
  transitionPrompts: boolean;
  showOuterRings: boolean;
  sound: boolean;
  wakeTime: string;   // "HH:MM" format
  sleepTime: string;   // "HH:MM" format
}

interface AppState {
  preferences: Preferences;
  sprintStartTime: number | null;
  sprintLog: Array<{
    date: string;
    sprintNumber: number;
    startTime: string;
    endTime: string;
    completed: boolean;
  }>;
}

const STORAGE_KEY = 'equilibrium-state';

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // If sprint is stale (>96 min old), clear it
      if (parsed.sprintStartTime) {
        const elapsed = (Date.now() - parsed.sprintStartTime) / 60000;
        if (elapsed >= 96) {
          parsed.sprintStartTime = null;
        }
      }
      // Ensure wake/sleep defaults
      if (!parsed.preferences.wakeTime) parsed.preferences.wakeTime = '07:00';
      if (!parsed.preferences.sleepTime) parsed.preferences.sleepTime = '23:00';
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load state:', e);
  }

  return {
    preferences: {
      breathDuration: 11,
      transitionPrompts: true,
      showOuterRings: true,
      sound: false,
      wakeTime: '07:00',
      sleepTime: '23:00',
    },
    sprintStartTime: null,
    sprintLog: [],
  };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

// ─── INIT ──────────────────────────────────────────

const state = loadState();
const clock = new Clock();
const guidanceEl = document.getElementById('guidance')!;
const sprintCta = document.getElementById('sprint-cta')!;

// Apply breath duration from preferences
document.documentElement.style.setProperty('--breath-duration', `${state.preferences.breathDuration}s`);

// ─── SETTINGS UI ───────────────────────────────────

const settingsToggle = document.getElementById('settings-toggle')!;
const settingsOverlay = document.getElementById('settings-overlay')!;
const settingsClose = document.getElementById('settings-close')!;
const breathDurationInput = document.getElementById('breath-duration') as HTMLInputElement;
const breathDurationLabel = document.getElementById('breath-duration-label')!;
const togglePrompts = document.getElementById('toggle-prompts') as HTMLInputElement;
const toggleOuterRings = document.getElementById('toggle-outer-rings') as HTMLInputElement;
const toggleSound = document.getElementById('toggle-sound') as HTMLInputElement;
const wakeTimeInput = document.getElementById('wake-time') as HTMLInputElement;
const sleepTimeInput = document.getElementById('sleep-time') as HTMLInputElement;

// Initialize UI from state
breathDurationInput.value = String(state.preferences.breathDuration);
breathDurationLabel.textContent = `${state.preferences.breathDuration}s`;
togglePrompts.checked = state.preferences.transitionPrompts;
toggleOuterRings.checked = state.preferences.showOuterRings;
toggleSound.checked = state.preferences.sound;
wakeTimeInput.value = state.preferences.wakeTime;
sleepTimeInput.value = state.preferences.sleepTime;

settingsToggle.addEventListener('click', () => {
  settingsOverlay.classList.remove('hidden');
});

settingsClose.addEventListener('click', () => {
  settingsOverlay.classList.add('hidden');
});

settingsOverlay.addEventListener('click', (e) => {
  if (e.target === settingsOverlay) {
    settingsOverlay.classList.add('hidden');
  }
});

breathDurationInput.addEventListener('input', () => {
  const val = parseInt(breathDurationInput.value);
  state.preferences.breathDuration = val;
  breathDurationLabel.textContent = `${val}s`;
  document.documentElement.style.setProperty('--breath-duration', `${val}s`);
  saveState(state);
});

togglePrompts.addEventListener('change', () => {
  state.preferences.transitionPrompts = togglePrompts.checked;
  saveState(state);
});

toggleOuterRings.addEventListener('change', () => {
  state.preferences.showOuterRings = toggleOuterRings.checked;
  saveState(state);
});

toggleSound.addEventListener('change', () => {
  state.preferences.sound = toggleSound.checked;
  saveState(state);
});

wakeTimeInput.addEventListener('change', () => {
  state.preferences.wakeTime = wakeTimeInput.value;
  saveState(state);
});

sleepTimeInput.addEventListener('change', () => {
  state.preferences.sleepTime = sleepTimeInput.value;
  saveState(state);
});

// ─── SPRINT CONTROL ────────────────────────────────

function startSprint() {
  if (!state.sprintStartTime) {
    state.sprintStartTime = Date.now();
    saveState(state);
  }
}

// CTA button starts sprint
sprintCta.addEventListener('click', (e) => {
  e.stopPropagation();
  startSprint();
});

// Long-press (3s) on clock to end sprint early
let longPressTimer: number | null = null;

const clockContainer = document.getElementById('clock-container')!;

clockContainer.addEventListener('pointerdown', (e) => {
  if (!state.sprintStartTime) return;
  if ((e.target as HTMLElement).id === 'settings-toggle') return;
  if ((e.target as HTMLElement).id === 'sprint-cta') return;

  longPressTimer = window.setTimeout(() => {
    // End sprint early
    state.sprintLog.push({
      date: new Date(state.sprintStartTime!).toISOString().slice(0, 10),
      sprintNumber: state.sprintLog.filter(
        s => s.date === new Date(state.sprintStartTime!).toISOString().slice(0, 10)
      ).length + 1,
      startTime: new Date(state.sprintStartTime!).toISOString(),
      endTime: new Date().toISOString(),
      completed: false,
    });
    state.sprintStartTime = null;
    saveState(state);
    longPressTimer = null;
  }, 3000);
});

clockContainer.addEventListener('pointerup', () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
});

clockContainer.addEventListener('pointerleave', () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
});

// ─── MAIN LOOP ─────────────────────────────────────

function tick() {
  const now = Date.now();
  const cycles = getAllCycles(now, state.sprintStartTime, state.preferences.breathDuration);

  // If sprint just ended, log it and clear
  if (state.sprintStartTime && !cycles.sprint.active && cycles.sprint.progress >= 1) {
    state.sprintLog.push({
      date: new Date(state.sprintStartTime).toISOString().slice(0, 10),
      sprintNumber: state.sprintLog.filter(
        s => s.date === new Date(state.sprintStartTime!).toISOString().slice(0, 10)
      ).length + 1,
      startTime: new Date(state.sprintStartTime).toISOString(),
      endTime: new Date(now).toISOString(),
      completed: true,
    });
    state.sprintStartTime = null;
    saveState(state);
  }

  // Show/hide sprint CTA
  if (state.sprintStartTime) {
    sprintCta.classList.add('hidden');
  } else {
    sprintCta.classList.remove('hidden');
  }

  clock.update(cycles, state.preferences.showOuterRings, state.preferences.transitionPrompts);

  // Update guidance line (pass wake/sleep for context)
  const guidance = getGuidance(cycles, state.preferences.wakeTime, state.preferences.sleepTime);
  guidanceEl.textContent = guidance.message;
  guidanceEl.className = `category-${guidance.category}`;

  requestAnimationFrame(tick);
}

// Start the living clock
requestAnimationFrame(tick);
