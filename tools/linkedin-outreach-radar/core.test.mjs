import assert from "node:assert/strict";
import { advanceCommercial, canonicalLinkedInPerson, conversationState, mergePeople, ownerIdFromConversationUrn, parseCompany, renderTemplate, tabFor } from "./core.mjs";

assert.equal(ownerIdFromConversationUrn("urn:li:msg_conversation:(urn:li:fsd_profile:ABC123,2-xyz)"), "ABC123");
const c = conversationState([{ senderId: "urn:li:fsd_profile:OTHER", createdAt: "2026-08-20T00:00:00Z", text: "Yes" }], "ME", Date.UTC(2026, 7, 25));
assert.equal(c.direction, "theirs"); assert.equal(c.daysAgo, 5);
const imported = canonicalLinkedInPerson({ profileUrn: "u1", name: "Ada Lovelace", score: 88, commercial: { stage: "prospect" } }, "icp_search");
const threaded = canonicalLinkedInPerson({ profileUrn: "u1", name: "Ada Lovelace", conversation: c, conversationUrn: "conv1" }, "conversation");
const merged = mergePeople([imported], [threaded])[0];
assert.equal(merged.score, 88); assert.equal(merged.conversation.direction, "theirs");
assert.equal(advanceCommercial(merged).commercial.stage, "replied");
assert.equal(tabFor(merged, Date.UTC(2026, 7, 25)).owe_reply, true);
assert.equal(parseCompany("Founder at Bright Field · Advisor"), "Bright Field");
assert.equal(parseCompany("Director of Sales"), "");
assert.equal(renderTemplate("Hi {first}[[company:, your work at {company} stood out]]", { firstName: "Ada", company: "Bright Field" }), "Hi Ada, your work at Bright Field stood out");
assert.equal(renderTemplate("Hi {first}[[company:, your work at {company} stood out]]", { firstName: "Ada" }), "Hi Ada");
console.log("LinkedIn Outreach Radar core: all tests passed");
