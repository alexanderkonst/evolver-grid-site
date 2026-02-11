/**
 * Equilibrium — Main Entry
 * 
 * "Your breath is the clock."
 * 
 * A living clock that shows WHERE YOU ARE in every cycle,
 * from breath to personal year.
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
  wakeTime: string;
  sleepTime: string;
  birthday: string;  // "YYYY-MM-DD" or "" 
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
      if (parsed.sprintStartTime) {
        const elapsed = (Date.now() - parsed.sprintStartTime) / 60000;
        if (elapsed >= 96) {
          parsed.sprintStartTime = null;
        }
      }
      // Ensure defaults for newer fields
      if (!parsed.preferences.wakeTime) parsed.preferences.wakeTime = '07:00';
      if (!parsed.preferences.sleepTime) parsed.preferences.sleepTime = '23:00';
      if (parsed.preferences.birthday === undefined) parsed.preferences.birthday = '';
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
      wakeTime: '07:00',
      sleepTime: '23:00',
      birthday: '',
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

document.documentElement.style.setProperty('--breath-duration', `${state.preferences.breathDuration}s`);

// ─── BIRTHDAY PROMPT ──────────────────────────────

const birthdayPrompt = document.getElementById('birthday-prompt')!;
const birthdayPromptInput = document.getElementById('birthday-input') as HTMLInputElement;
const birthdayConfirm = document.getElementById('birthday-confirm')!;

// Show birthday prompt on first visit if no birthday set
if (!state.preferences.birthday) {
  birthdayPrompt.classList.remove('hidden');
}

birthdayConfirm.addEventListener('click', () => {
  const val = birthdayPromptInput.value;
  if (val) {
    state.preferences.birthday = val;
    saveState(state);
  }
  birthdayPrompt.classList.add('hidden');
});

// ─── SETTINGS UI ───────────────────────────────────

const settingsToggle = document.getElementById('settings-toggle')!;
const settingsOverlay = document.getElementById('settings-overlay')!;
const settingsClose = document.getElementById('settings-close')!;
const breathDurationInput = document.getElementById('breath-duration') as HTMLInputElement;
const breathDurationLabel = document.getElementById('breath-duration-label')!;
const togglePrompts = document.getElementById('toggle-prompts') as HTMLInputElement;
const toggleOuterRings = document.getElementById('toggle-outer-rings') as HTMLInputElement;
const wakeTimeInput = document.getElementById('wake-time') as HTMLInputElement;
const sleepTimeInput = document.getElementById('sleep-time') as HTMLInputElement;
const birthdayInput = document.getElementById('birthday') as HTMLInputElement;

// Initialize UI from state
breathDurationInput.value = String(state.preferences.breathDuration);
breathDurationLabel.textContent = `${state.preferences.breathDuration}s`;
togglePrompts.checked = state.preferences.transitionPrompts;
toggleOuterRings.checked = state.preferences.showOuterRings;
wakeTimeInput.value = state.preferences.wakeTime;
sleepTimeInput.value = state.preferences.sleepTime;
birthdayInput.value = state.preferences.birthday;

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

wakeTimeInput.addEventListener('change', () => {
  state.preferences.wakeTime = wakeTimeInput.value;
  saveState(state);
});

sleepTimeInput.addEventListener('change', () => {
  state.preferences.sleepTime = sleepTimeInput.value;
  saveState(state);
});

birthdayInput.addEventListener('change', () => {
  state.preferences.birthday = birthdayInput.value;
  saveState(state);
});

// ─── SPRINT CONTROL ────────────────────────────────

// CTA button for starting sprint
sprintCta.addEventListener('click', () => {
  if (!state.sprintStartTime) {
    state.sprintStartTime = Date.now();
    saveState(state);
    sprintCta.classList.add('hidden');
  }
});

// Long-press to end sprint early (3 seconds)
let longPressTimer: number | null = null;

const clockContainer = document.getElementById('clock-container')!;

clockContainer.addEventListener('pointerdown', (e) => {
  if (!state.sprintStartTime) return;
  if ((e.target as HTMLElement).id === 'settings-toggle') return;

  longPressTimer = window.setTimeout(() => {
    state.sprintStartTime = null;
    saveState(state);
    sprintCta.classList.remove('hidden');
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

  // Extract birthday in MM-DD format for cycles
  let birthday: string | undefined;
  if (state.preferences.birthday) {
    const parts = state.preferences.birthday.split('-');
    birthday = `${parts[1]}-${parts[2]}`;
  }

  const cycles = getAllCycles(now, state.sprintStartTime, state.preferences.breathDuration, birthday);

  // Auto-end sprint
  if (state.sprintStartTime && !cycles.sprint.active) {
    state.sprintLog.push({
      date: new Date().toISOString().split('T')[0],
      sprintNumber: state.sprintLog.filter(l => l.date === new Date().toISOString().split('T')[0]).length + 1,
      startTime: new Date(state.sprintStartTime).toTimeString().slice(0, 5),
      endTime: new Date().toTimeString().slice(0, 5),
      completed: true,
    });
    state.sprintStartTime = null;
    saveState(state);
    sprintCta.classList.remove('hidden');
  }

  // Show/hide CTA
  if (state.sprintStartTime) {
    sprintCta.classList.add('hidden');
  }

  // Update clock
  clock.update(cycles, state.preferences.showOuterRings, state.preferences.transitionPrompts);

  // Update guidance
  const guidance = getGuidance(cycles, state.preferences.wakeTime, state.preferences.sleepTime);
  guidanceEl.textContent = guidance.message;

  requestAnimationFrame(tick);
}

// Start
tick();
