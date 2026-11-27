# Cluster: METROLOGY & CALIBRATION (control cluster; dossier, 2026-11-27)
Reading: "tested" = measured/calibrated. Sources opened via web_fetch/curl unless marked (search excerpt). Grades: A measured/large data, B credible case data with numbers, C anecdote/reputation.

---

## 1. BIPM / SI — the International Prototype Kilogram (IPK) and the 2019 redefinition
**Header.** BIPM (Sèvres), CGPM/CIPM/CCM; IPK 1889–2019; NIST/NPL/PTB Kibble & XRCD teams. Control exemplar: the top etalon itself drifted, and the fix was to stop trusting any single artifact. https://en.wikipedia.org/wiki/International_Prototype_of_the_Kilogram

| layer | what it catches | who/what runs it | when |
|---|---|---|---|
| Definition by 7 fixed constants | artifact drift (nothing to drift) | CGPM 2018 Res. 1 | since 20 May 2019 |
| Independent realizations (Kibble, XRCD) | method-specific bias | NMIs | continuous |
| Key comparison CCM.M-K8 | disagreement between realizations | CCM/BIPM | ~biennial |
| Consensus value (CV-kg) | one lab's error leaking into world scale | CCM task group | updated after each KC |
| Periodic verification (pre-2019) | national copies drifting vs IPK | BIPM | 1889, 1948, 1989 only |

**Q1** Pre-2019: national copies compared to IPK "roughly every 40 years"; only three verifications (Wikipedia IPK). **Q2** Only NMIs with primary realizations; others receive traceability (https://www.bipm.org/documents/20126/70306189/TRACEABILITY.pdf). **Q3** Results as offsets + uncertainty (K20 = 1 kg − 39 µg in 1889) (Wikipedia IPK). **Q4** Redefinition gated on rehearsal: ≥3 experiments ≤5×10⁻⁸, one ≤2×10⁻⁸, Kibble and Avogadro reconciled (https://en.wikipedia.org/wiki/2019_revision_of_the_SI). **Q5** Not addressed (cleaning experiments probed artifact sensitivity, Wikipedia IPK). **Q6** Unanimous CGPM vote 16 Nov 2018 after criteria met (2019 revision). **Q7** Ongoing key comparisons; CV adjustments: 2026 CV = 1 kg − 12 µg vs old IPK scale (https://www.bipm.org/documents/20126/286252479/Calculation%2Bof%2Bthe%2BConsensus%2BValue%2B2026/c8f356c3-d209-e847-4177-15ec5a1b53bc). **Q8** Third verification (1988–92) showed ensemble "slowly but inexorably diverging"; IPK ~50 µg vs copies per century; cause never found (Wikipedia IPK). **Q9** Definition moved from object to constants; "numerical values of the seven defining constants have no uncertainty" (https://www.bipm.org/en/measurement-units/si-defining-constants). **Q10** Relative-only comparison cannot detect common-mode drift: "possibility that all the prototypes gained mass" (Wikipedia IPK).

**Best practices.** (1) Replace the artifact with an invariant + written recipe any lab can realize. Grade A (KC data). Driver: removes single point of truth. (2) Consensus of independent methods, not one champion lab (https://www.bipm.org/documents/20126/276573591/Guide-to-CV-kg/613194d5-9024-185a-cedd-72fdb8de2c6a). Grade A. Driver: error averaging + disagreement detection. (3) Damped updates: 2026 adjustment capped at −5 µg (methodology said −8) "to maintain an acceptable stability" (https://www.bipm.org/documents/d/guest/cgpm-2026-ccm-report). Grade B.

**Failures/criticism.** 130 years of a reference that "by definition" had zero error while drifting; realizations still disagree, hence the CV workaround (Guide to CV-kg). Foster (CSIRO 2010) critique of SI formalism (2019 revision page).

**Quotes.** "The kilogram is in need of a new definition because the mass of the prototype is known to vary by several parts in 10⁸ over periods of time of the order of a month" (CGPM 2003, via Wikipedia IPK). "dissemination of the kilogram would proceed through an average of measurements… rather than from any one individually" (Guide to CV-kg).

---

## 2. Metrological traceability chain (VIM 2.39–2.43, 5.1–5.7)
**Header.** JCGM (BIPM, ISO, ILAC, OIML…), VIM3 2008/2012. Iconic: the grammar of "tested against an etalon." https://jcgm.bipm.org/vim/en/2.41.html

| layer | catches | who | when |
|---|---|---|---|
| Definition of unit / primary standard | conceptual reference | CGPM / NMI | rare |
| Secondary / reference standard | drift of lab's top standard | NMI or accredited lab | per interval |
| Working (check) standard | drift of routine instruments | lab | routine |
| Measuring instrument | product error | user | every measurement |

**Q1** Etalon = "realization of the definition of a given quantity, with stated quantity value and associated measurement uncertainty, used as a reference" (https://jcgm.bipm.org/vim/en/5.1.html). **Q2** Primary = by primary procedure or "artifact, chosen by convention" (IPK the example) (5.4); secondary calibrated against primary (5.5); working standard used routinely, aka "check standard" (5.7). **Q3** Each link reports value + uncertainty (2.41). **Q4** Not addressed. **Q5** Not addressed. **Q6** A result is acceptable only if the chain is documented and unbroken (2.41); in CIPM MRA, uncertainty must be "evaluated for each calibration in the hierarchy" (BIPM traceability leaflet). **Q7** Note 3: reference must carry "the time at which this reference was used" (2.41). **Q8** Not addressed. **Q9** Comparison between standards counts as calibration when used "to check and, if necessary, correct" a standard (2.40 Note 4). **Q10** Calibration ≠ adjustment ("often mistakenly called 'self-calibration'") ≠ verification (2.39 Note 2).

**Best practices.** (1) Uncertainty budget propagated per link; "uncertainty necessarily increases along the sequence" (https://jcgm.bipm.org/vim/en/2.40.html). Grade C (definitional). Driver: honest error accounting. (2) Time-stamped references. Grade C. Driver: enables impact analysis when a reference later proves wrong.

**Failures/criticism.** A "NIST number" is not evidence of traceability (NIST GMP 13, search excerpt: https://www.nist.gov/document/gmp-13-ensuring-traceability-20190621pdf). *Judgment:* the chain guarantees comparability, not truth: if the top is wrong (IPK), every link inherits it.

**Quotes.** "documented unbroken chain of calibrations, each contributing to the measurement uncertainty" (2.41). "Measurement uncertainty necessarily increases along the sequence of calibrations" (2.40).

---

## 3. Calibration intervals and drift — ILAC-G24 / OIML D10:2022
**Header.** ILAC + OIML joint guide, 2007 → 2022 edition. Iconic for "how often to re-check the checker." https://www.oiml.org/en/files/pdf_d/d010-e22.pdf

| layer | catches | who | when |
|---|---|---|---|
| Initial interval from risk assessment | expected drift/wear | lab | on acquisition |
| Intermediate checks (§4.9) | failure between calibrations | lab | between calibrations |
| Interval review methods 1–5 | interval too long/short | lab | each calibration |
| Historical records (§4.8) | trends, group issues | lab | ongoing |

**Q1** Initial interval "based mainly on a risk assessment": drift, instability, adjustments, history (§5.1). **Q2** Lab; external cal by accredited/NMI providers (§4.4). **Q3** As-found deviation vs % of maximum permissible error (§6.2). **Q4** "New measuring equipment should be calibrated more frequently to identify any trend" (§5.1). **Q5** Not addressed. **Q6** Check results "within predetermined limits prior to approving the measuring equipment for further use" (§4.10). **Q7** In-service / "black-box" checks of key parameters, daily or more (Method 4). **Q8** Overlong intervals risk "withdrawing large numbers of reported measurement results" (§6.2). **Q9** Calibration results retained "as the historical data… basis of future decisions" (§4.8). **Q10** Interval in hours of use, not calendar, for wear-driven items (Method 3).

**Best practices.** (1) Staircase: extend interval if within limits, shorten if not (§6.2). Grade C (Table 1 rates reliability "medium", effort "low"). Driver: feedback control on observed drift. (2) Control-chart method: plot calibration points vs time, compute drift, derive interval; reliability "high", effort "high" (§6.3, Table 1). Grade B. (3) "Fixed recalibration intervals are not recommended" unless mandated (§5.1). Grade C.

**Failures/criticism.** Delta Mu: staircase "rather arbitrary… rule of the 80% is not justified and the measurement uncertainty is not considered" (http://www.smart-metrology.com/wp-content/uploads/2014/10/Delta-Mu-Presentation-and-comparison-between-two-guidelines-for-the-determination-of-calibration-intervals-of-measuring-instruments.pdf). G24 itself: "no universally applicable single best practice" (§4.6).

**Quotes.** "fixed recalibration intervals are not recommended unless the interval has been specified in a normative document" (§5.1). "It would be inappropriate to set an extremely long recalibration interval using this method" (§6.2).

---

## 4. ISO/IEC 17025:2017 — lab competence, proficiency testing, interlaboratory comparison
**Header.** ISO/CASCO; 3rd ed. 2017; enforced via ILAC accreditation bodies; ILAC-P9:01/2024 for PT. Iconic: how a lab proves *itself* trustworthy. https://www.iso.org/standard/66912.html (text read: https://phld.anamai.moph.go.th/th/official-certification/download?did=25092&id=77922&lang=th&mid=24444&mkey=m_document)

| layer | catches | who | when |
|---|---|---|---|
| Impartiality (4.1) | commercial pressure on results | management | continuous |
| Equipment program, labels (6.4.7–6.4.8) | out-of-cal use | lab | continuous |
| Internal validity monitoring (7.7.1 a–k) | drift, operator error | lab | planned |
| PT / ILC (7.7.2) | lab-wide bias invisible internally | external provider (ISO 17043) | per PT plan |
| Nonconforming work (7.10) | bad results already issued | lab | on detection |
| Accreditation assessment | system failure | accreditation body | periodic |

**Q1** Monitoring "planned and reviewed": reference materials, check standards with control charts, replicates, blind samples (7.7.1). **Q2** Lab staff internally; peer labs externally; AB assesses the PT plan "before granting accreditation" (https://ilac.org/?ddownload=3259). **Q3** Results outside "pre-defined criteria" → action "to prevent incorrect results from being reported" (7.7.3). **Q4** Not addressed (method validation 7.2.2 is closest). **Q5** Blind samples (7.7.1 k); method robustness by varying controlled parameters (7.2.2 Note 2). **Q6** "results shall be reviewed and authorized prior to release" (7.8.1.1); documented decision rule with false accept/reject risk (7.1.3, 7.8.6). **Q7** PT plan; ANAB: full scope in a "four-year PT/ILC plan" (https://blog.ansi.org/anab/ensuring-validity-of-results-iso-iec-17025). **Q8** 7.10.1: halt work, withhold reports, "impact analysis on previous results", recall; corrective action if it could recur (7.10.3). **Q9** Monitoring data "used to control and, if applicable, improve" (7.7.3); AB checks "prompt and appropriate corrective actions" after unsatisfactory PT (ILAC-P9). **Q10** Out-of-spec equipment must be taken out of service and its past effect examined (6.4.9).

**Best practices.** (1) PT: same item measured by many labs vs pre-set criteria. Grade B (practitioner/regulator use; no effect size fetched). Driver: external reference exposes shared blind spots. (2) Impact analysis on previous results + recall (7.10.1c,e). Grade C. Driver: closes the loop backward in time. (3) Risk-based PT level/frequency (ILAC-P9 Annex). Grade C.

**Failures/criticism.** z-score alone can pass a biased result; ζ-score + uncertainty recommended (Accred Qual Assur 2022, search excerpt: https://doi.org/10.1007/s00769-022-01496-w). PT "does not necessarily indicate continued performance" (VLAC, search excerpt).

**Quotes.** "appropriate action shall be taken to prevent incorrect results from being reported" (7.7.3). "an evaluation is made of the significance of the nonconforming work, including an impact analysis on previous results" (7.10.1 c).

---

## 5. Measurement System Analysis (AIAG MSA-4, gage R&R)
**Header.** AIAG (Chrysler, Ford, GM), 1990 → 4th ed. 2010; required in PPAP/IATF 16949. Iconic: test the test before trusting its verdicts. https://rubymetrology.com/add_help_doc/MSA_Reference_Manual_4th_Edition.pdf

| layer | catches | who | when |
|---|---|---|---|
| Discrimination ("Rule of Tens") | gage too coarse | engineer | gage selection |
| Bias / linearity | systematic offset | engineer vs master | qualification |
| Stability (drift) study | change in bias over time | control chart on master | ongoing |
| Gage R&R | equipment vs appraiser vs part variation | ~3 operators × parts × trials | qualification, after change |
| ndc | can it distinguish parts? | statistic | with GRR |

**Q1** Three issues: adequate sensitivity, stability, consistency (MSA-4 Ch. I). **Q2** Multiple appraisers expose reproducibility (operator) error equipment-only cal misses (MSA-4). **Q3** %GRR <10% acceptable; 10–30% may be acceptable, "should be approved by the customer"; >30% unacceptable; ndc ≥5 (MSA-4 Table II-D 1). **Q4** Not addressed. **Q5** Not addressed. **Q6** Gage approval criteria above, but "threshold criteria alone is NOT an acceptable practice" (MSA-4 p.78). **Q7** Stability = "change in bias over time"; causes incl. "Worn or damaged master, error in master" (MSA-4 Ch. III). **Q8** Out-of-control or nonconformance: "the first thing that should be done is to evaluate the measurement system" (MSA-4 p.78). **Q9** Ford requires %GRR reported vs both study variation and tolerance (search excerpt: https://www.iatfglobaloversight.org/wp/wp-content/uploads/2024/10/Ford_Specifics_for_PPAP.pdf). **Q10** Separates *calibrated* (traceable) from *capable* (discriminates for this use).

**Best practices.** (1) Crossed GRR study decomposing variance. Grade B (industry-wide mandatory use; no effect study fetched). Driver: attributes noise to source. (2) Rule of Tens: resolution ≥1/10 of tolerance. Grade C. (3) Suspect the gage first on alarms. Grade C. Driver: avoids "fixing" a good process.

**Failures/criticism.** Manual's own warning: thresholds "can drive the wrong behavior… eliminating real life sources of variation… or manipulating the measurement study" (MSA-4 p.78). %GRR ratios criticized; Minitab presents Wheeler's EMP as alternative (https://support.minitab.com/en-us/minitab/help-and-how-to/quality-and-process-improvement/measurement-system-analysis/supporting-topics/gage-r-r-and-wheeler-s-emp-studies/is-my-measurement-system-acceptable).

**Quotes.** "As the quality of the data improves, the quality of decisions improves" (search excerpt: https://www.aiag.org/training-and-resources/manuals/details/MSA-4). "The use of the GRR guidelines as threshold criteria alone is NOT an acceptable practice" (MSA-4).

---

## 6. NEGATIVE — Hubble primary mirror, 1990: the test instrument was wrong
**Header.** NASA / Perkin-Elmer; mirror figured ~1981; launched 1990; Allen Board (Lew Allen, JPL), report Nov 1990; fix COSTAR/WFPC2 1993. Best-documented case of a trusted etalon (reflective null corrector, RNC) misassembled. https://ntrs.nasa.gov/citations/19910003124

| layer | what it should have caught | who | when |
|---|---|---|---|
| RNC (sole figuring + acceptance test) | mirror shape | Perkin-Elmer | figuring |
| Inverse null corrector | RNC error | Perkin-Elmer | alignment |
| Refractive null corrector | vertex radius / aberration | Perkin-Elmer | 1981 |
| NASA QA oversight | single-instrument reliance | NASA | program |
| On-orbit imaging | everything | astronomers | weeks after launch |

**Q1** Mirror verified only against RNC: "complete reliance on the reflective null corrector as the only test" (Allen abstract, NTRS). **Q2** Board measured the preserved RNC: lens 1.3 mm misplaced; mirror edge ~2200 nm too flat (NTRS; https://en.wikipedia.org/wiki/Hubble_Space_Telescope). **Q3** Contrary readings "discounted at the time as being themselves flawed" (NTRS). **Q4** No end-to-end optical test; "simple tests to protect against major error were considered and rejected" (NTRS). **Q5** Not done. **Q6** Single test = gate; cost/schedule pressure "inhibited consideration of independent tests" (NTRS). **Q7** Found by images "within weeks of the launch" (Wikipedia HST). **Q8** Board with fault-tree analysis, halted once cause confirmed (https://ntrs.nasa.gov/api/citations/19920008654/downloads/19920008654.pdf). **Q9** Lessons: cross-check independent instruments; "Cross checking… would have shown discrepancies too large to ignore" (ORA conclusion in same SRM&QA report). **Q10** Error was precise and stable, so correctable by inverse-error optics (Wikipedia HST).

**Best practice (the remedy).** Independent cross-check of the etalon with a different principle. Grade B (case data: 1.3 mm explains aberration "in detail"). Driver: common-mode error cannot fool two methods.

**Failures/criticism.** "No verification of the reflective null corrector's dimensions was carried out… after the original assembly" (NTRS). NASA criticized for "relying totally on test results from a single instrument" (Wikipedia HST). Parallel: Mars Climate Orbiter 1999, lbf·s vs N·s against the interface spec; navigators' concerns dismissed for not following the form (https://en.wikipedia.org/wiki/Mars_Climate_Orbiter).

**Quotes.** "This methodology should have alerted NASA management to the fragility of the process and the possibility of gross error" (NTRS abstract). "The defendant was allowed to be the jury at its own trial" (search excerpt: https://iopscience.iop.org/book/mono/978-0-7503-2038-2/chapter/bk978-0-7503-2038-2ch1.pdf).

---

## Cluster patterns
- **Testing against an etalon = comparison with a stated value AND its uncertainty, recorded with time.** A verdict without the reference's uncertainty and date is not a measurement (VIM 5.1, 2.41 Note 3). *Judgment:* for QA, a check is only as meaningful as the declared tolerance and version of what it checks against.
- **Etalons nest; trust flows down, error accumulates down.** Primary → secondary/reference → working → instrument, each link documented, each adding uncertainty (VIM 2.40–2.41, 5.4–5.7). Candidate invariant: every test oracle should name its parent reference.
- **The etalon itself is checked by comparison with peers or an independent principle, never by itself.** IPK vs copies, Kibble vs XRCD, PT across labs, inverse null vs RNC. Hubble is the negative: one instrument checked itself. Candidate invariant: ≥2 independent methods on the critical path.
- **Relative comparison cannot see common-mode drift.** IPK and copies may all have gained mass; only an invariant outside the ensemble fixed it. *Judgment:* agreement among agents trained alike is not validation.
- **Update the etalon deliberately and damped.** Redefinition gated on numeric criteria; consensus value updated per key comparison, capped for stability (CCM 2026). Candidate practice: version the oracle, change it on evidence with pre-set acceptance criteria, publish offsets.
- **Re-check interval is adaptive, driven by as-found data.** Staircase/control charts; new instruments checked more often; fixed intervals discouraged (ILAC-G24). Recurring practice.
- **When a reference is found bad, look backward.** Take it out of service, impact-analyze prior results, recall (17025 6.4.9, 7.10). Candidate invariant: a failed oracle triggers re-evaluation of what it passed.
- **Qualify the measuring system for its use, not just its calibration.** Gage R&R, discrimination, ndc (MSA-4); suspect the gage first on alarms.
- **Discounting contrary evidence from a "less precise" instrument is the signature failure** (Hubble; MCO dismissed concerns). Candidate practice: a disagreeing check is escalated, never auto-dismissed.
- **Thresholds get gamed.** MSA-4 warns fixed GRR thresholds drive manipulation; G24 staircase called arbitrary. *Judgment:* gates need judgment plus the data behind them.
