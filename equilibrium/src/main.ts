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

// Initialize UI from state
breathDurationInput.value = String(state.preferences.breathDuration);
breathDurationLabel.textContent = `${state.preferences.breathDuration}s`;
togglePrompts.checked = state.preferences.transitionPrompts;
toggleOuterRings.checked = state.preferences.showOuterRings;
toggleSound.checked = state.preferences.sound;

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

// ─── SPRINT CONTROL ────────────────────────────────

const clockContainer = document.getElementById('clock-container')!;

clockContainer.addEventListener('click', (e) => {
  // Don't start sprint if clicking during settings
  if (!settingsOverlay.classList.contains('hidden')) return;

  // Prevent starting if clicking on settings toggle
  if ((e.target as HTMLElement).id === 'settings-toggle') return;

  if (!state.sprintStartTime) {
    // Start new sprint
    state.sprintStartTime = Date.now();
    saveState(state);
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

  clock.update(cycles, state.preferences.showOuterRings, state.preferences.transitionPrompts);

  // Update guidance line
  const guidance = getGuidance(cycles);
  guidanceEl.textContent = guidance.message;
  guidanceEl.className = `category-${guidance.category}`;

  requestAnimationFrame(tick);
}

// Start the living clock
requestAnimationFrame(tick);
