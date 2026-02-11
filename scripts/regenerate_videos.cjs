#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Module definitions
const MODULES = [
  { code: "F01E05", title: "Body Path Defined", focus: "Focus on what the Body path develops (energy, vitality, physical foundation)." },
  { code: "F01E06", title: "Emotions Path Defined", focus: "Focus on what the Emotions path develops (emotional mastery, regulation)." },
  { code: "F01E07", title: "Mind Path Defined", focus: "Focus on what the Mind path develops (clarity of perception, cognitive development)." },
  { code: "F01E08", title: "Genius Path Defined", focus: "Focus on what the Genius path develops (authentic self-expression, unique gifts)." },
  { code: "F01E09", title: "Spirit Path Defined", focus: "Focus on the three components of Spirit (awareness, sensitivity, character)." },
  { code: "F01E10", title: "Balanced Growth", focus: "Focus on why balanced growth across all paths is optimal." },
  { code: "S01E01", title: "What is Spirit", focus: "Explain what Spirit is and why it matters for human development." },
  { code: "S01E02", title: "Noticing Present Moment", focus: "Focus on the practice of noticing the present moment." },
  { code: "S01E03", title: "Noticing Quality", focus: "Focus on noticing the quality of experience, not just content." },
  { code: "S01E04", title: "Conscious Breath", focus: "Focus on conscious breath as a foundational practice." },
  { code: "S01E05", title: "Heart Opening Protocol", focus: "Explain the Heart Opening Protocol and its benefits." },
  { code: "S01E06", title: "Meta-Awareness", focus: "Focus on meta-awareness: awareness of awareness itself." },
  { code: "S01E07", title: "Decision Making by Feeling", focus: "Explain how to make decisions by feeling into them." },
  { code: "S01E08", title: "Intuitive Knowing", focus: "Focus on developing and trusting intuitive knowing." },
  { code: "S01E09", title: "What Meditation Really Is", focus: "Explain what meditation really is beyond common misconceptions." },
  { code: "S01E10", title: "States of Consciousness", focus: "Focus on different states of consciousness and how to access them." },
  { code: "M01E01", title: "What is Mind", focus: "Explain what Mind is in the context of human development." },
  { code: "M01E02", title: "Stages of Development", focus: "Focus on the stages of cognitive development (e.g., Spiral Dynamics, Kegan)." },
  { code: "M01E03", title: "Recognizing Your Stage", focus: "Focus on how to recognize your current developmental stage." },
  { code: "M01E04", title: "Growing to the Next Stage", focus: "Explain how to grow to the next stage of development." },
  { code: "M01E05", title: "Cognitive Distortions", focus: "Focus on common cognitive distortions and how to recognize them." },
  { code: "E01E01", title: "What Are Emotions", focus: "Explain what emotions are and their role in human experience." },
  { code: "E01E02", title: "Emotional Patterns", focus: "Focus on recognizing recurring emotional patterns." },
  { code: "E01E03", title: "Processing Emotions", focus: "Explain practical methods for processing emotions." },
  { code: "E01E04", title: "Intense Emotions", focus: "Focus on working with intense or overwhelming emotions." },
  { code: "E01E05", title: "Emotional Mastery", focus: "Explain what emotional mastery looks like in practice." },
  { code: "B01E01", title: "What is Body", focus: "Explain what the Body path is and why it's foundational." },
  { code: "B01E02", title: "Body Foundations", focus: "Focus on the foundational practices for body development." },
  { code: "B01E03", title: "Reading Your Body", focus: "Explain how to read and listen to your body's signals." },
  { code: "G01E01", title: "What is Genius", focus: "Explain what Genius is in this framework." },
  { code: "G01E02", title: "Zone of Genius", focus: "Focus on identifying your Zone of Genius." },
  { code: "G01E03", title: "Genius Offer", focus: "Explain how to create a unique offer from your genius." },
  { code: "G01E04", title: "Masks We Wear", focus: "Focus on recognizing the masks we wear that hide our genius." },
  { code: "G01E05", title: "Authentic Expression", focus: "Explain what authentic expression looks like." },
  { code: "G01E06", title: "Genius Full Expression", focus: "Focus on full genius expression in the world." }
];

const VISUAL_STYLE = "Bio-luminescent, iridescent pastel gradients on dark background. Organic, alive, breathing aesthetic. Sacred geometry subtle accents.";
const CONSTRAINT = "\\n\\nCRITICAL CONSTRAINT: Under no circumstances make this video longer than 90 seconds. Keep it concise, focused, and transformational. Educational but inspiring tone.";
const NOTEBOOKLM_URL = "https://notebooklm.google.com/";

async function main() {
  console.log("🎬 NotebookLM Video Regeneration");
  console.log(`📊 Modules: ${MODULES.length}\\n`);
  
  const browser = await chromium.launch({ headless: false, channel: "chrome" });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  await page.goto(NOTEBOOKLM_URL);
  await page.waitForTimeout(5000);
  
  console.log("✅ Browser ready\\n");
  
  for (let i = 0; i < MODULES.length; i++) {
    const mod = MODULES[i];
    const fullTitle = `${mod.code} — ${mod.title} — Planetary OS v1.0`;
    console.log(`[${i+1}/${MODULES.length}] ${mod.code}: ${mod.title}`);
    
    try {
      await page.goto(NOTEBOOKLM_URL, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
      
      const notebook = page.locator(`button:has-text("${fullTitle}")`).first();
      await notebook.click();
      await page.waitForTimeout(3000);
      
      const editBtn = page.locator('button:has-text("Customize Video Overview")').first();
      await editBtn.click();
      await page.waitForTimeout(2000);
      
      const customBtn = page.getByText("Custom").first();
      await customBtn.click();
      await page.waitForTimeout(1000);
      
      const visualInput = page.locator('textarea').first();
      await visualInput.fill(VISUAL_STYLE);
      await page.waitForTimeout(500);
      
      const focusInput = page.locator('textarea').nth(1);
      const focusText = `Focus on the practical transformation message. ${mod.focus}${CONSTRAINT}`;
      await focusInput.fill(focusText);
      await page.waitForTimeout(500);
      
      const generateBtn = page.locator('button:has-text("Generate")').first();
      await generateBtn.click();
      await page.waitForTimeout(2000);
      
      console.log(`   ✅ ${mod.code} triggered\\n`);
      
      if ((i + 1) % 10 === 0) {
        console.log(`\\n━━━ Progress: ${i+1}/${MODULES.length} ━━━\\n`);
      }
    } catch (err) {
      console.log(`   ❌ ERROR: ${err.message}\\n`);
    }
  }
  
  console.log("\\n🎉 ALL DONE!\\n");
  await browser.close();
}

main().catch(console.error);
