#!/usr/bin/env node

/**
 * NotebookLM Video Regeneration Script
 * Regenerates all 35 pending videos with 90-second constraint
 * 
 * Usage: node scripts/regenerate_videos.js
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Module definitions with specific focus instructions
const MODULES = [
  // Foundational (F01) - 6 remaining (F01E04 already done)
  { code: 'F01E05', title: 'Body Path Defined', focus: 'Focus on what the Body path develops (energy, vitality, physical foundation).' },
  { code: 'F01E06', title: 'Emotions Path Defined', focus: 'Focus on what the Emotions path develops (emotional mastery, regulation).' },
  { code: 'F01E07', title: 'Mind Path Defined', focus: 'Focus on what the Mind path develops (clarity of perception, cognitive development).' },
  { code: 'F01E08', title: 'Genius Path Defined', focus: 'Focus on what the Genius path develops (authentic self-expression, unique gifts).' },
  { code: 'F01E09', title: 'Spirit Path Defined', focus: 'Focus on the three components of Spirit (awareness, sensitivity, character).' },
  { code: 'F01E10', title: 'Balanced Growth', focus: 'Focus on why balanced growth across all paths is optimal.' },
  
  // Spirit (S01) - 10 modules
  { code: 'S01E01', title: 'What is Spirit', focus: 'Explain what Spirit is and why it matters for human development.' },
  { code: 'S01E02', title: 'Noticing Present Moment', focus: 'Focus on the practice of noticing the present moment.' },
  { code: 'S01E03', title: 'Noticing Quality', focus: 'Focus on noticing the quality of experience, not just content.' },
  { code: 'S01E04', title: 'Conscious Breath', focus: 'Focus on conscious breath as a foundational practice.' },
  { code: 'S01E05', title: 'Heart Opening Protocol', focus: 'Explain the Heart Opening Protocol and its benefits.' },
  { code: 'S01E06', title: 'Meta-Awareness', focus: 'Focus on meta-awareness: awareness of awareness itself.' },
  { code: 'S01E07', title: 'Decision Making by Feeling', focus: 'Explain how to make decisions by feeling into them.' },
  { code: 'S01E08', title: 'Intuitive Knowing', focus: 'Focus on developing and trusting intuitive knowing.' },
  { code: 'S01E09', title: 'What Meditation Really Is', focus: 'Explain what meditation really is beyond common misconceptions.' },
  { code: 'S01E10', title: 'States of Consciousness', focus: 'Focus on different states of consciousness and how to access them.' },
  
  // Mind (M01) - 5 modules
  { code: 'M01E01', title: 'What is Mind', focus: 'Explain what Mind is in the context of human development.' },
  { code: 'M01E02', title: 'Stages of Development', focus: 'Focus on the stages of cognitive development (e.g., Spiral Dynamics, Kegan).' },
  { code: 'M01E03', title: 'Recognizing Your Stage', focus: 'Focus on how to recognize your current developmental stage.' },
  { code: 'M01E04', title: 'Growing to the Next Stage', focus: 'Explain how to grow to the next stage of development.' },
  { code: 'M01E05', title: 'Cognitive Distortions', focus: 'Focus on common cognitive distortions and how to recognize them.' },
  
  // Emotions (E01) - 5 modules
  { code: 'E01E01', title: 'What Are Emotions', focus: 'Explain what emotions are and their role in human experience.' },
  { code: 'E01E02', title: 'Emotional Patterns', focus: 'Focus on recognizing recurring emotional patterns.' },
  { code: 'E01E03', title: 'Processing Emotions', focus: 'Explain practical methods for processing emotions.' },
  { code: 'E01E04', title: 'Intense Emotions', focus: 'Focus on working with intense or overwhelming emotions.' },
  { code: 'E01E05', title: 'Emotional Mastery', focus: 'Explain what emotional mastery looks like in practice.' },
  
  // Body (B01) - 3 modules
  { code: 'B01E01', title: 'What is Body', focus: 'Explain what the Body path is and why it's foundational.' },
  { code: 'B01E02', title: 'Body Foundations', focus: 'Focus on the foundational practices for body development.' },
  { code: 'B01E03', title: 'Reading Your Body', focus: 'Explain how to read and listen to your body's signals.' },
  
  // Genius (G01) - 6 modules
  { code: 'G01E01', title: 'What is Genius', focus: 'Explain what Genius is in this framework.' },
  { code: 'G01E02', title: 'Zone of Genius', focus: 'Focus on identifying your Zone of Genius.' },
  { code: 'G01E03', title: 'Genius Offer', focus: 'Explain how to create a unique offer from your genius.' },
  { code: 'G01E04', title: 'Masks We Wear', focus: 'Focus on recognizing the masks we wear that hide our genius.' },
  { code: 'G01E05', title: 'Authentic Expression', focus: 'Explain what authentic expression looks like.' },
  { code: 'G01E06', title: 'Genius Full Expression', focus: 'Focus on full genius expression in the world.' },
];

// Constants
const VISUAL_STYLE_PROMPT = 'Bio-luminescent, iridescent pastel gradients on dark background. Organic, alive, breathing aesthetic. Sacred geometry subtle accents.';
const CONSTRAINT_TEXT = '\n\nCRITICAL CONSTRAINT: Under no circumstances make this video longer than 90 seconds. Keep it concise, focused, and transformational. Educational but inspiring tone.';
const NOTEBOOKLM_URL = 'https://notebooklm.google.com/';
const TRACKER_PATH = path.join(__dirname, '../notebooklm_sources/VIDEO_REGENERATION_90S.md');

// Helper to wait with logging
async function waitFor(ms, message) {
  console.log(`   ⏳ ${message} (${ms}ms)`);
  await new Promise(resolve => setTimeout(resolve, ms));
}

// Update tracker file
async function updateTracker(moduleCode, status, notes = '') {
  try {
    let content = await fs.readFile(TRACKER_PATH, 'utf-8');
    const regex = new RegExp(`(\\| ${moduleCode} \\| )⏸️ Pending( \\|[^|]*\\|)`, 'g');
    content = content.replace(regex, `$1${status}$2`);
    await fs.writeFile(TRACKER_PATH, content, 'utf-8');
  } catch (error) {
    console.error(`   ⚠️  Failed to update tracker: ${error.message}`);
  }
}

// Main regeneration function
async function regenerateVideo(page, module, index, total) {
  const { code, title, focus } = module;
  const fullTitle = `${code} — ${title} — Planetary OS v1.0`;
  
  console.log(`\n[${index}/${total}] Processing ${code}: ${title}`);
  console.log(`   📍 Searching for notebook: "${fullTitle}"`);
  
  try {
    // Navigate to homepage
    await page.goto(NOTEBOOKLM_URL, { waitUntil: 'networkidle' });
    await waitFor(2000, 'Page loaded');
    
    // Find and click the notebook
    const notebookButton = page.locator(`button:has-text("${fullTitle}")`).first();
    if (!(await notebookButton.isVisible())) {
      throw new Error(`Notebook not found: ${fullTitle}`);
    }
    
    await notebookButton.click();
    await waitFor(3000, 'Notebook opened');
    
    // Click "Video Overview" edit button
    console.log('   🎬 Opening Video Overview customize dialog');
    const videoEditButton = page.locator('button:has-text("Customize Video Overview")').first();
    await videoEditButton.waitFor({ state: 'visible', timeout: 10000 });
    await videoEditButton.click();
    await waitFor(2000, 'Customize dialog opened');
    
    // Select "Custom" visual style
    console.log('   🎨 Selecting Custom visual style');
    const customRadio = page.locator('radio[aria-label*="Custom"]').or(
      page.locator('text=Custom').locator('..').locator('input[type="radio"]')
    ).first();
    await customRadio.click();
    await waitFor(1000, 'Custom selected');
    
    // Fill visual style prompt
    console.log('   ✏️  Filling visual style prompt');
    const visualStyleInput = page.locator('textbox:has-text("Describe a custom visual style")').or(
      page.locator('textarea[placeholder*="style"]')
    ).first();
    await visualStyleInput.fill(VISUAL_STYLE_PROMPT);
    await waitFor(500, 'Visual style filled');
    
    // Fill focus instructions
    console.log('   ✏️  Filling focus instructions');
    const focusPrompt = `Focus on the practical transformation message. ${focus}${CONSTRAINT_TEXT}`;
    const focusInput = page.locator('textbox:has-text("What should the AI hosts focus on?")').or(
      page.locator('textarea[placeholder*="focus"]').or(
        page.locator('textarea').nth(1)
      )
    ).first();
    await focusInput.fill(focusPrompt);
    await waitFor(500, 'Focus filled');
    
    // Click Generate
    console.log('   🚀 Clicking Generate');
    const generateButton = page.locator('button:has-text("Generate")').first();
    await generateButton.click();
    await waitFor(2000, 'Generate clicked');
    
    // Update tracker
    await updateTracker(code, '⏳ Regenerating', `Started ${new Date().toLocaleString()}`);
    
    console.log(`   ✅ ${code} regeneration triggered successfully`);
    
    // Navigate back to homepage immediately (don't wait for video generation)
    await page.goto(NOTEBOOKLM_URL, { waitUntil: 'networkidle' });
    await waitFor(1000, 'Back to homepage');
    
  } catch (error) {
    console.error(`   ❌ ERROR processing ${code}: ${error.message}`);
    await updateTracker(code, '❌ Failed', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: `/tmp/${code}_error.png` });
    throw error; // Re-throw to stop execution
  }
}

// Main execution
async function main() {
  console.log('🎬 NotebookLM Video Regeneration Script');
  console.log(`📊 Total modules to process: ${MODULES.length}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);
  
  let browser;
  try {
    // Launch browser (headless can be changed to false for debugging)
    console.log('🌐 Launching browser...');
    browser = await chromium.launch({
      headless: false, // Set to true for background execution
      channel: 'chrome', // Use installed Chrome
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    
    const page = await context.newPage();
    
    // Navigate to NotebookLM and wait for login if needed
    console.log('🔐 Navigating to NotebookLM...');
    await page.goto(NOTEBOOKLM_URL);
    await waitFor(5000, 'Checking login status');
    
    // Check if we're logged in
    const isLoggedIn = await page.locator('text=My notebooks').isVisible().catch(() => false);
    if (!isLoggedIn) {
      console.log('\n⚠️  NOT LOGGED IN!');
      console.log('   Please log in to NotebookLM in the browser window.');
      console.log('   Press Enter when ready to continue...\n');
      // Wait for user to press Enter
      await new Promise(resolve => {
        process.stdin.once('data', resolve);
      });
    }
    
    console.log('✅ Login confirmed\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Process each module
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < MODULES.length; i++) {
      try {
        await regenerateVideo(page, MODULES[i], i + 1, MODULES.length);
        successCount++;
        
        // Progress report every 10 modules
        if ((i + 1) % 10 === 0) {
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`📊 Progress: ${i + 1}/${MODULES.length} completed`);
          console.log(`   ✅ Success: ${successCount}`);
          console.log(`   ❌ Failed: ${failureCount}`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
        
      } catch (error) {
        failureCount++;
        console.log(`\n   ⚠️  Continuing to next module after error...\n`);
        // Continue to next module instead of stopping
        continue;
      }
    }
    
    // Final summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 PHASE 1 COMPLETE!');
    console.log(`⏰ Finished at: ${new Date().toLocaleString()}`);
    console.log(`📊 Final Stats:`);
    console.log(`   Total: ${MODULES.length}`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (successCount > 0) {
      console.log('⏳ Videos will finish generating in ~15-20 minutes.');
      console.log('📥 Next step: Download videos when ready (Phase 2).\n');
    }
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  } finally {
    if (browser) {
      console.log('🔚 Closing browser...');
      await browser.close();
    }
  }
}

// Run the script
main().catch(console.error);
