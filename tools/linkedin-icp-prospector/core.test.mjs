import assert from "node:assert/strict";
import { canonicalPerson, mergePeople, mondayUtc, scorePerson, weeklyRequestCount } from "./core.mjs";

const founder = { profileUrn: "urn:li:1", firstName: "Ava", lastName: "Stone", headline: "Former Founder · Sabbatical · Exploring what's next", location: "London, UK", connectionDegree: "2nd" };
const scored = scorePerson(founder, "post_exit_founders", "Global");
assert.equal(scored.icpId, "post_exit_founders");
assert.ok(scored.score >= 90, `expected high founder score, got ${scored.score}`);

const recruiter = scorePerson({ headline: "Recruiter and talent acquisition intern", location: "US", connectionDegree: "3rd+" }, "fractional_executives", "Global");
assert.ok(recruiter.score < 40, `expected penalty, got ${recruiter.score}`);

const a = canonicalPerson(founder, "post_exit_founders", "former founder sabbatical");
const b = canonicalPerson({ ...founder, headline: "Ex-founder · next chapter" }, "post_exit_founders", "ex-founder next chapter");
a.commercial.stage = "connected";
assert.equal(mergePeople([a], [b]).length, 1);
assert.equal(mergePeople([a], [b])[0].commercial.stage, "connected");
assert.equal(mergePeople([a], [b])[0].searches.length, 2);

assert.equal(new Date(mondayUtc(Date.UTC(2026, 7, 30))).toISOString(), "2026-08-24T00:00:00.000Z");
assert.equal(weeklyRequestCount([{ queuedAt: "2026-08-24T01:00:00Z", status: "queued" }, { sentAt: "2026-08-20T01:00:00Z", status: "sent" }], Date.UTC(2026, 7, 25)), 1);
console.log("LinkedIn ICP Prospector core: all tests passed");
