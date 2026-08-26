import assert from "node:assert/strict";
import { canonicalPerson } from "../linkedin-icp-prospector/core.mjs";
import { canonicalLinkedInPerson, mergePeople, advanceCommercial } from "../linkedin-outreach-radar/core.mjs";
import { mergeContacts } from "../relationship-hub/core.mjs";
import { envelope, readEnvelope, mergeLedgerRecords, aggregateOutcomes } from "./core.mjs";

// Tool 1: a search creates the first-touch record.
const searchResult = canonicalPerson({
  profileUrn: "urn:li:person:1",
  firstName: "Ada",
  lastName: "Lovelace",
  headline: "Former Founder · Exploring what's next",
  location: "London, UK",
  connectionDegree: "2nd"
}, "post_exit_founders", "former founder sabbatical");
const tool1 = envelope([searchResult], { producer: "icp-prospector" });

// Tool 2: the same person replies on LinkedIn; source attribution survives.
const imported1 = readEnvelope(tool1).records;
const reply = canonicalLinkedInPerson({
  profileUrn: "urn:li:person:1",
  name: "Ada Lovelace",
  conversationUrn: "conversation:1",
  conversation: { verified: true, direction: "theirs", messageCount: 2, lastActivityAt: "2026-08-20T00:00:00Z" }
}, "linkedin_conversation");
const tool2Rows = mergePeople(imported1, [reply]).map(advanceCommercial);
assert.equal(tool2Rows[0].commercial.stage, "replied");
assert.equal(tool2Rows[0].source.searchTerm, "former founder sabbatical");

// Tool 3: Gmail enriches the same named person instead of creating a duplicate.
const email = { name: "Ada Lovelace", email: "ada@example.com", channels: ["email"], emailActivity: { ts: "2026-08-21T00:00:00Z", lastMine: false, thread: [] } };
const hubRows = mergeContacts(tool2Rows, [email]);
assert.equal(hubRows.length, 1);
assert.deepEqual(hubRows[0].channels.sort(), ["email", "linkedin"]);

// Commercial completion flows back to the originating Tool 1 search term.
const completed = mergeLedgerRecords(tool2Rows, [{
  ...tool2Rows[0],
  commercial: { ...tool2Rows[0].commercial, stage: "paid", callAt: "2026-08-22", offerAt: "2026-08-22", paymentAt: "2026-08-23", amountUsd: 555 }
}]);
const feedback = aggregateOutcomes(completed)[0];
assert.equal(feedback.searchTerm, "former founder sabbatical");
assert.equal(feedback.replied, 1);
assert.equal(feedback.calls, 1);
assert.equal(feedback.paid, 1);
assert.equal(feedback.cashUsd, 555);
console.log("Three-tool canonical ledger: end-to-end round trip passed");
