/**
 * Equilibrium — Main Entry
 * 
 * "Your breath is the clock."
 * 
 * AI-enhanced: fetches energy insights from generate-equilibrium-insight edge function.
 *
 * A living clock that shows WHERE YOU ARE in every cycle,
 * from breath to personal year.
 */

import './style.css';
import { getAllCycles } from './cycles';
import { Clock } from './clock';
import { getGuidance } from './guidance';
import { fetchAIInsight, getFallbackInsight, type AIInsight } from './ai-insight';
import { synthesizeCycles } from './cycles';

// ─── STATE ─────────────────────────────────────────

interface Preferences {
  breathDuration: number;
  transitionPrompts: boolean;
  showOuterRings: boolean;
  wakeTime: string;
  sleepTime: string;
  birthday: string;  // "YYYY-MM-DD" or "" 
}

interface Intention {
  text: string;
  setAt: number;
}

interface Intentions {
  sprint: Intention | null;
  day: Intention | null;
  week: Intention | null;
  moon: Intention | null;
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
  intentions: Intentions;
}

const STORAGE_KEY = 'equilibrium-state';

function loadState(): AppState {
  const defaults: AppState = {
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
    intentions: { sprint: null, day: null, week: null, moon: null },
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      // Merge preferences with defaults (handles missing fields from older versions)
      const prefs = { ...defaults.preferences, ...(parsed.preferences || {}) };
      const intentions = { ...defaults.intentions, ...(parsed.intentions || {}) };

      let sprintStartTime = parsed.sprintStartTime || null;
      if (sprintStartTime) {
        const elapsed = (Date.now() - sprintStartTime) / 60000;
        if (elapsed >= 96) sprintStartTime = null;
      }

      return {
        preferences: prefs,
        sprintStartTime,
        sprintLog: parsed.sprintLog || [],
        intentions,
      };
    }
  } catch (e) {
    console.warn('Failed to load state, using defaults:', e);
  }

  return defaults;
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

// ─── THEME ─────────────────────────────────────────

const THEME_KEY = 'equilibrium-theme';
const themeToggle = document.getElementById('theme-toggle')!;

function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☽' : '☀';
  localStorage.setItem(THEME_KEY, theme);
}

// Load saved theme or default to dark
const savedTheme = (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});
const guidanceEl = document.getElementById('guidance')!;
const activitiesEl = document.getElementById('activities')!;
const sprintCta = document.getElementById('sprint-cta')!;


// ─── AI INSIGHT STATE ─────────────────────────────
let currentAIInsight: AIInsight | null = null;
let aiInsightLoading = false;
let lastInsightKey = '';

async function maybeRefreshAIInsight(cycles: ReturnType<typeof getAllCycles>) {
  const synthesis = synthesizeCycles(cycles);
  const dayEnergy = cycles.week.planetaryDay.energy;
  const moonEnergy = cycles.moon.energy;
  const dominantPhase = synthesis.dominant.id;
  const coherenceLevel = synthesis.coherenceLevel;
  const intentionText = state.intentions.sprint?.text
    || state.intentions.day?.text
    || state.intentions.week?.text
    || state.intentions.moon?.text
    || null;

  const key = `${dayEnergy}|${dominantPhase}`;
  if (key === lastInsightKey && currentAIInsight) return;
  if (aiInsightLoading) return;

  lastInsightKey = key;
  aiInsightLoading = true;

  try {
    currentAIInsight = await fetchAIInsight(dayEnergy, moonEnergy, dominantPhase, coherenceLevel, intentionText);
  } catch {
    currentAIInsight = getFallbackInsight(dominantPhase);
  }
  aiInsightLoading = false;
}

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

// ─── INTENTION INPUTS ──────────────────────────────

const intentionDayInput = document.getElementById('intention-day') as HTMLInputElement;
const intentionWeekInput = document.getElementById('intention-week') as HTMLInputElement;
const intentionMoonInput = document.getElementById('intention-moon') as HTMLInputElement;

// Load from state
intentionDayInput.value = state.intentions.day?.text || '';
intentionWeekInput.value = state.intentions.week?.text || '';
intentionMoonInput.value = state.intentions.moon?.text || '';

intentionDayInput.addEventListener('change', () => {
  const val = intentionDayInput.value.trim();
  state.intentions.day = val ? { text: val, setAt: Date.now() } : null;
  saveState(state);
});

intentionWeekInput.addEventListener('change', () => {
  const val = intentionWeekInput.value.trim();
  state.intentions.week = val ? { text: val, setAt: Date.now() } : null;
  saveState(state);
});

intentionMoonInput.addEventListener('change', () => {
  const val = intentionMoonInput.value.trim();
  state.intentions.moon = val ? { text: val, setAt: Date.now() } : null;
  saveState(state);
});

// ─── SPRINT CONTROL ────────────────────────────────

// Sprint entry overlay
const sprintEntry = document.getElementById('sprint-entry')!;
const sprintIntentionInput = document.getElementById('sprint-intention-input') as HTMLInputElement;
const sprintBegin = document.getElementById('sprint-begin')!;
const sprintSkip = document.getElementById('sprint-skip')!;
const phaseBar = document.getElementById('phase-bar')!;
const phaseSegments = phaseBar.querySelectorAll('.phase-segment');

function startSprint(intention: string) {
  state.sprintStartTime = Date.now();
  if (intention.trim()) {
    state.intentions.sprint = { text: intention.trim(), setAt: Date.now() };
  } else {
    state.intentions.sprint = null;
  }
  saveState(state);
  sprintCta.classList.add('hidden');
  sprintEntry.classList.add('hidden');
  sprintIntentionInput.value = '';
}

// CTA button opens the sprint entry overlay
sprintCta.addEventListener('click', () => {
  if (!state.sprintStartTime) {
    sprintEntry.classList.remove('hidden');
    sprintIntentionInput.focus();
  }
});

// Insight → Intention: tapping insight also opens sprint entry
guidanceEl.style.cursor = 'pointer';
activitiesEl.style.cursor = 'pointer';
guidanceEl.addEventListener('click', () => {
  if (!state.sprintStartTime) {
    sprintEntry.classList.remove('hidden');
    sprintIntentionInput.focus();
  }
});
activitiesEl.addEventListener('click', () => {
  if (!state.sprintStartTime) {
    sprintEntry.classList.remove('hidden');
    sprintIntentionInput.focus();
  }
});

// BEGIN starts the sprint with the intention
sprintBegin.addEventListener('click', () => {
  startSprint(sprintIntentionInput.value);
});

// Skip starts without intention
sprintSkip.addEventListener('click', () => {
  startSprint('');
});

// Enter key in the input acts as BEGIN
sprintIntentionInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    startSprint(sprintIntentionInput.value);
  } else if (e.key === 'Escape') {
    sprintEntry.classList.add('hidden');
  }
});

// Long-press to end sprint early (3 seconds)
let longPressTimer: number | null = null;

const clockContainer = document.getElementById('clock-container')!;

// Hold-to-exit feedback element
const holdFeedback = document.createElement('div');
holdFeedback.id = 'hold-feedback';
holdFeedback.textContent = 'Hold to exit sprint';
clockContainer.appendChild(holdFeedback);

clockContainer.addEventListener('pointerdown', (e) => {
  if (!state.sprintStartTime) return;
  if ((e.target as HTMLElement).id === 'settings-toggle') return;

  holdFeedback.classList.add('visible');

  longPressTimer = window.setTimeout(() => {
    state.sprintStartTime = null;
    saveState(state);
    sprintCta.classList.remove('hidden');
    holdFeedback.classList.remove('visible');
  }, 3000);
});

clockContainer.addEventListener('pointerup', () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  holdFeedback.classList.remove('visible');
});

clockContainer.addEventListener('pointerleave', () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  holdFeedback.classList.remove('visible');
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
    state.intentions.sprint = null; // Clear sprint intention on end
    saveState(state);
    sprintCta.classList.remove('hidden');
  }

  // Show/hide CTA
  if (state.sprintStartTime) {
    sprintCta.classList.add('hidden');
  }

  // Update clock
  const today = new Date().toISOString().split('T')[0];
  const todaySprintCount = state.sprintLog.filter(l => l.date === today).length;
  clock.update(cycles, state.preferences.showOuterRings, state.preferences.transitionPrompts, todaySprintCount);

  // Update phase bar (show during sprint)
  if (cycles.sprint.active) {
    phaseBar.classList.remove('hidden');
    const pulseNum = cycles.sprint.pulse.pulseNumber;
    const currentPhase = cycles.sprint.pulse.phase;
    phaseSegments.forEach((seg, i) => {
      const segPulse = i + 1;
      seg.classList.remove('active', 'completed');
      if (segPulse < pulseNum || (segPulse === pulseNum && currentPhase === 'exit')) {
        seg.classList.add('completed');
      } else if (segPulse === pulseNum) {
        seg.classList.add('active');
      }
    });
  } else {
    phaseBar.classList.add('hidden');
  }

  // Update guidance with intention hierarchy + AI insight
  const guidance = getGuidance(cycles, state.preferences.wakeTime, state.preferences.sleepTime);

  if (!cycles.sprint.active) {
    // Trigger AI insight refresh (async, non-blocking)
    maybeRefreshAIInsight(cycles);

    const intentionText = state.intentions.sprint?.text
      || state.intentions.day?.text
      || state.intentions.week?.text
      || state.intentions.moon?.text
      || null;

    if (currentAIInsight) {
      guidanceEl.textContent = intentionText
        ? `"${intentionText}" · ${currentAIInsight.insight}`
        : currentAIInsight.insight;
      activitiesEl.textContent = currentAIInsight.activities.join(' · ');
      activitiesEl.style.display = '';
    } else {
      guidanceEl.textContent = intentionText
        ? `"${intentionText}"`
        : guidance.message;
      activitiesEl.style.display = 'none';
    }
  } else {
    activitiesEl.style.display = 'none';
    // In sprint: show intention + time remaining
    if (state.intentions.sprint?.text) {
      const sprintRemaining = Math.ceil(96 - (Date.now() - state.sprintStartTime!) / 60000);
      guidanceEl.textContent = `"${state.intentions.sprint.text}" · ${sprintRemaining}m left`;
      guidanceEl.style.display = '';
    }
  }

  requestAnimationFrame(tick);
}

// Start
tick();
