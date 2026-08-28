import assert from "node:assert/strict";
import { updateTemplateFromDraft, renderTemplate } from "./core.mjs";
// company substituted before first name (company can contain a person's name)
const r = updateTemplateFromDraft({name:"Alex Rivera",firstName:"Alex",company:"Northstar"},
  "Hi Alex, your work at Northstar stood out. — Sasha");
assert.ok(r.template.includes("{company}"),"company tokenized");
assert.ok(r.template.includes("{first}"),"first tokenized");
assert.ok(r.subs.length>=2,"reports substitutions");
// round-trip renders back
assert.equal(renderTemplate(r.template,{firstName:"Alex",company:"Northstar"}), "Hi Alex, your work at Northstar stood out. — Sasha");
console.log("Outreach Radar reverse-substitution: passed");
