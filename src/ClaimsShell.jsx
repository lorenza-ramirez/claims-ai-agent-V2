import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  ShieldPlus, Lightbulb, Calendar, Wrench, BookOpen, ChevronDown, ChevronsDownUp, Bell, Search, Mic, Sparkles,
  Settings, CircleHelp, Users, Ban, Repeat1, Circle, CircleCheck, UserPlus, Split, FilePlus, ListX,
  X, Command, Info, SearchX, Plus, ClipboardCheck, FileText, Pencil, ShieldCheck, ArrowUp, MailOpen, Wallet, CircleSlash, FileX, Gavel, RefreshCw, LayoutGrid, Trash2, Pause, Play, Zap, Clock, ArrowLeft, ThumbsUp, ThumbsDown, ExternalLink, Check, CircleAlert, ListChecks, HeartPulse, Code, Home, MessageSquare, ListFilter, ArrowUpDown, Plug, MoreHorizontal, Send, Stethoscope, Mail, ChevronLeft, ChevronRight, ArrowRight,
} from "lucide-react";

/* ============================================================
   AIR: App shell, side navigation, Claims container
   Step 1 of the assignment project. No claim rows yet.
   All data is synthetic. No patient information is used.
   ============================================================ */

/* ---------- Data ---------- */

const NAV = [
  { id: "ehr", label: "EHR", icon: ShieldPlus, items: ["Calendar", "Patients", "Inbox", "Preferences", "Interventions", "Orders"].map((l) => ({ l })) },
  { id: "insights", label: "Insights", icon: Lightbulb, items: [
    { l: "Overview" }, { l: "Dashboards", dot: "peach" }, { l: "Performance Analysis" }, { l: "Revenue Analysis" },
    { l: "Denials Analysis" }, { l: "A/R Report", dot: "blue" }, { l: "EHR Reports" }, { l: "My Reports" }, { l: "AI Report Builder", dot: "peach" },
  ] },
  { id: "daily", label: "Daily Operations", icon: Calendar, items: [
    { l: "Onboarding" }, { l: "Appointments (New)", dot: "peach" }, { l: "Prior Authorizations" }, { l: "Call Center" },
    { l: "Agents Center" }, { l: "Claims", page: "claims" }, { l: "Claim Details" }, { l: "Remittances", dot: "peach" }, { l: "Patient Responsibility" },
  ] },
  { id: "utilities", label: "Utilities", icon: Wrench, items: ["Posting Tool", "EOB Creation", "Remittances (Old)"].map((l) => ({ l })) },
  { id: "admin", label: "Admin Panel", icon: BookOpen, items: [{ l: "Practice Data" }] },
];

/* ---------- Synthetic data (no real people) ---------- */

const ME = "lr";
const MY_PER_GROUP = 3; /* how many claims in each group are yours (the first group gets 6) */
const AGENTS = [
  { id: "hv", name: "Hana Verdi", init: "HV", color: "green", kind: "person" },
  { id: "ta", name: "Tomas Alder", init: "TA", color: "teal", kind: "person" },
  { id: "tb", name: "Tess Boone", init: "TB", color: "orange", kind: "person" },
  { id: "wm", name: "Wes Marlow", init: "WM", color: "red", kind: "person" },
  { id: "ab", name: "Aria Bell", init: "AB", color: "cyan", kind: "person" },
  { id: "cd", name: "Cleo Dunn", init: "CD", color: "pink", kind: "person" },
  { id: "ef", name: "Eli Ford", init: "EF", color: "purple", kind: "person" },
  { id: "lr", name: "Lena Rowe (you)", init: "LR", color: "blue", kind: "person" },
  { id: "q1", name: "Intake Tech", init: "IT", color: "lilac", kind: "queue" },
  { id: "q2", name: "Posting Tech", init: "PT", color: "indigo", kind: "queue" },
  { id: "q3", name: "Appeals Tech", init: "AT", color: "lime", kind: "queue" },
  { id: "q4", name: "Rejections Tech", init: "RT", color: "mint", kind: "queue" },
];
const AGENT = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

/* Group names, chips, amounts and counts come from the product screenshot of Nov 23, 2026.
   Tag colors follow that screenshot: gray = neutral, blue = Decision Pending, red = denials, rejections and errors, orange = partial denials and balances.
   Chips given as an array render as one overlapping set (adjustment and remark codes). */
const STATUS = {
  "Payment Posting": { icon: FilePlus, tone: "neutral", row: "Payment Posting" },
  "Decision Pending": { icon: Split, tone: "info", row: "Decision Pending" },
  "Unsubmitted": { icon: MailOpen, tone: "neutral", row: "Unsubmitted" },
  "Rejections": { icon: ListX, tone: "danger", row: "Rejections" },
  "Full Denials": { icon: Ban, tone: "danger", row: "Full Denial" },
  "Unresolved Balances": { icon: Wallet, tone: "orange", row: "Unresolved Balance" },
  "Partial Denials": { icon: CircleSlash, tone: "orange", row: "Partial Denial" },
  "Submission Errors": { icon: FileX, tone: "danger", row: "Submission Error" },
  "Packet Pending": { icon: Gavel, tone: "info", row: "Packet Pending" },
  "Decision Inconclusive": { icon: RefreshCw, tone: "info", row: "Decision Inconclusive" },
};
const EOB = "Upload EOB: Payer sends EOB by mail";
const GROUPS = [
  { key: "g1", status: "Payment Posting", chips: ["Awaiting Deposit Verification"], amount: 1303908.41, count: "8,470" },
  { key: "g2", status: "Decision Pending", chips: ["TOM FOWLER LAW (INVOICE)", EOB, "EMAIL"], amount: 312346.24, count: "510", payer: "TOM FOWLER LAW (INVOICE)" },
  { key: "g3", status: "Unsubmitted", chips: ["Unsupported by Clearinghouse"], amount: 294885.53, count: "1,230" },
  { key: "g4", status: "Rejections", chips: ["WELLCARE HEALTH PLAN SIMPLE MA", "Acknowledgement/Rejected for Invalid Information - The claim/encounter has invalid information as specified by the payer"], amount: 36011.0, count: "162", payer: "WELLCARE HEALTH PLAN SIMPLE MA" },
  { key: "g5", status: "Decision Pending", chips: ["ST AMBROSE UNIVERSITY IN CLINIC (EPS)", EOB, "EMAIL"], amount: 27085.12, count: "205", payer: "ST AMBROSE UNIVERSITY IN CLINIC (EPS)" },
  { key: "g6", status: "Full Denials", chips: ["UNITED MEDICAL RESOURCES", "Documentation", ["CO45", "PI252"], "M127"], amount: 22480.44, count: "107", payer: "UNITED MEDICAL RESOURCES" },
  { key: "g7", status: "Unresolved Balances", chips: [], amount: 17932.49, count: "102" },
  { key: "g8", status: "Decision Pending", chips: ["PEPPING BALK KINCAID & OLSON LTD (INVOICE)", EOB, "EMAIL"], amount: 17703.5, count: "3", payer: "PEPPING BALK KINCAID & OLSON LTD (INVOICE)" },
  { key: "g9", status: "Decision Pending", chips: ["UNITED MEDICAL RESOURCES", "No decision information available, pending manual investigation", "WAYSTAR"], amount: 16513.22, count: "101", payer: "UNITED MEDICAL RESOURCES" },
  { key: "g10", status: "Full Denials", chips: ["IOWA BLUE SHIELD", "Prior Auth", ["CO197", "CO45"]], amount: 15379.0, count: "53", payer: "IOWA BLUE SHIELD" },
  { key: "g11", status: "Decision Pending", chips: ["WC-ONE CALL PT", EOB, "WAYSTAR"], amount: 15106.0, count: "42", payer: "WC-ONE CALL PT" },
  { key: "g12", status: "Decision Pending", chips: ["WAUKEE COMMUNITY SCHOOL DISTRICT (EPS)", EOB, "EMAIL"], amount: 12450.0, count: "83", payer: "WAUKEE COMMUNITY SCHOOL DISTRICT (EPS)" },
  { key: "g13", status: "Partial Denials", chips: ["HARVARD PILGRIM HEALTH CARE - HMO", "Contractual Adjustment", ["CO273", "CO45"]], amount: 12408.51, count: "130", payer: "HARVARD PILGRIM HEALTH CARE - HMO" },
  { key: "g14", status: "Decision Pending", chips: ["KURT NIERMANN (INVOICE)", EOB, "EMAIL"], amount: 11630.0, count: "1", payer: "KURT NIERMANN (INVOICE)" },
  { key: "g15", status: "Submission Errors", chips: ["This straight Medicare claim is on hold because the date of service was within the past six weeks. Please review the claim."], amount: 11254.0, count: "43", payer: "MEDICARE PART B" },
  { key: "g16", status: "Decision Pending", chips: ["RAYMOND MUSCATINE INC (EPS)", EOB, "EMAIL"], amount: 11110.0, count: "83", payer: "RAYMOND MUSCATINE INC (EPS)" },
  { key: "g17", status: "Full Denials", chips: ["WELLMARK BLUE CROSS BLUE SHIELD OF IOWA", "Diagnosis Code", "CO16", "M76"], amount: 10975.0, count: "38", payer: "WELLMARK BLUE CROSS BLUE SHIELD OF IOWA" },
  { key: "g18", status: "Full Denials", chips: ["IOWA BLUE SHIELD", "Bundled", "PR59"], amount: 10928.0, count: "41", payer: "IOWA BLUE SHIELD" },
  { key: "g19", status: "Rejections", chips: ["WELLCARE HEALTH PLAN SIMPLE MA", "Acknowledgement/Rejected for Invalid Information - The claim/encounter has invalid information as specified by the payer"], amount: 9743.0, count: "46", payer: "WELLCARE HEALTH PLAN SIMPLE MA" },
  { key: "g20", status: "Decision Pending", chips: ["IOWA BLUE SHIELD", EOB, "WAYSTAR"], amount: 9485.0, count: "30", payer: "IOWA BLUE SHIELD" },
  { key: "g21", status: "Full Denials", chips: ["ILLINOIS BLUE SHIELD", ["Patient Coverage", "Wrong Payer"], "CO109", "N418"], amount: 9411.0, count: "36", payer: "ILLINOIS BLUE SHIELD" },
  { key: "g22", status: "Decision Pending", chips: ["NF-STATE FARM AUTO", EOB, "WAYSTAR"], amount: 9203.0, count: "36", payer: "NF-STATE FARM AUTO" },
  { key: "g23", status: "Decision Pending", chips: ["BLACK & JONES ATTORNEYS (INVOICE)", EOB, "EMAIL"], amount: 9103.0, count: "1", payer: "BLACK & JONES ATTORNEYS (INVOICE)" },
  { key: "g24", status: "Packet Pending", chips: ["Medical Record Packet"], amount: 9101.28, count: "37" },
  { key: "g25", status: "Payment Posting", chips: ["Awaiting Automatic Posting"], amount: 9078.94, count: "79" },
  { key: "g26", status: "Decision Pending", chips: ["UNITED HEALTHCARE MA", "No decision information available, pending manual investigation", "WAYSTAR"], amount: 8716.0, count: "40", payer: "UNITED HEALTHCARE MA" },
  { key: "g27", status: "Decision Inconclusive", chips: ["TENNESSEE BLUE SHIELD", "Payment details missing from EOB", "WAYSTAR"], amount: 8522.92, count: "35", payer: "TENNESSEE BLUE SHIELD" },
  { key: "g28", status: "Full Denials", chips: ["IOWA BLUE SHIELD", "Coordination of Benefits", ["PR22", "PR59"]], amount: 8481.0, count: "30", payer: "IOWA BLUE SHIELD" },
  { key: "g29", status: "Full Denials", chips: ["WELLMARK BLUE CROSS BLUE SHIELD OF IOWA", "Prior Auth", "CO198"], amount: 8397.0, count: "33", payer: "WELLMARK BLUE CROSS BLUE SHIELD OF IOWA" },
  { key: "g30", status: "Decision Pending", chips: ["NESTLE (EPS)", EOB, "EMAIL"], amount: 8366.0, count: "33", payer: "NESTLE (EPS)" },
  { key: "g31", status: "Full Denials", chips: ["IOWA BLUE SHIELD", "Prior Auth", ["PR197", "PR59"]], amount: 8330.0, count: "32", payer: "IOWA BLUE SHIELD" },
  { key: "g32", status: "Full Denials", chips: ["IOWA BLUE SHIELD", "Diagnosis Code", "CO16", "M76"], amount: 7888.0, count: "29", payer: "IOWA BLUE SHIELD" },
  { key: "g33", status: "Decision Pending", chips: ["UNITED MEDICAL RESOURCES", "Update Portal Access: Configure 2FA for Athelas", "WAYSTAR"], amount: 7796.0, count: "36", payer: "UNITED MEDICAL RESOURCES" },
];
const FN = ["Marcus", "Elena", "Jonah", "Priya", "Tobias", "Imani", "Callum", "Noor", "Rafael", "Greta", "Dmitri", "Lucia", "Owen", "Mei", "Silas", "Farah", "Anders", "Zoe", "Mateo", "Ingrid"];
const LN = ["Ashworth", "Bellamy", "Castellano", "Duarte", "Eskridge", "Fairbanks", "Galloway", "Hargrove", "Iverson", "Jaramillo", "Kessler", "Lindqvist", "Marchetti", "Nakagawa", "Okafor", "Pemberton", "Quintero", "Rasmussen", "Sandoval", "Thackeray"];
const PROVIDERS = ["Noel Tanaka", "Ruth Calloway", "Ibrahim Sayed", "Petra Lindholm", "Gavin Ortiz", "Dana Whitcomb", "Hugo Brandt", "Selene Park"];
const PAYERS = ["MEDICARE PART B", "NORTHGATE MEDICAID", "SUMMIT HEALTH PLAN", "CASCADE MUTUAL", "BLUEFIELD PPO", "HARBOR CARE MA", "RIVERSTONE HMO"];
const TODAY = new Date(2026, 10, 23);

/* ---------- Agents ---------- */
/* The claim detail panel opens from the agent page only. Set to true to also open it from the Claims page. */
const CLAIMS_PANEL = false;
/* Only Medicare Agent is seeded, from the brief. Payer groups for the rule are an assumption. */
const PAYER_GROUPS = ["Medicare", "Medicaid", "Commercial"];
const payerGroup = (payer) => (payer.startsWith("MEDICARE") ? "Medicare" : payer.includes("MEDICAID") ? "Medicaid" : "Commercial");
const SEED_AGENTS = [
  {
    id: "medicare", name: "Medicare Agent", init: "MA", icon: "medicare",
    description: "Works Medicare claims as a first pass.",
    instructions: [
      "Work Medicare claims as a first pass. Never send, post or appeal on your own. Leave every result for review.",
      "If a claim is stuck in recon, check the Medicare portal and report what it shows.",
      "If it is a denial, suggest how to fix it and name the policy or contract term you used.",
      "If it needs COB, draft the secondary claim using the Medicaid SOP.",
      "If it needs posting, suggest a posting.",
      "If you are unsure, return the claim with a short reason.",
    ].join("\n"),
    context: ["Medicare payer policies", "Medicare contract", "Medicaid secondary claims SOP", "Medicare portal guide", "Appeals guide"],
    rule: { payer: "Medicare", on: true },
    chats: [],
  },
  {
    id: "coding", name: "Coding Agent", init: "CA", icon: "coding",
    description: "Checks the codes on denied and rejected claims and suggests the fix.",
    instructions: [
      "Check the diagnosis and procedure codes on denied and rejected claims as a first pass. Never send, post or appeal on your own. Leave every result for review.",
      "Look for code pairs that conflict (Excludes1), symptom codes that are part of a diagnosis, and a 7th character that does not fit the visit.",
      "Suggest the corrected codes and the diagnosis pointer for each line.",
      "If you are unsure, return the claim with a short reason.",
    ].join("\n"),
    context: ["ICD-10 coding guidelines", "CPT coding guidelines", "Payer policies", "Appeals guide"],
    rule: null,
    chats: [],
  },
  {
    id: "eligibility", name: "Eligibility Agent", init: "EA", icon: "eligibility",
    description: "Checks coverage on the payer portal before a claim moves on.",
    instructions: [
      "Check coverage on the payer portal before a claim moves on. Never send, post or appeal on your own. Leave every result for review.",
      "Confirm the plan was active on the date of service and that the member ID matches.",
      "If coverage ended or another payer is primary, say which payer and suggest the change.",
      "If you are unsure, return the claim with a short reason.",
    ].join("\n"),
    context: ["Payer portal guides", "Eligibility checklist", "Coordination of benefits rules"],
    rule: null,
    chats: [],
  },
  {
    id: "posting", name: "Posting Agent", init: "PA", icon: "posting",
    description: "Matches payments to claims and suggests the posting.",
    instructions: [
      "Match payments to claims and suggest the posting. Never post on your own. Leave every result for review.",
      "Check the remittance total against the deposit before you suggest a posting.",
      "If a posting would leave a negative balance, flag it for review.",
      "If you are unsure, return the claim with a short reason.",
    ].join("\n"),
    context: ["Contract and fee schedule", "Remittance posting SOP", "Deposit verification guide"],
    rule: null,
    chats: [],
  },
];
/* ---------- Agents menu pages: Skills, Documents, Chats (example content) ---------- */
/* The catalog: skills, connectors and plugins for the agent platform. scope: you = created by you, org = installed (P0 and P1), discover = available to add (P2) */
const sk = (name, cat, desc, agents, d, scope = "org", extra = {}) => ({ id: name, name, cat, desc, agents, d, scope, icon: FileText, ...extra });
const SK = (name, cat, pri, eff, tier, appr, desc, users, owner, metric, agents, note) => sk(name, cat, desc, agents, pri === "P0" ? 2 : pri === "P1" ? 4 : 0, pri === "P2" ? "discover" : "org", { pri, eff, tier, appr, users, owner, metric, note });
const cn = (name, cat, desc, icon, connected, d, scope = "org") => ({ id: name, name, cat, desc, icon, connected, d, scope });
const pl = (name, cat, desc, skills, connectors, d, scope = "org") => ({ id: name, name, cat, desc, skills, connectors, d, scope, icon: LayoutGrid });
const CAT_ORDER = ["Engineering patterns", "Operations", "Revenue cycle", "Healthcare integration", "Compliance and security", "Business", "Meta"];
const TIER_TEXT = { T0: "Public or non-sensitive content", T1: "Internal confidential, no patient data", T2: "Tokenized or de-identified data", T3: "PHI at runtime, tokenized by the data gateway" };
const APPR_TEXT = { A0: "No approval needed", A1: "A human reviews the output", A2: "A human approves before any external effect", A3: "Two people approve" };
const EXT = {
  skills: [
    sk("weekly-billing-review", "Revenue cycle", "Your weekly review of denied claims and the Monday update to the billing team.", "all", 14, "you"),
  SK("integration-engine-scaffold", "Engineering patterns", "P0", "M", "T1", "A3", "Use when adding or changing an interface in the Integration Engine, before writing connector code.", "Integration engineers", "Integration Engine tech lead", "Time from interface spec to first green contract test", [], ""),
  SK("temporal-workflow-patterns", "Engineering patterns", "P0", "M", "T1", "A3", "Use when writing, reviewing or debugging a Temporal workflow or activity.", "Backend and platform engineers", "Platform lead", "Share of workflow PRs with replay tests", [], ""),
  SK("service-auth-patterns", "Engineering patterns", "P1", "M", "T1", "A3", "Use when adding authentication, service-to-service auth, token handling or SMART and OAuth flows.", "Backend engineers", "Security engineering", "Auth findings per release", [], ""),
  SK("design-system-ui", "Engineering patterns", "P1", "M", "T1", "A1", "Use when building or changing user interfaces.", "Frontend engineers, designers", "Design systems lead", "Component adoption and accessibility defects", [], ""),
  SK("db-query-performance", "Engineering patterns", "P1", "S", "T1", "A3", "Use when writing or tuning SQL or ORM queries, indexes or migrations on large tables.", "Backend engineers", "Backend lead", "Slow query count", [], "Extends the existing SQLAlchemy skill"),
  SK("ci-flake-debugging", "Engineering patterns", "P1", "M", "T1", "A2", "Use when a test or pipeline fails intermittently.", "Engineers", "Developer experience lead", "Flake rate", [], "Partly overlaps the PR babysitting skill"),
  SK("incident-triage", "Operations", "P0", "M", "T2", "A2", "Use when an alert fires or an incident is declared and a first assessment is needed.", "On-call engineers, incident commanders", "SRE lead", "Time to first useful triage note", [], "Uses the incident.io connector"),
  SK("observability-queries", "Operations", "P0", "M", "T2", "A2", "Use when you need metrics, logs, traces or errors for a service.", "Engineers, SRE, RCM operations analysts", "SRE or observability lead", "Questions answered by library queries", [], "Uses aws-context; partly overlaps the claim metrics skill"),
  SK("release-safety-check", "Operations", "P1", "M", "T2", "A3", "Use when a production deploy is about to happen or has just happened.", "Engineers, release managers", "SRE or release manager", "Change failure rate", [], ""),
  SK("incident-postmortem", "Operations", "P1", "S", "T2", "A1", "Use when an incident is over and a blameless post-mortem is needed.", "SRE, incident commanders", "SRE lead", "Post-mortems published within 5 business days", [], "Extends the existing on-call post-mortem skill"),
  SK("claim-pipeline-health", "Operations", "P1", "S", "T2", "A0", "Use when claim submission, remittance or status metrics degrade.", "RCM platform engineers", "RCM platform lead", "Time to root cause", [], "Generalizes the claim submission metrics skill"),
  SK("runbook-lookup", "Operations", "P2", "S", "T1", "A2", "Use when an alert has a documented runbook.", "On-call engineers", "SRE", "Runbook coverage of alerts", [], ""),
  SK("rcm-denial-analysis", "Revenue cycle", "P0", "M", "T2", "A1", "Use when asked why claims are denied or which denials are preventable.", "RCM analysts, revenue integrity leads", "RCM analytics lead", "Share of recommendations adopted", ["coding"], ""),
  SK("rcm-appeal-letter", "Revenue cycle", "P0", "M", "T3", "A2", "Use when a denied or underpaid claim needs an appeal letter for a payer and denial reason.", "Appeals specialists, billing staff", "RCM appeals lead", "Drafts accepted with minor edits", ["medicare"], "Replaces ks-mo-appeal-letters"),
  SK("rcm-eligibility-check", "Revenue cycle", "P0", "M", "T3", "A2", "Use when coverage must be verified before a visit or claim, or after an eligibility rejection.", "Registration staff, RCM analysts", "RCM operations lead", "Checks returning a usable result", ["medicare", "eligibility"], ""),
  SK("rcm-claim-status", "Revenue cycle", "P0", "M", "T3", "A2", "Use when you need the current status of a submitted claim and the next action.", "Billers, AR team", "RCM operations lead", "Status checks resolved without follow-up", ["medicare"], ""),
  SK("rcm-eob-parse", "Revenue cycle", "P0", "L", "T3", "A1", "Use when a remittance (835, PDF or paper EOB) must become structured payment data.", "Posting team, integration engineers", "Payment posting lead", "Field accuracy and balanced totals", ["posting"], ""),
  SK("rcm-payment-posting", "Revenue cycle", "P1", "L", "T3", "A3", "Use when a parsed remittance must be matched to claims and posted.", "Posting team", "Payment posting lead with finance", "Auto-match rate", ["posting"], ""),
  SK("rcm-prior-auth", "Revenue cycle", "P1", "L", "T3", "A2", "Use when a service may need prior authorization.", "Authorization staff", "Prior auth product owner", "Turnaround time", ["eligibility"], "Overlaps the existing priced prior auth agent"),
  SK("rcm-ar-followup", "Revenue cycle", "P1", "L", "T3", "A2", "Use when working aged accounts receivable.", "AR team", "AR operations lead", "Dollars collected against a control group", [], ""),
  SK("rcm-coding-check", "Revenue cycle", "P2", "M", "T3", "A2", "Use when diagnosis or procedure codes or modifiers need a check.", "Coders", "Coding lead", "Coding denial rate", ["coding"], ""),
  SK("rcm-underpayment-review", "Revenue cycle", "P2", "M", "T3", "A1", "Use when a paid amount might differ from the contracted rate.", "Revenue integrity", "Revenue integrity lead", "Dollars recovered", [], ""),
  SK("rcm-timely-filing-watch", "Revenue cycle", "P2", "S", "T2", "A0", "Use when claims approach payer filing or appeal deadlines.", "RCM operations", "RCM operations lead", "Claims lost to timely filing", [], ""),
  SK("payer-policy-monitor", "Revenue cycle", "P2", "M", "T0", "A1", "Use when a payer policy, bulletin or fee schedule changes.", "Payer reference owners", "Payer reference owners", "Age of payer references", [], ""),
  SK("x12-edi-handling", "Healthcare integration", "P0", "M", "T3", "A2", "Use when you need to read, validate, build or troubleshoot X12 healthcare transactions.", "Integration engineers, RCM analysts", "Integration engineering lead", "Rejections diagnosed to a segment and element", ["eligibility", "posting"], ""),
  SK("fhir-resource-mapping", "Healthcare integration", "P0", "M", "T3", "A3", "Use when mapping data to FHIR resources or building and debugging FHIR APIs.", "Integration and EHR engineers", "Interoperability lead", "Mapping PRs passing the validator first time", [], ""),
  SK("hl7v2-message-handling", "Healthcare integration", "P1", "M", "T3", "A2", "Use when parsing, building or debugging HL7 v2 messages and interface mappings.", "Integration engineers", "Integration lead", "Time to diagnose interface errors", [], ""),
  SK("emr-integration-notes", "Healthcare integration", "P1", "M", "T1", "A1", "Use when integrating with a specific EMR or practice management system.", "Integration and implementation engineers", "A named owner per EMR", "Integrations with an EMR note", [], ""),
  SK("terminology-mapping", "Healthcare integration", "P2", "M", "T1", "A1", "Use when mapping between code systems (ICD-10, SNOMED CT, LOINC, RxNorm, CPT).", "Clinical informatics, engineers", "Clinical informatics", "Mapping accuracy on a reviewed sample", ["coding"], ""),
  SK("phi-deidentification", "Compliance and security", "P0", "M", "T3", "A2", "Use when data that may contain PHI must be shared, logged, prompted, analyzed or turned into examples.", "All engineers, analysts, support", "Privacy and security lead", "Recall on a labeled synthetic PHI set", [], ""),
  SK("hipaa-data-handling", "Compliance and security", "P0", "S", "T1", "A1", "Use when a task involves storing, moving, accessing or sharing patient data.", "Engineers, support, product, legal", "Compliance and privacy officer", "Answers reviewers agree with", [], ""),
  SK("synthetic-phi-generator", "Compliance and security", "P0", "M", "T0", "A0", "Use when you need realistic but fake patients, claims or messages.", "All engineers, analysts, sales engineers", "Security engineering", "Skills with synthetic eval sets", [], ""),
  SK("pentest-triage", "Compliance and security", "P1", "M", "T1", "A1", "Use when pentest, scanner or bug-bounty findings arrive.", "Security engineers", "Security engineering", "Time to triage", [], ""),
  SK("vendor-baa-check", "Compliance and security", "P1", "S", "T1", "A3", "Use when adding a vendor, connector or egress destination.", "Security, compliance", "Compliance with security", "Time to vendor decision", [], ""),
  SK("audit-evidence-collection", "Compliance and security", "P2", "M", "T2", "A0", "Use when preparing evidence for HIPAA, SOC 2 or customer audits.", "Compliance", "Compliance", "Audit preparation hours saved", [], ""),
  SK("implementation-scoping", "Business", "P1", "M", "T1", "A1", "Use when a customer or prospect needs scope, timeline and effort.", "Implementation leads, sales engineers", "Implementation lead", "Actual against scoped effort", [], "Builds on the Sales function skill"),
  SK("sow-drafting", "Business", "P1", "M", "T1", "A3", "Use when drafting an SOW from an approved scope.", "Sales, legal operations", "Legal operations with sales operations", "Legal review cycles per SOW", [], "Extends the Sales and Employment legal skills"),
  SK("pricing-quote", "Business", "P1", "M", "T1", "A3", "Use when producing a price quote or proposal.", "Sales, finance", "Sales operations with finance", "Quote turnaround and pricing errors", [], "Builds on the Sales function skill"),
  SK("roi-business-case", "Business", "P2", "M", "T1", "A1", "Use when building an ROI case for a prospect.", "Sales, finance", "Finance with sales operations", "Reviewer edits", [], ""),
  SK("skill-curator", "Meta", "P0", "M", "T1", "A3", "Use when someone proposes, edits, merges or retires a skill.", "Skill authors, the skill council", "Platform lead", "Skills passing lint first time", [], ""),
  SK("approval-request-writer", "Meta", "P0", "S", "T2", "A2", "Use when an agent needs a human to approve an action with external effect.", "All agents, approvers", "Agent platform product owner", "Approver time to decision", [], ""),
  SK("skill-eval-runner", "Meta", "P1", "M", "T1", "A1", "Use when a skill or model changes, before a release.", "Skill authors", "Platform", "Regressions caught before release", [], ""),
  SK("skill-usage-failure-report", "Meta", "P1", "M", "T2", "A0", "Use when reviewing how skills perform: use, failures and human edits.", "Platform team, skill owners", "Platform", "Failures with a logged root cause", [], ""),
  ],
  connectors: [
    cn("clearinghouse", "Revenue cycle", "Eligibility, claim status, claims and remittances over X12 (270/271, 276/277, 837, 835).", Send, true, 3),
    cn("payer-portals", "Revenue cycle", "Claim status, coverage and plan details on the payer portals.", ShieldCheck, true, 3),
    cn("analytics-warehouse", "Revenue cycle", "Read-only aggregated claims and remittance data for analysis.", LayoutGrid, true, 4),
    cn("ocr-service", "Revenue cycle", "Reads scanned paper EOBs. Images stay inside the PHI boundary.", FileText, false, 0, "discover"),
    cn("data-gateway", "Compliance and security", "Tokenized access to patient data. Re-identifies only after an approval is recorded.", ShieldCheck, true, 2),
    cn("policy-library", "Compliance and security", "Internal HIPAA and security policies for the privacy skills to cite.", FileText, true, 5),
    cn("vendor-registry", "Compliance and security", "Vendors, BAA status, subprocessors and approved egress destinations.", ListChecks, true, 5),
    cn("ticketing", "Compliance and security", "Security findings and follow-up tickets.", ClipboardCheck, false, 8),
    cn("ehr-air", "Healthcare integration", "Reads encounters, charts and patient details from the AIR EHR.", Stethoscope, true, 3),
    cn("emr-sandboxes", "Healthcare integration", "Test environments for third-party EMRs.", Stethoscope, false, 0, "discover"),
    cn("fhir-sandbox", "Healthcare integration", "A FHIR server with synthetic data for mapping and validation.", Plug, true, 6),
    cn("terminology-service", "Healthcare integration", "Licensed code system lookups (ICD-10, SNOMED CT, LOINC, RxNorm, CPT).", Search, false, 0, "discover"),
    cn("git-and-ci", "Engineering patterns", "Branches, pull requests and CI results. Work happens in branches only.", Code, true, 3),
    cn("temporal-sandbox", "Engineering patterns", "A Temporal dev server for replay and time-skipping tests.", RefreshCw, true, 6),
    cn("integration-engine-sandbox", "Engineering patterns", "Sandbox endpoints of the Integration Engine. No production credentials.", Plug, true, 6),
    cn("figma", "Engineering patterns", "Design files and design system tokens (read only).", LayoutGrid, false, 0, "discover"),
    cn("incident-io", "Operations", "Alerts, incidents and status updates.", Zap, true, 3),
    cn("aws-context", "Operations", "Cloud resources and configuration context for investigations.", Search, true, 3),
    cn("observability-stack", "Operations", "Metrics, logs, traces and errors through a PHI-safe query library.", Search, true, 4),
    cn("deploy-history", "Operations", "Deploys, config changes and rollbacks.", Clock, true, 5),
    cn("slack", "Operations", "Alerts when an agent has results ready for review.", MessageSquare, true, 6),
    cn("chattermill", "Business", "Customer feedback themes and trends.", MessageSquare, true, 7),
    cn("carta", "Business", "Cap table and equity records (restricted).", Wallet, true, 9),
    cn("price-book", "Business", "The approved price book and discount authority.", Wallet, false, 8),
    cn("approval-service", "Meta", "Creates approval requests and returns the recorded decision.", ListChecks, true, 2),
    cn("telemetry-store", "Meta", "Skill use, failures and human edits, with tokens only.", LayoutGrid, true, 2),
    cn("eval-harness", "Meta", "Runs synthetic eval sets and compares versions.", ListChecks, false, 0, "discover"),
  ],
  plugins: [
    pl("my-monday-routine", "Revenue cycle", "Your Monday review with an alert in Slack.", ["weekly-billing-review"], ["slack"], 10, "you"),
    pl("rcm-appeals-bundle", "Revenue cycle", "Find why claims are denied, check their status and draft appeals.", ["rcm-denial-analysis", "rcm-appeal-letter", "rcm-claim-status", "rcm-timely-filing-watch"], ["clearinghouse", "payer-portals", "data-gateway"], 2),
    pl("rcm-front-end-bundle", "Revenue cycle", "Verify coverage and handle prior authorization before care.", ["rcm-eligibility-check", "rcm-prior-auth", "x12-edi-handling"], ["clearinghouse", "payer-portals", "data-gateway"], 3),
    pl("rcm-payments-bundle", "Revenue cycle", "Parse remittances, post payments and chase accounts receivable.", ["rcm-eob-parse", "rcm-payment-posting", "rcm-ar-followup", "rcm-underpayment-review"], ["clearinghouse", "analytics-warehouse", "data-gateway"], 3),
    pl("integration-builder-bundle", "Healthcare integration", "Build and check integrations across X12, HL7 v2, FHIR and EMRs.", ["integration-engine-scaffold", "x12-edi-handling", "hl7v2-message-handling", "fhir-resource-mapping", "emr-integration-notes", "synthetic-phi-generator"], ["integration-engine-sandbox", "fhir-sandbox", "git-and-ci"], 4),
    pl("engineering-patterns-bundle", "Engineering patterns", "Workflow, auth, database, CI and UI patterns for engineers.", ["temporal-workflow-patterns", "service-auth-patterns", "db-query-performance", "ci-flake-debugging", "design-system-ui"], ["git-and-ci", "temporal-sandbox"], 4),
    pl("on-call-bundle", "Operations", "Triage alerts, query health, check releases and write post-mortems.", ["incident-triage", "observability-queries", "runbook-lookup", "release-safety-check", "incident-postmortem", "claim-pipeline-health"], ["incident-io", "aws-context", "observability-stack", "deploy-history", "slack"], 3),
    pl("hipaa-guardrails-bundle", "Compliance and security", "Handle patient data safely and review vendors, findings and audits.", ["phi-deidentification", "hipaa-data-handling", "vendor-baa-check", "synthetic-phi-generator", "pentest-triage"], ["data-gateway", "policy-library", "vendor-registry", "ticketing"], 2),
    pl("sales-engineering-bundle", "Business", "Scope implementations, draft SOWs, quote prices and build ROI cases.", ["implementation-scoping", "sow-drafting", "pricing-quote", "roi-business-case"], ["price-book", "chattermill"], 6),
    pl("skill-governance-bundle", "Meta", "Review, test and measure skills, and write clear approval requests.", ["skill-curator", "skill-eval-runner", "skill-usage-failure-report", "approval-request-writer"], ["approval-service", "telemetry-store", "git-and-ci"], 2),
    pl("coding-quality-bundle", "Revenue cycle", "Check codes and keep payer references current.", ["rcm-coding-check", "terminology-mapping", "payer-policy-monitor", "audit-evidence-collection"], ["terminology-service", "policy-library"], 0, "discover"),
  ],
};
const SEED_CHATS = [
  { id: "c1", name: "Why was claim 24410231 denied?", agentId: "coding", msgs: [
    { from: "you", text: "Why was claim 24410231 denied?" },
    { from: "agent", text: "Wellmark denied all four lines under CO-16 with remark M76. The diagnosis list has R42 next to H81.22, and those two conflict (Excludes1). Remove R42 and the claim should go through. I left the fix for your review in My Claims." },
  ] },
  { id: "c2", name: "Medicare portal checks this week", agentId: "medicare", msgs: [
    { from: "you", text: "How many Medicare claims did you check this week?" },
    { from: "agent", text: "I checked 16 Medicare claims on the portal. 4 are ready for your review and the rest are still running." },
  ] },
  { id: "c3", name: "Deposits that do not match", agentId: "posting", msgs: [
    { from: "you", text: "Which payments did not match their deposit?" },
    { from: "agent", text: "Two remittances from last week did not match. Both were short by the same $40, so I flagged them instead of posting." },
  ] },
];
const CHAT_REPLY = "Got it. I will look into that and come back with what I find.";

const AGENT_ICONS = { medicare: HeartPulse, coding: Code, eligibility: ShieldCheck, posting: Wallet };
const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "AG";
const toAssignee = (a) => ({ id: a.id, name: a.name, init: a.init, color: "agent", kind: "agent" });
const GROUP_BY_KEY = Object.fromEntries(GROUPS.map((g) => [g.key, g]));
const REVIEWER = "Lena Rowe";
const WORK_LABEL = { working: "Agent working", ready: "Ready for review" };
const PROPOSAL_TITLE = { "Portal check": "Proposed action", "Denial fix": "Suggested fix", "Secondary claim draft": "Draft secondary claim", "Posting suggestion": "Suggested posting" };
const isCode = (x) => /^[A-Z]{1,2}\d+$/.test(x);

/* Assumed mapping from a claim to the agent's four ways of working. Replace with the real rules. */
function workType(c) {
  const chips = GROUP_BY_KEY[c.group].chips.flat().join(" ");
  if (/Coordination of Benefits/i.test(chips)) return "Secondary claim draft";
  if (c.status === "Payment Posting") return "Posting suggestion";
  if (["Full Denials", "Partial Denials", "Rejections"].includes(c.status)) return "Denial fix";
  return "Portal check";
}
function buildResult(c, type) {
  const flat = GROUP_BY_KEY[c.group].chips.flat();
  const codes = flat.filter(isCode).join(", ") || "none listed";
  const reason = flat.find((x, i) => i > 0 && !isCode(x) && x !== EOB) || "see the remittance";
  const balance = money(c.amount * 0.2);
  if (type === "Secondary claim draft") return {
    finding: `Medicare paid as primary. The patient has Medicaid as secondary, so the remaining balance of ${balance} can go to Medicaid.`,
    proposal: `Secondary claim to NORTHGATE MEDICAID. Billed amount ${balance}. Attach the Medicare remittance. Date of service ${c.dos}.`,
    sources: ["Medicaid secondary claims SOP", "Medicare contract"],
  };
  if (type === "Denial fix") return {
    finding: `Denial reason: ${reason}. Codes: ${codes}.`,
    proposal: `Correct the claim for "${reason}" and resubmit. If the denial stands, appeal using the appeals guide.`,
    sources: ["Medicare payer policies", "Appeals guide"],
  };
  if (type === "Posting suggestion") return {
    finding: `A payment of ${money(c.amount)} matches claim ${c.id} by amount and date.`,
    proposal: `Post ${money(c.amount)} to claim ${c.id}. Write off the contractual adjustment. Patient balance after posting: $0.00.`,
    sources: ["Medicare contract"],
  };
  return {
    finding: `The Medicare portal lists claim ${c.id} as received and on hold. The hold clears six weeks after the date of service (${c.dos}).`,
    proposal: "Check the portal again in 3 days. No change to the claim is needed.",
    sources: ["Medicare portal guide", "Medicare payer policies"],
  };
}
const newWork = (c, agentId, readyAt) => ({ agentId, type: workType(c), state: "working", readyAt, finding: "", proposal: "", sources: [], edited: false, reviewer: null, reviewedAt: null, chat: [] });

/* Assigns claims to a person, a queue or an agent. Assigning to an agent starts a piece of work on each claim. */
function doAssign(claims, ids, assigneeId, o = {}) {
  const { auto = false, agentIds = [], now = Date.now(), instant = 0, backdate = false, reason = "Assigned by a person" } = o;
  const toAgent = !!assigneeId && agentIds.includes(assigneeId);
  const events = []; let k = 0;
  const next = claims.map((c) => {
    if (!ids.includes(c.id)) return c;
    let work = null;
    if (toAgent) {
      const i = k++;
      work = newWork(c, assigneeId, i < instant ? 0 : now + 3000 + (i - instant) * 1200);
      const t0 = backdate ? now - (90 + i * 47) * 1000 : now;
      events.push({ id: c.id + "-a-" + t0, agentId: assigneeId, claimId: c.id, t: t0, text: reason });
      events.push({ id: c.id + "-s-" + t0, agentId: assigneeId, claimId: c.id, t: t0 + 1000, text: "Started " + work.type.toLowerCase() });
    }
    return { ...c, assignee: assigneeId, auto: toAgent ? auto : false, work };
  });
  return { claims: next, events };
}
/* Moves work from "Agent working" to "Ready for review" once its time is up. */
function advance(claims, now, backdate = false, paused = null) {
  const events = []; let n = 0, changed = false;
  const next = claims.map((c) => {
    const w = c.work;
    if (!w || w.state !== "working" || w.readyAt > now || (paused && paused.has(w.agentId))) return c;
    changed = true;
    const t = backdate && w.readyAt === 0 ? now - (60 + n * 47) * 1000 : now; n++;
    events.push({ id: c.id + "-r-" + t, agentId: w.agentId, claimId: c.id, t, text: "Finished " + w.type.toLowerCase() + ". Ready for review." });
    return { ...c, work: { ...w, state: "ready", ...buildResult(c, w.type) } };
  });
  return { claims: changed ? next : claims, events, changed };
}
function seedState() {
  const now = Date.now();
  const base = makeClaims();
  const ids = base.filter((c) => payerGroup(c.payer) === "Medicare").map((c) => c.id);
  const a = doAssign(base, ids, "medicare", { auto: true, agentIds: ["medicare"], now, instant: 4, backdate: true, reason: "Assigned by the Medicare rule" });
  const b = advance(a.claims, now, true);
  let claims = b.claims, events = [...b.events, ...a.events];
  const agentIds = SEED_AGENTS.map((x) => x.id);
  const examples = [
    { id: "coding", n: 12, instant: 9, reason: "Assigned when the claim was denied", rank: (c) => (c.status === "Rejections" ? 0 : 1), pick: (c) => c.status === "Rejections" || c.status === "Partial Denials" },
    { id: "eligibility", n: 10, instant: 6, reason: "Assigned when the claim needed an eligibility check", rank: () => 0, pick: (c) => c.status === "Decision Pending" },
    { id: "posting", n: 9, instant: 9, reason: "Assigned when a payment arrived", rank: (c) => (c.status === "Payment Posting" ? 0 : 1), pick: (c) => c.status === "Payment Posting" },
  ];
  examples.forEach((w) => {
    const pick = claims.filter((c) => !c.work && c.assignee !== ME && w.pick(c)).sort((x, y) => w.rank(x) - w.rank(y)).slice(0, w.n).map((c) => c.id);
    const r = doAssign(claims, pick, w.id, { auto: true, agentIds, now, instant: w.instant, backdate: true, reason: w.reason });
    const r2 = advance(r.claims, now, true);
    claims = r2.claims; events = [...r2.events, ...r.events, ...events];
  });
  return { claims, activity: events.sort((x, y) => y.t - x.t) };
}

/* ---------- Hub numbers: all read from the live claims and activity ---------- */
const MIN_PER_RESULT = 6; /* assumption: minutes saved per approved result */
function agentStats(a, claims) {
  const work = claims.filter((c) => c.work && c.work.agentId === a.id);
  return { worked: work.length, working: work.filter((c) => c.work.state === "working").length, ready: work.filter((c) => c.work.state === "ready").length, approved: work.filter((c) => c.work.state === "approved").length };
}
/* Running: auto-assign is on or it has worked a claim. Draft: neither yet. Paused: you paused it. */
const SCHEDULE = "weekdays at 6:00 AM"; /* in the prototype every agent runs on this schedule */
function agentStatus(a, claims) {
  if (a.paused) return "Paused";
  const n = agentStats(a, claims);
  if (n.working > 0) return "Running";
  return (a.rule && a.rule.on) || n.worked > 0 || (a.triggers && a.triggers.length > 0) ? "Waiting on schedule" : "Draft";
}
const agoText = (t) => { const sec = Math.max(0, Math.round((Date.now() - t) / 1000)); if (sec < 60) return "just now"; const m = Math.round(sec / 60); if (m < 60) return m + " min ago"; const h = Math.round(m / 60); if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago"); const d = Math.round(h / 24); return d + (d === 1 ? " day ago" : " days ago"); };
/* Athelas templates live in athelasTemplates() below */

/* ---------- Agent builder: turns a plain description into a draft. Fake, keyword based. ---------- */
const BASE_LINE = "Work claims as a first pass. Never send, post or appeal on your own. Leave every result for review.";
const UNSURE_LINE = "If you are unsure, return the claim with a short reason.";
function draftFrom(text, taken, prev) {
  const t = text.toLowerCase();
  const d = prev ? { ...prev, context: [...prev.context] } : { name: "", description: "", instructions: "", context: [], rule: null };
  const lines = d.instructions ? d.instructions.split("\n").filter((l) => l !== UNSURE_LINE) : [BASE_LINE];
  let ins = 0, docs = 0, kind = null;
  const add = (l) => { if (!lines.includes(l)) { lines.push(l); ins++; } };
  const doc = (x) => { if (!d.context.includes(x)) { d.context.push(x); docs++; } };
  if (/medicare/.test(t)) { add("If a claim is stuck in recon, check the Medicare portal and report what it shows."); doc("Medicare payer policies"); doc("Medicare portal guide"); kind = kind || "Medicare"; if (!d.rule) d.rule = { payer: "Medicare", on: false }; }
  if (/denial|denied|reject|appeal/.test(t)) { add("If it is a denial, suggest how to fix it and name the policy or contract term you used."); doc("Payer policies"); doc("Appeals guide"); kind = kind || "Denials"; }
  if (/medicaid|secondary|cob|coordination/.test(t)) { add("If it needs COB, draft the secondary claim for review."); doc("Secondary claims SOP"); kind = kind || "Secondary Claims"; if (/medicaid/.test(t) && !d.rule) d.rule = { payer: "Medicaid", on: false }; }
  if (/post|payment|remit/.test(t)) { add("If it needs posting, suggest a posting."); doc("Contract and fee schedule"); kind = kind || "Posting"; }
  if (/coding|diagnos|icd|cpt|modifier/.test(t)) { add("Check the diagnosis and procedure codes and suggest the corrected codes and pointers."); doc("ICD-10 coding guidelines"); doc("CPT coding guidelines"); kind = kind || "Coding"; }
  if (/eligib|coverage/.test(t)) { add("Check coverage on the payer portal and confirm the plan was active on the date of service."); doc("Payer portal guides"); doc("Eligibility checklist"); kind = kind || "Eligibility"; }
  if (/follow-?up|status/.test(t)) { add("Check the claim status and set the next follow-up date."); doc("Payer portal guides"); kind = kind || "Follow-up"; }
  if (/portal/.test(t)) add("Check the payer portal first and report what it shows.");
  if (/review/.test(t)) add("Send every result to the reviewer. Never act on your own.");
  const only = t.match(/only (?:work )?(medicare|medicaid)/);
  if (only) d.rule = { payer: only[1] === "medicare" ? "Medicare" : "Medicaid", on: d.rule ? d.rule.on : false };
  lines.push(UNSURE_LINE);
  d.instructions = lines.join("\n");
  if (!prev) {
    const base = kind ? kind + " Agent" : "New Agent";
    let name = base, n = 2; while (taken.includes(name)) name = base + " " + n++;
    d.name = name;
    const one = text.trim().replace(/^./, (c) => c.toUpperCase());
    d.description = one.length > 90 ? one.slice(0, 87) + "..." : one;
  }
  const parts = [];
  if (ins) parts.push(ins + (ins === 1 ? " instruction" : " instructions"));
  if (docs) parts.push(docs + (docs === 1 ? " context document" : " context documents"));
  const ruleNote = d.rule && !(prev && prev.rule) ? " I also added an auto-assign rule for " + d.rule.payer + " claims. It stays off until you turn it on." : "";
  const reply = prev
    ? (parts.length || ruleNote ? "Updated the draft: added " + (parts.join(" and ") || "a rule") + "." + ruleNote : "I did not find anything new to add. Tell me more about what the agent should do.")
    : "Here is a first draft called " + d.name + ". " + (parts.length ? "I added " + parts.join(" and ") + "." : "I did not find specifics yet.") + ruleNote + " Change anything below, then create the agent.";
  return { draft: d, reply };
}
const rel = (t) => {
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 10) return "Just now";
  if (s < 60) return s + " sec ago";
  if (s < 3600) return Math.round(s / 60) + " min ago";
  return new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const mdy = (d) => String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getDate()).padStart(2, "0") + "/" + d.getFullYear();

function makeClaims() {
  let seed = 7;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const out = [];
  GROUPS.forEach((g, gi) => {
    let id = 25290000 - gi * 600000;
    const n = Math.min(8, parseInt(g.count.replace(/,/g, ""), 10));
    for (let i = 0; i < n; i++) {
      id -= 300 + Math.floor(rnd() * 4000);
      const dos = new Date(TODAY); dos.setDate(dos.getDate() - (5 + i * 2 + Math.floor(rnd() * 3)));
      const r = rnd();
      out.push({
        id: String(id), group: g.key, status: g.status, days: 1 + Math.floor(rnd() * 33), stage: "Payer 1",
        patient: pick(FN) + " " + pick(LN), provider: pick(PROVIDERS), dos: mdy(dos), payer: i === 0 && ["g6", "g25", "g28"].includes(g.key) ? "MEDICARE PART B" : g.payer || pick(PAYERS),
        amount: Math.round((200 + rnd() * 3800) * 100) / 100,
        assignee: i < (gi === 0 ? 6 : MY_PER_GROUP) && g.status !== "Full Denials" ? ME : r < 0.28 ? null : AGENTS[Math.floor(rnd() * 7)].id,
      });
    }
  });
  return [...TOP5_CLAIMS, ...out];
}

const TABS = [
  { k: "all", label: "All Claims" },
  { k: "workable", label: "Workable Claims", count: "19,218" },
  { k: "mine", label: "My Claims" },
  { divider: true },
  { k: "under", label: "Underpayments" },
];

/* [key, label, width] */
const COLS = [
  ["id", "ID", 110], ["status", "Status", 250], ["tis", "Time in status", 120], ["stage", "Stage", 120],
  ["patient", "Patient", 180], ["provider", "Provider", 160], ["dos", "Date of Service", 140], ["ins", "Insurances", 200],
];
const SKEL = [[70, 90, 40, 70, 110, 90, 70, 120], [60, 100, 36, 70, 130, 80, 70, 110], [76, 84, 44, 70, 100, 100, 70, 130], [64, 96, 40, 70, 120, 90, 70, 100], [72, 88, 38, 70, 110, 84, 70, 120], [58, 104, 42, 70, 124, 96, 70, 108], [74, 92, 40, 70, 104, 88, 70, 126], [66, 98, 44, 70, 116, 92, 70, 112]];
const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- My Claims: summary and a two-step suggested action path for every claim (fake content) ---------- */
const PRACTICE = "Northgate Therapy Group";
const longDate = (d) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const parseMDY = (x) => { const [m, d, y] = x.split("/").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const tcase = (x) => x.toLowerCase().replace(/\b[a-z]/g, (m) => m.toUpperCase()).replace(/ (Of|And|The) /g, (m) => m.toLowerCase());
const hashId = (id) => [...String(id)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
const LINE_SETS = [["97110", "97112", "97140", "97530"], ["97110", "97112", "97530"], ["97110", "97140"], ["97530"], ["97110", "97112", "97140"]];
const NUMW = ["zero", "one", "two", "three", "four", "five"];

/* The five claims at the top of My Claims follow the design: a denied claim, fix the diagnoses, then resubmit. */
const TOP_PAYER = "WELLMARK BLUE CROSS BLUE SHIELD OF IOWA";
const TOP5 = [
  ["24410231", "Dalia M Okoro", "Noel Tanaka", "10/27/2026", 3, 274.0, 0, 0],
  ["24398876", "Tobias R Lindqvist", "Ruth Calloway", "10/26/2026", 4, 262.0, 0, 1],
  ["24377012", "Imani S Castellano", "Ibrahim Sayed", "10/23/2026", 6, 281.0, 1, 2],
  ["24352694", "Callum J Ashworth", "Petra Lindholm", "10/22/2026", 7, 268.0, 0, 3],
  ["24331507", "Greta P Duarte", "Gavin Ortiz", "10/20/2026", 9, 275.0, 1, 4],
];
const TOP5_CLAIMS = TOP5.map(([id, patient, provider, dos, days, amount, lineSet, variant]) => ({
  id, group: "g17", status: "Full Denials", days, stage: "Payer 1", patient, provider, dos, payer: TOP_PAYER, amount,
  assignee: ME, lines: LINE_SETS[lineSet], variant, top: true,
}));

function claimBrief(c) {
  const g = GROUP_BY_KEY[c.group], h = hashId(c.id);
  const lines = c.lines || LINE_SETS[h % LINE_SETS.length];
  const n = lines.length, nw = NUMW[n], ln = n === 1 ? "line" : "lines";
  const reason = g.chips.flat().slice(g.payer ? 1 : 0).filter((x) => !isCode(x)).join(" / ").toLowerCase();
  const payer = tcase(c.payer), short = payer.split(" ")[0];
  const dos = parseMDY(c.dos), amt = money(c.amount);
  const sentD = longDate(addDays(dos, 2)), remitD = longDate(addDays(dos, c.top ? 15 : 12 + (h % 5)));
  const lineTxt = n > 1 ? lines.slice(0, -1).join(", ") + ", and " + lines[n - 1] : lines[0];
  const billed = PRACTICE + " billed " + payer + " " + amt + " for " + nw + " therapy " + ln + " (" + lineTxt + ") on " + longDate(dos) + ". ";
  const claimLink = { link: "The initial claim went out on " + sentD };
  const remitLink = { link: short + "'s remittance dated " + remitD };
  const st = c.status;
  const pointers = (from) => lines.slice(0, 2).map((l) => ["Procedure " + l, from, "Pointer 1"]);
  const resubmit = (from) => ({ title: "Resubmit to " + payer, body: ["Resubmit the corrected claim to ", { bold: payer }, ". It goes out with all " + n + " " + ln + " and nothing else changes."], chips: [["Claim: Status", from, "Resubmitted"]] });
  const A = (title, body, chips) => ({ title, body, chips });
  const out = (stand, next, a1, a2) => ({ stand, next, actions: [a1, a2] });

  if (st === "Full Denials" && /diagnosis/.test(reason)) {
    const V = [
      ["Remove Diagnoses", " Excludes1 conflict between H81.22 and R42 explains the CO-16/M76 diagnosis denial. The chart documents left peripheral vestibular hypofunction (H81.22), and R42 is an integral symptom, so remove R42 and keep H81.22 as the sole diagnosis. All " + nw + " " + ln + " point only to pointer 1.", ["Claim", "H81.22, R42", "H81.22"]],
      ["Remove Diagnoses", " M54.6 is a symptom code integral to the documented thoracic strain, and it triggers the CO-16/M76 denial. Remove M54.6 and report S29.012A alone, with all " + nw + " " + ln + " pointing to pointer 1.", ["Claim", "M54.6, S29.012A", "S29.012A"]],
      ["Update Diagnoses", " R27.0 and R26.89 cannot coexist (Excludes1), and the note documents gait abnormality rather than ataxia. Remove R27.0 and keep R26.89 as the lead diagnosis. Every line points to pointer 1.", ["Claim", "R27.0, R26.89", "R26.89"]],
      ["Update Diagnoses", " M79.629 is redundant with the more specific left-sided M79.622 and contradicts it. Lead with M79.622 (left upper arm pain, laterality documented in the chart) and remove M79.629. Each line then points to pointer 1.", ["Claim", "M79.629, M79.622", "M79.622"]],
      ["Update Diagnoses", " S93.401A uses the initial-encounter character, but this is a later visit of therapy for a right ankle sprain. Change it to S93.401D and remove the history code Z87.39. Each line points to pointer 1.", ["Claim", "S93.401A, Z87.39", "S93.401D"]],
    ][c.variant != null ? c.variant : h % 5];
    return out(
      ["This claim was fully denied. " + billed, claimLink, ", and ", remitLink, " denied all " + amt + " under CO-16 with remark M76: the diagnosis codes were missing, incomplete, or invalid. Nothing has been paid."],
      ["Review the diagnosis codes on all " + nw + " " + ln + ". CO-16 with remark M76 means the payer rejected the claim specifically because the diagnosis information was missing or invalid, not a coverage issue. Correct the diagnosis codes to ensure they are complete and valid for each billed procedure, then resubmit to " + payer + "."],
      A(V[0], [{ bold: V[0] + ":" }, V[1]], [V[2], ...pointers("Pointers 1,2")]), resubmit("Full Denial"));
  }
  if (st === "Full Denials") {
    const [t1, body1, chip1] = /prior auth/.test(reason)
      ? ["Request Retro Authorization", "Request a retro-authorization from " + payer + " and attach the number to the claim.", ["Claim: Authorization", "none", "PA-" + c.id.slice(-5)]]
      : /documentation/.test(reason)
        ? ["Attach Documentation", "Attach the signed progress notes and set the documentation flag on the claim.", ["Claim: Attachments", "none", "Progress notes (2 pages)"]]
        : ["Correct Claim", "Correct what the payer flagged on the claim.", ["Claim: Status", "Denied", "Corrected"]];
    return out(
      ["This claim was fully denied. " + billed, claimLink, ", and ", remitLink, " denied all " + amt + ". Nothing has been paid."],
      ["Work the denial reason on all " + nw + " " + ln + ", then resubmit to " + payer + ". Check back in about 14 days for the new remittance."],
      A(t1, [{ bold: t1 + ":" }, " " + body1], [chip1]), resubmit("Full Denial"));
  }
  if (st === "Partial Denials") {
    const open = money(c.amount * 0.4);
    return out(
      ["This claim was paid in part. " + billed, claimLink, ", and ", remitLink, " paid part of it and applied a contractual adjustment (CO-45). " + open + " remains open."],
      ["Write off the contractual adjustment. No appeal is needed."],
      A("Write Off Adjustment", [{ bold: "Write Off Adjustment:" }, " Write off " + open + " as a contractual adjustment."], [["Claim: Open balance", open, "$0.00"]]),
      A("Close Claim", [{ bold: "Close Claim:" }, " Close the claim with a zero balance."], [["Claim: Status", "Partial Denial", "Closed"]]));
  }
  if (st === "Rejections") {
    return out(
      ["This claim was rejected. " + billed, claimLink, ", and ", { link: short + "'s acknowledgement dated " + remitD }, " rejected it before adjudication for invalid information. Nothing has been paid."],
      ["Correct the subscriber details (ID, date of birth and name spelling) and resubmit to " + payer + ". A rejection is not a denial, so the timely filing clock keeps running."],
      A("Correct Subscriber Details", [{ bold: "Correct Subscriber Details:" }, " Update the subscriber ID to match the card on file and the date of birth to match the registration."], [["Claim: Subscriber ID", "W84201", "W84210"], ["Claim: Date of birth", "03/14/1961", "03/14/1951"]]),
      resubmit("Rejected"));
  }
  if (st === "Decision Pending") {
    return out(
      [billed, claimLink, ". The payer has not posted a decision, and the EOB is expected by mail. Nothing has been paid."],
      ["Upload the EOB when it arrives. If it is late, call " + payer + " for the status."],
      A("Set Follow-up", [{ bold: "Set Follow-up:" }, " Set a follow-up for five business days from today so the claim is checked again."], [["Follow-up", "none", mdy(addDays(TODAY, 7))]]),
      A("Request EOB by Email", [{ bold: "Request EOB by Email:" }, " Ask for the EOB by email so the decision can be posted without waiting on mail."], [["Claim: EOB request", "none", "Requested by email"]]));
  }
  if (st === "Payment Posting") {
    return out(
      ["A payment of " + amt + " for this claim arrived on ", { link: "the remittance dated " + remitD }, ". The deposit has not been verified, so nothing is posted yet."],
      ["Verify the deposit against the remittance, then post the payment."],
      A("Verify Deposit", [{ bold: "Verify Deposit:" }, " Confirm the deposit with the bank or the lockbox report."], [["Deposit", "Not verified", "Verified"]]),
      A("Post Payment", [{ bold: "Post Payment:" }, " Post " + amt + " to the claim and close it with a zero balance."], [["Claim: Posted", "$0.00", amt], ["Claim: Open balance", amt, "$0.00"]]));
  }
  if (st === "Unsubmitted") {
    return out(
      ["This claim has not been sent. " + billed.replace(/ billed.*$/, "") + " billed " + payer + " " + amt + " on " + longDate(dos) + ", but the clearinghouse does not support the payer, so the claim never left the practice."],
      ["Send the claim on paper, or switch to a supported payer ID. Check the filing deadline so it is not late."],
      A("Route to Paper Billing", [{ bold: "Route to Paper Billing:" }, " Print the claim form with the attachments that are on file."], [["Claim: Submission method", "Clearinghouse", "Paper"]]),
      A("Send Claim", [{ bold: "Send Claim:" }, " Mail the claim to " + payer + "."], [["Claim: Status", "Unsubmitted", "Sent"]]));
  }
  if (st === "Unresolved Balances") {
    const bal = money(c.amount * 0.1);
    return out(
      ["After payment and adjustments this claim has an open balance of " + bal + ". ", { link: "The account history" }, " shows that no patient statement was sent."],
      ["Bill the patient, or write off the balance if it is below the practice's write-off limit."],
      A("Review Balance", [{ bold: "Review Balance:" }, " Confirm the balance is correct after the last payment and adjustment."], [["Claim: Review", "Open", "Reviewed"]]),
      A("Write Off Balance", [{ bold: "Write Off Balance:" }, " Write off " + bal + ". It is below the practice's write-off limit."], [["Claim: Open balance", bal, "$0.00"]]));
  }
  if (st === "Submission Errors") {
    return out(
      [payer + " put this claim on hold because the date of service (" + c.dos + ") is within the past six weeks. ", { link: "The hold notice" }, " has the details."],
      ["No fix is needed on the claim. Release it once six weeks have passed since the date of service."],
      A("Keep Claim on Hold", [{ bold: "Keep Claim on Hold:" }, " Keep the hold and set a reminder so the claim does not sit past the filing deadline."], [["Reminder", "none", mdy(addDays(dos, 42))]]),
      A("Release Claim", [{ bold: "Release Claim:" }, " Release the claim to " + payer + "."], [["Claim: Hold", "On hold", "Released"]]));
  }
  if (st === "Packet Pending") {
    return out(
      ["The medical record packet for this claim has not been received, so the claim cannot be sent. ", { link: "The packet request" }, " shows no reply from the provider's office."],
      ["Request the packet again and attach it to the claim as soon as it arrives."],
      A("Request Medical Record Packet", [{ bold: "Request Medical Record Packet:" }, " Send a second request to " + c.provider + "'s office and flag it as urgent."], [["Claim: Packet", "Missing", "Requested again"]]),
      A("Attach Packet and Send", [{ bold: "Attach Packet and Send:" }, " Attach the packet to the claim and send it."], [["Claim: Packet", "Requested", "Attached"], ["Claim: Status", "Packet Pending", "Sent"]]));
  }
  if (st === "Decision Inconclusive") {
    return out(
      [{ link: short + "'s remittance dated " + remitD }, " arrived without payment details, so the payment of " + amt + " cannot be matched to this claim."],
      ["Request a corrected EOB with the payment details by line. Hold posting until it arrives."],
      A("Request Corrected EOB", [{ bold: "Request Corrected EOB:" }, " Ask " + payer + " for an EOB with payment details by line."], [["EOB: Payment details", "Missing", "Corrected EOB requested"]]),
      A("Post Payment", [{ bold: "Post Payment:" }, " Post the payment once the corrected EOB arrives."], [["Claim: Posted", "$0.00", amt]]));
  }
  return out(["This claim needs attention. ", { link: "The claim detail" }, " has the details."], ["Open the claim and work it in order."],
    A("Review Claim", [{ bold: "Review Claim:" }, " Review the claim and decide the next step."], [["Claim: Status", "Open", "Reviewed"]]),
    A("Close Claim", [{ bold: "Close Claim:" }, " Close the claim."], [["Claim: Status", "Reviewed", "Closed"]]));
}


/* Icons exported from Figma (Claims file, Data Table 10836:33553). Fill follows currentColor. */
const FIG = {
  filter: "M7.33333 12C7.14444 12 6.98611 11.9361 6.85833 11.8083C6.73056 11.6806 6.66667 11.5222 6.66667 11.3333C6.66667 11.1444 6.73056 10.9861 6.85833 10.8583C6.98611 10.7306 7.14444 10.6667 7.33333 10.6667H8.66667C8.85556 10.6667 9.01389 10.7306 9.14167 10.8583C9.26944 10.9861 9.33333 11.1444 9.33333 11.3333C9.33333 11.5222 9.26944 11.6806 9.14167 11.8083C9.01389 11.9361 8.85556 12 8.66667 12H7.33333ZM4.66667 8.66667C4.47778 8.66667 4.31944 8.60278 4.19167 8.475C4.06389 8.34722 4 8.18889 4 8C4 7.81111 4.06389 7.65278 4.19167 7.525C4.31944 7.39722 4.47778 7.33333 4.66667 7.33333H11.3333C11.5222 7.33333 11.6806 7.39722 11.8083 7.525C11.9361 7.65278 12 7.81111 12 8C12 8.18889 11.9361 8.34722 11.8083 8.475C11.6806 8.60278 11.5222 8.66667 11.3333 8.66667H4.66667ZM2.66667 5.33333C2.47778 5.33333 2.31944 5.26944 2.19167 5.14167C2.06389 5.01389 2 4.85556 2 4.66667C2 4.47778 2.06389 4.31944 2.19167 4.19167C2.31944 4.06389 2.47778 4 2.66667 4H13.3333C13.5222 4 13.6806 4.06389 13.8083 4.19167C13.9361 4.31944 14 4.47778 14 4.66667C14 4.85556 13.9361 5.01389 13.8083 5.14167C13.6806 5.26944 13.5222 5.33333 13.3333 5.33333H2.66667Z",
  settings: "M7.21665 14.6667C6.91665 14.6667 6.65832 14.5667 6.44165 14.3667C6.22499 14.1667 6.09443 13.9223 6.04999 13.6334L5.89999 12.5334C5.75554 12.4778 5.61943 12.4112 5.49165 12.3334C5.36388 12.2556 5.23888 12.1723 5.11665 12.0834L4.08332 12.5167C3.80554 12.6389 3.52776 12.65 3.24999 12.55C2.97221 12.45 2.75554 12.2723 2.59999 12.0167L1.81665 10.65C1.6611 10.3945 1.61665 10.1223 1.68332 9.83337C1.74999 9.54449 1.89999 9.3056 2.13332 9.11671L3.01665 8.45004C3.00554 8.37226 2.99999 8.29726 2.99999 8.22504V7.77504C2.99999 7.70282 3.00554 7.62782 3.01665 7.55004L2.13332 6.88337C1.89999 6.69448 1.74999 6.4556 1.68332 6.16671C1.61665 5.87782 1.6611 5.6056 1.81665 5.35004L2.59999 3.98337C2.75554 3.72782 2.97221 3.55004 3.24999 3.45004C3.52776 3.35004 3.80554 3.36115 4.08332 3.48337L5.11665 3.91671C5.23888 3.82782 5.36665 3.74448 5.49999 3.66671C5.63332 3.58893 5.76665 3.52226 5.89999 3.46671L6.04999 2.36671C6.09443 2.07782 6.22499 1.83337 6.44165 1.63337C6.65832 1.43337 6.91665 1.33337 7.21665 1.33337H8.78332C9.08332 1.33337 9.34165 1.43337 9.55832 1.63337C9.77499 1.83337 9.90554 2.07782 9.94999 2.36671L10.1 3.46671C10.2444 3.52226 10.3805 3.58893 10.5083 3.66671C10.6361 3.74448 10.7611 3.82782 10.8833 3.91671L11.9167 3.48337C12.1944 3.36115 12.4722 3.35004 12.75 3.45004C13.0278 3.55004 13.2444 3.72782 13.4 3.98337L14.1833 5.35004C14.3389 5.6056 14.3833 5.87782 14.3167 6.16671C14.25 6.4556 14.1 6.69448 13.8667 6.88337L12.9833 7.55004C12.9944 7.62782 13 7.70282 13 7.77504V8.22504C13 8.29726 12.9889 8.37226 12.9667 8.45004L13.85 9.11671C14.0833 9.3056 14.2333 9.54449 14.3 9.83337C14.3667 10.1223 14.3222 10.3945 14.1667 10.65L13.3667 12.0167C13.2111 12.2723 12.9944 12.45 12.7167 12.55C12.4389 12.65 12.1611 12.6389 11.8833 12.5167L10.8833 12.0834C10.7611 12.1723 10.6333 12.2556 10.5 12.3334C10.3667 12.4112 10.2333 12.4778 10.1 12.5334L9.94999 13.6334C9.90554 13.9223 9.77499 14.1667 9.55832 14.3667C9.34165 14.5667 9.08332 14.6667 8.78332 14.6667H7.21665ZM7.33332 13.3334H8.64999L8.88332 11.5667C9.22776 11.4778 9.54721 11.3473 9.84165 11.175C10.1361 11.0028 10.4055 10.7945 10.65 10.55L12.3 11.2334L12.95 10.1L11.5167 9.01671C11.5722 8.86115 11.6111 8.69726 11.6333 8.52504C11.6555 8.35282 11.6667 8.17782 11.6667 8.00004C11.6667 7.82226 11.6555 7.64726 11.6333 7.47504C11.6111 7.30282 11.5722 7.13893 11.5167 6.98337L12.95 5.90004L12.3 4.76671L10.65 5.46671C10.4055 5.21115 10.1361 4.99726 9.84165 4.82504C9.54721 4.65282 9.22776 4.52226 8.88332 4.43337L8.66665 2.66671H7.34999L7.11665 4.43337C6.77221 4.52226 6.45276 4.65282 6.15832 4.82504C5.86388 4.99726 5.59443 5.2056 5.34999 5.45004L3.69999 4.76671L3.04999 5.90004L4.48332 6.96671C4.42776 7.13337 4.38888 7.30004 4.36665 7.46671C4.34443 7.63337 4.33332 7.81115 4.33332 8.00004C4.33332 8.17782 4.34443 8.35004 4.36665 8.51671C4.38888 8.68337 4.42776 8.85004 4.48332 9.01671L3.04999 10.1L3.69999 11.2334L5.34999 10.5334C5.59443 10.7889 5.86388 11.0028 6.15832 11.175C6.45276 11.3473 6.77221 11.4778 7.11665 11.5667L7.33332 13.3334ZM8.03332 10.3334C8.67776 10.3334 9.22776 10.1056 9.68332 9.65004C10.1389 9.19448 10.3667 8.64448 10.3667 8.00004C10.3667 7.3556 10.1389 6.8056 9.68332 6.35004C9.22776 5.89448 8.67776 5.66671 8.03332 5.66671C7.37776 5.66671 6.82499 5.89448 6.37499 6.35004C5.92499 6.8056 5.69999 7.3556 5.69999 8.00004C5.69999 8.64448 5.92499 9.19448 6.37499 9.65004C6.82499 10.1056 7.37776 10.3334 8.03332 10.3334Z",
  history: "M5.675 13.525C4.94722 13.2083 4.31111 12.7778 3.76667 12.2333C3.22222 11.6889 2.79167 11.0528 2.475 10.325C2.15833 9.59722 2 8.82222 2 8C2 7.13333 2.16667 6.32222 2.5 5.56667C2.83333 4.81111 3.3 4.16111 3.9 3.61667C4.03333 3.49444 4.19167 3.43611 4.375 3.44167C4.55833 3.44722 4.71111 3.51111 4.83333 3.63333L8.46667 7.26667C8.58889 7.38889 8.65 7.54445 8.65 7.73333C8.65 7.92222 8.58889 8.07778 8.46667 8.2C8.34444 8.32222 8.18889 8.38333 8 8.38333C7.81111 8.38333 7.65556 8.32222 7.53333 8.2L4.4 5.06667C4.06667 5.46667 3.80556 5.91389 3.61667 6.40833C3.42778 6.90278 3.33333 7.43333 3.33333 8C3.33333 9.28889 3.78889 10.3889 4.7 11.3C5.61111 12.2111 6.71111 12.6667 8 12.6667C9.28889 12.6667 10.3889 12.2111 11.3 11.3C12.2111 10.3889 12.6667 9.28889 12.6667 8C12.6667 6.81111 12.2861 5.78611 11.525 4.925C10.7639 4.06389 9.81111 3.55556 8.66667 3.4V4C8.66667 4.18889 8.60278 4.34722 8.475 4.475C8.34722 4.60278 8.18889 4.66667 8 4.66667C7.81111 4.66667 7.65278 4.60278 7.525 4.475C7.39722 4.34722 7.33333 4.18889 7.33333 4V2.66667C7.33333 2.47778 7.39722 2.31944 7.525 2.19167C7.65278 2.06389 7.81111 2 8 2C8.82222 2 9.59722 2.15833 10.325 2.475C11.0528 2.79167 11.6889 3.22222 12.2333 3.76667C12.7778 4.31111 13.2083 4.94722 13.525 5.675C13.8417 6.40278 14 7.17778 14 8C14 8.82222 13.8417 9.59722 13.525 10.325C13.2083 11.0528 12.7778 11.6889 12.2333 12.2333C11.6889 12.7778 11.0528 13.2083 10.325 13.525C9.59722 13.8417 8.82222 14 8 14C7.17778 14 6.40278 13.8417 5.675 13.525ZM4.19167 8.475C4.06389 8.34722 4 8.18889 4 8C4 7.81111 4.06389 7.65278 4.19167 7.525C4.31944 7.39722 4.47778 7.33333 4.66667 7.33333C4.85556 7.33333 5.01389 7.39722 5.14167 7.525C5.26944 7.65278 5.33333 7.81111 5.33333 8C5.33333 8.18889 5.26944 8.34722 5.14167 8.475C5.01389 8.60278 4.85556 8.66667 4.66667 8.66667C4.47778 8.66667 4.31944 8.60278 4.19167 8.475ZM7.525 11.8083C7.39722 11.6806 7.33333 11.5222 7.33333 11.3333C7.33333 11.1444 7.39722 10.9861 7.525 10.8583C7.65278 10.7306 7.81111 10.6667 8 10.6667C8.18889 10.6667 8.34722 10.7306 8.475 10.8583C8.60278 10.9861 8.66667 11.1444 8.66667 11.3333C8.66667 11.5222 8.60278 11.6806 8.475 11.8083C8.34722 11.9361 8.18889 12 8 12C7.81111 12 7.65278 11.9361 7.525 11.8083ZM10.8583 8.475C10.7306 8.34722 10.6667 8.18889 10.6667 8C10.6667 7.81111 10.7306 7.65278 10.8583 7.525C10.9861 7.39722 11.1444 7.33333 11.3333 7.33333C11.5222 7.33333 11.6806 7.39722 11.8083 7.525C11.9361 7.65278 12 7.81111 12 8C12 8.18889 11.9361 8.34722 11.8083 8.475C11.6806 8.60278 11.5222 8.66667 11.3333 8.66667C11.1444 8.66667 10.9861 8.60278 10.8583 8.475Z",
  download: "M7.99984 10.6666L4.6665 7.33329L5.59984 6.36663L7.33317 8.09996V2.66663H8.6665V8.09996L10.3998 6.36663L11.3332 7.33329L7.99984 10.6666ZM3.99984 13.3333C3.63317 13.3333 3.31928 13.2027 3.05817 12.9416C2.79706 12.6805 2.6665 12.3666 2.6665 12V9.99996H3.99984V12H11.9998V9.99996H13.3332V12C13.3332 12.3666 13.2026 12.6805 12.9415 12.9416C12.6804 13.2027 12.3665 13.3333 11.9998 13.3333H3.99984Z",
  chart: "M2.00016 14C1.81127 14 1.65294 13.9361 1.52516 13.8083C1.39738 13.6806 1.3335 13.5222 1.3335 13.3333C1.3335 13.1444 1.39738 12.9861 1.52516 12.8583C1.65294 12.7306 1.81127 12.6667 2.00016 12.6667H14.0002C14.1891 12.6667 14.3474 12.7306 14.4752 12.8583C14.6029 12.9861 14.6668 13.1444 14.6668 13.3333C14.6668 13.5222 14.6029 13.6806 14.4752 13.8083C14.3474 13.9361 14.1891 14 14.0002 14H2.00016ZM2.29183 11.7083C2.09738 11.5139 2.00016 11.2778 2.00016 11V8.33333C2.00016 8.05556 2.09738 7.81944 2.29183 7.625C2.48627 7.43056 2.72238 7.33333 3.00016 7.33333C3.27794 7.33333 3.51405 7.43056 3.7085 7.625C3.90294 7.81944 4.00016 8.05556 4.00016 8.33333V11C4.00016 11.2778 3.90294 11.5139 3.7085 11.7083C3.51405 11.9028 3.27794 12 3.00016 12C2.72238 12 2.48627 11.9028 2.29183 11.7083ZM5.62516 11.7083C5.43072 11.5139 5.3335 11.2778 5.3335 11V5C5.3335 4.72222 5.43072 4.48611 5.62516 4.29167C5.81961 4.09722 6.05572 4 6.3335 4C6.61127 4 6.84738 4.09722 7.04183 4.29167C7.23627 4.48611 7.3335 4.72222 7.3335 5V11C7.3335 11.2778 7.23627 11.5139 7.04183 11.7083C6.84738 11.9028 6.61127 12 6.3335 12C6.05572 12 5.81961 11.9028 5.62516 11.7083ZM8.9585 11.7083C8.76405 11.5139 8.66683 11.2778 8.66683 11V7C8.66683 6.72222 8.76405 6.48611 8.9585 6.29167C9.15294 6.09722 9.38905 6 9.66683 6C9.94461 6 10.1807 6.09722 10.3752 6.29167C10.5696 6.48611 10.6668 6.72222 10.6668 7V11C10.6668 11.2778 10.5696 11.5139 10.3752 11.7083C10.1807 11.9028 9.94461 12 9.66683 12C9.38905 12 9.15294 11.9028 8.9585 11.7083ZM12.2918 11.7083C12.0974 11.5139 12.0002 11.2778 12.0002 11V3C12.0002 2.72222 12.0974 2.48611 12.2918 2.29167C12.4863 2.09722 12.7224 2 13.0002 2C13.2779 2 13.5141 2.09722 13.7085 2.29167C13.9029 2.48611 14.0002 2.72222 14.0002 3V11C14.0002 11.2778 13.9029 11.5139 13.7085 11.7083C13.5141 11.9028 13.2779 12 13.0002 12C12.7224 12 12.4863 11.9028 12.2918 11.7083Z",
  add: "M8.25 9.75H4.5C4.2875 9.75 4.10938 9.67812 3.96562 9.53438C3.82187 9.39062 3.75 9.2125 3.75 9C3.75 8.7875 3.82187 8.60938 3.96562 8.46562C4.10938 8.32188 4.2875 8.25 4.5 8.25H8.25V4.5C8.25 4.2875 8.32188 4.10938 8.46562 3.96562C8.60938 3.82187 8.7875 3.75 9 3.75C9.2125 3.75 9.39062 3.82188 9.53438 3.96562C9.67812 4.10938 9.75 4.2875 9.75 4.5V8.25H13.5C13.7125 8.25 13.8906 8.32188 14.0344 8.46562C14.1781 8.60938 14.25 8.7875 14.25 9C14.25 9.2125 14.1781 9.39062 14.0344 9.53438C13.8906 9.67812 13.7125 9.75 13.5 9.75H9.75V13.5C9.75 13.7125 9.67812 13.8906 9.53438 14.0344C9.39062 14.1781 9.2125 14.25 9 14.25C8.7875 14.25 8.60938 14.1781 8.46562 14.0344C8.32188 13.8906 8.25 13.7125 8.25 13.5V9.75Z",
};
function FigIcon({ name, size = 16 }) {
  const box = name === "add" ? 18 : 16;
  return <svg width={size} height={size} viewBox={`0 0 ${box} ${box}`} fill="currentColor" aria-hidden="true"><path d={FIG[name]} /></svg>;
}

/* ---------- Assistant Emblem: Design System 3.0, node 6165:16205 (4 translucent petals) ---------- */
const PETALS = [
  { id: "orange", d: "M119.72 22.4954C92.8718 -4.3531 49.3417 -4.3531 22.4932 22.4954C-4.35537 49.344 -4.35537 92.8741 22.4932 119.723C49.3417 146.571 92.8718 146.571 119.72 119.723C146.569 92.8741 146.569 49.344 119.72 22.4954Z", p: 0 },
  { id: "green", d: "M197.502 119.723C224.351 92.8742 224.351 49.3441 197.502 22.4956C170.654 -4.353 127.123 -4.35301 100.275 22.4955C73.4264 49.3441 73.4264 92.8742 100.275 119.723C127.123 146.571 170.654 146.571 197.502 119.723Z", p: 1 },
  { id: "blue", d: "M197.502 100.277C224.351 127.126 224.351 170.656 197.502 197.504C170.654 224.353 127.123 224.353 100.275 197.504C73.4264 170.656 73.4264 127.126 100.275 100.277C127.123 73.4287 170.654 73.4287 197.502 100.277Z", p: 2 },
  { id: "purple", d: "M119.72 197.505C92.8718 224.353 49.3417 224.353 22.4932 197.505C-4.35536 170.656 -4.35537 127.126 22.4932 100.277C49.3417 73.4288 92.8718 73.4288 119.72 100.277C146.569 127.126 146.569 170.656 119.72 197.505Z", p: 3 },
];
const PETAL_GRADIENTS = [
  { id: "orange", x1: 119.72, y1: 119.723, x2: 13.3127, y2: 13.315 },
  { id: "blue", x1: 100.275, y1: 100.277, x2: 206.156, y2: 206.159 },
  { id: "green", x1: 100.275, y1: 119.723, x2: 203.564, y2: 16.4339 },
  { id: "purple", x1: 119.72, y1: 100.277, x2: 13.7059, y2: 206.292 },
];
function AgentGradient() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        {PETAL_GRADIENTS.map((g) => (
          <linearGradient key={g.id} id={"em-" + g.id} gradientUnits="userSpaceOnUse" x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}>
            <stop offset="0" style={{ stopColor: "var(--em-" + g.id + ")" }} />
            <stop offset="1" style={{ stopColor: "var(--base)", stopOpacity: 0 }} />
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}
/* The emblem never moves or scales. Only each petal's glow rises and fades, one after another around the center. */
function AgentEmblem({ size = 20, animate = true }) {
  return (
    <svg className={"emblem" + (animate ? " live" : "")} width={size} height={size} viewBox="-5 -5 230 230" aria-hidden="true">
      {PETALS.map((o) => <path key={o.id} className="petal" d={o.d} opacity="0.7" fill={"url(#em-" + o.id + ")"} style={{ "--p": o.p }} />)}
    </svg>
  );
}
const AgentsIcon = ({ size = 16 }) => <AgentEmblem size={size} animate={false} />;

/* ---------- Patterns ---------- */

function AirLogo() {
  /* Exact vector from Design System 3.0, node 109:10852 (Brand=Air, Mono=Yes). Fill follows text color token. */
  return (
    <div className="logo" role="img" aria-label="Air">
      <svg width="66" height="40" viewBox="0 0 66 40" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M16.8243 14.7113C16.8243 16.2469 18.0572 17.4918 19.5781 17.4918H24.1036C25.4444 17.4918 26.5314 18.5894 26.5314 19.9433C26.5314 21.2972 25.4444 22.3947 24.1036 22.3947H22.8431C16.0856 22.3947 10.6077 16.8634 10.6077 10.0401C10.6077 8.3611 11.9556 7 13.6184 7L13.716 7C15.4327 7 16.8243 8.40521 16.8243 10.1386V14.7113Z" />
        <path fillRule="evenodd" clipRule="evenodd" d="M11.1671 25.2887C11.1671 23.7531 9.93423 22.5082 8.41337 22.5082H3.8878C2.54696 22.5082 1.46 21.4106 1.46 20.0567C1.46 18.7028 2.54696 17.6053 3.8878 17.6053H5.14836C11.9058 17.6053 17.3837 23.1366 17.3837 29.9599C17.3837 31.6389 16.0358 33 14.373 33H14.2754C12.5587 33 11.1671 31.5948 11.1671 29.8614V25.2887Z" />
        <path d="M31.4064 27.8748L38.5872 12.2572H42.4538L49.6566 27.8748H45.9006L44.3761 24.3497H36.444L34.9195 27.8748H31.4064ZM37.6813 21.5162L37.5046 21.9401H43.3155L43.1387 21.5162L40.4211 15.1129L37.6813 21.5162Z" />
        <path d="M51.1678 14.6444V12.1679H54.3714V14.6444H51.1678ZM51.1678 27.8748V15.693H54.3714V27.8748H51.1678Z" />
        <path d="M56.6255 27.8748V15.693H59.8295V17.9241C60.7572 16.34 62.2155 15.4476 64.1822 15.4476C64.3145 15.4476 64.3809 15.4476 64.4914 15.4699V18.2811C64.1599 18.2365 63.8284 18.2142 63.4969 18.2142C61.9504 18.2142 60.5144 18.8389 59.8295 20.0214V27.8748H56.6255Z" />
      </svg>
    </div>
  );
}

function NavItem({ item, active, onClick }) {
  return (
    <button className={"ni" + (active ? " on" : "")} aria-current={active ? "page" : undefined} onClick={onClick}>
      {item.icon && <item.icon size={16} />}<span>{item.l}</span>
      {item.badge > 0 && <b className="nbadge" aria-label={item.badge + " ready for review"}>{item.badge}</b>}
      {item.dot && !active && <i className={"ndot " + item.dot} aria-hidden="true" />}
    </button>
  );
}

/* ---------- Skills, Documents and Chats pages ---------- */
function PageRow({ icon: I, name, desc, aside, onClick, label }) {
  const body = (<><span className="hx-tile"><I size={24} /></span><span className="hx-txt"><b className="hx-name">{name}</b><span className="hx-desc">{desc}</span></span></>);
  return (
    <div className="hx-item"><div className="hx-row">
      {onClick ? <button className="hx-main" aria-label={label} onClick={onClick}>{body}</button> : <div className="hx-main static">{body}</div>}
      {aside}
    </div></div>
  );
}
const SKILL_CATS = ["Revenue cycle", "Operations", "Engineering patterns", "Healthcare integration", "Compliance and security", "Business", "Meta"];
const slug = (t) => t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
function ExtMenu({ label, icon: I, iconNode, children, align = "right", primary }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));
  return (
    <div className="xm" ref={ref}>
      <button className={primary ? "btn primary" : "ibtn"} aria-label={primary ? undefined : label} title={primary ? undefined : label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        {primary ? <><FigIcon name="add" size={18} />{label}<ChevronDown size={14} /></> : (iconNode || <I size={18} />)}
      </button>
      {open && <div className={"xm-pop " + align} role="menu">{children(() => setOpen(false))}</div>}
    </div>
  );
}
function NewSkillDialog({ names, onCreate, onCancel }) {
  const [name, setName] = useState(""), [cat, setCat] = useState(SKILL_CATS[0]), [desc, setDesc] = useState(""), [how, setHow] = useState("");
  const id = slug(name), dup = !!id && names.includes(id);
  return (
    <Dialog form title="Create skill" confirmLabel="Create skill" confirmDisabled={!id || !desc.trim() || dup} onCancel={onCancel} onConfirm={() => onCreate({ id, name: id, cat, desc: desc.trim(), how: how.trim() })}>
      <div className="fld"><label htmlFor="sk-name">Name</label><input id="sk-name" className="bld-f" autoFocus placeholder="check-eligibility" value={name} onChange={(e) => setName(e.target.value)} /><i className={dup ? "bad" : ""}>{dup ? "A skill with this name already exists." : id ? "Saved as " + id : "Lowercase with dashes."}</i></div>
      <div className="fld"><label htmlFor="sk-cat">Category</label><div className="ds-select wide"><select id="sk-cat" value={cat} onChange={(e) => setCat(e.target.value)}>{SKILL_CATS.map((c) => <option key={c}>{c}</option>)}</select><ChevronDown size={16} /></div></div>
      <div className="fld"><label htmlFor="sk-desc">Description</label><input id="sk-desc" className="bld-f" placeholder="What the skill does and when to use it" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
      <div className="fld"><label htmlFor="sk-how">Instructions</label><textarea id="sk-how" className="ag-ta" rows={4} placeholder="How the skill works, step by step" value={how} onChange={(e) => setHow(e.target.value)} /></div>
      <p className="sk-all"><Users size={16} />Available to all agents.</p>
    </Dialog>
  );
}
function SkillDetail({ k, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement; if (ref.current) ref.current.focus();
    const key = (e) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); if (prev && prev.focus) prev.focus(); };
  }, []);
  const using = athelasTemplates().filter((t) => t.skills.includes(k.id)).map((t) => t.name);
  const rows = [["Use when", k.desc.replace(/^Use when /, "")], ["Category", k.cat], k.pri ? ["Priority and effort", k.pri + ", effort " + k.eff] : null, k.tier ? ["Data tier", k.tier + ": " + TIER_TEXT[k.tier]] : null, k.appr ? ["Approval", k.appr + ": " + APPR_TEXT[k.appr]] : null, k.users ? ["Used by people in", k.users] : null, k.owner ? ["Owner", k.owner] : null, k.metric ? ["Success metric", k.metric] : null, k.pri ? ["Compared with today's catalog", k.note || "New skill"] : null, ["Agents that use it", using.length ? using.join(", ") : "None yet"]].filter(Boolean);
  return (
    <div className="dlg-back" onMouseDown={onClose}>
      <div className="dlg am sd" ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="sd-t" onMouseDown={(e) => e.stopPropagation()}>
        <div className="am-h"><div><h2 id="sd-t">{k.name}</h2></div><button className="ibtn" aria-label="Close" onClick={onClose}><X size={18} /></button></div>
        <dl className="sd-l">{rows.map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}</dl>
      </div>
    </div>
  );
}
function SkillsPage({ agents, notify, mine, added, onAddSkill, onAddExisting, initialTab, onUseTemplate, onDescribe }) {
  const [tab, setTab] = useState(initialTab || "templates");
  const isTpl = tab === "templates";
  const [view, setView] = useState("yours");
  const [q, setQ] = useState("");
  const [cs, setCs] = useState(new Set()); /* categories picked in the filter menu */
  const [pf, setPf] = useState(new Set()); /* filter menu: priority for skills, status for connectors */
  const [shut, setShut] = useState(new Set()); /* collapsed category groups */
  const [sort, setSort] = useState("priority");
  const [creating, setCreating] = useState(false);
  const fileRef = useRef(null);
  const [detail, setDetail] = useState(null);
  const all = isTpl ? [] : tab === "skills" ? [...EXT.skills, ...mine] : EXT[tab], term = q.trim().toLowerCase();
  const isAdded = (x) => added.includes(x.id);
  const inView = (x) => (view === "yours" ? x.scope === "you" || x.scope === "org" || (x.scope === "discover" && isAdded(x)) : x.scope === "discover");
  const flt = (x) => (pf.size === 0 || pf.has(tab === "skills" ? x.pri || "Yours" : tab === "connectors" ? (x.connected ? "Connected" : "Not connected") : ""));
  const ok0 = (x) => (!term || x.name.toLowerCase().includes(term) || x.desc.toLowerCase().includes(term)) && flt(x);
  const ok = (x) => ok0(x) && (cs.size === 0 || cs.has(x.cat));
  const rank = (x) => ({ P0: 0, P1: 1, P2: 2 })[x.pri] ?? 3;
  const ordered = (arr) => arr.filter(ok).sort((x, y) => (sort === "name" ? x.name.localeCompare(y.name) : sort === "recent" ? x.d - y.d || x.name.localeCompare(y.name) : rank(x) - rank(y) || x.name.localeCompare(y.name)));
  const catsHere = isTpl ? TPL_CATS : [...CAT_ORDER, ...[...new Set(all.map((x) => x.cat))].filter((c) => !CAT_ORDER.includes(c))].filter((c) => all.some((x) => x.cat === c));
  const filterOpts = tab === "skills" ? ["P0", "P1", "P2"] : tab === "connectors" ? ["Connected", "Not connected"] : null;
  const pickTab = (v) => { setTab(v); setCs(new Set()); setPf(new Set()); setShut(new Set()); setQ(""); };
  const pickView = (v) => { setView(v); setCs(new Set()); setShut(new Set()); };
  const sections = view === "yours"
    ? [["Created by you", ordered(all.filter((x) => x.scope === "you")), "by you"], ["Added by you", ordered(all.filter((x) => x.scope === "discover" && isAdded(x))), "added from Discover"], ["From your organization", ordered(all.filter((x) => x.scope === "org")), "pre-installed by your organization"]]
    : [["Suggested for your team", ordered(all.filter((x) => x.scope === "discover")), "available to add"]];
  const total = sections.reduce((n, sec) => n + sec[1].length, 0);
  const when = (x) => (x.scope === "you" ? (x.d === 0 ? "Today" : addDays(TODAY, -x.d).toLocaleDateString("en-US", { month: "short", day: "numeric" })) : x.d === 0 ? "Today" : x.d + "d ago");
  const usedBy = (x) => { if (x.agents === "all" || (tab === "skills" && isAdded(x))) return "All agents"; const n = (x.agents || []).filter((id) => agents.some((a) => a.id === id)).length; return n ? n + (n === 1 ? " agent" : " agents") : "No agents yet"; };
  const names = [...EXT.skills, ...mine].map((x) => x.name);
  const upload = (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = "";
    if (!f) return;
    const make = (nm, desc, how) => { let id = slug(nm) || "uploaded-skill", n = 2; const base = id; while (names.includes(id)) id = base + "-" + n++; onAddSkill({ id, name: id, cat: "Custom", desc, how }); };
    const fileBase = f.name.replace(/\.[^.]+$/, "");
    if (/\.(md|txt)$/i.test(f.name)) {
      const r = new FileReader();
      r.onload = () => {
        const t = String(r.result || ""), fm = t.match(/^---\n([\s\S]*?)\n---/);
        const get = (k) => { const m = fm && fm[1].match(new RegExp("^" + k + ":\\s*(.+)$", "m")); return m ? m[1].trim().replace(/^["']|["']$/g, "") : ""; };
        const rest = t.replace(/^---\n[\s\S]*?\n---\n?/, "");
        const first = rest.split("\n").map((l) => l.trim()).find((l) => l && !l.startsWith("#")) || "";
        make(get("name") || fileBase, (get("description") || first || "Uploaded from " + f.name + ".").slice(0, 140), rest.trim());
      };
      r.readAsText(f);
    } else make(fileBase, "Uploaded from " + f.name + ".", "");
  };
  const plusItems = tab === "skills" ? [["Create skill", () => setCreating(true)], ["Upload a skill", () => fileRef.current && fileRef.current.click()]] : tab === "connectors" ? [["Browse connectors", () => setView("discover")], ["Add a custom connector", () => notify()]] : [["Browse plugins", () => setView("discover")], ["Create plugin", () => notify()]];
  const tabBtn = (k, l, cur2, set) => <button key={k} role="tab" aria-selected={cur2 === k} className={"cl-tab" + (cur2 === k ? " on" : "")} onClick={() => set(k)}>{l}</button>;
  const sub = (x, lead) => {
    const extra = tab === "plugins" ? " Includes " + x.skills.length + (x.skills.length === 1 ? " skill" : " skills") + " and " + x.connectors.length + (x.connectors.length === 1 ? " connector." : " connectors.") : "";
    return x.desc + extra;
  };
  const row = (x, lead, you) => {
    const I = x.icon, disc = x.scope === "discover", done = isAdded(x), clickable = tab === "skills";
    return (
      <div key={x.id} className="hx-item"><div className="hx-row">
        {(() => { const inner = (<><span className="hx-tile"><I size={24} /></span><span className="hx-txt"><span className="ext-nm"><b className="hx-name">{x.name}</b></span><span className="hx-desc">{sub(x, lead)}</span></span></>); return clickable ? <button className="hx-main" aria-label={"Details for " + x.name} onClick={() => setDetail(x)}>{inner}</button> : <div className="hx-main static">{inner}</div>; })()}
        {tab === "skills" && (!disc || done) && <span className="ext-used">{usedBy(x)}</span>}
        {tab === "connectors" && !disc && (x.connected ? <span className="ext-st"><i />Connected</span> : <button className="btn" onClick={() => notify()}>Connect</button>)}
        {disc ? <button className="btn" disabled={done} onClick={() => { onAddExisting(x.id); notify(tab === "skills" ? "Added " + x.name + ". It is available to all agents." : "Added " + x.name); }}>{done ? "Added" : "Add"}</button> : <span className="ext-when">{when(x)}</span>}
        {you && <button className="ibtn" aria-label={"More actions for " + x.name} onClick={() => notify()}><MoreHorizontal size={16} /></button>}
      </div></div>
    );
  };
  const groupKey = (title, c) => title + "|" + c;
  const tplShown = isTpl ? athelasTemplates().filter((t) => (!term || (t.name + " " + t.desc + " " + t.cat + " " + t.skills.join(" ")).toLowerCase().includes(term)) && (cs.size === 0 || cs.has(t.cat))) : [];
  const tplGroups = TPL_CATS.filter((c) => tplShown.some((t) => t.cat === c));
  return (
    <div className="hub ext">
      <h1 className="ext-title">Tools</h1>
      <p className="ext-lead">{isTpl ? "Ready-made agents. Pick one and change it before you create it." : tab === "skills" ? "Skills your agents can use. Skills you create or add are available to every agent." : tab === "connectors" ? "The systems your agents can connect to, always through the egress proxy." : "Bundles of skills and connectors for a job."}</p>
      <div className="cl-top ext-top">
        <div className="cl-tabs">
          <div className="cl-tabs" role="tablist" aria-label="Agents, skills, connectors and plugins">{[["templates", "Agents"], ["skills", "Skills"], ["connectors", "Connectors"], ["plugins", "Plugins"]].map(([k, l]) => tabBtn(k, l, tab, pickTab))}</div>
          {!isTpl && <><span className="cl-div" /><div className="seg" role="tablist" aria-label="View">{[["yours", "Yours"], ["discover", "Discover"]].map(([k, l]) => <button key={k} role="tab" aria-selected={view === k} className={view === k ? "on" : ""} onClick={() => pickView(k)}>{l}</button>)}</div></>}
        </div>
        <div className="cl-act">
          <label className="ds-search"><input aria-label={"Search " + (isTpl ? "agents" : tab)} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /><Search size={16} /></label>
          <ExtMenu label="Filter" iconNode={<FigIcon name="filter" size={16} />}>{() => (
            <div className="xm-sec">
              <b>Category</b>
              {catsHere.map((c) => <label key={c} className="xm-ck"><Cb label={c} checked={cs.has(c)} onChange={() => { const n = new Set(cs); n.has(c) ? n.delete(c) : n.add(c); setCs(n); }} />{c}</label>)}
              {filterOpts && <><b>{tab === "skills" ? "Priority" : "Status"}</b>{filterOpts.map((c) => <label key={c} className="xm-ck"><Cb label={c} checked={pf.has(c)} onChange={() => { const n = new Set(pf); n.has(c) ? n.delete(c) : n.add(c); setPf(n); }} />{c}</label>)}</>}
              {(cs.size > 0 || pf.size > 0) && <button className="link" onClick={() => { setCs(new Set()); setPf(new Set()); }}>Clear</button>}
            </div>)}
          </ExtMenu>
          {!isTpl && (
          <ExtMenu label="Sort" icon={ArrowUpDown}>{(close) => (
            <div className="xm-sec"><b>Sort by</b>
              {[["priority", "Priority"], ["name", "Name A to Z"], ["recent", "Recently added"]].map(([k, l]) => <button key={k} role="menuitemradio" aria-checked={sort === k} className={"xm-it" + (sort === k ? " on" : "")} onClick={() => { setSort(k); close(); }}>{sort === k && <Check size={14} />}{l}</button>)}
            </div>)}
          </ExtMenu>
          )}
          {isTpl ? <button className="btn primary" onClick={onDescribe}>Describe your own</button> : <ExtMenu label="Add" primary>{(close) => <div className="xm-sec">{plusItems.map(([l, fn]) => <button key={l} role="menuitem" className="xm-it" onClick={() => { close(); fn(); }}>{l}</button>)}</div>}</ExtMenu>}
        </div>
      </div>
      <input ref={fileRef} type="file" accept=".md,.txt,.zip,.skill" hidden aria-label="Upload a skill file" onChange={upload} />
      {isTpl && tplShown.length > 0 && (
        <section className="ext-sec" aria-label="Agents">
          <h2>Ready-made agents<span className="cnt">{tplShown.length}</span></h2>
          <div className="hx-list">{tplGroups.map((c) => {
            const k = "tpl|" + c, closed = shut.has(k), items = tplShown.filter((t) => t.cat === c);
            return (<React.Fragment key={c}><button className={"ext-gh" + (closed ? " shut" : "")} aria-expanded={!closed} onClick={() => { const n = new Set(shut); closed ? n.delete(k) : n.add(k); setShut(n); }}><ChevronDown size={14} />{c}<span className="n">{items.length}</span></button>{!closed && items.map((t) => <TemplateRow key={t.id} t={t} onAdd={onUseTemplate} />)}</React.Fragment>);
          })}</div>
        </section>
      )}
      {isTpl && tplShown.length === 0 && <div className="empty"><b>No agents match.</b><span>Try a different search or clear the filter, or describe your own agent.</span></div>}
      {!isTpl && sections.filter((sec) => sec[1].length > 0).map(([title, list, lead]) => (
        <section key={title} className="ext-sec" aria-label={title}>
          <h2>{title}<span className="cnt">{list.length}</span></h2>
          <div className="hx-list">{[...CAT_ORDER, ...[...new Set(list.map((x) => x.cat))].filter((c) => !CAT_ORDER.includes(c))].filter((c) => list.some((x) => x.cat === c)).map((c) => {
            const k = groupKey(title, c), closed = shut.has(k), items = list.filter((x) => x.cat === c);
            return (<React.Fragment key={c}><button className={"ext-gh" + (closed ? " shut" : "")} aria-expanded={!closed} onClick={() => { const n = new Set(shut); closed ? n.delete(k) : n.add(k); setShut(n); }}><ChevronDown size={14} />{c}<span className="n">{items.length}</span></button>{!closed && items.map((x) => row(x, lead, x.scope === "you"))}</React.Fragment>);
          })}</div>
        </section>
      ))}
      {!isTpl && total === 0 && <div className="empty"><b>{term || cs.size || pf.size ? "Nothing matches." : "Nothing here yet."}</b><span>{term || cs.size || pf.size ? "Try a different search or clear the filter." : "Add something from Discover."}</span></div>}
      {detail && <SkillDetail k={detail} onClose={() => setDetail(null)} />}
      {creating && <NewSkillDialog names={names} onCancel={() => setCreating(false)} onCreate={(sk) => { setCreating(false); onAddSkill(sk); }} />}
    </div>
  );
}

function DocumentsPage({ agents, notify }) {
  const docs = {};
  agents.forEach((a) => (a.context || []).forEach((d) => { (docs[d] = docs[d] || []).push(a.name); }));
  const list = Object.entries(docs).sort((x, y) => y[1].length - x[1].length || x[0].localeCompare(y[0]));
  return (
    <div className="hub">
      <div className="hub-top"><h1>Documents</h1><button className="btn primary" onClick={() => notify()}><FigIcon name="add" size={18} />Add Document</button></div>
      <p className="pg-sub">The documents your agents read before they work a claim.</p>
      <div className="hx-list">
        {list.map(([name, by]) => (
          <PageRow key={name} icon={FileText} name={name} desc={"Updated " + addDays(TODAY, -(1 + (hashId(name) % 40))).toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ". Used by " + by.join(", ") + "."} aside={<button className="btn" onClick={() => notify()}>Open</button>} />
        ))}
        {list.length === 0 && <div className="empty"><b>No documents yet.</b><span>Add a document so your agents can use it.</span></div>}
      </div>
    </div>
  );
}
function ChatsPage({ chats, agents, onOpen, onNew }) {
  return (
    <div className="hub">
      <div className="hub-top"><h1>Chats</h1><button className="btn primary" onClick={onNew}><FigIcon name="add" size={18} />New Chat</button></div>
      <p className="pg-sub">Questions you asked about your claims and your agents.</p>
      <div className="hx-list">
        {chats.map((c) => {
          const who = (agents.find((a) => a.id === c.agentId) || { name: "Athelas AI" }).name, last = c.msgs[c.msgs.length - 1];
          return <PageRow key={c.id} icon={MessageSquare} name={c.name} desc={last ? (last.text || (last.card && last.card.title) || "") : "No messages yet."} label={"Open chat: " + c.name} onClick={() => onOpen(c.id)} aside={<span className="pg-by">{who}</span>} />;
        })}
        {chats.length === 0 && <div className="empty"><b>No chats yet.</b><span>Start one to ask about a claim or an agent.</span></div>}
      </div>
    </div>
  );
}
/* one message in a thread: plain text, or a card with rows and buttons */
function ThreadMsg({ m, onAction }) {
  return (
    <div className={"cmsg " + m.from}>
      {m.from === "agent" && <span className="cmsg-av"><AgentEmblem size={18} animate={false} /></span>}
      {m.card ? (
        <div className="cmsg-card">
          <p className="cmsg-t">{m.card.title}</p>
          {m.card.rows && <dl className="cmsg-rows">{m.card.rows.map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}</dl>}
          {m.card.text && <p className="cmsg-x">{m.card.text}</p>}
          {m.card.actions && <div className="cmsg-acts">{m.card.actions.map((a) => <button key={a.id} className={"btn" + (a.primary ? " primary" : "")} disabled={a.done} onClick={() => onAction && onAction(a)}>{a.done ? a.label + " (done)" : a.label}</button>)}</div>}
        </div>
      ) : <p>{m.text}</p>}
    </div>
  );
}
/* the first thing a new agent says: what it understood, and a way to try it */
function setupThread(a) {
  const approvals = a.perms ? PERMS.filter(([k]) => a.perms[k]).length : 0;
  const lvl = a.level ? LEVELS.find((l) => l[0] === a.level)[1] : "Suggest only";
  const nw = a.notify ? ({ ready: "tell you when results are ready", daily: "send a daily summary", never: "do not notify you" })[a.notify.when] : "tell you when results are ready";
  const rows = [
    ["Job", a.description || (a.instructions || "").split("\n")[0].slice(0, 120)],
    ["Runs", a.triggers ? triggersSummary(a.triggers) : "When you ask it to"],
    ["Skills", (a.skills || []).length ? a.skills.join(", ") : "None yet. Type / in my instructions to add one."],
    ["Context", a.context && a.context.length ? a.context.join(", ") : "No documents yet"],
    ["Auto-assign", a.rule ? a.rule.payer + " claims, " + (a.rule.on ? "on" : "off") : "Off. I only work claims you give me."],
    ["Safeguards", lvl + ". " + (approvals ? approvals + (approvals === 1 ? " step needs" : " steps need") + " your approval." : "Nothing needs your approval.") + " I " + nw + "."],
  ];
  return { id: "c" + Date.now(), name: "Setting up " + a.name, agentId: a.id, setup: true, msgs: [{ from: "agent", card: { title: "I'm ready. Here is what I understood.", rows, text: "Tell me if I got anything wrong. You can also try me on a few claims first. Nothing is sent or posted.", actions: [{ id: "try", label: "Try it on 3 claims", primary: true }, { id: "settings", label: "See settings" }] } }] };
}
function ChatPage({ chat, agents, onSend, onAction }) {
  const agent = agents.find((a) => a.id === chat.agentId);
  const [text, setText] = useState("");
  const end = useRef(null);
  useEffect(() => { if (end.current) end.current.scrollIntoView({ block: "end" }); }, [chat.msgs.length]);
  const send = () => { const t = text.trim(); if (!t) return; setText(""); onSend(chat, t); };
  return (
    <div className="chatpg">
      <div className="chat-h"><h1>{chat.name}</h1><span className="chat-who">{agent ? agent.name : "Athelas AI"}</span></div>
      <div className="cmsgs" role="log" aria-live="polite" aria-label="Messages">
        {chat.msgs.length === 0 && <div className="empty"><b>Ask a question</b><span>Ask about your claims or about what an agent did.</span></div>}
        {chat.msgs.map((m, i) => <ThreadMsg key={i} m={m} onAction={(a) => onAction && onAction(a, chat)} />)}
        <div ref={end} />
      </div>
      <div className="cmp">
        <textarea aria-label="Message" rows={1} placeholder="Ask a question" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button className="btn primary" disabled={!text.trim()} onClick={send}>Send</button>
      </div>
    </div>
  );
}
/* Claude style Chats entry: the label opens the list, a chevron folds the recent chats, a plus starts a new one */
function ChatsNav({ item, page, onGo, chats, onNew }) {
  const [open, setOpen] = useState(true);
  const on = page === "chats";
  return (
    <div className="chats-nav">
      <div className={"ni chats-row" + (on ? " on" : "")}>
        <button className="chats-main" aria-current={on ? "page" : undefined} onClick={() => onGo(item)}><MessageSquare size={16} /><span>Chats</span></button>
        <button className="chats-btn plus" aria-label="New chat" title="New chat" onClick={onNew}><Plus size={14} /></button>
        <button className="chats-btn" aria-label={open ? "Hide recent chats" : "Show recent chats"} aria-expanded={open} onClick={() => setOpen(!open)}><ChevronDown size={14} className={open ? "" : "rot"} /></button>
      </div>
      {open && chats.length > 0 && (
        <div className="chats-list">
          {chats.slice(0, 8).map((c) => { const act = page === "chat:" + c.id; return <button key={c.id} className={"chat-i" + (act ? " on" : "")} aria-current={act ? "page" : undefined} title={c.name} onClick={() => onGo({ page: "chat:" + c.id })}>{c.name}</button>; })}
        </div>
      )}
    </div>
  );
}

function NavGroup({ group, open, onToggle, page, onGo, chats, onNewChat }) {
  const Ic = group.icon;
  return (
    <div className="sgroup">
      <button className="shead" aria-expanded={open} onClick={onToggle}>
        <Ic size={16} /><span>{group.label}</span><ChevronDown size={16} className={open ? "flip" : ""} />
      </button>
      {open && (
        <div className="sbody">
          <span className="sline" />
          <div className="slist">
            {group.items.map((it) => it.kind === "chats" ? <ChatsNav key={it.l} item={it} page={page} onGo={onGo} chats={chats} onNew={onNewChat} /> : <NavItem key={it.l} item={it} active={it.page === page} onClick={() => onGo(it)} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function ImpersonationCard({ onStop }) {
  return (
    <div className="imp">
      <div className="imp-t"><Users size={16} /><span>Slate</span></div>
      <div className="imp-s">ID: 153271 &bull; GLD: Jun 2, 2026</div>
      <button className="link" onClick={onStop}>Stop Impersonating</button>
    </div>
  );
}

function SideNav({ page, onGo, notify, agents, readyCounts, chats, onNewChat }) {
  const groups = [{ id: "agents", label: "Agents", icon: AgentsIcon, items: [{ l: "Home", page: "agents", icon: Home }, { l: "Tools", page: "skills", icon: Zap }, { l: "Documents", page: "documents", icon: FileText }, { l: "Chats", page: "chats", kind: "chats" }] }, ...NAV];
  const [open, setOpen] = useState({ agents: true, ehr: true, insights: true, daily: true, utilities: true, admin: true });
  return (
    <nav className="sidecol" aria-label="Main">
      <AirLogo />
      <div className="sidescroll">
        {groups.map((g) => (
          <NavGroup key={g.id} group={g} open={open[g.id]} onToggle={() => setOpen({ ...open, [g.id]: !open[g.id] })} page={page} onGo={onGo} chats={chats} onNewChat={onNewChat} />
        ))}
      </div>
      <ImpersonationCard onStop={notify} />
      <div className="sfoot">
        <span className="avatar">LR</span>
        <button className="icon" aria-label="Settings" onClick={notify}><Settings size={16} /></button>
        <span className="grow" />
        <button className="icon" aria-label="Help" onClick={notify}><CircleHelp size={16} /></button>
      </div>
    </nav>
  );
}

function PanelFilled() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="2" width="13" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 2h4.500v12H2z" fill="currentColor" />
    </svg>
  );
}

function ScribeGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="6" cy="5" r="2.6" fill="currentColor" />
      <path d="M1.5 13c0-2.6 2-4.2 4.5-4.2S10.5 10.4 10.5 13z" fill="currentColor" />
      <path d="M11.5 4.2c1 .8 1 2.8 0 3.6M13.2 2.8c2 1.6 2 5 0 6.4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function TopBar({ navOff, onToggleNav, crumb, notify }) {
  return (
    <header className="hdr">
      <div className="hdr-l">
        <button className="icon hbtn" aria-label={navOff ? "Show navigation" : "Hide navigation"} aria-pressed={navOff} onClick={onToggleNav}><PanelFilled /></button>
        <div className="bc">{crumb.length > 1 && <><span className="bc-link">{crumb[0]}</span><span className="bc-sep">/</span></>}<span className={"bc-cur" + (crumb.length > 1 ? " pill" : "")}>{crumb[crumb.length - 1]}</span></div>
      </div>
      <div className="hdr-c">
        <button className="icon" aria-label="Notifications" onClick={notify}><Bell size={16} /></button>
        <button className="gsearch" onClick={notify}><Search size={16} />Global Search<span className="kbd">&#8984;K</span></button>
      </div>
      <div className="hdr-r">
        <button className="aitab icononly" aria-label="Voice" onClick={notify}><ScribeGlyph /></button>
        <button className="aitab" onClick={notify}><Mic size={16} />Scribe</button>
        <button className="aitab" onClick={notify}><Sparkles size={16} />Athelas AI</button>
      </div>
    </header>
  );
}

function ToggleButton({ icon, label, on, dot, onClick }) {
  return <button className={"tbtn" + (on ? " on" : "")} aria-label={label} aria-pressed={on === undefined ? undefined : on} onClick={onClick}><FigIcon name={icon} />{dot && <i className="tdot" aria-label="Filter applied" />}</button>;
}

function ClaimsTabs({ value, onChange, notify }) {
  return (
    <div className="cl-tabs" role="tablist">
      {TABS.map((t, i) => t.divider ? <span key={i} className="cl-div" /> : (
        <button key={t.k} role="tab" aria-selected={value === t.k} className={"cl-tab" + (value === t.k ? " on" : "")} onClick={() => onChange(t.k)}>
          {t.label}{t.count && value === t.k ? ` (${t.count})` : ""}
        </button>
      ))}
      <button className="ibtn" aria-label="Add view" onClick={notify}><FigIcon name="add" size={18} /></button>
    </div>
  );
}

function Bar({ w }) { return <span className="bar" style={{ width: w }} />; }

function Avatar({ agent, size = 28 }) {
  return <span className={"av av-" + agent.color} style={{ width: size, height: size }} title={agent.name}>{agent.color === "agent" ? <AgentEmblem size={size - 6} /> : agent.init}</span>;
}

function Cb({ checked, indeterminate, onChange, label, disabled }) {
  const ref = useRef(null);
  useLayoutEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return <input ref={ref} type="checkbox" className="cb" aria-label={label} checked={!!checked} disabled={disabled} onChange={onChange} onClick={(e) => e.stopPropagation()} />;
}

/* Group header line from Figma (10880:127410): "PAYER: Reason - CODE/CODE" as plain text, after the status tag and the amount chip */
function groupParts(g) {
  const flat = g.chips.flat(), withPayer = !!g.payer;
  const rest = flat.slice(withPayer ? 1 : 0);
  let reasons = rest.filter((x) => !isCode(x));
  const codes = rest.filter(isCode);
  let hd = withPayer ? flat[0] : null;
  if (!hd && reasons.length > 1) { hd = reasons[0]; reasons = reasons.slice(1); }
  const body = reasons.join(" / "), codesTxt = codes.length ? " - " + codes.join("/") : "";
  const head = hd || body, tail = hd ? (body ? ": " + body : "") + codesTxt : codesTxt;
  return { head, tail, full: head + tail };
}
function GroupLead({ g }) {
  return (
    <div className="clgin">
      <Tag status={g.status} filled />
      <span className="chip amt">
        <span aria-hidden="true"><b className="amt-n">{money(g.total).slice(1)}</b><span className="amt-x"> Balance</span><span className="amt-s"> | </span><b className="amt-c">{g.count}</b><span className="amt-x"> {g.count === "1" ? "Claim" : "Claims"}</span></span>
        <span className="vh">{money(g.total) + " balance, " + g.count + (g.count === "1" ? " claim" : " claims")}</span>
      </span>
      <span className="gline" title={groupParts(g).full}><b>{groupParts(g).head}</b>{groupParts(g).tail}</span>
    </div>
  );
}

function Tag({ status, row, filled }) {
  const m = STATUS[status];
  const I = m.icon;
  return <span className={"tag " + m.tone + (filled ? " filled" : "")}><I size={16} />{row ? m.row : status}</span>;
}

function AssigneeStack({ ids, dir }) {
  const uniq = [...new Set(ids)].slice(0, 3);
  return <span className="stack" aria-label={uniq.length + " assignees"}>{uniq.map((id) => <Avatar key={id} agent={dir[id]} />)}</span>;
}

function Banner({ children }) {
  return <div className="banner" role="alert"><Info size={16} />{children}</div>;
}

function WorkTag({ state }) {
  return <span className={"wtag " + state}>{state === "working" ? <AgentEmblem size={14} /> : <ClipboardCheck size={14} />}{WORK_LABEL[state]}</span>;
}

function useOutside(ref, onClose) {
  useEffect(() => {
    const down = (e) => { if (ref.current && !ref.current.contains(e.target) && !e.target.closest("[data-keep-open]")) onClose(); };
    const key = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [onClose]);
}

function AgentCard({ anchor, agent, claim, onOpen, onChange, onClose }) {
  const ref = useRef(null);
  useOutside(ref, onClose);
  const W = 280;
  const left = Math.min(Math.max(8, anchor.right - W), window.innerWidth - W - 8);
  const style = anchor.bottom + 170 > window.innerHeight ? { left, bottom: window.innerHeight - anchor.top + 4 } : { left, top: anchor.bottom + 4 };
  return (
    <div className="apo acard" ref={ref} style={style} role="dialog" aria-label={agent.name}>
      <div className="acard-h"><Avatar agent={agent} size={36} /><div><b>{agent.name}</b><span className="muted">{claim.work ? claim.work.type : "Agent"}</span></div></div>
      {claim.work && WORK_LABEL[claim.work.state] && <div className="acard-s"><WorkTag state={claim.work.state} /></div>}
      <div className="acard-b"><button className="btn primary" onClick={onOpen}>Open {agent.name}</button><button className="btn" onClick={onChange}>Change assignee</button></div>
    </div>
  );
}

function Dialog({ title, children, confirmLabel, onConfirm, onCancel, form, confirmDisabled }) {
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onCancel(); }; document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [onCancel]);
  return (
    <div className="dlg-back" onMouseDown={onCancel}>
      <div className={"dlg" + (form ? " form" : "")} role={form ? "dialog" : "alertdialog"} aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="dlg-b">{children}</div>
        <div className="ag-btns"><button className="btn" onClick={onCancel}>Cancel</button><button className="btn primary" autoFocus={!form} disabled={confirmDisabled} onClick={onConfirm}>{confirmLabel}</button></div>
      </div>
    </div>
  );
}

function ClaimPanel({ claim, dir, onClose, onReview, onEdit, onChat, goAgent, fixed }) {
  const w = claim.work;
  const agent = w ? dir[w.agentId] : null;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(w ? w.proposal : "");
  const [msg, setMsg] = useState("");
  const endRef = useRef(null);
  useEffect(() => { setEditing(false); setText(w ? w.proposal : ""); }, [claim.id, w && w.state]);
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [onClose]);
  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ block: "end" }); }, [w && w.chat.length]);
  const owner = dir[claim.assignee];
  const send = () => { const t = msg.trim(); if (!t) return; onChat(claim.id, t); setMsg(""); };
  const field = (k, v) => <div className="cp-f"><span>{k}</span><b>{v}</b></div>;
  return (
    <aside className={"cpanel" + (fixed ? " fx" : "")} aria-label={"Claim " + claim.id}>
      <header className="cp-h">
        <div><h2>Claim {claim.id}</h2><div className="cp-sub"><Tag status={claim.status} row /></div></div>
        <button className="ibtn" aria-label="Close claim" onClick={onClose}><X size={18} /></button>
      </header>
      <div className="cp-body">
        <div className="cp-grid">
          {field("Patient", claim.patient)}{field("Provider", claim.provider)}{field("Date of Service", claim.dos)}
          {field("Insurances", claim.payer)}{field("Amount", money(claim.amount))}{field("Time in status", claim.days + "d")}
          <div className="cp-f"><span>Assignee</span><b className="cp-own">{owner ? <><Avatar agent={owner} size={20} />{owner.name}</> : "Unassigned"}</b></div>
          {field("Stage", claim.stage)}
        </div>
        {!w && <p className="ag-muted">No agent has worked this claim.</p>}
        {w && (
          <section className="cp-sec">
            <div className="cp-sech"><h3>{agent.name}: {w.type}</h3>{WORK_LABEL[w.state] ? <WorkTag state={w.state} /> : <span className={"outcome " + w.state}>{w.state === "approved" ? "Approved" : "Rejected"}</span>}</div>
            {w.state === "working" && <p className="ag-muted">{agent.name} is working on this claim. The result will appear here.</p>}
            {w.state !== "working" && (
              <>
                <p className="cp-find">{w.finding}</p>
                <div className="cp-prop">
                  <div className="cp-proph"><span>{PROPOSAL_TITLE[w.type]}{w.edited ? " (edited)" : ""}</span></div>
                  {editing ? <textarea className="ag-ta" aria-label={PROPOSAL_TITLE[w.type]} rows={5} value={text} onChange={(e) => setText(e.target.value)} /> : <p>{w.proposal}</p>}
                </div>
                <div className="cp-src"><span className="muted">Sources</span>{w.sources.map((s) => <span key={s} className="chip">{s}</span>)}</div>
                {w.state === "ready" && !editing && (
                  <div className="cp-act"><button className="btn primary" onClick={() => onReview([claim.id], "approved")}>Approve</button><button className="btn" onClick={() => setEditing(true)}>Edit</button><button className="btn" onClick={() => onReview([claim.id], "rejected")}>Reject</button></div>
                )}
                {w.state === "ready" && editing && (
                  <div className="cp-act"><button className="btn primary" disabled={!text.trim()} onClick={() => { onEdit(claim.id, text.trim()); setEditing(false); }}>Save edits</button><button className="btn" onClick={() => { setText(w.proposal); setEditing(false); }}>Cancel</button></div>
                )}
                {w.state !== "ready" && <p className="cp-done"><CircleCheck size={16} />{w.state === "approved" ? "Approved" : "Rejected"} by {w.reviewer}. Your decision is saved in Activity. Nothing was sent or posted.</p>}
              </>
            )}
            {goAgent && <button className="link" onClick={() => goAgent(w.agentId)}>Open {agent.name}</button>}
          </section>
        )}
      </div>
      {w && (
        <footer className="cp-chat">
          <div className="cp-thread" aria-live="polite">
            {w.chat.length === 0 && <p className="ag-muted">Ask {agent.name} about this claim.</p>}
            {w.chat.map((m, i) => <div key={i} className={"cp-m " + m.from}>{m.text}</div>)}
            <span ref={endRef} />
          </div>
          <div className="cp-in"><input aria-label={"Message " + agent.name} placeholder={"Ask " + agent.name + " about this claim"} value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} /><button className="send" aria-label="Send" disabled={!msg.trim()} onClick={send}><ArrowUp size={18} /></button></div>
        </footer>
      )}
    </aside>
  );
}

function FilterRow({ assignees, value, onChange, onHide }) {
  const [menu, setMenu] = useState(null);
  const ref = useRef(null);
  useOutside(ref, () => setMenu(null));
  const active = value !== null;
  const name = (id) => (assignees.find((a) => a.id === id) || { name: "" }).name.replace(" (you)", "");
  const label = !active ? "" : value.length === 0 ? "none selected" : value.length === 1 ? name(value[0]) : value.length + " selected";
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div className="cl-filter" ref={ref}>
      <span className="fwrap">
        <button className="ibtn" aria-label="Add filter" aria-haspopup="menu" aria-expanded={menu === "add"} onClick={() => setMenu(menu === "add" ? null : "add")}><FigIcon name="add" size={18} /></button>
        {menu === "add" && <div className="fpop" role="menu"><button className="fpop-i" role="menuitem" disabled={active} onClick={() => { onChange([]); setMenu("values"); }}>Assignee</button>{active && <div className="fpop-h">All fields are in use</div>}</div>}
      </span>
      {active && (
        <span className="fwrap">
          <span className="fchip">
            <span className="fchip-k">Assignee</span>
            <button className="fchip-b" aria-haspopup="listbox" aria-expanded={menu === "values"} onClick={() => setMenu(menu === "values" ? null : "values")}>includes {label}<ChevronDown size={14} /></button>
            <button className="fchip-x" aria-label="Remove Assignee filter" onClick={() => { onChange(null); setMenu(null); }}><X size={14} /></button>
          </span>
          {menu === "values" && (
            <div className="fpop fvals" role="listbox" aria-label="Assignee values">
              {assignees.map((a) => <label key={a.id} className="apo-row"><Avatar agent={a} size={24} /><span className="apo-n">{a.name}</span><Cb label={a.name} checked={value.includes(a.id)} onChange={() => toggle(a.id)} /></label>)}
            </div>
          )}
        </span>
      )}
      <span className="grow" />
      <button className="link hide" onClick={onHide}><ChevronsDownUp size={16} />Hide</button>
    </div>
  );
}

function ClaimsTable({ state, groups, sel, open, onOpen, onToggle, onToggleGroup, onToggleAll, onAssignClick, onAgentClick, onOpenClaim, canOpen, tab, dir , onRetry }) {
  const rows = groups.flatMap((g) => g.rows);
  const nSel = rows.filter((r) => sel.has(r.id)).length;
  return (
    <div className="clwrap">
      <table className="cltbl" aria-busy={state === "loading"}>
        <thead>
          <tr>
            <th className="exp" />
            <th className="sel"><Cb label="Select all claims" checked={rows.length > 0 && nSel === rows.length} indeterminate={nSel > 0 && nSel < rows.length} disabled={state !== "live"} onChange={onToggleAll} /></th>
            {COLS.map(([k, l, w]) => <th key={k} style={{ minWidth: w, width: w }}>{l}</th>)}
            <th className="asg-h">Assignee</th>
          </tr>
        </thead>
        <tbody>
          {state === "loading" && (
            <>
              <tr className="clgrp"><td className="exp" /><td className="sel" /><td colSpan={COLS.length}><div className="clgin"><Bar w={28} /><Bar w={110} /><Bar w={180} /><Bar w={130} /></div></td><td className="asg-c"><Bar w={44} /></td></tr>
              {SKEL.map((r, i) => (
                <tr key={i} className="clrow skel">
                  <td className="exp" /><td className="sel" />
                  {r.map((w, j) => <td key={j}>{j === 0 ? <span className="muted">-</span> : <Bar w={w} />}</td>)}
                  <td className="asg-c"><Bar w={28} /></td>
                </tr>
              ))}
            </>
          )}
          {state === "error" && <tr className="clempty"><td colSpan={COLS.length + 3}><div className="empty err" role="alert"><span className="err-ic"><CircleAlert size={20} /></span><b>Claims could not be loaded.</b><button className="link" onClick={onRetry}>Try again</button></div></td></tr>}
          {state === "empty" && <tr className="clempty"><td colSpan={COLS.length + 3}><div className="empty"><SearchX size={20} /><b>{tab === "mine" ? "No claims are assigned to you." : "No claims match."}</b><span>{tab === "mine" ? "Claims you assign to yourself show up here." : "Try a different tab."}</span></div></td></tr>}
          {state === "live" && groups.map((g) => {
            const isOpen = !!open[g.key];
            const gSel = g.rows.filter((r) => sel.has(r.id)).length;
            return (
              <React.Fragment key={g.key}>
                <tr className="clgrp">
                  <td className="exp"><button className="ibtn" aria-label={isOpen ? "Collapse group" : "Expand group"} aria-expanded={isOpen} onClick={() => onOpen(g.key)}><ChevronDown size={18} className={isOpen ? "" : "rot"} /></button></td>
                  <td className="sel"><Cb label={"Select all in " + g.status} checked={gSel === g.rows.length} indeterminate={gSel > 0 && gSel < g.rows.length} onChange={() => onToggleGroup(g)} /></td>
                  <td colSpan={COLS.length}>
                    <GroupLead g={g} />
                  </td>
                  <td className="asg-c"><AssigneeStack dir={dir} ids={g.rows.map((r) => r.assignee).filter(Boolean)} /></td>
                </tr>
                {isOpen && g.rows.map((r) => (
                  <tr key={r.id} className={"clrow" + (sel.has(r.id) ? " picked" : "")}>
                    <td className="exp stripe" />
                    <td className="sel"><Cb label={"Select " + r.id} checked={sel.has(r.id)} onChange={() => onToggle(r.id)} /></td>
                    <td>{canOpen ? <button className="idlink" onClick={() => onOpenClaim(r.id)}>{r.id}</button> : r.id}</td>
                    <td><span className="stcell"><Tag status={r.status} row />{r.work && WORK_LABEL[r.work.state] && (canOpen ? <button className="wlink" aria-label={"Open claim " + r.id + ", " + WORK_LABEL[r.work.state]} onClick={() => onOpenClaim(r.id)}><WorkTag state={r.work.state} /></button> : <WorkTag state={r.work.state} />)}</span></td>
                    <td>{r.days}d</td>
                    <td><span className="tag info"><Repeat1 size={16} />{r.stage}</span></td>
                    <td><button className="plink" onClick={canOpen ? () => onOpenClaim(r.id) : notifyNoop}>{r.patient}</button></td>
                    <td>{r.provider}</td>
                    <td>{r.dos}</td>
                    <td><span className="ins"><CircleCheck size={16} />{r.payer}</span></td>
                    <td className="asg-c">
                      {r.assignee
                        ? <button className="asgb" aria-label={"Assigned to " + dir[r.assignee].name + ", change assignee"} onClick={(e) => (dir[r.assignee].kind === "agent" ? onAgentClick(e.currentTarget, r) : onAssignClick(e.currentTarget, [r.id]))}><Avatar agent={dir[r.assignee]} /></button>
                        : <button className="asgb empty" aria-label={"Assign " + r.id} onClick={(e) => onAssignClick(e.currentTarget, [r.id])}><UserPlus size={16} /></button>}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
const notifyNoop = (e) => e.stopPropagation();


/* ---------- My Claims: flat list, each claim expands to a summary and a two-step suggested action path ---------- */
function ExtLink({ children, onClick }) {
  const t = String(children), i = t.lastIndexOf(" ");
  const head = i < 0 ? "" : t.slice(0, i + 1), tail = i < 0 ? t : t.slice(i + 1);
  return <a className="xlink" href="#" role="button" onClick={(e) => { e.preventDefault(); onClick(); }}>{head}<span className="nw">{tail}<ExternalLink size={12} /></span></a>;
}
const segs = (arr, notify) => arr.map((x, i) => (typeof x === "string" ? <React.Fragment key={i}>{x}</React.Fragment> : x.link ? <ExtLink key={i} onClick={notify}>{x.link}</ExtLink> : <b key={i} className="b-strong">{x.bold}</b>));

function ActionStep({ a, mode, vote, onVote, onAccept, notify }) {
  const [all, setAll] = useState(false);
  const shown = all ? a.chips : a.chips.slice(0, 1), extra = a.chips.length - 1;
  return (
    <div className={"st st-" + mode}>
      <span className="st-emb"><AgentEmblem size={20} animate={mode === "active"} /></span>
      <div className="st-body">
        {mode === "active" ? (
          <>
            <div className="st-t">{a.title}</div>
            <div className="st-card">
              <p>{segs(a.body, notify)}</p>
              <div className="st-foot">
                <div className="st-chg"><span>What will change:</span>
                  {shown.map(([l, f, t], i) => <span key={i} className="st-chip">{l}: <s>{f}</s> &rarr; {t}</span>)}
                  {extra > 0 && <button className="st-chip st-more" aria-expanded={all} title={all ? "Show fewer changes" : "Show " + extra + " more " + (extra === 1 ? "change" : "changes")} onClick={() => setAll(!all)}>{all ? "Show less" : "+" + extra}<ChevronDown size={12} className={all ? "up" : ""} /></button>}
                </div>
                <div className="st-acts">
                  <button className={"vbtn" + (vote === "up" ? " on" : "")} aria-label="Helpful" title="Helpful" aria-pressed={vote === "up"} onClick={() => onVote("up")}><ThumbsUp size={16} /></button>
                  <button className={"vbtn" + (vote === "down" ? " on" : "")} aria-label="Not helpful" title="Not helpful" aria-pressed={vote === "down"} onClick={() => onVote("down")}><ThumbsDown size={16} /></button>
                  <button className="vbtn note" aria-label="View medical record" title="View medical record" onClick={notify}><FileText size={16} /></button>
                  <span className="st-sep" />
                  <button className="btn primary" onClick={(e) => onAccept(e.detail === 0)}>Accept</button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={"st-card slim" + (mode === "done" ? " done" : "")}>
            <span className="st-slim">{mode === "done" && <Check size={16} />}{a.title}</span>
            {mode === "done" ? <span className="st-ok">Accepted</span> : <button className="btn off" disabled>Accept</button>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- My Claims is clear: celebratory empty state ---------- */
const MIN_SAVED_PER_CLAIM = 8; /* assumption: about 8 minutes saved per claim (roughly 10 by hand versus 1.5 with suggestions) */
const CONFETTI = Array.from({ length: 32 }, (_, i) => {
  const a = (i / 32) * Math.PI * 2 + ((i * 7) % 5) * 0.08, d = 110 + ((i * 41) % 120);
  return { x: Math.round(Math.cos(a) * d), y: Math.round(Math.sin(a) * d * 0.5 - 28), r: ((i * 67) % 540) - 180, d: ((i % 8) * 0.035).toFixed(2), c: i % 4, w: i % 3 === 0 ? 8 : 6, h: i % 3 === 0 ? 8 : 12, rd: i % 3 === 0 };
});
function AllClear({ claims, goneIds, onWorkable }) {
  const base = claims.filter((c) => (goneIds.length ? goneIds.includes(c.id) : c.assignee === ME));
  const solved = Math.max(base.length, 1);
  const mins = solved * MIN_SAVED_PER_CLAIM;
  const saved = mins >= 60 ? (mins / 60).toFixed(1) + " hrs" : mins + " min";
  const counts = {};
  base.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
  const chips = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <div className="clwrap clearwrap">
      <section className="clear" aria-labelledby="clr-h">
        <div className="clr-art" aria-hidden="true">
          {CONFETTI.map((q, i) => <i key={i} className={"cf cf" + q.c + (q.rd ? " rd" : "")} style={{ "--x": q.x + "px", "--y": q.y + "px", "--r": q.r + "deg", "--d": q.d + "s", width: q.w, height: q.h }} />)}
          <span className="clr-badge"><Check size={34} strokeWidth={3} /></span>
        </div>
        <h2 id="clr-h">You cleared My Claims</h2>
        <p className="clr-sub" role="status">Every claim assigned to you is solved. Take a breather, or pick up more work.</p>
        <div className="clr-stats">
          <div className="clr-stat"><span>Claims solved</span><b>{solved}</b></div>
          <div className="clr-stat"><span>Actions accepted</span><b>{solved * 2}</b></div>
          <div className="clr-stat"><span>Time saved (est)</span><b>{saved}</b><small>About {MIN_SAVED_PER_CLAIM} min per claim</small></div>
        </div>
        {chips.length > 0 && <div className="clr-chips" aria-label="What you solved">{chips.map(([st, n]) => <span key={st} className="clr-chip">{STATUS[st] ? STATUS[st].row : st}<b>{n}</b></span>)}</div>}
        <button className="btn primary" onClick={onWorkable}>View Workable Claims</button>
      </section>
    </div>
  );
}

function MyClaimsTable({ state, groups, sel, onToggle, onToggleGroup, onToggleAll, dir, gOpen, onToggleGroupOpen, open, onToggleOpen, step, onAccept, votes, onVote, onAssignClick, notify, allDone, claims, goneIds, onWorkable, onRetry, onTableKey }) {
  if (state === "clear" || (state === "empty" && allDone)) return <AllClear claims={claims} goneIds={goneIds} onWorkable={onWorkable} />;
  const rows = groups.flatMap((g) => g.rows);
  const nSel = rows.filter((r) => sel.has(r.id)).length;
  const claimRows = (r) => {
    const isOpen = !!open[r.id], b = isOpen ? claimBrief(r) : null, st = step[r.id] || 0;
    return (
      <React.Fragment key={r.id}>
        <tr className={"clrow" + (sel.has(r.id) ? " picked" : "")}>
          <td className="exp stripe"><button className="ibtn" aria-label={isOpen ? "Collapse claim " + r.id : "Expand claim " + r.id} aria-expanded={isOpen} onClick={(e) => onToggleOpen(r.id, e.detail === 0)}><ChevronDown size={18} className={isOpen ? "" : "rot"} /></button></td>
          <td className="sel"><Cb label={"Select " + r.id} checked={sel.has(r.id)} onChange={() => onToggle(r.id)} /></td>
          <td>{r.id}</td>
          <td><span className="stcell"><Tag status={r.status} row />{r.work && WORK_LABEL[r.work.state] && <WorkTag state={r.work.state} />}</span></td>
          <td>{r.days}d</td>
          <td><span className="tag info"><Repeat1 size={16} />{r.stage}</span></td>
          <td><button className="plink" onClick={notifyNoop}>{r.patient}</button></td>
          <td>{r.provider}</td>
          <td>{r.dos}</td>
          <td><span className="ins"><CircleCheck size={16} />{r.payer}</span></td>
          <td className="asg-c"><button className="asgb" aria-label={"Assigned to " + dir[r.assignee].name + ", change assignee"} onClick={(e) => onAssignClick(e.currentTarget, [r.id])}><Avatar agent={dir[r.assignee]} /></button></td>
        </tr>
        {isOpen && (
          <tr className="myctx">
            <td colSpan={COLS.length + 3}>
              <div className="mypanel" id={"panel-" + r.id} tabIndex={-1} role="region" aria-label={"Claim " + r.id + " details"}>
                <div className="mp-l">
                  <h3>Where things stand</h3><p>{segs(b.stand, notify)}</p>
                  <h3>What to do next</h3><p>{segs(b.next, notify)}</p>
                </div>
                <div className="mp-r" aria-label="Suggested actions">
                  {b.actions.map((a, i) => (
                    <ActionStep key={i} a={a} vote={votes[r.id + ":" + i]} onVote={(v) => onVote(r.id + ":" + i, v)} notify={notify}
                      mode={i === 0 ? (st === 0 ? "active" : "done") : st === 0 ? "waiting" : st === 1 ? "active" : "done"}
                      onAccept={(kb) => onAccept(r, i, a, kb)} />
                  ))}
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };
  return (
    <div className="clwrap">
      <table className="cltbl mytbl" id="claims-list" aria-busy={state === "loading"} onKeyDown={onTableKey}>
        <thead>
          <tr>
            <th className="exp" />
            <th className="sel"><Cb label="Select all claims" checked={rows.length > 0 && nSel === rows.length} indeterminate={nSel > 0 && nSel < rows.length} disabled={state !== "live"} onChange={onToggleAll} /></th>
            {COLS.map(([k, l, w]) => <th key={k} style={{ minWidth: w, width: w }}>{l}</th>)}
            <th className="asg-h">Assignee</th>
          </tr>
        </thead>
        <tbody>
          {state === "loading" && (
            <>
              <tr className="clgrp"><td className="exp" /><td className="sel" /><td colSpan={COLS.length}><div className="clgin"><Bar w={28} /><Bar w={110} /><Bar w={180} /><Bar w={130} /></div></td><td className="asg-c"><Bar w={44} /></td></tr>
              {SKEL.map((r, i) => (
                <tr key={i} className="clrow skel">
                  <td className="exp" /><td className="sel" />
                  {r.map((w, j) => <td key={j}>{j === 0 ? <span className="muted">-</span> : <Bar w={w} />}</td>)}
                  <td className="asg-c"><Bar w={28} /></td>
                </tr>
              ))}
            </>
          )}
          {state === "error" && <tr className="clempty"><td colSpan={COLS.length + 3}><div className="empty err" role="alert"><span className="err-ic"><CircleAlert size={20} /></span><b>Claims could not be loaded.</b><button className="link" onClick={onRetry}>Try again</button></div></td></tr>}
          {state === "empty" && <tr className="clempty"><td colSpan={COLS.length + 3}><div className="empty"><SearchX size={20} /><b>No claims are assigned to you.</b><span>Claims you assign to yourself show up here.</span></div></td></tr>}
          {state === "live" && groups.map((g, gi) => {
            const isOpen = !!gOpen[g.key];
            const gSel = g.rows.filter((r) => sel.has(r.id)).length;
            return (
              <React.Fragment key={g.key}>
                {gi > 0 && <tr className="grpgap" aria-hidden="true"><td colSpan={COLS.length + 3} /></tr>}
                <tr className={"clgrp" + (isOpen ? " open" : "")}>
                  <td className="exp"><button className="ibtn" aria-label={isOpen ? "Collapse group" : "Expand group"} aria-expanded={isOpen} onClick={() => onToggleGroupOpen(g.key)}><ChevronDown size={18} className={isOpen ? "" : "rot"} /></button></td>
                  <td className="sel"><Cb label={"Select all in " + g.status} checked={gSel === g.rows.length} indeterminate={gSel > 0 && gSel < g.rows.length} onChange={() => onToggleGroup(g)} /></td>
                  <td colSpan={COLS.length}>
                    <GroupLead g={g} />
                  </td>
                  <td className="asg-c"><AssigneeStack dir={dir} ids={g.rows.map((r) => r.assignee).filter(Boolean)} /></td>
                </tr>
                {isOpen && g.rows.map(claimRows)}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AssignPopover({ anchor, ids, claims, list: all, onPick, onClose }) {
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const down = (e) => { if (ref.current && !ref.current.contains(e.target) && !e.target.closest("[data-assign-anchor]")) onClose(); };
    const key = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [onClose]);
  const target = claims.filter((c) => ids.includes(c.id));
  const stateOf = (a) => { const n = target.filter((c) => c.assignee === a.id).length; return n === 0 ? "none" : n === target.length ? "all" : "some"; };
  const list = all.filter((a) => a.name.toLowerCase().includes(q.trim().toLowerCase()));
  const people = list.filter((a) => a.kind === "person"), queues = list.filter((a) => a.kind === "queue"), bots = list.filter((a) => a.kind === "agent");
  const W = 280, H = 360;
  const left = Math.min(Math.max(8, anchor.above ? anchor.left : anchor.right - W), window.innerWidth - W - 8);
  const style = anchor.above ? { left, bottom: window.innerHeight - anchor.top + 8 } : (anchor.bottom + H + 12 > window.innerHeight ? { left, bottom: window.innerHeight - anchor.top + 4 } : { left, top: anchor.bottom + 4 });
  const Row = ({ a }) => {
    const st = stateOf(a);
    return (
      <label className="apo-row">
        <Avatar agent={a} /><span className="apo-n">{a.name}</span>
        <Cb label={a.name} checked={st === "all"} indeterminate={st === "some"} onChange={() => onPick(a, st === "all")} />
      </label>
    );
  };
  return (
    <div className="apo" ref={ref} style={style} role="dialog" aria-label="Assign claims">
      <div className="apo-s"><Search size={16} /><input autoFocus placeholder="Search by name" aria-label="Search agents" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="apo-l">
        {people.map((a) => <Row key={a.id} a={a} />)}
        {people.length > 0 && queues.length > 0 && <div className="apo-div" />}
        {queues.map((a) => <Row key={a.id} a={a} />)}
        {bots.length > 0 && (people.length > 0 || queues.length > 0) && <div className="apo-div" />}
        {bots.map((a) => <Row key={a.id} a={a} />)}
        {!list.length && <div className="apo-none">No one matches "{q}".</div>}
      </div>
    </div>
  );
}

function BulkBar({ n, onAssign, onAsk, onClear }) {
  return (
    <div className="bulk" role="region" aria-label="Bulk actions">
      <span className="bulk-tab">Bulk Actions</span>
      <span className="bulk-n">{n} Selected</span>
      <span className="bulk-sep" />
      <button className="bulk-btn" data-assign-anchor onClick={(e) => onAssign(e.currentTarget)}><UserPlus size={16} />Assign</button>
      <button className="bulk-btn" onClick={onAsk}><Sparkles size={16} />Ask Athelas AI</button>
      <button className="bulk-btn" onClick={onAsk}><Command size={16} />More Actions</button>
      <button className="bulk-x" aria-label="Clear selection" onClick={onClear}><X size={18} /></button>
    </div>
  );
}

function DemoSwitch({ value, onChange }) {
  return (
    <label className="demo">
      <span>Demo state</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Demo state">
        <option value="live">Live data</option><option value="loading">Loading</option><option value="empty">Empty</option><option value="clear">All clear</option><option value="error">Error</option>
      </select>
    </label>
  );
}

function ClaimsPage({ notify, claims, agents, assign, review, editProposal, sendChat, intent, clearIntent, goAgent, myStep, onMyStep, myGone, onMyGone, onFullDenialsDone }) {
  const assignees = [...AGENTS, ...agents.map(toAssignee)];
  const dir = Object.fromEntries(assignees.map((a) => [a.id, a]));
  const [tab, setTab] = useState("mine"); /* My Claims is the default tab */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fAssignee, setFAssignee] = useState(null);
  const [sel, setSel] = useState(() => new Set());
  const [open, setOpen] = useState({});
  const [demo, setDemo] = useState("live");
  const [busy, setBusy] = useState(true);
  const [pop, setPop] = useState(null); /* { anchor, ids, bulk } */
  const [card, setCard] = useState(null); /* { anchor, claim } */
  const [panelId, setPanelId] = useState(null);
  const [rowOpen, setRowOpen] = useState({}); /* My Claims: which claims are expanded */
  const [myOpen, setMyOpen] = useState({}); /* My Claims: which groups are expanded */
  const [votes, setVotes] = useState({});

  useEffect(() => { setBusy(true); setSel(new Set()); setPop(null); setCard(null); const t = setTimeout(() => setBusy(false), 650); return () => clearTimeout(t); }, [tab, demo]);

  /* arriving from an agent page: filter to that agent and/or open a claim */
  useEffect(() => {
    if (!intent) return;
    if (intent.assignee) {
      setFAssignee([intent.assignee]); setFiltersOpen(true); setTab("workable");
      const keys = GROUPS.filter((g) => claims.some((c) => c.group === g.key && c.assignee === intent.assignee)).map((g) => g.key);
      setOpen((o) => ({ ...o, ...Object.fromEntries(keys.map((k) => [k, true])) }));
    }
    if (intent.claim) {
      const c = claims.find((x) => x.id === intent.claim);
      if (!intent.assignee) setFAssignee(null);
      if (c) setOpen((o) => ({ ...o, [c.group]: true }));
      if (CLAIMS_PANEL) setPanelId(intent.claim);
    }
    clearIntent();
  }, [intent]);

  const passAssignee = (c) => !fAssignee || fAssignee.length === 0 || fAssignee.includes(c.assignee);
  const inTab = (c) => (tab === "mine" ? c.assignee === ME : tab === "under" ? false : true) && passAssignee(c);
  const groups = GROUPS.map((g) => {
    const rows = claims.filter((c) => c.group === g.key && inTab(c));
    return { ...g, rows, total: tab === "mine" || fAssignee ? rows.reduce((s, r) => s + r.amount, 0) : g.amount, count: tab === "mine" || fAssignee ? String(rows.length) : g.count };
  }).filter((g) => g.rows.length);
  const mineList = claims.filter((c) => c.assignee === ME && !myGone.includes(c.id) && passAssignee(c));
  const state = demo === "clear" ? (tab === "mine" ? "clear" : "live") : demo !== "live" ? demo : busy ? "loading" : (tab === "mine" ? mineList.length : groups.length) ? "live" : "empty";
  const rows = tab === "mine" ? mineList : groups.flatMap((g) => g.rows);
  /* the first claim in My Claims opens by default, and the next one opens when it is solved */
  const myGroups = [...GROUPS].sort((a, b) => (b.key === "g17") - (a.key === "g17")).map((g) => {
    const rs = mineList.filter((c) => c.group === g.key);
    return { ...g, rows: rs, total: rs.reduce((t, r) => t + r.amount, 0), count: String(rs.length) };
  }).filter((g) => g.rows.length);
  const firstG = tab === "mine" && myGroups.length ? myGroups[0] : null;
  const firstId = firstG ? firstG.rows[0].id : null;
  useEffect(() => { if (firstG) { setMyOpen({ [firstG.key]: true }); setRowOpen((o) => ({ ...o, [firstId]: true })); } }, [firstId]);
  /* when the group you are working in is finished, the next group opens with its first claim */
  const keysStr = myGroups.map((g) => g.key).join(",");
  const prevGroups = useRef({ keys: [], open: null });
  useEffect(() => {
    const keys = myGroups.map((g) => g.key), prev = prevGroups.current;
    if (tab === "mine" && prev.open && !keys.includes(prev.open) && keys.length) {
      const at = prev.keys.indexOf(prev.open);
      const next = myGroups.find((g) => prev.keys.indexOf(g.key) > at) || myGroups[0];
      setMyOpen({ [next.key]: true }); setRowOpen((o) => ({ ...o, [next.rows[0].id]: true }));
      prevGroups.current = { keys, open: next.key };
      return;
    }
    prevGroups.current = { keys, open: Object.keys(myOpen).find((k) => myOpen[k]) || null };
  }, [keysStr, myOpen]);
  const toggleMyGroup = (g) => setSel((p) => { const n = new Set(p); const all = g.rows.every((r) => n.has(r.id)); g.rows.forEach((r) => (all ? n.delete(r.id) : n.add(r.id))); return n; });
  /* when the last Full Denial in My Claims is solved, the app offers to build an agent */
  useEffect(() => {
    const full = claims.filter((x) => x.status === "Full Denials");
    const doneFull = full.filter((x) => myGone.includes(x.id)).length;
    const left = full.filter((x) => x.assignee === ME && !myGone.includes(x.id)).length;
    if (doneFull > 0 && left === 0) onFullDenialsDone(doneFull);
  }, [myGone]);
  /* keyboard: a claim opened with the keyboard moves focus into its panel */
  const toggleClaimOpen = (id, kb) => {
    const opening = !rowOpen[id];
    setRowOpen((o) => ({ ...o, [id]: !o[id] }));
    if (kb && opening) setTimeout(() => { const el = document.getElementById("panel-" + id); if (el) el.focus(); }, 30);
  };
  const jumpToList = (e) => { e.preventDefault(); const b = document.querySelector(".clwrap tbody .exp .ibtn"); if (b) b.focus(); };
  const onTableKey = (e) => {
    const t = e.target;
    if (!t.matches || !t.matches("tbody .exp .ibtn")) return;
    const stops = [...e.currentTarget.querySelectorAll("tbody .exp .ibtn")], i = stops.indexOf(t);
    if (i < 0) return;
    const go = (n) => { const el = stops[Math.max(0, Math.min(stops.length - 1, n))]; if (el) { e.preventDefault(); el.focus(); el.scrollIntoView({ block: "nearest" }); } };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(stops.length - 1);
    else if (e.key === "ArrowRight" && t.getAttribute("aria-expanded") === "false") { e.preventDefault(); t.click(); }
    else if (e.key === "ArrowLeft" && t.getAttribute("aria-expanded") === "true") { e.preventDefault(); t.click(); }
  };
  /* presentation mode hides the Demo state pill: open the page with ?present, or press Shift+P */
  const [present, setPresent] = useState(() => /[?&]present(=|&|$)/.test(window.location.search));
  useEffect(() => {
    const h = (e) => { const tg = e.target; if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === "p" && !(tg && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) || tg.isContentEditable))) setPresent((v) => !v); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  /* Accept the first action: the second activates. Accept the second: the claim leaves the list. */
  const acceptStep = (c, i, a, kb) => {
    if (i === 0) { onMyStep(c.id, 1); notify("Accepted: " + a.title); if (kb) setTimeout(() => { const b = document.querySelector("#panel-" + c.id + " .st-active .btn.primary"); if (b) b.focus(); }, 80); return; }
    onMyStep(c.id, 2); notify("Accepted: " + a.title + ". Claim " + c.id + " is done and leaves My Claims. Nothing was sent in this prototype.");
    setTimeout(() => { onMyGone(c.id); setSel((p) => { const n = new Set(p); n.delete(c.id); return n; });
      if (kb) setTimeout(() => { const el = document.querySelector(".mypanel") || document.querySelector(".mytbl tbody .exp .ibtn"); if (el) el.focus(); }, 150); }, 700);
  };

  const toggle = (id) => setSel((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleGroup = (g) => setSel((p) => { const n = new Set(p); const all = g.rows.every((r) => n.has(r.id)); g.rows.forEach((r) => (all ? n.delete(r.id) : n.add(r.id))); return n; });
  const toggleAll = () => setSel((p) => (rows.every((r) => p.has(r.id)) ? new Set() : new Set(rows.map((r) => r.id))));
  const rect = (el) => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; };
  const openAssign = (el, ids, bulk) => { setCard(null); setPop({ anchor: { ...rect(el), above: !!bulk }, ids, bulk: !!bulk }); };
  const openAgent = (el, claim) => { setPop(null); setCard({ anchor: rect(el), claim }); };
  const pick = (agent, wasAll) => {
    const ids = pop.ids, n = ids.length;
    assign(ids, wasAll ? null : agent.id, false);
    notify(wasAll ? `Unassigned ${n} ${n === 1 ? "claim" : "claims"}` : `Assigned ${n} ${n === 1 ? "claim" : "claims"} to ${agent.name.replace(" (you)", "")}`);
    if (pop.bulk) setSel(new Set());
    setPop(null);
  };
  const panelClaim = CLAIMS_PANEL && panelId ? claims.find((c) => c.id === panelId) : null;

  return (
    <div className="clpage">
      <a className="skip" href="#claims-list" onClick={jumpToList}>Jump to claims list</a>
      <div className="cl-top">
        <ClaimsTabs value={tab} onChange={setTab} notify={notify} />
        <div className="cl-act">
          <ToggleButton icon="filter" label={filtersOpen ? "Hide filters" : "Show filters"} on={filtersOpen} dot={!filtersOpen && fAssignee !== null} onClick={() => setFiltersOpen(!filtersOpen)} />
          <ToggleButton icon="settings" label="Table settings" onClick={notify} />
          <span className="cl-div" />
          <ToggleButton icon="history" label="History" onClick={notify} />
          <ToggleButton icon="download" label="Export claims" onClick={notify} />
          <ToggleButton icon="chart" label="Analytics" onClick={notify} />
          <button className="btn primary" onClick={notify}><FigIcon name="add" size={18} />Create Claim</button>
        </div>
      </div>
      {filtersOpen && <FilterRow assignees={assignees} value={fAssignee} onChange={setFAssignee} onHide={() => setFiltersOpen(false)} />}
      {tab === "mine" ? (
        <MyClaimsTable state={state} groups={state === "live" ? myGroups : []} sel={sel} onToggle={toggle} onToggleGroup={toggleMyGroup} onToggleAll={toggleAll} dir={dir}
          gOpen={myOpen} onToggleGroupOpen={(k) => setMyOpen((o) => (o[k] ? {} : { [k]: true }))} open={rowOpen} onToggleOpen={toggleClaimOpen} step={myStep} onAccept={acceptStep} onRetry={() => setDemo("live")} onTableKey={onTableKey}
          votes={votes} onVote={(k, v) => setVotes((p) => ({ ...p, [k]: p[k] === v ? null : v }))}
          onAssignClick={(el, ids) => openAssign(el, ids, false)} notify={notify} allDone={myGone.length > 0} claims={claims} goneIds={myGone} onWorkable={() => setTab("workable")} />
      ) : (
        <ClaimsTable state={state} groups={state === "live" ? groups : []} sel={sel} open={open} tab={tab} dir={dir}
          onOpen={(k) => setOpen((o) => ({ ...o, [k]: !o[k] }))} onToggle={toggle} onToggleGroup={toggleGroup} onToggleAll={toggleAll}
          onAssignClick={(el, ids) => openAssign(el, ids, false)} onAgentClick={openAgent} onOpenClaim={setPanelId} canOpen={CLAIMS_PANEL} onRetry={() => setDemo("live")} />
      )}
      {sel.size > 0 && state === "live" && <BulkBar n={sel.size} onAssign={(el) => openAssign(el, [...sel], true)} onAsk={notify} onClear={() => { setSel(new Set()); setPop(null); }} />}
      {pop && <AssignPopover anchor={pop.anchor} ids={pop.ids} claims={claims} list={assignees} onPick={pick} onClose={() => setPop(null)} />}
      {card && <AgentCard anchor={card.anchor} agent={dir[card.claim.assignee]} claim={card.claim} onClose={() => setCard(null)}
        onOpen={() => { setCard(null); goAgent(card.claim.assignee); }}
        onChange={(e) => { const c = card; setCard(null); setPop({ anchor: { ...c.anchor, above: false }, ids: [c.claim.id], bulk: false }); }} />}
      {panelClaim && <ClaimPanel claim={panelClaim} dir={dir} onClose={() => setPanelId(null)} onReview={review} onEdit={editProposal} onChat={sendChat} goAgent={goAgent} />}
      {!present && <DemoSwitch value={demo} onChange={setDemo} />}
    </div>
  );
}

/* ---------- Agent pages (layout follows the Claude Projects page) ---------- */

function InstructionsCard({ agent, onSave, skills }) {
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState(agent.instructions);
  useEffect(() => { setText(agent.instructions); setEdit(false); }, [agent.id]);
  return (
    <section className="ag-sec">
      <div className="ag-h"><h2>Instructions</h2><button className="ibtn" aria-label={agent.instructions ? "Edit instructions" : "Add instructions"} onClick={() => setEdit(true)}>{agent.instructions ? <Pencil size={16} /> : <Plus size={18} />}</button></div>
      {edit ? (
        <>
          <SkillTextarea label="Instructions" autoFocus skills={skills || []} value={text} onChange={setText} rows={9} />
          <div className="sl-hint">Type <kbd>/</kbd> to use a skill.</div>
          <div className="ag-btns"><button className="btn" onClick={() => { setText(agent.instructions); setEdit(false); }}>Cancel</button><button className="btn primary" onClick={() => { onSave(text.trim()); setEdit(false); }}>Save</button></div>
        </>
      ) : agent.instructions ? <p className="ag-clamp">{agent.instructions}</p> : <p className="ag-muted">Add instructions to tailor how this agent works.</p>}
    </section>
  );
}

function RuleCard({ agent, onRule, notify }) {
  const r = agent.rule;
  return (
    <section className="ag-sec">
      <div className="ag-h"><h2>Auto-assign</h2>{r && <button className={"sw" + (r.on ? " on" : "")} role="switch" aria-checked={r.on} aria-label="Auto-assign" onClick={() => onRule({ ...r, on: !r.on })}><span /></button>}</div>
      {r ? (
        <p className="ag-rule">When a <select aria-label="Payer group" value={r.payer} onChange={(e) => onRule({ ...r, payer: e.target.value })}>{PAYER_GROUPS.map((g) => <option key={g}>{g}</option>)}</select> claim needs action, assign it to {agent.name}.</p>
      ) : (
        <><p className="ag-muted">Send claims to this agent automatically.</p><button className="link" onClick={() => onRule({ payer: "Medicare", on: false })}>Add rule</button></>
      )}
    </section>
  );
}

function ContextCard({ agent, onAdd, onRemove }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const add = () => { if (!name.trim()) return; onAdd(name.trim()); setName(""); setAdding(false); };
  return (
    <section className="ag-sec">
      <div className="ag-h"><h2>Context</h2><button className="ibtn" aria-label="Add context" onClick={() => setAdding(true)}><Plus size={18} /></button></div>
      {adding && (
        <div className="ag-add"><input autoFocus aria-label="Document name" placeholder="Document name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); if (e.key === "Escape") setAdding(false); }} /><button className="btn primary" disabled={!name.trim()} onClick={add}>Add</button></div>
      )}
      {agent.context.length ? (
        <ul className="ag-docs">{agent.context.map((d) => (
          <li key={d}><FileText size={16} /><span>{d}</span><button className="ibtn rm" aria-label={"Remove " + d} onClick={() => onRemove(d)}><X size={16} /></button></li>
        ))}</ul>
      ) : <div className="ag-drop"><FileText size={20} /><span>Add PDFs, documents, or other text this agent should know.</span></div>}
    </section>
  );
}

function TaskBar({ n, onApprove, onClear }) {
  return (
    <div className="bulk" role="region" aria-label="Bulk actions">
      <span className="bulk-tab">Bulk Actions</span>
      <span className="bulk-n">{n} Selected</span>
      <span className="bulk-sep" />
      <button className="bulk-btn primary" onClick={onApprove}>Approve {n}</button>
      <button className="bulk-x" aria-label="Clear selection" onClick={onClear}><X size={18} /></button>
    </div>
  );
}

function TriggersCard({ agent, onChange }) {
  const fb = useRef(null);
  if (!fb.current) fb.current = defaultTriggers(); /* agents made before triggers existed start from the default */
  const list = agent.triggers || fb.current;
  return (
    <section className="ag-sec">
      <div className="ag-h"><h2>Triggers</h2></div>
      <div className="tg tg-side">
        {list.length === 0 && <p className="ag-muted">No triggers. This agent only runs when you ask it to.</p>}
        {list.map((t) => <TriggerRow key={t.id} t={t} onChange={(nt) => onChange(list.map((x) => (x.id === t.id ? nt : x)))} onDelete={() => onChange(list.filter((x) => x.id !== t.id))} />)}
        <div><AddTrigger onAdd={(type) => onChange([...list, newTrigger(type)])} /></div>
      </div>
    </section>
  );
}
function SkillsCard({ skills, onManage }) {
  return (
    <section className="ag-sec">
      <div className="ag-h"><h2>Skills</h2><button className="link" onClick={onManage}>Manage</button></div>
      {skills.length === 0 ? <p className="ag-muted">No skills yet.</p> : <ul className="ag-docs ag-skills">{skills.map((k) => <li key={k.id}><Zap size={16} /><span>{k.name}</span>{k.shared && <em className="sk-tag">All agents</em>}</li>)}</ul>}
      <p className="ag-muted">Skills you create or add are available to every agent.</p>
    </section>
  );
}
function AgentPage({ agent, claims, activity, dir, onUpdate, onRule, onApprove, onReview, onEdit, onChat, goClaims, notify, skills, onManageSkills, pickSkills, thread, onThreadSend, onThreadAction }) {
  const [tab, setTab] = useState(() => (thread && !claims.some((c) => c.assignee === agent.id && c.work && WORK_LABEL[c.work.state]) ? "thread" : "tasks"));
  const [tText, setTText] = useState("");
  const tEnd = useRef(null);
  useEffect(() => { if (tab === "thread" && tEnd.current) tEnd.current.scrollIntoView({ block: "nearest" }); }, [tab, thread && thread.msgs.length]);
  const tSend = () => { const t = tText.trim(); if (!t || !thread) return; setTText(""); onThreadSend(thread, t); };
  const tAct = (a) => { if (a.id === "settings") { const el = document.querySelector(".ag-side"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); } else if (a.id === "review") setTab("tasks"); else onThreadAction(a, thread); };
  const [panelId, setPanelId] = useState(null);
  const [sel, setSel] = useState(() => new Set());
  const [confirm, setConfirm] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 5000); return () => clearInterval(t); }, []);
  const mine = claims.filter((c) => c.assignee === agent.id && c.work && WORK_LABEL[c.work.state]);
  const ready = mine.filter((c) => c.work.state === "ready");
  const selected = ready.filter((c) => sel.has(c.id));
  const events = activity.filter((e) => e.agentId === agent.id).slice(0, 60);
  const toggle = (id) => setSel((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allReady = ready.length > 0 && selected.length === ready.length;
  const byType = selected.reduce((m, c) => { m[c.work.type] = (m[c.work.type] || 0) + 1; return m; }, {});
  const approve = () => { onApprove(selected.map((c) => c.id)); setSel(new Set()); setConfirm(false); };
  return (
    <div className="ag">
      <div className="ag-top">
        <div className="ag-id">
          <span className="ag-emblem"><AgentEmblem size={40} /></span>
          <div>
            <h1 className="ag-title">{agent.name}</h1>
            <div className="ag-meta">Created by you<span className="dot-sep" />{agent.description || "No description yet"}</div>
          </div>
        </div>
        <div className="ag-actions">
          {agent.paused && <span className="ag-pill paused">Paused</span>}
          {ready.length > 0 && <span className="ag-pill"><ClipboardCheck size={16} />{ready.length} ready for review</span>}
          <button className="btn" onClick={() => goClaims(agent.id)}>View in Claims</button>
        </div>
      </div>
      <div className="ag-grid">
        <div className="ag-main">
          <div className="ag-tabs" role="tablist">
            {thread && <button role="tab" aria-selected={tab === "thread"} className={"cl-tab" + (tab === "thread" ? " on" : "")} onClick={() => setTab("thread")}>Thread</button>}
            <button role="tab" aria-selected={tab === "tasks"} className={"cl-tab" + (tab === "tasks" ? " on" : "")} onClick={() => setTab("tasks")}>Tasks ({mine.length})</button>
            <button role="tab" aria-selected={tab === "activity"} className={"cl-tab" + (tab === "activity" ? " on" : "")} onClick={() => setTab("activity")}>Activity</button>
          </div>
          {tab === "thread" && thread && (
            <div className="ag-thread">
              <div className="cmsgs" role="log" aria-live="polite" aria-label="Thread">
                {thread.msgs.map((m, i) => <ThreadMsg key={i} m={m} onAction={tAct} />)}
                <div ref={tEnd} />
              </div>
              <div className="cmp">
                <textarea aria-label="Message to the agent" rows={1} placeholder={"Tell " + agent.name + " what to change, or ask a question"} value={tText} onChange={(e) => setTText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); tSend(); } }} />
                <button className="btn primary" disabled={!tText.trim()} onClick={tSend}>Send</button>
              </div>
            </div>
          )}
          {tab === "activity" && (
            events.length ? (
              <ul className="ag-act">{events.map((e) => (
                <li key={e.id}><span className="ag-t">{rel(e.t)}</span><span><button className="plink" onClick={() => setPanelId(e.claimId)}>Claim {e.claimId}</button><span className="ag-sep">{e.text}</span></span></li>
              ))}</ul>
            ) : <div className="ag-empty"><b>No activity yet.</b><span>What {agent.name} does will be listed here, newest first.</span></div>
          )}
          {tab === "tasks" && (
            mine.length ? (
              <>
                <div className="tk">
                  <table className="cltbl">
                    <thead><tr>
                      <th className="sel"><Cb label="Select all ready results" checked={allReady} indeterminate={selected.length > 0 && !allReady} disabled={ready.length === 0} onChange={() => setSel(allReady ? new Set() : new Set(ready.map((c) => c.id)))} /></th>
                      <th style={{ minWidth: 110 }}>Claim</th><th style={{ minWidth: 170 }}>What it did</th><th style={{ minWidth: 160 }}>State</th><th style={{ minWidth: 160 }}>Patient</th><th style={{ minWidth: 190 }}>Insurances</th>
                    </tr></thead>
                    <tbody>{mine.map((c) => (
                      <tr key={c.id} className={"clrow tkrow" + (sel.has(c.id) ? " picked" : "") + (panelId === c.id ? " open" : "")} onClick={() => setPanelId(c.id)}>
                        <td className="sel"><Cb label={"Select " + c.id} checked={sel.has(c.id)} disabled={c.work.state !== "ready"} onChange={() => toggle(c.id)} /></td>
                        <td><button className="idlink" onClick={(e) => { e.stopPropagation(); setPanelId(c.id); }}>{c.id}</button></td>
                        <td>{c.work.type}</td>
                        <td><WorkTag state={c.work.state} /></td>
                        <td>{c.patient}</td>
                        <td><span className="ins"><CircleCheck size={16} />{c.payer}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </>
            ) : <div className="ag-empty"><b>No tasks right now.</b><span>Claims assigned to {agent.name} show up here until you review them.</span></div>
          )}
        </div>
        <aside className="ag-side" aria-label="Agent configuration">
          <InstructionsCard agent={agent} onSave={(t) => onUpdate({ instructions: t, skills: skillTokens(t, pickSkills || []) })} skills={pickSkills} />
          <RuleCard agent={agent} onRule={onRule} notify={notify} />
          <TriggersCard agent={agent} onChange={(triggers) => onUpdate({ triggers })} />
          <section className="ag-sec"><div className="ag-h"><h2>Memory</h2></div><p className="ag-muted">Memory will show here after the agent works a few claims.</p></section>
          <ContextCard agent={agent} onAdd={(n) => onUpdate({ context: [...agent.context, n] })} onRemove={(n) => onUpdate({ context: agent.context.filter((d) => d !== n) })} />
          <SkillsCard skills={skills || []} onManage={onManageSkills} />
        </aside>
      </div>
      {panelId && claims.find((c) => c.id === panelId) && <ClaimPanel fixed claim={claims.find((c) => c.id === panelId)} dir={dir} onClose={() => setPanelId(null)} onReview={onReview} onEdit={onEdit} onChat={onChat} goAgent={null} />}
      {tab === "tasks" && selected.length > 0 && <TaskBar n={selected.length} onApprove={() => setConfirm(true)} onClear={() => setSel(new Set())} />}
      {confirm && (
        <Dialog title={`Approve ${selected.length} ${selected.length === 1 ? "result" : "results"}?`} confirmLabel={`Approve ${selected.length}`} onConfirm={approve} onCancel={() => setConfirm(false)}>
          <p>Your approval is saved in Activity. This prototype does not send or post anything, and the claims stay as they are.</p>
          <ul>{Object.entries(byType).map(([t, n]) => <li key={t}>{n} {t.toLowerCase()}{n === 1 ? "" : "s"}</li>)}</ul>
        </Dialog>
      )}
    </div>
  );
}

function Metrics({ items }) {
  return <span className="hx-m">{items.map(([l, v]) => <span key={l}><i>{l}</i> <b>{v}</b></span>)}</span>;
}
function AgentRow({ r, open, onToggle, activity, onOpen, onPause, onDelete }) {
  const { a, st, s: n } = r, k = st === "Waiting on schedule" ? "waiting" : st.toLowerCase();
  const done = n.worked ? Math.round(((n.worked - n.working) / n.worked) * 100) : 0;
  const Ic = AGENT_ICONS[a.icon];
  const events = activity.filter((e) => e.agentId === a.id).sort((x, y) => y.t - x.t);
  const why = {};
  activity.forEach((e) => { if (e.agentId === a.id && /-a-/.test(e.id)) why[e.text] = (why[e.text] || 0) + 1; });
  const reasons = Object.entries(why).sort((x, y) => y[1] - x[1]);
  const ruleLine = a.paused ? "This agent is paused, so it takes no new claims." : a.rule && a.rule.on ? "Auto-assign is on. Every " + a.rule.payer + " claim that needs action goes to " + a.name + "." : "Auto-assign is off. This agent only works claims that were assigned to it.";
  return (
    <div className={"hx-item" + (open ? " open" : "")}>
      <div className="hx-row hx-int" onClick={onToggle}>
        <button className="hx-main" aria-expanded={open} aria-controls={"hx-p-" + a.id} onClick={(e) => { e.stopPropagation(); onToggle(); }}>
          <span className="hx-tile">{Ic ? <Ic size={24} /> : <AgentEmblem size={24} animate={false} />}</span>
          <span className="hx-txt"><b className="hx-name">{a.name}</b><Metrics items={[["Claims worked", n.worked], ["Completed", done + "%"], ["Queue", n.working], ["Need review", n.ready]]} /></span>
        </button>
        <span className={"hc-st " + k}><i />{st}</span>
        <button className="btn" onClick={(e) => { e.stopPropagation(); onOpen(a); }}>Open</button>
      </div>
      {open && (
        <div className="hx-panels" id={"hx-p-" + a.id}>
          <section className="hx-pn" aria-label="What the system did">
            <h3>What the system did</h3>
            <p>{n.worked ? "Worked " + n.worked + (n.worked === 1 ? " claim" : " claims") + ". " + n.ready + " need your review and " + n.approved + " are approved." : "No claims worked yet."}{k === "waiting" ? " " + waitingText(a) : ""}</p>
            {events.length > 0 && <ul className="hx-ev">{events.slice(0, 4).map((e) => <li key={e.id}><span>{e.text}</span><em>Claim {e.claimId} &middot; {agoText(e.t)}</em></li>)}</ul>}
            {events.length > 4 && <button className="link" onClick={() => onOpen(a)}>See all activity</button>}
          </section>
          <section className="hx-pn" aria-label="Why these claims are yours">
            <h3>Why these claims are yours</h3>
            <p>{ruleLine}</p>
            {reasons.length > 0 ? <ul className="hx-why">{reasons.map(([txt, c]) => <li key={txt}><b>{c}</b><span>{txt}</span></li>)}</ul> : <p>No claims have been assigned yet.</p>}
          </section>
          <div className="hx-ft">
            <button className="btn" onClick={() => onPause(a)}>{a.paused ? <Play size={16} /> : <Pause size={16} />}{a.paused ? "Resume" : "Pause"}</button>
            <button className="btn" onClick={() => onDelete(a)}><Trash2 size={16} />Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
function PersonaSwitch({ value, onChange }) {
  return (
    <div className="persona" role="group" aria-label="Demo: view as">
      <span>View as</span>
      {[["biller", "Biller"], ["manager", "Billing manager"]].map(([k, l]) => <button key={k} aria-pressed={value === k} className={value === k ? "on" : ""} onClick={() => onChange(k)}>{l}</button>)}
    </div>
  );
}
function ManagerPanels({ claims, agents, rows, myGone, onOpen, onPause, onOpenClaims }) {
  const un = claims.filter((c) => !c.assignee).length;
  const needs = rows.reduce((n, r) => n + r.s.ready, 0), top = [...rows].sort((x, y) => y.s.ready - x.s.ready)[0];
  const items = [];
  if (un) items.push({ id: "un", icon: Users, tone: "amber", title: un.toLocaleString() + " claims nobody owns", text: "Hand them to a biller or an agent.", cta: "Assign", go: onOpenClaims });
  if (needs && top) items.push({ id: "rv", icon: ClipboardCheck, tone: "blue", title: needs + " agent results are waiting for review", text: top.a.name + " has the most (" + top.s.ready + ").", cta: "Review", go: () => onOpen(top.a) });
  agents.filter((a) => a.paused).forEach((a) => items.push({ id: "p" + a.id, icon: Pause, tone: "gray", title: a.name + " is paused", text: "It takes no new claims until you resume it.", cta: "Resume", go: () => onPause(a) }));
  const people = AGENTS.filter((a) => a.kind === "person").map((a) => {
    const you = a.id === ME;
    return { id: a.id, name: a.name.replace(" (you)", ""), init: a.init, you, open: claims.filter((c) => c.assignee === a.id && !(you && myGone.includes(c.id))).length, solved: you ? myGone.length : (hashId(a.id) % 9) + 2 };
  }).sort((x, y) => y.open - x.open);
  const max = Math.max(1, ...people.map((x) => x.open));
  return (
    <>
      <section className="mg-sec" aria-label="Needs your attention">
        <h2 className="hub-h2">Needs your attention</h2>
        {items.length ? (
          <ul className="mg-att">{items.map((i) => { const I = i.icon; return (
            <li key={i.id}><span className={"mg-ic " + i.tone}><I size={18} /></span><span className="mg-tx"><b>{i.title}</b><span>{i.text}</span></span><button className="btn" onClick={i.go}>{i.cta}</button></li>
          ); })}</ul>
        ) : <p className="ag-muted">All clear. Nothing needs you right now.</p>}
      </section>
      <section className="mg-sec" aria-label="Team workload">
        <h2 className="hub-h2">Team</h2>
        <table className="mg-tbl">
          <thead><tr><th>Biller</th><th>Open claims</th><th>Solved today</th></tr></thead>
          <tbody>{people.map((x) => (
            <tr key={x.id}>
              <td><span className="mg-who"><span className="mg-av">{x.init}</span>{x.name}{x.you && <em>you</em>}</span></td>
              <td><span className="mg-bar"><i style={{ width: Math.round((x.open / max) * 100) + "%" }} /></span><b>{x.open}</b></td>
              <td>{x.solved}</td>
            </tr>
          ))}</tbody>
        </table>
      </section>
    </>
  );
}
function HubPage({ agents, claims, activity, onOpen, onNew, onShowAll, onPause, onDelete, onAddTemplate, persona, myGone, onOpenClaims }) {
  const mgr = persona === "manager";
  const [tab, setTab] = useState("all");
  const [view, setView] = useState("yours");
  const [openId, setOpenId] = useState(null); /* one agent open at a time */
  const [del, setDel] = useState(null);
  const rows = agents.map((a) => ({ a, st: agentStatus(a, claims), s: agentStats(a, claims) }));
  const keyOf = (st) => (st === "Waiting on schedule" ? "waiting" : st.toLowerCase());
  const active = rows.filter((r) => r.st === "Running" || r.st === "Waiting on schedule").length;
  const ids = new Set(agents.map((a) => a.id));
  const approved = rows.reduce((n, r) => n + r.s.approved, 0);
  const mins = approved * MIN_PER_RESULT;
  const saved = mins >= 60 ? (mins / 60).toFixed(1) + " hrs" : mins + " min";
  const needs = rows.reduce((n, r) => n + r.s.ready, 0); /* results waiting for your review */
  const worked = rows.reduce((n, r) => n + r.s.worked, 0), queued = rows.reduce((n, r) => n + r.s.working, 0);
  const completion = worked ? Math.round(((worked - queued) / worked) * 100) : 0; /* share of the claims worked that are finished */
  const shown = rows.filter((r) => tab === "all" || keyOf(r.st) === tab);
  const stat = (icon, label, value, tip) => (
    <div className="hub-stat" title={tip || label}><span className="hub-ic">{icon}</span><span className="hub-sl">{label}</span><b>{value}</b></div>
  );
  return (
    <div className="hub">
      <div className="hub-top"><h1>Home</h1><button className="btn primary" onClick={onNew}><FigIcon name="add" size={18} />Add Agent</button></div>
      <div className="hub-stats">
        {mgr ? (
          <>
            {stat(<Users size={16} />, "Open claims", (claims.length - (myGone || []).length).toLocaleString(), "Claims the team still has to work, owned by a person, a queue or an agent")}
            {stat(<FileText size={16} />, "Unassigned", claims.filter((c) => !c.assignee).length.toLocaleString(), "Claims that nobody owns")}
            {stat(<ClipboardCheck size={16} />, "Needs review", needs.toLocaleString(), "Agent results waiting for review")}
            {stat(<CircleCheck size={16} />, "Completion", completion + "%", "Share of the claims your agents worked that are finished and no longer in the queue")}
          </>
        ) : (
          <>
            {stat(<AgentEmblem size={18} animate={false} />, "Active agents", active + "/" + rows.length, "Agents that are running or waiting for their next trigger, out of all agents")}
            {stat(<ClipboardCheck size={16} />, "Needs review", needs.toLocaleString(), "Results waiting for your review")}
            {stat(<CircleCheck size={16} />, "Completion", completion + "%", "Share of the claims your agents worked that are finished and no longer in the queue")}
            {stat(<Clock size={16} />, "Time saved", saved, "Estimated time saved, at " + MIN_PER_RESULT + " minutes per approved result")}
          </>
        )}
      </div>
      {mgr && <ManagerPanels claims={claims} agents={agents} rows={rows} myGone={myGone || []} onOpen={onOpen} onPause={onPause} onOpenClaims={onOpenClaims} />}
      <h2 className="hub-h2">Agents</h2>
      <div className="hub-bar">
        {view === "yours" ? (
          <div className="hub-ftabs" role="tablist" aria-label="Filter agents">
            {[["all", "All"], ["running", "Running"], ["waiting", "Waiting on schedule"], ["paused", "Paused"]].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={"cl-tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
        ) : <span />}
        <div className="seg" role="tablist" aria-label="Agents view">
          <button role="tab" aria-selected={view === "yours"} className={view === "yours" ? "on" : ""} onClick={() => setView("yours")}>Yours</button>
          <button role="tab" aria-selected={view === "discover"} className={view === "discover" ? "on" : ""} onClick={() => setView("discover")}>Discover</button>
        </div>
      </div>
      {view === "yours" ? (
        <div className="hx-list">
          {shown.map((r) => <AgentRow key={r.a.id} r={r} open={openId === r.a.id} onToggle={() => setOpenId((cur) => (cur === r.a.id ? null : r.a.id))} activity={activity} onOpen={onOpen} onPause={onPause} onDelete={setDel} />)}
          {shown.length === 0 && <div className="empty"><b>No agents here.</b><span>{tab === "all" ? "Add an agent to get started." : "Try another filter."}</span></div>}
        </div>
      ) : (
        <div className="hx-list">
          <TemplateGroups templates={athelasTemplates()} onAdd={onAddTemplate} />
        </div>
      )}
      {del && (
        <Dialog title={"Delete " + del.name + "?"} confirmLabel="Delete agent" onConfirm={() => { onDelete(del); setDel(null); }} onCancel={() => setDel(null)}>
          <p>{agentStats(del, claims).worked} claims it worked go back to unassigned. This cannot be undone.</p>
        </Dialog>
      )}
    </div>
  );
}


const FOLLOWUPS = ["Check the payer portal first", "Only work Medicare claims", "Send every result to me for review"];

function DraftCard({ icon: I, title, desc, children }) {
  return (
    <section className="tcard">
      <div className="tcard-h"><span className="tcard-i"><I size={18} /></span><div><h3>{title}</h3><p>{desc}</p></div></div>
      {children && <div className="tcard-b">{children}</div>}
    </section>
  );
}

/* ---------- After the last Full Denial is solved: offer to build an agent for that work ---------- */
function seedFromFullDenials(count, taken) {
  let name = "Full Denials Agent", k = 2;
  while (taken.includes(name)) name = "Full Denials Agent " + k++;
  const lines = [
    BASE_LINE,
    "Work claims in Full Denials with CO-16 and remark M76 (diagnosis missing, incomplete or invalid).",
    "Review the diagnosis codes against the chart. Remove symptom, history or conflicting codes (Excludes1), correct the 7th character, and point every line to the confirmed diagnosis.",
    "Then prepare the resubmission to the payer. Do not send it until it is approved.",
    "Prepare claims with the same cause together, oldest first.",
    UNSURE_LINE,
  ];
  return {
    id: Date.now(),
    text: "Build an agent that does what I just did on the Full Denials: fix the diagnoses, then resubmit.",
    reply: "Here is a draft built from the Full Denials you just solved. You fixed the diagnoses on " + count + (count === 1 ? " claim" : " claims") + " and prepared each resubmission. I added the instructions, suggested context and an auto-assign rule for Commercial claims that stays off until you turn it on. Change anything below, then create the agent.",
    draft: { name, description: "Fixes the diagnoses on Full Denials (CO-16 / M76) and prepares the resubmission.", instructions: lines.join("\n"), context: ["Payer policies", "Appeals guide", "ICD-10 coding guidelines"], rule: { payer: "Commercial", on: false } },
  };
}
function AgentOffer({ offer, progress, onBuild, onLater, onView }) {
  if (offer.stage === "done") {
    const { total, ready } = progress, all = total > 0 && ready >= total;
    return (
      <section className="offer" role="region" aria-label="Agent set up" aria-live="polite">
        <span className="offer-i"><AgentEmblem size={22} animate={!all} /></span>
        <div className="offer-t">
          <div className="offer-c">
            <h3>{offer.name} is set up and working</h3>
            <p>{total > 0 ? "It started on " + total + " Full Denials that nobody owns yet. " : "It is watching for new Full Denials. "}Every result comes to you for review, and nothing is sent without your approval.</p>
          </div>
          <ul className="offer-ck">
            <li><Check size={14} />Instructions saved</li>
            <li><Check size={14} />{offer.docs} context documents added</li>
            {total > 0 && <li><Check size={14} />Started on {total} Full Denials</li>}
          </ul>
          {total > 0 && (
            <>
              <div className="offer-pg" role="progressbar" aria-label="Results ready for review" aria-valuemin={0} aria-valuemax={total} aria-valuenow={ready}><i style={{ width: (ready / total) * 100 + "%" }} /></div>
              <div className="offer-st">{all ? "All " + total + " results are ready for review" : ready + " of " + total + " ready for review"}</div>
            </>
          )}
          <div className="offer-b"><button className="offer-go" onClick={onLater}>Done</button><button className="offer-no" onClick={onView}>View agent</button></div>
        </div>
        <button className="ibtn offer-x" aria-label="Dismiss" onClick={onLater}><X size={16} /></button>
      </section>
    );
  }
  const { count } = offer;
  return (
    <section className="offer" role="region" aria-label="Build an agent for Full Denials">
      <span className="offer-i"><AgentEmblem size={22} /></span>
      <div className="offer-t">
        <div className="offer-c">
          <h3>Build an agent for Full Denials?</h3>
          <p>You solved all {count} Full Denials in My Claims. An agent can do the first pass next time: fix the diagnoses, prepare the resubmission, and send each result to you for review.</p>
        </div>
        <div className="offer-b"><button className="offer-go" onClick={onBuild}>Build Agent</button><button className="offer-no" onClick={onLater}>Not Now</button></div>
      </div>
      <button className="ibtn offer-x" aria-label="Dismiss" onClick={onLater}><X size={16} /></button>
    </section>
  );
}

/* ---------- triggers: when an agent runs (a time, or something that happens) ---------- */
const FREQS = [["once", "Once"], ["hourly", "Hourly"], ["daily", "Daily"], ["weekly", "Weekly"], ["monthly", "Monthly"], ["yearly", "Yearly"]];
const WEEKDAYS = [["weekdays", "Weekdays"], ["mon", "Monday"], ["tue", "Tuesday"], ["wed", "Wednesday"], ["thu", "Thursday"], ["fri", "Friday"], ["sat", "Saturday"], ["sun", "Sunday"]];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const EVENTS = [["assigned", "a new claim is assigned"], ["denied", "a claim is denied"], ["payment", "a payment arrives"], ["status", "a claim changes status"], ["alert", "an alert fires"], ["incident", "an incident is declared"], ["deploy", "a deploy is about to ship"], ["finding", "a security finding arrives"], ["skill", "a skill is proposed"]];
const DOMS = [...Array.from({ length: 28 }, (_, i) => [String(i + 1), "Day " + (i + 1)]), ["last", "Last day"]];
const DAYS31 = Array.from({ length: 31 }, (_, i) => [String(i + 1), String(i + 1)]);
const pad2 = (n) => String(n).padStart(2, "0");
const timeText = (at) => at.h + ":" + pad2(at.m) + " " + at.ap;
const tid = () => "t" + Math.random().toString(36).slice(2, 7);
const isoToday = () => TODAY.getFullYear() + "-" + pad2(TODAY.getMonth() + 1) + "-" + pad2(TODAY.getDate());
const newTrigger = (type) => (type === "event" ? { id: tid(), type: "event", event: "assigned" } : { id: tid(), type: "time", freq: "daily", day: "weekdays", dom: "1", month: 0, date: isoToday(), at: { h: 9, m: 0, ap: "AM" } });
const defaultTriggers = () => [{ ...newTrigger("time"), freq: "weekly", day: "weekdays", at: { h: 6, m: 0, ap: "AM" } }, newTrigger("event")];
const lc = (x) => x.charAt(0).toLowerCase() + x.slice(1);
function triggerText(t) {
  if (t.type === "event") return "When " + (EVENTS.find((e) => e[0] === t.event) || EVENTS[0])[1];
  const at = timeText(t.at);
  if (t.freq === "once") return "Once on " + new Date(t.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " at " + at;
  if (t.freq === "hourly") return "Hourly at :" + pad2(t.at.m);
  if (t.freq === "daily") return "Daily at " + at;
  if (t.freq === "weekly") return (t.day === "weekdays" ? "Weekdays" : WEEKDAYS.find((x) => x[0] === t.day)[1] + "s") + " at " + at;
  if (t.freq === "monthly") return "Monthly on " + (t.dom === "last" ? "the last day" : "day " + t.dom) + " at " + at;
  return "Yearly on " + MONTHS[t.month].slice(0, 3) + " " + t.dom + " at " + at;
}
const triggersSummary = (list) => (!list.length ? "None, runs when you ask" : list.slice(0, 2).map((t, i) => (i ? lc(triggerText(t)) : triggerText(t))).join(", ") + (list.length > 2 ? ", +" + (list.length - 2) + " more" : ""));
function waitingText(a) {
  const list = a.triggers;
  if (!list) return "Waiting for the next run, " + SCHEDULE + ".";
  const tm = list.find((x) => x.type === "time");
  if (tm) return "Waiting for the next run: " + lc(triggerText(tm)) + ".";
  const ev = list.find((x) => x.type === "event");
  return ev ? "Waiting until " + (EVENTS.find((e) => e[0] === ev.event) || EVENTS[0])[1] + "." : "Waiting until you run it.";
}
/* ---------- Athelas templates: ready-made agents. Adding one makes you your own copy of it. ---------- */
const TPL = (id, cat, by, icon, name, desc, lines, context, skills, triggers) => ({ id, cat, by, icon, name, desc, lines, context, skills, triggers });
const TPL_CATS = ["Revenue cycle", "Productivity", "Healthcare integration", "Engineering patterns", "Operations", "Compliance and security", "Business", "Meta"];
const athelasTemplates = () => [
  TPL("claim-status", "Revenue cycle", "Athelas", Search, "Claim Status Agent", "Checks where submitted claims stand and recommends the next action.", ["Check the status of submitted claims. Never send, post or appeal on your own. Leave every result for review.", "Look up each claim with /rcm-claim-status and say how fresh the answer is.", "If a payer response is hard to read, break it down with /x12-edi-handling.", "Recommend one next action per claim: wait, resubmit, appeal, call the payer or fix the data."], ["Payer portal guides", "Claim status code reference"], ["rcm-claim-status", "x12-edi-handling"], [{"type": "time", "freq": "weekly", "day": "weekdays", "at": {"h": 7, "m": 0, "ap": "AM"}}]),
  TPL("eligibility", "Revenue cycle", "Athelas", ShieldCheck, "Eligibility Agent", "Checks coverage before a visit or claim and explains what it found.", ["Check coverage before a visit or claim. Never send, post or appeal on your own. Leave every result for review.", "Get the benefit summary with /rcm-eligibility-check.", "Read 271 responses with /x12-edi-handling when needed.", "Flag other coverage and say which payer is primary."], ["Payer portal guides", "Eligibility checklist"], ["rcm-eligibility-check", "x12-edi-handling"], [{"type": "event", "event": "assigned"}]),
  TPL("denial-analysis", "Revenue cycle", "Athelas", Ban, "Denial Analysis Agent", "Finds why claims are denied and which denials can be prevented.", ["Study denials on aggregated data only. Never show patient-level details. Leave every finding for review.", "Group denials by payer, reason code and procedure with /rcm-denial-analysis.", "Name the root cause: eligibility, authorization, coding, documentation, timely filing or payer error.", "Estimate the recoverable dollars and say how sure you are."], ["Denial reason code reference", "Denial root-cause taxonomy"], ["rcm-denial-analysis"], [{"type": "time", "freq": "weekly", "day": "mon", "at": {"h": 7, "m": 0, "ap": "AM"}}]),
  TPL("appeals", "Revenue cycle", "Athelas", FilePlus, "Appeals Agent", "Drafts payer-specific appeal letters and tracks the appeal deadline.", ["Work denied claims as a first pass. Never send, post or appeal on your own. Leave every result for review.", "Draft the appeal with /rcm-appeal-letter and quote the payer policy for every claim you make.", "Check the deadline with /rcm-timely-filing-watch and escalate if it is under 3 days.", "Check where the claim stands with /rcm-claim-status before you draft, so you do not appeal a claim that was already paid.","If a fact is missing, list it instead of guessing."], ["Payer appeal rules", "Appeals guide"], ["rcm-appeal-letter", "rcm-timely-filing-watch", "rcm-claim-status"], [{"type": "event", "event": "denied"}]),
  TPL("posting", "Revenue cycle", "Athelas", Wallet, "Payment Posting Agent", "Reads remittances and prepares payments to be posted.", ["Prepare payments for posting. Never post on your own. Leave every result for review.", "Read each remittance with /rcm-eob-parse and hold the batch if the totals do not balance.", "Prepare the postings with /rcm-payment-posting and list the variances.", "Use /x12-edi-handling for 835 files."], ["Remittance posting SOP", "Deposit verification guide"], ["rcm-eob-parse", "rcm-payment-posting", "x12-edi-handling"], [{"type": "event", "event": "payment"}]),
  TPL("ar-followup", "Revenue cycle", "Athelas", RefreshCw, "AR Follow-up Agent", "Prioritizes aged accounts and recommends the next action on each.", ["Work aged accounts as a first pass. Never send, post or appeal on your own. Leave every result for review.", "Rank the accounts with /rcm-ar-followup.", "Check each one with /rcm-claim-status.", "If an appeal is the right step, draft it with /rcm-appeal-letter."], ["AR follow-up playbook", "Appeals guide"], ["rcm-ar-followup", "rcm-claim-status", "rcm-appeal-letter"], [{"type": "time", "freq": "weekly", "day": "weekdays", "at": {"h": 7, "m": 0, "ap": "AM"}}]),
  TPL("prior-auth", "Revenue cycle", "Athelas", ClipboardCheck, "Prior Authorization Agent", "Finds out if a service needs authorization and prepares the request.", ["Prepare authorization requests. Never send, post or appeal on your own. Leave every result for review.", "Decide if authorization is needed with /rcm-prior-auth and name the rule you used.", "Check coverage with /rcm-eligibility-check.", "Prepare the document checklist and draft the clinical summary from structured fields only."], ["Payer authorization rules", "Clinical documentation checklist"], ["rcm-prior-auth", "rcm-eligibility-check"], [{"type": "event", "event": "assigned"}]),
  TPL("coding-check", "Revenue cycle", "Athelas", Code, "Coding Check Agent", "Checks diagnosis and procedure codes and modifiers before and after submission.", ["Check codes as a first pass. Suggest, never change. A certified coder decides.", "Check codes and modifiers with /rcm-coding-check.", "Map between code systems with /terminology-mapping when needed."], ["ICD-10 coding guidelines", "CPT coding guidelines", "Payer policies"], ["rcm-coding-check", "terminology-mapping"], [{"type": "event", "event": "assigned"}]),
  TPL("underpayment", "Revenue cycle", "Athelas", ListChecks, "Underpayment Review Agent", "Compares what was paid with the contract and flags underpayments.", ["Review payments against the contract. Never send, post or appeal on your own. Leave every result for review.", "Read the remittance with /rcm-eob-parse.", "Compare it with the contract using /rcm-underpayment-review.", "List underpaid claims as appeal candidates."], ["Contract and fee schedule"], ["rcm-underpayment-review", "rcm-eob-parse"], [{"type": "event", "event": "payment"}]),
  TPL("timely-filing", "Revenue cycle", "Athelas", Clock, "Timely Filing Watch", "Warns before claims pass a filing or appeal deadline.", ["Watch deadlines. Only read and summarize. Never change a claim.", "List claims near their deadline with /rcm-timely-filing-watch and give the source of each deadline.", "Check for payer policy changes with /payer-policy-monitor."], ["Payer filing deadlines"], ["rcm-timely-filing-watch", "payer-policy-monitor"], [{"type": "time", "freq": "daily", "day": "weekdays", "at": {"h": 8, "m": 0, "ap": "AM"}}]),
  TPL("payer-policy", "Revenue cycle", "Athelas", FileText, "Payer Policy Monitor", "Notices payer policy changes and proposes updates to the reference files.", ["Watch public payer publications only. Propose updates for the owner to approve. Never edit a reference file yourself.", "Find changes with /payer-policy-monitor and record the source and date.", "Propose each update as a change for the payer owner."], ["Payer reference files"], ["payer-policy-monitor"], [{"type": "time", "freq": "weekly", "day": "mon", "at": {"h": 6, "m": 0, "ap": "AM"}}]),
  TPL("weekly-review", "Productivity", "Athelas", ClipboardCheck, "Weekly Review", "Sums up the week: what was worked, what is waiting and what needs attention.", ["Every week, sum up how the billing team did. Only read and summarize. Never change a claim.", "List the claims worked, the results approved and the results waiting for review.", "Show the top denial patterns with /rcm-denial-analysis.", "Flag underpayments with /rcm-underpayment-review.", "Warn about deadlines with /rcm-timely-filing-watch."], ["Contract and fee schedule"], ["rcm-denial-analysis", "rcm-underpayment-review", "rcm-timely-filing-watch"], [{"type": "time", "freq": "weekly", "day": "mon", "at": {"h": 8, "m": 0, "ap": "AM"}}]),
  TPL("daily-planning", "Productivity", "Athelas", ListChecks, "Daily Planning", "Plans your day: what to work first and what is about to expire.", ["Every morning, plan the day for the biller. Only read and suggest. Never change a claim.", "Put claims in the order to work them: oldest and most valuable first.", "Use /rcm-ar-followup for the aged accounts.", "Check status with /rcm-claim-status.", "Warn about deadlines with /rcm-timely-filing-watch."], [], ["rcm-ar-followup", "rcm-claim-status", "rcm-timely-filing-watch"], [{"type": "time", "freq": "weekly", "day": "weekdays", "at": {"h": 8, "m": 0, "ap": "AM"}}]),
  TPL("interface-builder", "Healthcare integration", "Commure", Plug, "Interface Builder", "Scaffolds a new integration and checks it against X12, HL7 v2 and EMR notes.", ["Work in a branch. Never change production. Leave every change for review.", "Start from /integration-engine-scaffold and follow its readiness checklist.", "Check messages with /x12-edi-handling or /hl7v2-message-handling.", "Read the EMR specifics with /emr-integration-notes.", "Build tests with /synthetic-phi-generator. Never use real patient data."], ["Integration Engine guide", "Interface readiness checklist"], ["integration-engine-scaffold", "x12-edi-handling", "hl7v2-message-handling", "emr-integration-notes", "synthetic-phi-generator"], []),
  TPL("fhir-mapper", "Healthcare integration", "Commure", Stethoscope, "FHIR Mapping Agent", "Maps data to FHIR resources and checks them with the validator.", ["Work in a branch. Never change production. Leave every change for review.", "Build the mapping table with /fhir-resource-mapping and run the validator before you claim conformance.", "Bind codes with /terminology-mapping.", "Create test resources with /synthetic-phi-generator."], ["US Core profiles", "FHIR validator guide"], ["fhir-resource-mapping", "terminology-mapping", "synthetic-phi-generator"], []),
  TPL("workflow-reviewer", "Engineering patterns", "Commure", RefreshCw, "Workflow Reviewer", "Reviews Temporal workflows and service authentication.", ["Work in a branch. Never change production. Leave every change for review.", "Review workflows with /temporal-workflow-patterns: determinism, retries, timeouts and versioning.", "Check authentication with /service-auth-patterns and never put a secret in code.", "Never put patient data in workflow arguments."], ["Temporal determinism checklist", "Auth patterns guide"], ["temporal-workflow-patterns", "service-auth-patterns"], []),
  TPL("ci-flake", "Engineering patterns", "Commure", Search, "CI Flake Debugger", "Finds why a test fails now and then and proposes a fix.", ["Work in a branch. Never change production. Leave every change for review.", "Classify the flake with /ci-flake-debugging and write a minimal repro.", "Propose a fix. Quarantine a test only with an expiry date and the owner's approval."], ["CI troubleshooting guide"], ["ci-flake-debugging"], []),
  TPL("db-reviewer", "Engineering patterns", "Commure", LayoutGrid, "Database Performance Reviewer", "Reviews queries, indexes and migrations on large tables.", ["Work in a branch. Never change production. Leave every change for review.", "Analyze queries with /db-query-performance.", "Propose indexes and safe migration steps. Never run changes in production."], ["Database guidelines"], ["db-query-performance"], []),
  TPL("ui-builder", "Engineering patterns", "Commure", Pencil, "UI Builder", "Builds screens from the design system with accessible states.", ["Work in a branch. Never change production. Leave every change for review.", "Build with /design-system-ui: use tokens, cover loading, empty and error states, and check accessibility.", "Use fake data only."], ["Design system documentation"], ["design-system-ui"], []),
  TPL("oncall-triage", "Operations", "Commure", Zap, "On-call Triage Agent", "Makes a first assessment when an alert fires.", ["Only read. Never restart, scale or roll back on your own. Propose the exact step and leave it for a human.", "Triage with /incident-triage: impact, timeline, recent deploys and ranked hypotheses.", "Get the data with /observability-queries and follow the runbook with /runbook-lookup.", "Say unknown when the evidence is not there."], ["Incident severity rubric", "Runbooks"], ["incident-triage", "observability-queries", "runbook-lookup"], [{"type": "event", "event": "alert"}]),
  TPL("release-guard", "Operations", "Commure", ShieldCheck, "Release Guard", "Assesses the risk of a deploy and what to watch afterwards.", ["Only read. Never restart, scale or roll back on your own. Propose the exact step and leave it for a human.", "Assess the release with /release-safety-check: risk, rollout and rollback plan.", "List the metrics to watch using /observability-queries."], ["Release checklist"], ["release-safety-check", "observability-queries"], [{"type": "event", "event": "deploy"}]),
  TPL("postmortem", "Operations", "Commure", FileText, "Post-mortem Writer", "Writes a blameless post-mortem after an incident.", ["Only read. Never restart, scale or roll back on your own. Propose the exact step and leave it for a human.", "Write it with /incident-postmortem using facts and links only.", "List action items with owners."], ["Post-mortem template"], ["incident-postmortem"], []),
  TPL("pipeline-health", "Operations", "Commure", Search, "Claim Pipeline Health Agent", "Finds why claim submission, remittance or status metrics degrade.", ["Only read. Never restart, scale or roll back on your own. Propose the exact step and leave it for a human.", "Investigate with /claim-pipeline-health and show the queries you ran.", "Get the data with /observability-queries."], ["Claim pipeline overview"], ["claim-pipeline-health", "observability-queries"], [{"type": "time", "freq": "hourly", "day": "weekdays", "at": {"h": 12, "m": 0, "ap": "AM"}}]),
  TPL("privacy-assistant", "Compliance and security", "Commure", ShieldCheck, "Privacy Assistant", "Answers whether data is PHI and how it may be handled.", ["Never share patient data. Use tokens and leave every decision to a person.", "Classify the data and the handling with /hipaa-data-handling and cite the policy.", "Remove identifiers with /phi-deidentification before data leaves the PHI boundary.", "Escalate suspected incidents to the privacy officer at once."], ["HIPAA policies"], ["hipaa-data-handling", "phi-deidentification"], []),
  TPL("vendor-review", "Compliance and security", "Commure", ListChecks, "Vendor Review Agent", "Checks a vendor or connector for a BAA and data flow before it is allowed.", ["Never share patient data. Use tokens and leave every decision to a person.", "Check the vendor with /vendor-baa-check: data types, BAA and subprocessors.", "Use /hipaa-data-handling for the handling rules.", "Never change the allowlist."], ["Vendor policy"], ["vendor-baa-check", "hipaa-data-handling"], []),
  TPL("pentest-triage", "Compliance and security", "Commure", Ban, "Pentest Triage Agent", "Sorts security findings by real risk and assigns an owner.", ["Never share patient data. Use tokens and leave every decision to a person.", "Triage with /pentest-triage: deduplicate, rate severity with context and propose an owner and SLA.", "Never exploit or scan anything."], ["Severity rubric"], ["pentest-triage"], [{"type": "event", "event": "finding"}]),
  TPL("audit-evidence", "Compliance and security", "Commure", ClipboardCheck, "Audit Evidence Agent", "Collects evidence for HIPAA, SOC 2 and customer audits.", ["Never share patient data. Use tokens and leave every decision to a person.", "Build the evidence index with /audit-evidence-collection and link every item.", "Never include screenshots that show patient data."], ["Audit control list"], ["audit-evidence-collection"], [{"type": "time", "freq": "monthly", "day": "weekdays", "dom": "1", "at": {"h": 9, "m": 0, "ap": "AM"}}]),
  TPL("scoping", "Business", "Commure", Pencil, "Scoping Assistant", "Estimates scope, effort and risks for an implementation.", ["Draft only. Never send anything to a customer. Leave every document for review.", "Scope with /implementation-scoping and write the assumptions out.", "Read the EMR specifics with /emr-integration-notes.", "Give effort as ranges, not commitments."], ["Implementation playbook"], ["implementation-scoping", "emr-integration-notes"], []),
  TPL("sow-quote", "Business", "Commure", FileText, "SOW and Quote Assistant", "Drafts an SOW and a price quote from approved templates and the price book.", ["Draft only. Never send anything to a customer. Leave every document for review.", "Draft the SOW with /sow-drafting and flag every clause that differs from the template.", "Price with /pricing-quote using the approved price book only."], ["SOW templates", "Approved price book"], ["sow-drafting", "pricing-quote"], []),
  TPL("roi-case", "Business", "Commure", Wallet, "ROI Case Agent", "Builds a clear ROI case from the customer's own numbers.", ["Draft only. Never send anything to a customer. Leave every document for review.", "Build the model with /roi-business-case and label every number as sourced or assumed.", "Show a range, not a single figure."], ["ROI model template"], ["roi-business-case"], []),
  TPL("skill-curator", "Meta", "Commure", ListChecks, "Skill Curator", "Reviews proposed skills for quality, overlap and safety.", ["Review skills. Advisory only. Never merge a skill yourself.", "Review each proposal with /skill-curator: trigger quality, one job, overlap and a PHI scan.", "Run the evals with /skill-eval-runner and report any regression."], ["Skill template and lint rules"], ["skill-curator", "skill-eval-runner"], [{"type": "event", "event": "skill"}]),
  TPL("skill-analyst", "Meta", "Commure", Search, "Skill Usage Analyst", "Reports how skills perform: use, failures and human edits.", ["Report at team level only. Never rank individuals.", "Write the weekly report with /skill-usage-failure-report: top skills, failure modes and skills that never trigger.", "Recommend fixes."], ["Telemetry guide"], ["skill-usage-failure-report"], [{"type": "time", "freq": "weekly", "day": "mon", "at": {"h": 9, "m": 0, "ap": "AM"}}]),
];
function agentFromTemplate(t, taken) {
  let name = t.name, n = 2; while (taken.includes(name)) name = t.name + " " + n++;
  return { id: "ag" + Date.now(), name, init: initials(name), description: t.desc, instructions: t.lines.join("\n"), context: [...t.context], rule: null, triggers: t.triggers.map((x) => ({ ...newTrigger(x.type), ...x })), notify: { when: "ready", app: true, slack: false }, level: "suggest", perms: { send: true, post: true, writeoff: true, appeal: true }, skills: t.skills.slice(), fromTemplate: t.id, paused: false };
}
const TPL_TINT = { "Revenue cycle": ["#eef2ff", "#dfe6ff", "#3b4fd8"], Productivity: ["#ecfdf5", "#d3f6e6", "#0f8a5f"], "Healthcare integration": ["#f5f3ff", "#e8e1ff", "#6d3fd1"], "Engineering patterns": ["#fff7ed", "#ffe9d3", "#c2540a"], Operations: ["#fef2f2", "#fddede", "#c2342f"], "Compliance and security": ["#f0fdfa", "#c9f3ee", "#0e8a85"], Business: ["#fffbeb", "#fdefc2", "#b17508"], Meta: ["#f4f4f5", "#e6e6ea", "#52525b"] }; /* category tints for the agent tiles */
const CONN_LABELS = { "git-and-ci": "Git and CI", "incident-io": "incident.io", "aws-context": "AWS context", "ehr-air": "EHR (AIR)", "fhir-sandbox": "FHIR sandbox", "ocr-service": "OCR service", "emr-sandboxes": "EMR sandboxes", "integration-engine-sandbox": "Integration Engine" };
const connLabel = (id) => CONN_LABELS[id] || id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " ");
function connectorsFor(t) { /* the connectors of the bundles that hold this agent's skills, most shared first */
  const n = {};
  EXT.plugins.filter((p) => p.skills.some((k) => t.skills.includes(k))).forEach((p) => p.connectors.forEach((c) => { if (c !== "data-gateway") n[c] = (n[c] || 0) + 1; }));
  return Object.entries(n).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map((e) => e[0]).slice(0, 2);
}
const tplReadOnly = (t) => /Only read|Never change a claim/i.test(t.lines.join(" "));
function TplBadge({ t }) { const ro = tplReadOnly(t); return <span className={"tb" + (ro ? " ro" : "")} title={ro ? "It only reads and reports. It never changes anything." : "It prepares changes and waits for your approval."}>{ro ? "Read-only" : "You approve"}</span>; }
function FlowStrip({ t, compact }) { /* when it runs, what it works with, who decides */
  const first = t.triggers[0], trig = first ? { ...newTrigger(first.type), ...first } : null;
  const conns = connectorsFor(t), c = EXT.connectors.find((x) => x.id === conns[0]), CI = c ? c.icon : LayoutGrid;
  const TI = !trig ? Play : trig.type === "event" ? Zap : Clock;
  const cap = trig ? triggerText(trig) + (t.triggers.length > 1 ? " +" + (t.triggers.length - 1) : "") : "When you ask it to";
  const tip = cap + ". Works with " + (conns.map(connLabel).join(", ") || "your claims") + ". You review the result.";
  return (
    <span className={"flow" + (compact ? " mini" : "")} role="img" aria-label={tip} title={tip}>
      <span className="fl-row"><span className="fl-n"><TI size={compact ? 12 : 14} /></span><i /><span className="fl-n big"><CI size={compact ? 15 : 18} /></span><i /><span className="fl-n"><ClipboardCheck size={compact ? 12 : 14} /></span></span>
      <span className="fl-cap">{cap}</span>
    </span>
  );
}
function TemplateRow({ t, onAdd, onPick, selected, onGo }) {
  const I = t.icon, tip = "By " + t.by + ". Uses " + t.skills.length + (t.skills.length === 1 ? " skill: " : " skills: ") + t.skills.join(", ");
  const act = onPick || onAdd, tint = TPL_TINT[t.cat] || TPL_TINT.Meta;
  return (
    <div className="hx-item"><div className={"hx-row hx-int tpr" + (selected ? " sel" : "")} style={{ "--hm-a": tint[0], "--hm-b": tint[1], "--hm-fg": tint[2] }} title={tip} onClick={() => act(t)} onDoubleClick={onGo ? () => onGo(t) : undefined}>
      <button className="hx-main" aria-label={(onPick ? "Select " : "Use ") + t.name + ". " + t.desc} aria-pressed={onPick ? !!selected : undefined} onClick={(e) => { e.stopPropagation(); act(t); }}>
        <span className="hx-tile"><I size={20} /></span>
        <span className="hx-txt"><span className="ext-nm"><b className="hx-name">{t.name}</b><TplBadge t={t} /></span><span className="hx-desc">{t.desc}</span></span>
      </button>
      {onPick ? <span className={"rd" + (selected ? " on" : "")} aria-hidden="true">{selected && <Check size={12} />}</span> : <span className="btn tpr-use" aria-hidden="true">Use</span>}
    </div></div>
  );
}
/* ready-made agents grouped by category; a heading folds its group, a search opens every group that matches */
function TemplateGroups({ templates, onAdd, searching, flat, onPick, pick, onGo }) {
  const [shut, setShut] = useState(new Set());
  if (flat) return <div className="hx-list">{templates.map((t) => <TemplateRow key={t.id} t={t} onAdd={onAdd} onPick={onPick} selected={pick === t.id} onGo={onGo} />)}</div>;
  return TPL_CATS.map((c) => {
    const items = templates.filter((t) => t.cat === c);
    if (!items.length) return null;
    const closed = !searching && shut.has(c);
    return (
      <section key={c} className="ext-sec" aria-label={c}>
        <button className={"ext-gh" + (closed ? " shut" : "")} aria-expanded={!closed} onClick={() => { const n = new Set(shut); closed ? n.delete(c) : n.add(c); setShut(n); }}><ChevronDown size={14} />{c}<span className="n">{items.length}</span></button>
        {!closed && <div className="hx-list">{items.map((t) => <TemplateRow key={t.id} t={t} onAdd={onAdd} onPick={onPick} selected={pick === t.id} onGo={onGo} />)}</div>}
      </section>
    );
  });
}
function AddAgentModal({ templates, onAdd, onDescribe, onClose, mode }) {
  const ref = useRef(null);
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const [sel, setSel] = useState({ k: "all" }); /* all, a category, or a connector */
  const [pick, setPick] = useState(null); /* null, "blank", or a template id */
  const chosen = pick && pick !== "blank" ? templates.find((t) => t.id === pick) : null;
  const go = (id) => { const v = id || pick; if (!v) return; if (v === "blank") onDescribe(); else onAdd(templates.find((t) => t.id === v)); };
  const hit = (t) => !term || (t.name + " " + t.desc + " " + t.cat + " " + t.skills.join(" ")).toLowerCase().includes(term);
  const match = (t, v) => v.k === "all" || (v.k === "cat" && t.cat === v.v) || (v.k === "conn" && connectorsFor(t).includes(v.v));
  const shown = templates.filter((t) => hit(t) && match(t, sel));
  const count = (v) => templates.filter((t) => hit(t) && match(t, v)).length;
  const same = (v) => sel.k === v.k && sel.v === v.v;
  const conns = (() => { const n = {}; templates.forEach((t) => connectorsFor(t).forEach((c) => { n[c] = (n[c] || 0) + 1; })); return Object.keys(n).sort((a, b) => n[b] - n[a] || a.localeCompare(b)); })();
  const showAll = mode === "templates";
  useEffect(() => {
    const prev = document.activeElement;
    const inp = ref.current && ref.current.querySelector(".am-s input");
    if (ref.current) (inp || ref.current).focus(); /* start in the search box, so you can type at once */
    const key = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "Tab" && ref.current) { /* keep Tab inside the modal */
        const f = [...ref.current.querySelectorAll("button:not([disabled]), input")];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1], at = document.activeElement;
        if (e.shiftKey && (at === first || at === ref.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); if (prev && prev.focus) prev.focus(); };
  }, []);
  return (
    <div className="dlg-back" onMouseDown={onClose}>
      <div className="dlg am" ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="am-t" onMouseDown={(e) => e.stopPropagation()}>
        <div className="am-h">
          <h2 id="am-t">{showAll ? "Ready-made agents" : "Add an agent"}</h2>
          <button className="ibtn" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="am-body">
          <nav className="am-rail" aria-label="Filters">
            <p className="am-rh">Categories</p>
            {[{ k: "all" }, ...TPL_CATS.map((v) => ({ k: "cat", v }))].map((v) => <button key={v.k + (v.v || "")} className={"am-c" + (same(v) ? " on" : "")} aria-pressed={same(v)} onClick={() => setSel(v)}><span>{v.k === "all" ? "All" : v.v}</span><i>{count(v)}</i></button>)}
            <p className="am-rh">Works with</p>
            {conns.map((c) => { const v = { k: "conn", v: c }, CI = (EXT.connectors.find((x) => x.id === c) || {}).icon || LayoutGrid; return <button key={c} className={"am-c" + (same(v) ? " on" : "")} aria-pressed={same(v)} onClick={() => setSel(v)}><span className="am-cn"><CI size={14} />{connLabel(c)}</span><i>{count(v)}</i></button>; })}
          </nav>
          <div className="am-main">
            <button className={"am-blank" + (pick === "blank" ? " sel" : "")} aria-pressed={pick === "blank"} onClick={() => setPick("blank")} onDoubleClick={() => go("blank")}>
              <span className="am-bi"><Plus size={20} /></span>
              <span className="am-bt"><b>Start from blank</b><span>Write the instructions yourself, or describe the agent and draft them with AI.</span></span>
              <span className={"rd" + (pick === "blank" ? " on" : "")} aria-hidden="true">{pick === "blank" && <Check size={12} />}</span>
            </button>
        <label className="am-s"><Search size={16} /><input aria-label="Search agents" placeholder="Search agents, skills or jobs" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "ArrowDown") { const r = ref.current && ref.current.querySelector(".am-b .hx-main"); if (r) { e.preventDefault(); r.focus(); } } else if (e.key === "Enter" && shown.length === 1) { e.preventDefault(); if (pick === shown[0].id) go(); else setPick(shown[0].id); } }} />{q && <button className="am-x" aria-label="Clear search" onClick={() => { setQ(""); const i = ref.current && ref.current.querySelector(".am-s input"); if (i) i.focus(); }}><X size={14} /></button>}</label>
        {term && <p className="am-n" aria-live="polite">{shown.length} {shown.length === 1 ? "agent" : "agents"}</p>}
        <div className="am-b" onKeyDown={(e) => { if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return; const rows = [...ref.current.querySelectorAll(".am-b .hx-main")], i = rows.indexOf(document.activeElement); if (i < 0) return; e.preventDefault(); if (e.key === "ArrowDown") (rows[i + 1] || rows[i]).focus(); else if (i === 0) ref.current.querySelector(".am-s input").focus(); else rows[i - 1].focus(); }}>{shown.length ? <TemplateGroups templates={shown} onAdd={onAdd} onPick={(t) => setPick(t.id)} pick={pick} onGo={(t) => go(t.id)} searching={!!term} flat={sel.k !== "all"} /> : <div className="empty"><b>No agents match.</b><span>Try a different word, or start from blank above.</span></div>}</div>
          </div>
        </div>
        <div className="am-f"><span className="am-sel">{pick === "blank" ? "Selected: Start from blank" : chosen ? "Selected: " + chosen.name : "Select an agent or start from blank"}</span><span className="am-fb"><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!pick} onClick={() => go()}>Continue</button></span></div>
      </div>
    </div>
  );
}
/* typing "/" in the instructions opens the skills you can use; picking one writes /skill-name */
const skillTokens = (text, skills) => [...new Set([...text.matchAll(/(?:^|\s)\/([a-z0-9-]+)/gi)].map((m) => m[1]).filter((n) => skills.some((k) => k.name === n)))];
function SkillTextarea({ value, onChange, skills, rows, placeholder, autoFocus, label }) {
  const ref = useRef(null);
  const [pop, setPop] = useState(null);
  const closedAt = useRef(-1); /* Esc keeps the popup closed for this slash until you type a new one */
  const list = pop ? skills.filter((k) => k.name.includes(pop.q.toLowerCase())).slice(0, 8) : [];
  const detect = (v, caret) => { const m = v.slice(0, caret).match(/(^|\s)\/([a-z0-9-]*)$/i); const st = m ? caret - m[2].length - 1 : -1; if (!m) closedAt.current = -1; setPop(m && st !== closedAt.current ? { q: m[2], start: st, idx: 0 } : null); };
  const insert = (k) => {
    const el = ref.current, caret = el.selectionStart;
    onChange(value.slice(0, pop.start) + "/" + k.name + " " + value.slice(caret));
    const at = pop.start + k.name.length + 2; setPop(null);
    setTimeout(() => { el.focus(); el.setSelectionRange(at, at); }, 0);
  };
  const key = (e) => {
    if (!pop || !list.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setPop({ ...pop, idx: (pop.idx + 1) % list.length }); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setPop({ ...pop, idx: (pop.idx + list.length - 1) % list.length }); }
    else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insert(list[Math.min(pop.idx, list.length - 1)]); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closedAt.current = pop.start; setPop(null); }
  };
  return (
    <div className="sl-wrap">
      <textarea ref={ref} className="ag-ta" aria-label={label} autoFocus={autoFocus} placeholder={placeholder} rows={rows} value={value} onChange={(e) => { onChange(e.target.value); detect(e.target.value, e.target.selectionStart); }} onKeyDown={key} onBlur={() => setTimeout(() => setPop(null), 120)} />
      {pop && list.length > 0 && (
        <ul className="sl-pop" role="listbox" aria-label="Skills">
          {list.map((k, i) => <li key={k.id}><button role="option" aria-selected={i === pop.idx} className={i === pop.idx ? "on" : ""} onMouseDown={(e) => { e.preventDefault(); insert(k); }} onMouseEnter={() => setPop({ ...pop, idx: i })}><b>{k.name}</b><span>{k.desc}</span></button></li>)}
        </ul>
      )}
    </div>
  );
}

function PillMenu({ value, options, onChange, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));
  const cur = options.find((o) => o[0] === value);
  return (
    <div className="pm" ref={ref}>
      <button className={"tg-pill" + (open ? " on" : "")} aria-label={label} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>{cur ? cur[1] : value}<ChevronDown size={14} /></button>
      {open && <ul className="pm-pop" role="listbox" aria-label={label}>{options.map(([k, l]) => <li key={k}><button role="option" aria-selected={k === value} className={k === value ? "on" : ""} onClick={() => { onChange(k); setOpen(false); }}>{l}</button></li>)}</ul>}
    </div>
  );
}
function TimePill({ at, onChange, minutesOnly, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null), hRef = useRef(null), mRef = useRef(null);
  useOutside(ref, () => setOpen(false));
  useEffect(() => { const el = minutesOnly ? mRef.current : hRef.current; if (open && el) { el.focus(); el.select(); } }, [open]);
  const setH = (v) => { const n = parseInt(String(v).replace(/\D/g, ""), 10); if (!isNaN(n)) onChange({ ...at, h: Math.min(12, Math.max(1, n)) }); };
  const setM = (v) => { const n = parseInt(String(v).replace(/\D/g, "").slice(-2) || "0", 10); onChange({ ...at, m: Math.min(59, Math.max(0, n)) }); };
  return (
    <div className="pm" ref={ref}>
      <button className={"tg-pill" + (open ? " on" : "")} aria-label={label} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>{minutesOnly ? ":" + pad2(at.m) : timeText(at)}</button>
      {open && (
        <div className="tp-pop" role="dialog" aria-label="Pick a time" onKeyDown={(e) => { if (e.key === "Enter") setOpen(false); }}>
          {!minutesOnly && <><input ref={hRef} className="tp-in" aria-label="Hour" inputMode="numeric" value={String(at.h)} onFocus={(e) => e.target.select()} onChange={(e) => setH(e.target.value)} /><span className="tg-w">:</span></>}
          <input ref={mRef} className="tp-in" aria-label="Minutes" inputMode="numeric" value={pad2(at.m)} onFocus={(e) => e.target.select()} onChange={(e) => setM(e.target.value)} />
          {!minutesOnly && <div className="tp-ap" role="group" aria-label="AM or PM">{["AM", "PM"].map((ap) => <button key={ap} aria-pressed={at.ap === ap} className={at.ap === ap ? "on" : ""} onClick={() => onChange({ ...at, ap })}>{ap}</button>)}</div>}
        </div>
      )}
    </div>
  );
}
function DatePill({ date, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));
  return (
    <div className="pm" ref={ref}>
      <button className={"tg-pill" + (open ? " on" : "")} aria-label="Date" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>{new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</button>
      {open && <div className="tp-pop" role="dialog" aria-label="Pick a date"><input className="tp-date" type="date" aria-label="Pick a date" value={date} onChange={(e) => e.target.value && onChange(e.target.value)} /></div>}
    </div>
  );
}
function TriggerRow({ t, onChange, onDelete }) {
  const up = (patch) => onChange({ ...t, ...patch });
  return (
    <div className="tg-row">
      <span className="tg-ic">{t.type === "time" ? <Clock size={16} /> : <Zap size={16} />}</span>
      {t.type === "event" ? (
        <><span className="tg-w">When</span><PillMenu label="Event" value={t.event} options={EVENTS} onChange={(v) => up({ event: v })} /></>
      ) : (
        <>
          <PillMenu label="Frequency" value={t.freq} options={FREQS} onChange={(v) => up({ freq: v })} />
          {t.freq === "once" && <><span className="tg-w">on</span><DatePill date={t.date} onChange={(v) => up({ date: v })} /></>}
          {t.freq === "weekly" && <><span className="tg-w">on</span><PillMenu label="Day of the week" value={t.day} options={WEEKDAYS} onChange={(v) => up({ day: v })} /></>}
          {t.freq === "monthly" && <><span className="tg-w">on</span><PillMenu label="Day of the month" value={t.dom} options={DOMS} onChange={(v) => up({ dom: v })} /></>}
          {t.freq === "yearly" && <><span className="tg-w">on</span><PillMenu label="Month" value={String(t.month)} options={MONTHS.map((m, i) => [String(i), m])} onChange={(v) => up({ month: +v })} /><PillMenu label="Day" value={t.dom === "last" ? "1" : t.dom} options={DAYS31} onChange={(v) => up({ dom: v })} /></>}
          <span className="tg-w">at</span>
          <TimePill label="Time" at={t.at} minutesOnly={t.freq === "hourly"} onChange={(at) => up({ at })} />
        </>
      )}
      <span className="grow" />
      <button className="ibtn" aria-label="Remove trigger" onClick={onDelete}><Trash2 size={16} /></button>
    </div>
  );
}
function AddTrigger({ onAdd }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));
  return (
    <div className="pm" ref={ref}>
      <button className="btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}><Plus size={16} />Add trigger</button>
      {open && <ul className="pm-pop" role="menu">{[["time", "On a schedule"], ["event", "When something happens"]].map(([k, l]) => <li key={k}><button role="menuitem" onClick={() => { onAdd(k); setOpen(false); }}>{l}</button></li>)}</ul>}
    </div>
  );
}
const LEVELS = [["suggest", "Suggest only", "Prepares a suggestion for each claim and waits for you."], ["prepare", "Prepare the change", "Builds the fix, such as the corrected claim, and waits for your approval."], ["act", "Act on its own", "Makes the change without waiting. Use it only for steps you trust."]];
const PERMS = [["send", "Send or resubmit a claim"], ["post", "Post a payment"], ["writeoff", "Write off a balance"], ["appeal", "Send an appeal"]];
const withSetup = (d) => ({ triggers: defaultTriggers(), notify: { when: "ready", app: true, slack: false }, level: "suggest", perms: { send: true, post: true, writeoff: true, appeal: true }, ...d });
/* the agent's name is inferred from its instructions (the standard opening and closing lines are ignored) */
function inferName(text, taken) {
  const t = text.split("\n").filter((l) => l !== BASE_LINE && l !== UNSURE_LINE).join(" ").toLowerCase();
  const kind = /medicare/.test(t) ? "Medicare" : /denial|denied|reject|appeal/.test(t) ? "Denials" : /medicaid|secondary|cob|coordination/.test(t) ? "Secondary Claims" : /post|payment|remit|deposit/.test(t) ? "Posting" : /eligib|coverage/.test(t) ? "Eligibility" : /coding|diagnos|icd|cpt|modifier/.test(t) ? "Coding" : /follow-?up|status/.test(t) ? "Follow-up" : null;
  const base = kind ? kind + " Agent" : "New Agent";
  let name = base, n = 2; while (taken.includes(name)) name = base + " " + n++;
  return name;
}
function AgentBuilder({ agents, onCreate, onCancel, seed, onBrowse, skills }) {
  const blank = () => withSetup({ name: "", description: "", instructions: "", context: [], rule: null });
  const [draft, setDraft] = useState(seed ? withSetup(seed.draft) : blank());
  const [note, setNote] = useState(seed ? seed.reply : ""); /* what the builder did, shown inside the Instructions box */
  const [drafted, setDrafted] = useState(!!seed);
  const [snap, setSnap] = useState(null); /* the draft before the last AI change, for Undo */
  const [sel, setSel] = useState(null); /* the setting being edited: one at a time */
  const [busy, setBusy] = useState(false);
  const [doc, setDoc] = useState("");
  const [flash, setFlash] = useState(0); /* lights the name for a moment when the system sets it */
  const alive = useRef(true), touched = useRef(!!seed), nameT = useRef(null); /* touched: you renamed it, so we stop inferring */
  useEffect(() => () => { alive.current = false; clearTimeout(nameT.current); }, []);
  const taken = agents.map((a) => a.name);
  const d = draft;
  const fromTpl = seed && seed.template; /* the template this draft started from, if any */
  const known = [...(skills || []), ...EXT.skills.filter((k) => !(skills || []).some((s2) => s2.id === k.id))]; /* every catalog skill, so a template's skills are recognized in its instructions */
  /* ask the builder: a template or your own description makes a first draft, a suggestion refines the draft */
  const run = (t, refine) => {
    if (!t.trim() || busy) return;
    setSnap(d); setBusy(true);
    setTimeout(() => {
      if (!alive.current) return;
      const r = draftFrom(t, taken, refine ? d : null);
      const keep = touched.current && d.name.trim();
      const auto = /^New Agent/.test(r.draft.name) ? inferName(t + " " + r.draft.instructions, taken) : r.draft.name;
      setDraft(withSetup({ ...d, ...r.draft, name: keep ? d.name : auto }));
      if (!keep) setFlash((n) => n + 1);
      setNote(r.reply); setDrafted(true); setBusy(false);
    }, 800);
  };
  const undo = () => { if (snap) { setDraft(snap); setSnap(null); setNote(""); setDrafted(false); } };
  const set = (patch) => setDraft((d0) => ({ ...d0, ...patch }));
  const onInstructions = (v) => {
    set({ instructions: v });
    if (!v.trim()) { setDrafted(false); setNote(""); setSnap(null); }
    if (!touched.current) { clearTimeout(nameT.current); nameT.current = setTimeout(() => { if (!alive.current || touched.current) return; setDraft((d0) => { const nm = v.trim() ? inferName(v, taken) : ""; if (nm !== d0.name) setFlash((n) => n + 1); return { ...d0, name: nm }; }); }, 400); }
  };
  const drafting = busy;
  const skel = (n) => <div className="bx-skel" aria-hidden="true">{Array.from({ length: n }, (_, k) => <i key={k} style={{ width: 92 - k * 11 + "%" }} />)}</div>;
  const nWhen = ({ ready: "When results are ready", daily: "Once a day, in a summary", never: "Never" })[d.notify.when];
  const nWhere = [d.notify.app && "in the app", d.notify.slack && "in Slack"].filter(Boolean).join(" and ");
  const approvals = PERMS.filter(([k]) => d.perms[k]).length;
  const sum = {
    context: d.context.length ? d.context.length + (d.context.length === 1 ? " document" : " documents") : "No documents",
    rule: d.rule ? d.rule.payer + " claims, " + (d.rule.on ? "on" : "off") : "No rule",
    triggers: triggersSummary(d.triggers),
    notify: nWhen + (d.notify.when !== "never" && nWhere ? ", " + nWhere : ""),
    level: LEVELS.find((l) => l[0] === d.level)[1],
    perms: approvals === 0 ? "Nothing needs your approval" : approvals + (approvals === 1 ? " step needs" : " steps need") + " your approval",
  };
  const TILES = [["context", FileText, "Context"], ["rule", Users, "Auto-assign"], ["triggers", Clock, "Triggers"], ["notify", Bell, "Notifications"], ["level", Zap, "Agent level"], ["perms", ShieldCheck, "Permissions"]];
  const editors = {
    context: (
      <>
        {d.context.length > 0 && <ul className="ag-docs">{d.context.map((x) => <li key={x}><FileText size={16} /><span>{x}</span><button className="ibtn rm" aria-label={"Remove " + x} onClick={() => set({ context: d.context.filter((y) => y !== x) })}><X size={16} /></button></li>)}</ul>}
        <div className="ag-add"><input aria-label="Add a document" placeholder="Add a document" value={doc} onChange={(e) => setDoc(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && doc.trim()) { set({ context: [...d.context, doc.trim()] }); setDoc(""); } }} /><button className="btn" disabled={!doc.trim()} onClick={() => { set({ context: [...d.context, doc.trim()] }); setDoc(""); }}>Add</button></div>
      </>
    ),
    rule: (
      <div className="bld-rule">
        <select aria-label="Payer group" value={d.rule ? d.rule.payer : ""} onChange={(e) => set({ rule: e.target.value ? { payer: e.target.value, on: d.rule ? d.rule.on : false } : null })}>
          <option value="">No rule</option>{PAYER_GROUPS.map((g) => <option key={g} value={g}>{g} claims</option>)}
        </select>
        <button className={"sw" + (d.rule && d.rule.on ? " on" : "")} role="switch" aria-checked={!!(d.rule && d.rule.on)} aria-label="Auto-assign" disabled={!d.rule} onClick={() => set({ rule: { ...d.rule, on: !d.rule.on } })}><span /></button>
      </div>
    ),
    triggers: (
      <div className="tg">
        {d.triggers.length === 0 && <p className="bx-empty">No triggers. The agent only runs when you ask it to.</p>}
        {d.triggers.map((t) => <TriggerRow key={t.id} t={t} onChange={(nt) => set({ triggers: d.triggers.map((x) => (x.id === t.id ? nt : x)) })} onDelete={() => set({ triggers: d.triggers.filter((x) => x.id !== t.id) })} />)}
        <div><AddTrigger onAdd={(type) => set({ triggers: [...d.triggers, newTrigger(type)] })} /></div>
      </div>
    ),
    notify: (
      <div className="bx-form">
        <div className="bx-opts" role="radiogroup" aria-label="When to tell you">
          {[["ready", "When results are ready for review"], ["daily", "Once a day, in a summary"], ["never", "Never"]].map(([k, l]) => <label key={k} className="bx-opt"><input type="radio" name="bx-notify" checked={d.notify.when === k} onChange={() => set({ notify: { ...d.notify, when: k } })} />{l}</label>)}
        </div>
        <div className="bx-row">
          <label className="bx-ck"><Cb label="Tell me in the app" checked={d.notify.app} disabled={d.notify.when === "never"} onChange={() => set({ notify: { ...d.notify, app: !d.notify.app } })} />In the app</label>
          <label className="bx-ck"><Cb label="Tell me in Slack" checked={d.notify.slack} disabled={d.notify.when === "never"} onChange={() => set({ notify: { ...d.notify, slack: !d.notify.slack } })} />In Slack</label>
        </div>
      </div>
    ),
    level: (
      <div className="bx-opts lv" role="radiogroup" aria-label="Agent level">
        {LEVELS.map(([k, l, t]) => <label key={k} className={"bx-lv" + (d.level === k ? " on" : "")}><input type="radio" name="bx-level" checked={d.level === k} onChange={() => set({ level: k })} /><span><b>{l}</b><i>{t}</i></span></label>)}
      </div>
    ),
    perms: (
      <ul className="bx-perms">
        {PERMS.map(([k, l]) => <li key={k}><span>{l}</span><span className="bx-pn">{d.perms[k] ? "Needs my approval" : "On its own"}</span><button className={"sw" + (d.perms[k] ? " on" : "")} role="switch" aria-checked={!!d.perms[k]} aria-label={l + ": needs my approval"} onClick={() => set({ perms: { ...d.perms, [k]: !d.perms[k] } })}><span /></button></li>)}
      </ul>
    ),
  };
  useEffect(() => { if (!sel) return; const el = document.getElementById("bx-ed-" + sel); if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [sel]);
  const ready = !!d.instructions.trim() && !drafting;
  const create = () => onCreate({ ...d, skills: skillTokens(d.instructions, known), fromTemplate: fromTpl ? fromTpl.id : undefined, name: d.name.trim() || inferName(d.instructions, taken), description: d.description || d.instructions.split("\n")[0].slice(0, 90) });
  return (
    <div className="bx">
      <header className="bx-bar">
        <button className="ibtn" aria-label="Back to Agents" onClick={onCancel}><ArrowLeft size={18} /></button>
        <span className="bx-tile sm"><AgentEmblem size={20} animate={busy} /></span>
        <label className={"bx-nm" + (flash ? " flash" : "")} key={"nm" + flash} title="Rename the agent"><input aria-label="Agent name" placeholder="New agent" value={d.name} style={{ width: Math.max(9, d.name.length + 2) + "ch" }} onChange={(e) => { touched.current = true; set({ name: e.target.value }); }} /><Pencil size={14} /></label>
        <span className="bx-pill">Draft</span>
        <span className="grow" />
        <span className="bx-fmsg">{drafting ? "Drafting your agent" : !d.instructions.trim() ? "Add instructions to continue." : "You can change all of this later."}</span>
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn primary" disabled={!ready} onClick={create}>Create agent</button>
      </header>
      <div className="bx-body">
        <div className="bx-in started">
          <section className="bx-ins" aria-label="Instructions section">
            <div className="bx-sh">
              <span className="bx-ci"><ClipboardCheck size={18} /></span>
              <div><h2>Instructions</h2></div>
              {!drafted && <button className="btn bx-draft" disabled={!d.instructions.trim() || busy} onClick={() => run(d.instructions, false)}><AgentEmblem size={16} animate={busy} />Draft with AI</button>}
            </div>
            {drafting ? skel(5) : <SkillTextarea label="Instructions" autoFocus={!seed} skills={skills || []} placeholder="Describe what the agent should do, or write the instructions, one per line." rows={Math.min(14, Math.max(6, d.instructions.split("\n").length + 1))} value={d.instructions} onChange={onInstructions} />}
            {!drafting && <div className="sl-hint">Type <kbd>/</kbd> to use a skill.{skillTokens(d.instructions, known).length > 0 && <span className="sl-used"> Skills used: {skillTokens(d.instructions, known).map((n) => <span key={n} className="ext-chip">{n}</span>)}</span>}</div>}
            {note && !drafting && <div className="bx-nt" aria-live="polite"><AgentEmblem size={18} animate={false} /><span>{note}</span>{snap && <button className="link" onClick={undo}>Undo</button>}</div>}
            <div className="bx-tpl">
              {fromTpl
                ? <button className="link bx-browse" onClick={onBrowse}>Choose a different template</button>
                : drafted
                ? <><span className="bx-tl-l">Refine the draft</span><div className="bx-chips">{FOLLOWUPS.map((f) => <button key={f} className="bx-chip" disabled={busy} onClick={() => run(f, true)}>{f}</button>)}</div></>
                : <button className="link bx-browse" onClick={onBrowse}>Browse templates</button>}
            </div>
          </section>
          <section className="bx-set" aria-label="Agent settings">
            <h2 className="bx-h2">Settings</h2>
            <div className="bx-list">
              {TILES.map(([k, I, title]) => (
                <div key={k} className={"bx-sc" + (sel === k ? " on" : "")}>
                  <button className="bx-tl" aria-expanded={sel === k} aria-controls={"bx-ed-" + k} onClick={() => setSel(sel === k ? null : k)}>
                    <span className="bx-ci"><I size={18} /></span>
                    <span className="bx-ct"><b>{title}</b><span>{sum[k]}</span></span>
                    <ChevronDown size={16} className={"bx-cv" + (sel === k ? " up" : "")} />
                  </button>
                  {sel === k && <div className="bx-ed" id={"bx-ed-" + k} role="region" aria-label={title + " settings"}>{editors[k]}</div>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------- App ---------- */


export default function App() {
  const [page, setPage] = useState("agents"); /* the prototype starts on the Hub */
  const [navOff, setNavOff] = useState(false);
  const [msg, setMsg] = useState("");
  const [agents, setAgents] = useState(SEED_AGENTS);
  const [seed] = useState(seedState);
  const [claims, setClaims] = useState(seed.claims);
  const [activity, setActivity] = useState(seed.activity);
  const [intent, setIntent] = useState(null);
  const [chats, setChats] = useState(SEED_CHATS);
  const [addOpen, setAddOpen] = useState(false); /* the Add an agent modal */
  /* demo control: view as a biller or a billing manager. ?role=manager starts as a manager, Shift+M switches, ?present or Shift+P hides the control */
  const [persona, setPersona] = useState(() => (/[?&]role=manager/.test(window.location.search) ? "manager" : "biller"));
  const [hidePersona, setHidePersona] = useState(() => /[?&]present(=|&|$)/.test(window.location.search));
  useEffect(() => {
    const h = (e) => { const tg = e.target; if (!e.shiftKey || e.metaKey || e.ctrlKey || e.altKey || (tg && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) || tg.isContentEditable))) return; const k = e.key.toLowerCase(); if (k === "p") setHidePersona((v) => !v); else if (k === "m") setPersona((v) => (v === "manager" ? "biller" : "manager")); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  const [mySkills, setMySkills] = useState([]); /* skills you create or upload: available to all agents */
  const [addedExt, setAddedExt] = useState([]); /* skills, connectors and plugins added from Discover */
  const availableSkills = (() => { const seen = new Set(); return [...EXT.skills.filter((k) => k.scope === "org" || k.scope === "you"), ...mySkills, ...EXT.skills.filter((k) => k.scope === "discover" && addedExt.includes(k.id))].filter((k) => !seen.has(k.id) && seen.add(k.id)); })();
  const skillsFor = (a) => [...EXT.skills.filter((k) => k.scope === "you").map((k) => ({ ...k, shared: true })), ...mySkills.map((k) => ({ ...k, shared: true })), ...EXT.skills.filter((k) => k.scope === "discover" && addedExt.includes(k.id)).map((k) => ({ ...k, shared: true })), ...EXT.skills.filter((k) => (k.scope === "org" && (k.agents || []).includes(a.id)) || (a.skills || []).includes(k.id))];
  const addSkill = (k) => { setMySkills((p) => [...p, { id: k.id, name: k.name, cat: k.cat, desc: k.desc, how: k.how, agents: "all", d: 0, scope: "you", icon: FileText }]); notify("Created " + k.name + ". It is available to all agents."); setPage("skills"); };
  const [myStep, setMyStep] = useState({}); /* My Claims: 0 = first action active, 1 = second active, 2 = done */
  const [myGone, setMyGone] = useState([]); /* My Claims: claims that are done and gone */
  const [offer, setOffer] = useState(null); /* the "build an agent" prompt */
  const [asked, setAsked] = useState(false); /* we ask once */
  const [builderSeed, setBuilderSeed] = useState(null);
  const onFullDenialsDone = (count) => { if (asked) return; setAsked(true); setOffer({ count }); };
  const buildFromOffer = () => {
    const o = offer, d = seedFromFullDenials(o.count, agents.map((a) => a.name)).draft;
    const a = { id: "ag" + Date.now(), name: d.name, init: initials(d.name), description: d.description, instructions: d.instructions, context: d.context, rule: { ...d.rule, on: false }, paused: false };
    const ids = claims.filter((c) => c.status === "Full Denials" && !c.assignee).map((c) => c.id); /* only Full Denials nobody owns yet */
    setAgents((p) => [...p, a]); setChats((p) => [setupThread(a), ...p]);
    if (ids.length) { const r = doAssign(claims, ids, a.id, { auto: true, agentIds: [...agentIds, a.id], now: Date.now(), reason: "Assigned when the agent was set up" }); setClaims(r.claims); setActivity((x) => [...r.events, ...x]); }
    setOffer({ ...o, stage: "done", agentId: a.id, name: a.name, docs: a.context.length }); /* the biller stays in the work list */
  };
  const offerTasks = offer && offer.agentId ? claims.filter((c) => c.assignee === offer.agentId && c.work) : [];
  const offerProgress = { total: offerTasks.length, ready: offerTasks.filter((c) => c.work.state === "ready").length };
  const laterOffer = () => setOffer(null);
  /* chats: a new chat appears in the menu with its first message */
  const sendChatMsg = (chat, text) => {
    const smart = (t) => { const q = t.toLowerCase(); return /trigger|schedule|when do you run|how often/.test(q) ? "You can change when I run in the Triggers card on my page." : /instruction|only|never|always/.test(q) ? "Change my instructions in the Instructions card on my page. Type / to add a skill." : /try|test/.test(q) ? "Press Try it on 3 claims in my first message and I will show you the results." : CHAT_REPLY; };
    const reply = (id, t) => setTimeout(() => setChats((p) => p.map((c) => (c.id === id ? { ...c, msgs: [...c.msgs, { from: "agent", text: smart(t) }] } : c))), 900);
    if (chat.id === "new") {
      const id = "c" + Date.now(), name = text.length > 40 ? text.slice(0, 37) + "..." : text;
      setChats((p) => [{ id, name, agentId: null, msgs: [{ from: "you", text }] }, ...p]); setPage("chat:" + id); reply(id, text); return;
    }
    setChats((p) => p.map((c) => (c.id === chat.id ? { ...c, msgs: [...c.msgs, { from: "you", text }] } : c))); reply(chat.id, text);
  };
  /* "Try it on 3 claims": hand the agent a few claims nobody owns and report back in the thread */
  const tests = useRef([]);
  const threadAction = (action, chat) => {
    const a = agents.find((x) => x.id === chat.agentId);
    if (!a) return;
    if (action.id === "review") { setPage("agent:" + a.id); return; }
    if (action.id !== "try") return;
    const kind = inferName(a.instructions || "", []).replace(" Agent", "");
    const want = { Denials: ["Full Denials", "Partial Denials", "Rejections"], Posting: ["Payment Posting"], Eligibility: ["Decision Pending"], Coding: ["Rejections", "Partial Denials"], "Secondary Claims": ["Payment Posting", "Decision Pending"] }[kind];
    const free = claims.filter((c) => !c.assignee && !c.work);
    const pick = (want ? free.filter((c) => want.includes(c.status)) : []).concat(free).filter((c, i, arr) => arr.findIndex((y) => y.id === c.id) === i).slice(0, 3);
    const add = (m) => setChats((p) => p.map((c) => (c.id === chat.id ? { ...c, msgs: [...c.msgs.map((x) => (x.card && x.card.actions ? { ...x, card: { ...x.card, actions: x.card.actions.map((b) => (b.id === "try" ? { ...b, done: true } : b)) } } : x)), m] } : c)));
    if (!pick.length) { add({ from: "agent", text: "I could not find claims that nobody owns to try. Assign a few to me from Claims and I will start." }); return; }
    assign(pick.map((c) => c.id), a.id, true, "Test run from the thread");
    tests.current.push({ chatId: chat.id, ids: pick.map((c) => c.id) });
    add({ from: "agent", text: "Trying it on " + pick.length + (pick.length === 1 ? " claim" : " claims") + ": " + pick.map((c) => c.id).join(", ") + ". They are now assigned to me, and the results appear in Tasks as they finish. Nothing is sent or posted." });
  };
  useEffect(() => {
    if (!tests.current.length) return;
    tests.current = tests.current.filter((t) => {
      const done = t.ids.every((id) => { const c = claims.find((x) => x.id === id); return !c || !c.work || c.work.state === "ready"; });
      if (done) setChats((p) => p.map((c) => (c.id === t.chatId ? { ...c, msgs: [...c.msgs, { from: "agent", card: { title: "Done. " + t.ids.length + (t.ids.length === 1 ? " result is" : " results are") + " ready for review.", text: "I did not send or post anything. Open Tasks to approve, edit or reject each one.", actions: [{ id: "review", label: "Review results", primary: true }] } }] } : c)));
      return !done;
    });
  }, [claims]);
  /* an Athelas template becomes your own agent: a copy you can change */
  /* picking a template opens the creation screen filled in from it, so the biller can change anything before creating the agent */
  const addFromTemplate = (t) => {
    const a = agentFromTemplate(t, agents.map((x) => x.name));
    setBuilderSeed({
      id: Date.now(), template: t,
      reply: "This starts from the " + t.name + " template by " + t.by + ". It uses " + t.skills.length + (t.skills.length === 1 ? " skill" : " skills") + ". Change anything below, then create your agent.",
      draft: { name: a.name, description: a.description, instructions: a.instructions, context: a.context, rule: null, triggers: a.triggers, notify: a.notify, level: a.level, perms: a.perms, skills: a.skills },
    });
    setPage("agent:new");
  };
  useEffect(() => { if (page !== "agent:new") setBuilderSeed(null); }, [page]);
  const claimsRef = useRef(claims);
  claimsRef.current = claims;
  const pausedRef = useRef(new Set());
  const timer = useRef(null);
  const notify = (m) => { setMsg(typeof m === "string" ? m : "Not part of this demo"); clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(""), 2800); };
  useEffect(() => () => clearTimeout(timer.current), []);
  const [toolsTab, setToolsTab] = useState("templates");
  const [toolsKey, setToolsKey] = useState(0);
  const goTools = (tab) => { setToolsTab(tab); setToolsKey((k) => k + 1); setPage("skills"); }; /* open Tools on a given tab */
  const go = (it) => { if (it.page === "skills") goTools("templates"); else if (it.page) setPage(it.page); else notify(); };

  /* agents finish their work over time */
  useEffect(() => {
    const t = setInterval(() => {
      const r = advance(claimsRef.current, Date.now(), false, pausedRef.current);
      if (r.changed) { setClaims(r.claims); setActivity((a) => [...r.events, ...a]); }
    }, 600);
    return () => clearInterval(t);
  }, []);

  pausedRef.current = new Set(agents.filter((a) => a.paused).map((a) => a.id));
  const agentIds = agents.map((a) => a.id);
  const update = (id, patch) => setAgents((p) => p.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const assign = (ids, assigneeId, auto = false, reason) => {
    const r = doAssign(claims, ids, assigneeId, { auto, agentIds, now: Date.now(), reason });
    setClaims(r.claims); setActivity((a) => [...r.events, ...a]);
  };
  const setRule = (agent, rule) => {
    update(agent.id, { rule });
    if (rule.on) {
      const ids = claims.filter((c) => payerGroup(c.payer) === rule.payer && c.assignee !== agent.id).map((c) => c.id);
      if (ids.length) assign(ids, agent.id, true, `Assigned by the ${rule.payer} rule`);
      notify(ids.length ? `Assigned ${ids.length} ${rule.payer} ${ids.length === 1 ? "claim" : "claims"} to ${agent.name}` : `Auto-assign is on for ${rule.payer} claims`);
    } else notify("Auto-assign is off. Claims already assigned stay with " + agent.name);
  };
  const review = (ids, decision) => {
    const now = Date.now(); const evs = [];
    const next = claims.map((c) => {
      if (!ids.includes(c.id) || !c.work || c.work.state !== "ready") return c;
      evs.push({ id: c.id + "-v-" + now, agentId: c.work.agentId, claimId: c.id, t: now, text: `${decision === "approved" ? "Approved" : "Rejected"} by ${REVIEWER}.` });
      return { ...c, work: { ...c.work, state: decision, reviewer: REVIEWER, reviewedAt: now } };
    });
    if (!evs.length) return;
    setClaims(next); setActivity((a) => [...evs, ...a]);
    const n = evs.length;
    notify(`${decision === "approved" ? "Approved" : "Rejected"} ${n} ${n === 1 ? "result" : "results"}. Saved in Activity. Nothing was sent or posted.`);
  };
  const editProposal = (id, text) => {
    const c = claims.find((x) => x.id === id); if (!c || !c.work) return;
    setClaims((p) => p.map((x) => (x.id === id ? { ...x, work: { ...x.work, proposal: text, edited: true } } : x)));
    setActivity((a) => [{ id: id + "-e-" + Date.now(), agentId: c.work.agentId, claimId: id, t: Date.now(), text: `Proposal edited by ${REVIEWER}` }, ...a]);
  };
  const sendChat = (id, text) => {
    const add = (m) => setClaims((p) => p.map((c) => (c.id === id && c.work ? { ...c, work: { ...c.work, chat: [...c.work.chat, m] } } : c)));
    add({ from: "you", text, t: Date.now() });
    setTimeout(() => add({ from: "agent", text: "Got it. I will use that on my next pass and update the proposal.", t: Date.now() }), 900);
  };
  const create = (d) => {
    const a = { id: "ag" + Date.now(), name: d.name.trim(), init: initials(d.name), description: d.description, instructions: d.instructions, context: d.context, rule: d.rule ? { ...d.rule } : null, triggers: d.triggers, skills: d.skills || [], notify: d.notify, level: d.level, perms: d.perms, paused: false };
    setAgents((p) => [...p, a]); setPage("agent:" + a.id);
    setChats((p) => [setupThread(a), ...p]); /* the agent's first conversation starts when it is created */
    if (d.rule && d.rule.on) {
      /* auto-assign was switched on while creating: hand over the matching claims that nobody is working and that are not yours */
      const ids = claims.filter((c) => payerGroup(c.payer) === d.rule.payer && c.assignee !== ME && !c.work).map((c) => c.id);
      if (ids.length) { const r = doAssign(claims, ids, a.id, { auto: true, agentIds: [...agentIds, a.id], now: Date.now(), reason: `Assigned by the ${d.rule.payer} rule` }); setClaims(r.claims); setActivity((x) => [...r.events, ...x]); }
      notify(ids.length ? `Created ${a.name}. It started on ${ids.length} ${d.rule.payer} ${ids.length === 1 ? "claim" : "claims"}` : `Created ${a.name}. Auto-assign is on for ${d.rule.payer} claims`);
    } else notify(`Created ${a.name}`);
  };
  const togglePause = (a) => { update(a.id, { paused: !a.paused }); notify(a.paused ? `Resumed ${a.name}` : `Paused ${a.name}. Its work waits until you resume.`); };
  const removeAgent = (a) => {
    const n = claims.filter((c) => c.work && c.work.agentId === a.id || c.assignee === a.id).length;
    setClaims((p) => p.map((c) => (c.assignee === a.id || (c.work && c.work.agentId === a.id) ? { ...c, assignee: c.assignee === a.id ? null : c.assignee, auto: false, work: null } : c)));
    setAgents((p) => p.filter((x) => x.id !== a.id));
    setChats((p) => p.filter((c) => !(c.agentId === a.id && c.setup))); /* its setup thread goes with it */
    if (page === "agent:" + a.id) setPage("agents");
    notify(`Deleted ${a.name}. ${n} ${n === 1 ? "claim is" : "claims are"} unassigned.`);
  };
  const goClaims = (assignee, claim) => { setIntent({ assignee, claim, n: Date.now() }); setPage("claims"); };
  const readyCounts = Object.fromEntries(agents.map((a) => [a.id, claims.filter((c) => c.assignee === a.id && c.work && c.work.state === "ready").length]));

  const dir = Object.fromEntries([...AGENTS, ...agents.map(toAssignee)].map((a) => [a.id, a]));
  const agent = page.startsWith("agent:") && page !== "agent:new" ? agents.find((a) => "agent:" + a.id === page) : null;
  const chatObj = page === "chat:new" ? { id: "new", name: "New chat", agentId: null, msgs: [] } : page.startsWith("chat:") ? chats.find((c) => "chat:" + c.id === page) || null : null;
  const crumb = page === "agents" ? ["Agents", "Home"] : page === "skills" ? ["Agents", "Tools"] : page === "documents" ? ["Agents", "Documents"] : page === "chats" ? ["Agents", "Chats"] : chatObj ? ["Chats", chatObj.name] : page === "agent:new" ? ["Agents", "New agent"] : agent ? ["Agents", agent.name] : ["Claims"];

  return (
    <div className="app">
      <style>{CSS}</style>
      <AgentGradient />
      <div className={"shell" + (navOff ? " navoff" : "")}>
        <SideNav page={page} onGo={go} notify={notify} agents={agents} readyCounts={readyCounts} chats={chats} onNewChat={() => setPage("chat:new")} />
        <div className="rightcol">
          <TopBar navOff={navOff} onToggleNav={() => setNavOff(!navOff)} crumb={crumb} notify={notify} />
          <main className="canvas">
            {page === "claims" && <ClaimsPage notify={notify} claims={claims} agents={agents} assign={assign} review={review} editProposal={editProposal} sendChat={sendChat} myStep={myStep} onMyStep={(id, n) => setMyStep((p) => ({ ...p, [id]: n }))} myGone={myGone} onFullDenialsDone={onFullDenialsDone} onMyGone={(id) => setMyGone((p) => (p.includes(id) ? p : [...p, id]))} intent={intent} clearIntent={() => setIntent(null)} goAgent={(id) => setPage("agent:" + id)} />}
            {agent && <AgentPage key={agent.id} thread={chats.find((c) => c.agentId === agent.id && c.setup)} onThreadSend={sendChatMsg} onThreadAction={threadAction} skills={skillsFor(agent)} pickSkills={availableSkills} onManageSkills={() => goTools("skills")} agent={agent} claims={claims} activity={activity} onUpdate={(patch) => update(agent.id, patch)} onRule={(r) => setRule(agent, r)} onApprove={(ids) => review(ids, "approved")} onReview={review} onEdit={editProposal} onChat={sendChat} dir={dir} goClaims={goClaims} notify={notify} />}
            {page === "agents" && <HubPage persona={persona} myGone={myGone} onOpenClaims={() => setPage("claims")} onAddTemplate={addFromTemplate} agents={agents} claims={claims} activity={activity} onOpen={(a) => setPage("agent:" + a.id)} onNew={() => setAddOpen("add")} onShowAll={() => goTools("templates")} onPause={togglePause} onDelete={removeAgent} />}
            {page === "skills" && <SkillsPage key={"tools" + toolsKey} initialTab={toolsTab} onUseTemplate={addFromTemplate} onDescribe={() => setPage("agent:new")} agents={agents} notify={notify} mine={mySkills} added={addedExt} onAddSkill={addSkill} onAddExisting={(id) => setAddedExt((p) => (p.includes(id) ? p : [...p, id]))} />}
            {page === "documents" && <DocumentsPage agents={agents} notify={notify} />}
            {page === "chats" && <ChatsPage chats={chats} agents={agents} onOpen={(id) => setPage("chat:" + id)} onNew={() => setPage("chat:new")} />}
            {chatObj && <ChatPage key={chatObj.id} chat={chatObj} agents={agents} onSend={sendChatMsg} onAction={(a, c) => (a.id === "settings" ? setPage("agent:" + c.agentId) : threadAction(a, c))} />}
            {page === "agent:new" && <AgentBuilder key={builderSeed ? builderSeed.id : "blank"} seed={builderSeed} agents={agents} skills={availableSkills} onBrowse={() => setAddOpen(true)} onCreate={create} onCancel={() => setPage("agents")} />}
          </main>
        </div>
      </div>
      {!hidePersona && <PersonaSwitch value={persona} onChange={setPersona} />}
      {addOpen && <AddAgentModal mode={addOpen} templates={athelasTemplates()} onAdd={(t) => { setAddOpen(false); addFromTemplate(t); }} onDescribe={() => { setAddOpen(false); setPage("agent:new"); }} onClose={() => setAddOpen(false)} />}
      {offer && <AgentOffer offer={offer} progress={offerProgress} onBuild={buildFromOffer} onLater={laterOffer} onView={() => { const id = offer.agentId; setOffer(null); setPage("agent:" + id); }} />}
      {msg && !offer && <div className="toast" role="status">{msg}</div>}
    </div>
  );
}

/* ---------- Styles (all colors come from tokens in .app) ---------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap');
.app{
/* Design System 3.0 tokens (Theme collection), same set as the ATI demo */
--fg1:#1f1f1f;--fg2:#454545;--fg3:#737373;--fg-dis:rgba(0,0,0,.4);--fg-accent:#1132ee;--on-accent:#fff;
--bs:rgba(0,0,0,.1);--bst:rgba(0,0,0,.2);
--base:#fff;--solid2:#f5f5f5;--tonal:#f1f3fe;--d5:rgba(0,0,0,.05);--d10:rgba(0,0,0,.1);
--accent:#1132ee;--accent-h:#0d27c0;--accent-sub:rgba(17,50,238,.1);--accent-sub-h:rgba(17,50,238,.06);
--r-soft:8px;--r-semi:4px;--r-extra:12px;--r-card:16px;--r-full:100px;
/* Tokens added for this screen (sampled from the recording) */
--imp-bg:rgba(17,50,238,.2);--avatar-bg:#6068fd;--dot-peach:#ebddd3;--dot-blue:#b9c1f3;
--shadow-sticky:rgba(0,0,0,.12);--danger:#b52b2b;--danger-sub:rgba(181,43,43,.1);--info:#416bcf;--info-sub:rgba(65,107,207,.1);--info-bd:rgba(65,107,207,.4);--neutral-sub:rgba(89,89,89,.1);--success:#2a9953;--em-orange:#c27023;--em-blue:#405bf2;--em-green:#2a9953;--em-purple:#ae42b0;--orange:#c27023;--orange-sub:rgba(194,112,35,.1);--pop-shadow:rgba(0,0,0,.18);--scrim:rgba(0,0,0,.35);--success-fg:#228048;--bg1:#fafafa;--tonal:#f1f3fe;--ai-from:#f9fafe;--ai-to:#edf0ff;
--av-green:#5fb86b;--av-teal:#58c7b8;--av-orange:#f5a03a;--av-red:#e85d5f;--av-cyan:#55c7d6;--av-pink:#d16fd4;--av-purple:#7268d2;--av-blue:#5b8fe8;--av-lilac:#a99ad8;--av-indigo:#7f8bd0;--av-lime:#8fcb6a;--av-mint:#8fddd0;--toast-bg:#141414;--toast-fg:#e5e5e5;--skel:rgba(0,0,0,.07);
font-family:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--fg1);font-size:13px;line-height:1.6;height:100vh;display:flex;flex-direction:column;background:var(--tonal);font-variant-numeric:tabular-nums;position:relative}
.app *{box-sizing:border-box}
:where(.app) button{font-family:inherit;font-size:inherit;color:inherit;cursor:pointer}
.app :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.grow{flex:1}.muted{color:var(--fg3)}

/* shell */
.shell{flex:1;display:grid;grid-template-columns:232px 1fr;min-height:0;background:var(--tonal)}
.shell.navoff{grid-template-columns:1fr}.shell.navoff .sidecol{display:none}
.sidecol{display:flex;flex-direction:column;gap:4px;padding:8px;min-height:0}
.logo{display:flex;align-items:center;height:48px;padding:0;color:var(--fg1);flex:none}
.sidescroll{flex:1;overflow:auto;min-height:0;scrollbar-width:none;-webkit-mask-image:linear-gradient(to bottom,#000 calc(100% - 44px),transparent);mask-image:linear-gradient(to bottom,#000 calc(100% - 44px),transparent)}
.sidescroll::-webkit-scrollbar{display:none}
.sgroup{display:flex;flex-direction:column;margin-bottom:4px}
.shead{display:flex;align-items:center;gap:6px;height:30px;width:100%;padding:0 0 0 2px;border:0;background:transparent;text-align:left;font-weight:500;font-size:14px;color:var(--fg2)}
.shead:hover{color:var(--fg1)}.shead .flip{transform:rotate(180deg);margin-left:2px}
.sbody{display:flex}.sline{width:1px;background:var(--d10);margin:0 12px 6px 8px}
.slist{flex:1;display:flex;flex-direction:column;gap:2px;padding-bottom:6px;min-width:0}
.ni{display:flex;align-items:center;gap:6px;width:100%;text-align:left;background:transparent;border:0;color:var(--fg2);padding:0 8px;height:28px;border-radius:var(--r-soft);overflow:hidden;white-space:nowrap}
.ni span{overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}
.ni:hover{background:var(--d5)}.ni.on{background:var(--accent-sub);color:var(--fg-accent);font-weight:500}
.ndot{width:10px;height:10px;border-radius:50%;flex:none}.ndot.peach{background:var(--dot-peach)}.ndot.blue{background:var(--dot-blue)}
.imp{flex:none;background:var(--imp-bg);border-radius:var(--r-soft);padding:8px;display:flex;flex-direction:column;gap:2px;margin-top:4px}
.imp-t{display:flex;align-items:center;gap:8px;font-weight:500}
.imp-s{color:var(--fg2)}
.imp .link{align-self:flex-start;height:24px}
.sfoot{display:flex;align-items:center;height:36px;flex:none;gap:4px}
.avatar{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:500;background:var(--avatar-bg);color:var(--on-accent)}
.rightcol{display:flex;flex-direction:column;min-width:0;min-height:0;padding:0 8px 8px 0}
.navoff .rightcol{padding-left:8px}

/* top bar */
.hdr{display:flex;align-items:center;justify-content:space-between;padding:4px 0;position:relative;height:36px;flex:none}
.hdr-l,.hdr-r{display:flex;align-items:center;gap:6px}
.hdr-l .hbtn{margin:0 0 0 -3px}
.bc{display:flex;align-items:center}.bc-cur{font-weight:500}.bc-link{color:var(--fg3)}.bc-sep{color:var(--bst);padding:0 12px}.bc-cur.pill{background:var(--d5);border-radius:var(--r-soft);padding:0 8px}
.hdr-c{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:4px;top:4px;color:var(--fg2)}
.gsearch{display:flex;align-items:center;gap:4px;justify-content:center;width:320px;background:var(--d5);border:0;border-radius:var(--r-soft);padding:3px 6px;color:var(--fg3);position:relative}
.kbd{position:absolute;right:10px;font-size:12px;color:var(--fg-dis)}
.aitab{display:flex;align-items:center;gap:6px;height:28px;padding:0 8px;border:0;background:transparent;border-radius:var(--r-soft);color:var(--fg-accent);font-weight:500}
.aitab:hover{background:var(--accent-sub-h)}
.icon{border:0;background:transparent;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:var(--fg2);padding:0}.icon:hover{background:var(--d5)}

/* canvas and claims container */
.canvas{flex:1;min-height:0;overflow:hidden;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);position:relative;display:flex;flex-direction:column}
.clpage{flex:1;min-height:0;display:flex;flex-direction:column;position:relative}
.cl-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 12px;height:48px;flex:none}
.cl-tabs{display:flex;align-items:center;gap:8px}
.cl-tab{height:28px;padding:0 6px;border:0;border-radius:var(--r-soft);background:transparent;color:var(--fg2);white-space:nowrap}
.cl-tab:hover:not(.on){background:var(--d5)}.cl-tab.on{background:var(--accent-sub);color:var(--fg-accent)}
.cl-div{width:1px;height:28px;background:var(--bs);flex:none}
.cl-act{display:flex;align-items:center;gap:6px}
.tbtn{width:28px;height:28px;padding:4px;border:0;border-radius:var(--r-soft);background:transparent;color:var(--fg2);display:grid;place-items:center}
.tbtn:hover:not(.on){background:var(--d5)}.tbtn.on{background:var(--accent-sub);color:var(--fg-accent)}
.ibtn{width:28px;height:28px;padding:0;border:0;border-radius:var(--r-full);background:transparent;color:var(--fg2);display:grid;place-items:center}.ibtn:hover{background:var(--d5)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;border:1px solid var(--bs);background:var(--base);border-radius:var(--r-full);padding:0 14px;font-weight:500;white-space:nowrap}
.btn svg{margin-right:-3px}.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}.btn.primary:hover{background:var(--accent-h)}
.link{border:0;background:transparent;color:var(--fg-accent);font-weight:500;padding:0}.link:hover{text-decoration:underline;text-underline-offset:2px}
.link.hide{display:inline-flex;align-items:center;gap:4px;height:28px}
.cl-filter{display:flex;align-items:center;gap:8px;padding:0 12px;height:36px;margin-bottom:8px;flex:none}
.cl-err{padding:12px 12px 0;flex:none}
.banner{display:flex;align-items:center;gap:12px;min-height:40px;padding:6px 12px;background:var(--info-sub);border:1px solid var(--info);border-radius:var(--r-semi);color:var(--fg1)}
.banner svg{color:var(--info);flex:none}

/* table: Figma Data Table (header 28, rows 36, group rows 45) */
.clwrap{flex:1;min-height:0;overflow:auto;position:relative;margin:0 12px 12px;border:1px solid var(--bs);border-radius:var(--r-soft)}
.cltbl{border-collapse:separate;border-spacing:0;width:100%;min-width:max-content;font-size:13px}
.cltbl th{position:sticky;top:0;z-index:3;height:28px;padding:0 8px;background:var(--solid2);text-align:left;font-weight:400;color:var(--fg1);white-space:nowrap;border-bottom:1px solid var(--bs);border-right:1px solid var(--bs)}
.cltbl td{height:36px;padding:0 8px;border-bottom:1px solid var(--bs);background-color:var(--base);color:var(--fg2);white-space:nowrap}
.cltbl th.exp,.cltbl td.exp{width:36px;min-width:36px;padding:0 4px}
.cltbl th.sel,.cltbl td.sel{width:32px;min-width:32px;padding:0 8px}
.cltbl th.exp,.cltbl th.sel{border-right:1px solid var(--bs)}
.cltbl td.sel .cb,.cltbl th.sel .cb{margin:0 auto}
.cltbl td.exp,.cltbl td.sel{border-right:1px solid transparent}
.cltbl td.stripe{box-shadow:inset 6px 0 0 var(--d10)}
.cltbl .asg-h,.cltbl .asg-c{position:sticky;right:0;z-index:2;width:92px;min-width:92px;padding:0 8px;box-shadow:-6px 0 8px -6px var(--shadow-sticky);text-align:center}
.cltbl th.asg-h{z-index:4;border-right:0}
.cltbl td.asg-c .bar{margin:0 auto}
.clgrp td{height:44px;padding:0;background-color:var(--bg1)}
.clgrp td.asg-c{padding:0 8px}.clgrp td.exp .ibtn{margin:0 auto}
.clgin{position:sticky;left:76px;display:flex;align-items:center;gap:8px;height:44px;padding:0;width:max-content;max-width:calc(100vw - 460px)}
.clgin .ibtn svg{transition:transform .12s}.clgin .ibtn svg.rot{transform:rotate(-90deg)}
.clrow:hover td{background-image:linear-gradient(var(--d5),var(--d5))}
.clrow.picked td{background-image:linear-gradient(var(--accent-sub),var(--accent-sub))}
.clrow.skel:hover td{background-image:none}
.clempty td{height:auto;border-bottom:0}
.empty{display:flex;flex-direction:column;align-items:center;gap:4px;padding:56px 0;color:var(--fg3)}.empty b{color:var(--fg1);font-weight:500;margin-top:4px}
.bar{display:inline-block;height:14px;border-radius:7px;background:var(--skel);vertical-align:middle}

/* tags, chips, links */
.tag{--tone:var(--fg1);--ic:var(--fg2);--bg:var(--neutral-sub);display:inline-flex;align-items:center;gap:4px;line-height:16px;height:21px;padding:0 2px;border-radius:var(--r-soft);font-weight:500;color:var(--tone)}
.tag svg{color:var(--ic);flex:none}
.tag.danger{--tone:var(--danger);--ic:var(--danger);--bg:var(--danger-sub)}
.tag.info{--tone:var(--info);--ic:var(--info);--bg:var(--info-sub)}
.tag.orange{--tone:var(--orange);--ic:var(--orange);--bg:var(--orange-sub)}
.tag.filled{height:28px;padding:0 8px;background:var(--bg);color:var(--fg1)}
.chip{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border-radius:var(--r-soft);background:var(--d5);color:var(--fg1);font-weight:500;white-space:nowrap;max-width:620px;min-width:0}
.chip:not(.amt){overflow:hidden;text-overflow:ellipsis;display:inline-block;line-height:28px}
.chip.amt{background:var(--d5);flex:none;display:inline-block;position:relative;line-height:28px;white-space:pre}
.amt-n{font-weight:500;color:var(--fg1)}.amt-s,.amt-c{color:var(--fg2);font-weight:500}
.chip.amt:hover .amt-c{color:var(--fg1)}
.amt-x{display:inline-block;vertical-align:top;max-width:0;opacity:0;overflow:hidden;color:var(--fg2);font-weight:400;transition:max-width .28s ease,opacity .2s ease}
.chip.amt:hover .amt-x{max-width:96px;opacity:1}
@media (prefers-reduced-motion:reduce){.amt-x{transition:none}}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.gline{min-width:0;font-size:13px;color:var(--fg2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tag.filled,.chipset{flex:none}
.chipset{display:inline-flex}.chipset .chip+.chip{margin-left:-6px;box-shadow:0 0 0 2px var(--base)}
.plink{border:0;background:transparent;padding:0;color:var(--fg-accent);font-size:13px;cursor:pointer}.plink:hover{text-decoration:underline;text-underline-offset:2px}
.ins{display:inline-flex;align-items:center;gap:6px;line-height:16px;color:var(--fg2)}.ins svg{color:var(--success)}

/* avatars */
.av{display:inline-grid;place-items:center;border-radius:50%;border:.5px solid var(--bst);color:var(--on-accent);font-weight:500;font-size:13px;line-height:1;flex:none}
.av-green{background:var(--av-green)}.av-teal{background:var(--av-teal)}.av-orange{background:var(--av-orange)}.av-red{background:var(--av-red)}.av-cyan{background:var(--av-cyan)}.av-pink{background:var(--av-pink)}.av-purple{background:var(--av-purple)}.av-blue{background:var(--av-blue)}.av-lilac{background:var(--av-lilac)}.av-indigo{background:var(--av-indigo)}.av-lime{background:var(--av-lime)}.av-mint{background:var(--av-mint)}
.av-agent{background:var(--base);border:1px solid var(--bst);border-radius:var(--r-soft)}
.emblem{display:block;overflow:visible}
.emblem.live .petal{animation:em-glow 3.2s ease-in-out infinite;animation-delay:calc(var(--p) * -.8s)}
@keyframes em-glow{0%,100%{opacity:.4}35%{opacity:1}}
@media (prefers-reduced-motion:reduce){.emblem.live .petal{animation:none}}
.ag-id{display:flex;align-items:center;gap:16px}
.ag-emblem{width:56px;height:56px;border-radius:var(--r-extra);display:grid;place-items:center;background:var(--base);border:1px solid var(--bst)}
.stack{display:inline-flex;align-items:center}.stack .av+.av{margin-left:-20px}

/* My Claims: expandable claims, summary and a two-step suggested action path (Figma Claims, 10881:131379) */
.clwrap{container-type:inline-size}
.mytbl tr.clrow td.exp{padding:0 0 0 6px;text-align:left}.mytbl tr.clrow td.exp .ibtn{margin:0 -2px 0 4px}
.mytbl .exp .ibtn svg{transition:transform .12s}.mytbl .exp .ibtn svg.rot{transform:rotate(-90deg)}
.myctx td{padding:0;height:auto;background-color:var(--base);border-bottom:1px solid var(--bs);white-space:normal}
.mypanel{position:sticky;left:0;width:calc(100cqw - 2px);box-sizing:border-box;display:flex;gap:24px;padding:16px 16px 16px 22px;background:var(--bg1);box-shadow:inset 6px 0 0 #e5e5e5} /* the 6px stripe of the claim row continues down the expanded panel */
.mp-l{flex:1 1 0;min-width:0}.mp-r{flex:1 1 0;min-width:0;display:flex;flex-direction:column}
.mp-l h3{margin:0;font-size:13px;font-weight:500;color:var(--fg1);line-height:21px}
.mp-l p{margin:0;color:var(--fg2);line-height:21px;text-wrap:pretty}
.xlink{color:var(--fg-accent);cursor:pointer;text-decoration:underline;text-underline-offset:2px}.xlink svg{display:inline-block;margin-left:2px;vertical-align:-1px}.nw{white-space:nowrap}
.b-strong{font-weight:500;color:var(--fg1)}
.st{position:relative;display:grid;grid-template-columns:20px minmax(0,1fr);gap:8px;padding-bottom:16px}
.st:last-child{padding-bottom:0}
.st:not(:last-child)::before{content:"";position:absolute;left:9.5px;top:26px;bottom:0;width:1px;background:var(--bs)}
.st-emb{display:grid;place-items:start center;padding-top:2px}
.st-t{font-weight:500;color:var(--fg1);line-height:21px;margin-bottom:2px}
.st-card{background:var(--tonal);border:1px solid var(--bs);border-radius:8px;padding:8px 12px 12px;box-shadow:0 2px 4px rgba(0,0,0,.08)}
.st-card p{margin:0;color:#1a1a1a;line-height:21px}
.st-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:8px;flex-wrap:wrap}
.st-chg{display:flex;align-items:center;gap:4px;flex-wrap:wrap;min-width:0;font-size:11px;font-weight:500;color:#1a1a1a;padding-bottom:4px}
.st-chip{display:inline-flex;align-items:center;min-height:20px;padding:0 8px;border-radius:8px;background:rgba(89,89,89,.1);color:var(--fg1);font-size:11px;font-weight:400;border:0;line-height:18px}.st-chip s{color:var(--fg2);margin:0 4px}
button.st-more{cursor:pointer}button.st-more:hover{background:var(--d10)}
.st-acts{display:flex;align-items:center;gap:8px;flex:none}
.vbtn{width:28px;height:28px;border:0;border-radius:var(--r-soft);background:transparent;color:var(--fg2);display:grid;place-items:center;padding:0}.vbtn:hover{background:var(--d5)}.vbtn.on{background:var(--accent-sub);color:var(--fg-accent)}.vbtn.note{color:var(--fg-accent)}
.st-sep{width:1px;height:28px;background:#e6e6e6;margin:0}
.st-card.slim{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;padding:8px 12px}
.st-slim{display:inline-flex;align-items:center;gap:6px;color:var(--fg1)}
.st-card.slim.done .st-slim svg{color:var(--success)}.st-ok{color:var(--success);font-weight:500}
.btn.off{background:var(--d10);border-color:transparent;color:var(--fg-dis);cursor:default}
.st-waiting .st-emb svg{opacity:.55}
@media (max-width:1100px){.mypanel{flex-direction:column}}


/* Inline Alert Notification, Intent=Success (Figma Claims, 10881:131379) */
.offer{position:fixed;right:30px;bottom:32px;z-index:70;width:400px;box-sizing:border-box;display:flex;align-items:flex-start;gap:12px;padding:6px 12px;background:linear-gradient(rgba(42,153,83,.1),rgba(42,153,83,.1)),#fff;border-left:4px solid var(--success);border-radius:4px;box-shadow:0 6px 16px rgba(0,0,0,.08);color:#1f1f1f;animation:offer-in .22s ease-out}
.offer-i{flex:none;margin-top:9px;display:grid;place-items:center}
.offer-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;padding-right:12px}
.offer-c{display:flex;flex-direction:column;gap:4px;padding:6px 0}
.offer h3{margin:0;font-size:15px;font-weight:500;line-height:24px;color:#1f1f1f}
.offer p{margin:0;font-size:13px;line-height:21px;color:#1f1f1f}
.offer-ck{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;font-size:13px;line-height:21px;color:#1f1f1f}
.offer-ck li{display:flex;align-items:center;gap:8px}.offer-ck svg{color:var(--success);flex:none}
.offer-pg{height:4px;border-radius:2px;background:rgba(42,153,83,.2);overflow:hidden}
.offer-pg i{display:block;height:100%;background:var(--success);border-radius:2px;transition:width .5s ease}
.offer-st{margin-top:-4px;font-size:12px;line-height:18px;color:#1f1f1f}
.offer-b{display:flex;align-items:center;gap:12px;padding-bottom:4px}
.offer-go{height:28px;padding:0 12px;border:0;border-radius:100px;background:var(--success);color:#fff;font-size:13px;font-weight:500;cursor:pointer}.offer-go:hover{background:var(--success-fg)}
.offer-no{height:28px;padding:0;border:0;background:transparent;color:var(--success-fg);font-size:13px;font-weight:500;cursor:pointer}.offer-no:hover{text-decoration:underline;text-underline-offset:2px}
.offer-x{margin-top:7px;color:#1f1f1f}
@keyframes offer-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.offer{animation:none}}


/* My Claims is clear */
.clearwrap{display:grid;place-items:center;background:radial-gradient(46% 42% at 50% 30%,rgba(42,153,83,.09),transparent 72%),radial-gradient(60% 55% at 50% 26%,rgba(64,91,242,.06),transparent 72%)}
.clear{display:flex;flex-direction:column;align-items:center;text-align:center;padding:40px 24px;width:min(640px,100%)}
.clr-art{position:relative;width:96px;height:96px;display:grid;place-items:center;margin-bottom:20px}
.clr-badge{position:relative;z-index:2;width:72px;height:72px;border-radius:50%;background:var(--success);color:#fff;display:grid;place-items:center;box-shadow:0 0 0 8px rgba(42,153,83,.14),0 8px 24px rgba(42,153,83,.28);animation:clr-pop .5s cubic-bezier(.2,1.4,.4,1) both}
.cf{position:absolute;left:50%;top:50%;margin:-6px 0 0 -3px;border-radius:2px;opacity:0;animation:clr-burst 1.7s cubic-bezier(.15,.7,.3,1) var(--d) both}
.cf.rd{border-radius:50%}.cf0{background:var(--em-green)}.cf1{background:var(--em-blue)}.cf2{background:var(--em-purple)}.cf3{background:var(--em-orange)}
@keyframes clr-burst{0%{opacity:0;transform:translate(0,0) rotate(0) scale(.4)}10%{opacity:1}70%{opacity:1}100%{opacity:0;transform:translate(var(--x),calc(var(--y) + 36px)) rotate(var(--r)) scale(1)}}
@keyframes clr-pop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.cf{display:none}.clr-badge{animation:none}}
.clear h2,.clr-sub,.clr-stats,.clr-chips,.clear>.btn{position:relative;z-index:3}
.clear h2{margin:0;font-size:24px;line-height:32px;font-weight:600;letter-spacing:-.01em;color:var(--fg1)}
.clr-sub{margin:8px 0 24px;max-width:420px;color:var(--fg2);line-height:21px}
.clr-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;width:100%}
.clr-stat{border:1px solid var(--bs);border-radius:var(--r-card);background:var(--base);padding:14px 16px;text-align:left}
.clr-stat span{color:var(--fg3)}.clr-stat b{display:block;margin-top:2px;font-size:22px;line-height:30px;font-weight:600;color:var(--fg1)}.clr-stat small{display:block;margin-top:2px;color:var(--fg3);font-size:12px}
.clr-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:16px 0 24px}
.clr-chip{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:var(--r-full);background:var(--d5);color:var(--fg2);font-size:12px}.clr-chip b{font-weight:600;color:var(--fg1)}


/* UI pass: group header hierarchy, group boundaries, panel spacing, action focus, quiet controls, error state, keyboard */
.gline{margin-left:4px}.gline b{font-weight:500;color:var(--fg1)}
.mytbl tr.clgrp td{position:sticky;top:28px;z-index:2}
.mytbl tr.clgrp td.asg-c{z-index:3}
.mytbl .grpgap td{height:10px;padding:0;background:var(--base);border-bottom:0}
.mytbl td.stripe{box-shadow:inset 6px 0 0 var(--accent)}
.mytbl .exp .ibtn{scroll-margin-top:84px}
.mp-l{max-width:75ch}.mp-r{max-width:760px}
.mp-l h3{margin:0;color:#454545}.mp-l h3 + p{margin-top:2px}.mp-l p + h3{margin-top:16px}
.mp-l p{color:#5c5c5c}
.mypanel{box-shadow:inset 6px 0 0 var(--accent)}
.mypanel:focus-visible{outline-offset:-3px}
.st-t{font-size:14px;font-weight:600}
.st-active .st-card{border-color:rgba(17,50,238,.35);box-shadow:0 2px 8px rgba(17,50,238,.14)}
.st-card.slim{box-shadow:none}
.st-active .btn.primary{height:32px;padding:0 20px;font-size:14px}
.st-active .vbtn{opacity:.5;transition:opacity .12s}
.st-active .st-card:hover .vbtn,.st-active .st-card:focus-within .vbtn,.st-active .vbtn.on{opacity:1}
.vbtn.note{color:var(--fg2)}.vbtn.note:hover{color:var(--fg-accent)}
.st-chg{font-size:12px}.st-chip{font-size:12px;min-height:22px;line-height:20px}
.st-chip.st-more{background:transparent;box-shadow:inset 0 0 0 1px var(--bst);gap:2px;padding:0 6px 0 8px}.st-chip.st-more svg{transition:transform .12s}.st-chip.st-more svg.up{transform:rotate(180deg)}
.empty.err{color:var(--fg2)}.empty.err .err-ic{width:40px;height:40px;border-radius:50%;background:var(--danger-sub);color:var(--danger);display:grid;place-items:center}
.skip{position:absolute;left:12px;top:-48px;z-index:30;height:32px;display:inline-flex;align-items:center;padding:0 12px;border-radius:var(--r-soft);background:var(--base);color:var(--fg-accent);box-shadow:0 0 0 2px var(--accent),0 4px 12px rgba(0,0,0,.12);text-decoration:none}
.skip:focus{top:8px}

.asgb{width:28px;height:28px;padding:0;border:0;border-radius:50%;background:transparent;display:inline-grid;place-items:center;color:var(--fg2)}
.asgb.empty{border:1px solid var(--bst);background:var(--base)}.asgb:hover{box-shadow:0 0 0 2px var(--accent-sub)}.asgb.empty:hover{background:var(--d5)}

/* checkbox (Figma: 16px, 1px border, 4px radius) */
.cb{appearance:none;-webkit-appearance:none;display:block;width:16px;height:16px;margin:0;border:1px solid var(--fg3);border-radius:var(--r-semi);background:var(--base);position:relative;vertical-align:middle;cursor:pointer;flex:none}
.cb:disabled{opacity:.4;cursor:default}
.cb:checked,.cb:indeterminate{background:var(--accent);border-color:var(--accent)}
.cb:checked::after{content:"";position:absolute;left:4px;top:1px;width:4px;height:8px;border:solid var(--on-accent);border-width:0 2px 2px 0;transform:rotate(45deg)}
.cb:indeterminate::after{content:"";position:absolute;left:3px;top:6px;width:8px;height:2px;border-radius:1px;background:var(--on-accent)}

/* bulk actions bar (Figma: dark, 12px radius, 42px) */
.bulk{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);z-index:12;display:flex;align-items:center;gap:8px;height:42px;padding:4px 8px 4px 16px;background:var(--toast-bg);color:var(--toast-fg);border:1px solid var(--info-bd);border-radius:12px;box-shadow:0 6px 24px var(--pop-shadow)}
.bulk-tab{position:absolute;left:50%;top:-22px;transform:translateX(-50%);background:var(--toast-bg);color:var(--toast-fg);border-radius:var(--r-soft) var(--r-soft) 0 0;padding:0 12px;font-size:12px;line-height:22px;white-space:nowrap}
.bulk-n{font-weight:500;white-space:nowrap}
.bulk-sep{width:1px;height:20px;background:var(--bst)}
.bulk-btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:0;border-radius:var(--r-soft);background:rgba(255,255,255,.1);color:var(--toast-fg);font-weight:500;white-space:nowrap}
.bulk-btn:hover{background:rgba(255,255,255,.18)}
.bulk-x{width:30px;height:30px;border:0;border-radius:50%;background:transparent;color:var(--toast-fg);display:grid;place-items:center;padding:0}.bulk-x:hover{background:rgba(255,255,255,.12)}

/* assign popover */
.apo{position:fixed;z-index:60;width:280px;max-height:360px;display:flex;flex-direction:column;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);box-shadow:0 8px 24px var(--pop-shadow);overflow:hidden}
.apo-s{display:flex;align-items:center;gap:6px;margin:8px;padding:0 8px;height:28px;border-radius:var(--r-soft);background:var(--d5);color:var(--fg3)}
.apo-s:focus-within{outline:2px solid var(--accent)}.apo-s input{border:0;outline:none !important;flex:1;font:inherit;background:transparent;color:var(--fg1);min-width:0}
.apo-l{overflow:auto;padding:0 0 4px}
.apo-row{display:flex;align-items:center;gap:10px;height:40px;padding:0 12px;cursor:pointer}.apo-row:hover{background:var(--d5)}
.apo-n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--fg1)}
.apo-div{height:1px;background:var(--bs);margin:4px 0}
.apo-none{padding:16px;color:var(--fg3);text-align:center}

/* demo state switch (not part of the product) */
.demo{position:fixed;left:248px;bottom:16px;z-index:15;display:flex;align-items:center;gap:8px;background:var(--toast-bg);color:var(--toast-fg);border-radius:var(--r-full);padding:4px 6px 4px 12px;font-size:12px}
.demo select{height:24px;border:0;border-radius:var(--r-full);background:rgba(255,255,255,.12);color:var(--toast-fg);padding:0 8px;font:inherit}

/* agent pages */
.canvas:has(> .ag){overflow:auto}
.ag{width:100%;max-width:1240px;margin:0 auto;padding:40px 40px 64px}
.ag-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:32px}
.ag-title{font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.015em;margin:0 0 6px}
.ag-meta{display:flex;align-items:center;color:var(--fg3)}.dot-sep{width:3px;height:3px;border-radius:50%;background:var(--fg3);margin:0 8px}
.ag-right{display:flex;align-items:center;gap:6px;color:var(--fg2);height:28px}
.ag-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:32px;align-items:start}
.ag-comp{border:1px solid var(--bst);border-radius:var(--r-card);padding:12px 12px 8px 16px;background:var(--base)}
.ag-comp:focus-within{border-color:var(--accent)}
.ag-comp textarea{width:100%;border:0;outline:0;resize:none;font:inherit;font-size:15px;color:var(--fg1);background:transparent;padding:4px 0}
.ag-comp textarea::placeholder{color:var(--fg3)}
.ag-comp-b{display:flex;align-items:center;margin-top:4px}
.send{width:32px;height:32px;border:0;border-radius:var(--r-soft);background:var(--accent);color:var(--on-accent);display:grid;place-items:center;padding:0}.send:hover:not(:disabled){background:var(--accent-h)}.send:disabled{background:var(--d10);color:var(--fg-dis);cursor:default}
.ag-tabs{display:flex;gap:8px;margin:0 0 12px}
.ag-list{list-style:none;margin:0;padding:0}
.ag-list li{display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid var(--bs);color:var(--fg1)}
.ag-empty{display:flex;flex-direction:column;gap:4px;padding:40px 0;color:var(--fg3)}.ag-empty b{color:var(--fg1);font-weight:500}
.ag-side{border:1px solid var(--bs);border-radius:var(--r-card);background:var(--base)}
.ag-sec{padding:16px 20px;border-top:1px solid var(--bs)}.ag-sec:first-child{border-top:0}
.ag-h{display:flex;align-items:center;justify-content:space-between;min-height:28px}
.ag-h h2{font-size:14px;font-weight:500;margin:0;color:var(--fg1)}
.ag-muted{color:var(--fg3);margin:4px 0 0}
.ag-clamp{margin:6px 0 0;color:var(--fg2);white-space:pre-line;display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden}
.ag-ta{width:100%;margin-top:8px;border:1px solid var(--bst);border-radius:var(--r-soft);padding:8px;font:inherit;color:var(--fg1);resize:vertical}.ag-ta:focus{outline:2px solid var(--accent);border-color:transparent}
.ag-btns{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}.ag-btns.left{justify-content:flex-start;margin-top:20px}
.ag-rule{margin:6px 0 0;color:var(--fg2)}
.ag-rule select{font:inherit;color:var(--fg-accent);font-weight:500;border:1px solid var(--bs);border-radius:var(--r-soft);background:var(--base);height:24px;padding:0 4px}
.ag-docs{list-style:none;margin:8px 0 0;padding:0}
.ag-docs li{display:flex;align-items:center;gap:8px;min-height:32px;color:var(--fg2)}.ag-docs li span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ag-docs .rm{opacity:0}.ag-docs li:hover .rm,.ag-docs .rm:focus-visible{opacity:1}
.ag-drop{margin-top:8px;background:var(--solid2);border-radius:var(--r-extra);padding:28px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;color:var(--fg3)}
.ag-add{display:flex;gap:8px;margin-top:8px}.ag-add input{flex:1;min-width:0;height:28px;border:1px solid var(--bst);border-radius:var(--r-soft);padding:0 8px;font:inherit}.ag-add input:focus{outline:2px solid var(--accent);border-color:transparent}
.sw{width:34px;height:20px;border-radius:10px;border:0;background:var(--bst);position:relative;padding:0;flex:none}
.sw span{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--base);transition:left .15s}
.sw.on{background:var(--accent)}.sw.on span{left:16px}
.ag-new{max-width:560px;padding-top:56px}
.ag-f{display:flex;flex-direction:column;gap:6px;margin-top:20px;font-weight:500}
.ag-f input,.ag-f textarea{font:inherit;font-weight:400;color:var(--fg1);border:1px solid var(--bst);border-radius:var(--r-soft);padding:8px 10px}
.ag-f input:focus,.ag-f textarea:focus{outline:2px solid var(--accent);border-color:transparent}
@media (max-width:1100px){.ag-grid{grid-template-columns:1fr}}

/* claim ids, work labels, filter on toggle */
.idlink{border:0;background:transparent;padding:0;color:var(--fg2);font:inherit;cursor:pointer}.idlink:hover{color:var(--fg-accent);text-decoration:underline;text-underline-offset:2px}
.stcell{display:inline-flex;align-items:center}
.wlink{border:0;background:transparent;padding:0;display:inline-flex;cursor:pointer;margin-left:8px}
.wtag{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 6px;border-radius:var(--r-semi);font-size:12px;font-weight:500;white-space:nowrap}
.wtag.working{background:var(--neutral-sub);color:var(--fg2)}.wtag.ready{background:var(--info-sub);color:var(--info)}
.tbtn{position:relative}.tdot{position:absolute;top:3px;right:3px;width:7px;height:7px;border-radius:50%;background:var(--accent)}
.nbadge{margin-left:auto;background:var(--accent);color:var(--on-accent);border-radius:10px;padding:0 6px;font-size:12px;line-height:18px;font-weight:500}

/* assignee filter */
.fwrap{position:relative;display:inline-flex}
.fpop{position:absolute;top:32px;left:0;z-index:30;min-width:200px;max-height:320px;overflow:auto;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);box-shadow:0 8px 24px var(--pop-shadow);padding:4px 0}
.fpop.fvals{width:280px}
.fpop-i{display:block;width:100%;text-align:left;border:0;background:transparent;padding:0 12px;height:32px}.fpop-i:hover:not(:disabled){background:var(--d5)}.fpop-i:disabled{color:var(--fg-dis);cursor:default}
.fpop-h{padding:4px 12px;color:var(--fg3)}
.fchip{display:inline-flex;align-items:center;height:28px;border-radius:var(--r-soft);background:var(--d5);padding:0 4px 0 8px;gap:6px}
.fchip-k{font-weight:500}
.fchip-b{display:inline-flex;align-items:center;gap:4px;border:0;background:transparent;color:var(--fg-accent);height:28px;padding:0}
.fchip-x{display:grid;place-items:center;width:20px;height:20px;border:0;border-radius:50%;background:transparent;padding:0;color:var(--fg2)}.fchip-x:hover{background:var(--d10)}

/* agent card popover */
.acard{width:280px;padding:12px;gap:10px;max-height:none}
.acard-h{display:flex;align-items:center;gap:10px}.acard-h b{display:block;color:var(--fg1)}.acard-h .muted{display:block}
.acard-b{display:flex;gap:8px;flex-wrap:wrap}

/* claim panel (Claims experience only) */
/* agents hub */
.hub{width:100%;box-sizing:border-box;max-width:1240px;margin:0 auto;padding:32px 40px 56px}
.hub-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.hub-top h1{font-size:20px;font-weight:600;margin:0}
.hub-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:24px}
.hub-stat{border:1px solid var(--bs);border-radius:var(--r-card);padding:16px 20px;display:flex;flex-direction:column}
.hub-ic{width:36px;height:36px;border-radius:50%;border:1px solid var(--bs);display:grid;place-items:center;margin-bottom:16px;color:var(--fg1);background:var(--base)}
.hub-sl{color:var(--fg3)}.hub-stat b{font-size:24px;font-weight:600;line-height:1.3;letter-spacing:-.01em}.hub-note{color:var(--fg3);font-size:12px;margin-top:2px}

/* hub: the selected card and the agent page under it */
.hc{cursor:pointer}.hc.hc-new{cursor:pointer}
.hc.sel{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.hc:not(.hc-new):hover{border-color:var(--bst)}.hc.sel:hover{border-color:var(--accent)}
.hub-hint{margin:24px 0 0;text-align:center;color:var(--fg3)}
.hub-detail{margin-top:48px}
.hub-detail .ag{max-width:none;padding:0 0 24px}

.hub-tabs{display:inline-flex;gap:4px;padding:4px;border:1px solid var(--bs);border-radius:var(--r-soft);background:var(--solid2);margin-bottom:16px}
.hub-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.hc{border:1px solid var(--bs);border-radius:var(--r-card);background:var(--base);overflow:hidden;display:flex;flex-direction:column;text-align:left}
.hc-h{display:flex;align-items:center;gap:12px;padding:16px 16px 12px}
.hc-ic{width:40px;height:40px;border-radius:50%;border:1px solid var(--bs);display:grid;place-items:center;flex:none}
.hc-t{flex:1;min-width:0;display:flex;flex-direction:column}.hc-t b{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hc-t span{color:var(--fg3);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hc-st{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--fg2);white-space:nowrap}.hc-st i{width:8px;height:8px;border-radius:50%;background:var(--bst)}
.hc-st.running i{background:var(--accent)}.hc-st.draft i{background:transparent;border:1.5px solid var(--fg3)}
.hc-b{margin:0 4px 4px;background:var(--solid2);border-radius:var(--r-extra);padding:12px;display:flex;flex-direction:column;gap:10px}
.hc-r{display:flex;justify-content:space-between;color:var(--fg2)}.hc-r b{font-weight:500;color:var(--fg1)}.hc-r b.acc{color:var(--fg-accent)}
.hc-f{display:flex;align-items:center;gap:8px;margin-top:4px}
.hc-new{border:1px dashed var(--bst);background:transparent;align-items:center;justify-content:center;gap:4px;min-height:236px;cursor:pointer;color:var(--fg1)}.hc-new:hover{background:var(--d5)}.hc-new .hub-ic{margin-bottom:8px}.hc-new b{font-weight:500}
.ag-pill.paused{background:var(--neutral-sub);color:var(--fg2)}
@media (max-width:1200px){.hub-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.hub-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}


/* hub (Figma reference): six stats, status tabs, Yours and Discover, expandable agent rows */
.hub-stats{grid-template-columns:repeat(3,minmax(0,1fr))}
.hub-top h1{font-size:24px;font-weight:600}
.hub-h2{margin:32px 0 12px;font-size:16px;font-weight:600}
.hub-bar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:8px}
.hub-ftabs{display:flex;align-items:center;gap:4px}
.seg{display:inline-flex;padding:2px;border-radius:8px;background:var(--solid2);border:1px solid var(--bs)}
.seg button{height:28px;padding:0 14px;border:0;border-radius:6px;background:transparent;color:var(--fg2)}
.seg button.on{background:var(--base);color:var(--fg-accent);box-shadow:0 0 0 1px var(--bs)}
.hx-list{display:flex;flex-direction:column}
.hx-item{border-bottom:1px solid var(--bs)}.hx-item:last-child{border-bottom:0}
.hx-row{display:flex;align-items:center;gap:16px;padding:16px 0}
.hx-main{flex:1;min-width:0;display:flex;align-items:center;gap:16px;border:0;background:transparent;text-align:left;padding:0;border-radius:var(--r-soft);cursor:pointer}
.hx-main.static{cursor:default}
.hx-main:not(.static):hover .hx-txt b{color:var(--fg-accent)}
.hx-tile{width:44px;height:44px;border-radius:var(--r-soft);border:1px solid var(--bs);background:var(--bg1);display:grid;place-items:center;flex:none}
.hx-txt{min-width:0;display:flex;flex-direction:column;gap:2px}.hx-txt b{font-weight:500;color:var(--fg1)}.hx-txt span{color:var(--fg2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hc-st.waiting i{background:var(--success)}

/* hub rows: tile, badge and dot, metrics (your screenshot) */
/* agent rows in Home: the whole row is the hover and click target */
.hx-row.hx-int{margin:0 -12px;padding:16px 12px;border-radius:12px;cursor:pointer;transition:background .12s}
.hx-row.hx-int:hover{background:var(--d5)}
.hx-row.hx-int .hx-main:hover .hx-txt b{color:var(--fg1)}
.hx-row.hx-int .hx-main:focus-visible{outline:none}
.hx-row.hx-int:has(.hx-main:focus-visible){background:var(--bg1);box-shadow:0 0 0 2px var(--accent)}
.hx-item.open .hx-row.hx-int{background:var(--bg1)}
.hx-tile{position:relative;width:48px;height:48px;border-radius:12px;color:var(--fg1)}
.hx-name{font-size:15px;font-weight:500;color:var(--fg1)}
.hx-txt .hx-m{display:flex;flex-wrap:wrap;column-gap:24px;row-gap:0;white-space:normal;overflow:visible}
.hx-m i{font-style:normal;color:var(--fg3)}.hx-m b{font-weight:500;color:var(--fg1)}
.hx-desc{color:var(--fg2)}


/* Agents menu: Home, Skills, Documents, Chats (Claude style recent chats) */
.canvas:has(> .hub){overflow:auto}
.pg-sub{margin:-8px 0 20px;color:var(--fg2)}
.pg-by{color:var(--fg3);white-space:nowrap;max-width:320px;overflow:hidden;text-overflow:ellipsis}
.chats-row{padding:0}.chats-row .chats-main{flex:1;min-width:0;display:flex;align-items:center;gap:6px;height:100%;padding:0 0 0 8px;border:0;background:transparent;color:inherit;font:inherit;font-weight:inherit;text-align:left}
.chats-row .chats-main span{overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}
.chats-btn{width:24px;height:24px;flex:none;display:grid;place-items:center;border:0;border-radius:6px;background:transparent;color:var(--fg2);padding:0}
.chats-btn:hover{background:var(--d10);color:var(--fg1)}.chats-btn.plus{opacity:0}.chats-row:hover .chats-btn.plus,.chats-row:focus-within .chats-btn.plus{opacity:1}
.chats-btn svg{transition:transform .12s}.chats-btn svg.rot{transform:rotate(-90deg)}
.chats-list{display:flex;flex-direction:column;gap:1px;margin:2px 0 4px 15px;padding-left:8px;border-left:1px solid var(--d10)}
.chat-i{display:block;width:100%;height:28px;padding:0 8px;border:0;border-radius:var(--r-soft);background:transparent;color:var(--fg2);text-align:left;font:inherit;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chat-i:hover{background:var(--d5);color:var(--fg1)}.chat-i.on{background:var(--accent-sub);color:var(--fg-accent);font-weight:500}
.chatpg{flex:1;min-height:0;width:100%;max-width:760px;margin:0 auto;padding:24px 24px 16px;box-sizing:border-box;display:flex;flex-direction:column}
.chat-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--bs)}
.chat-h h1{margin:0;font-size:18px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chat-who{flex:none;padding:2px 10px;border-radius:var(--r-full);background:var(--d5);color:var(--fg2);font-size:12px}
.cmsgs{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:12px;padding:16px 0}
.cmsg{display:flex;gap:8px;max-width:85%}.cmsg p{margin:0;padding:8px 12px;border-radius:12px;line-height:21px}
.cmsg.you{align-self:flex-end}.cmsg.you p{background:var(--accent-sub);color:var(--fg1)}
.cmsg.agent p{background:var(--bg1);border:1px solid var(--bs);color:var(--fg1)}
.cmsg-av{flex:none;width:28px;height:28px;border-radius:50%;border:1px solid var(--bs);display:grid;place-items:center;margin-top:2px}
.cmp{display:flex;align-items:flex-end;gap:8px;padding:8px;border:1px solid var(--bst);border-radius:12px;background:var(--base)}
.cmp textarea{flex:1;min-width:0;border:0;outline:0;resize:none;font:inherit;color:var(--fg1);padding:6px 4px;max-height:140px;background:transparent}


/* Skills page: Design System 3.0 worklist template (Solid Tab Menu, Icon Button, Button, Search Field, Data Table, Pagination) */
.xm{position:relative}
.xm-pop{position:absolute;top:calc(100% + 4px);z-index:40;min-width:200px;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);box-shadow:0 8px 24px var(--pop-shadow);padding:4px 0}
.xm-pop.right{right:0}.xm-pop.left{left:0}
.xm-sec{display:flex;flex-direction:column}.xm-sec>b{padding:4px 12px;font-weight:400;color:var(--fg3);font-size:12px}
.xm-it{display:flex;align-items:center;gap:8px;height:32px;padding:0 12px;border:0;background:transparent;color:var(--fg1);text-align:left;white-space:nowrap}.xm-it:hover{background:var(--d5)}.xm-it.on{font-weight:500}
.xm-ck{display:flex;align-items:center;gap:8px;height:32px;padding:0 12px;color:var(--fg1);cursor:pointer}.xm-ck:hover{background:var(--d5)}
.xm-sec .link{align-self:flex-start;margin:4px 12px}
.ds-search{display:inline-flex;align-items:center;gap:8px;width:180px;height:28px;padding:0 8px;border-radius:6px;background:var(--d5);color:var(--fg1)}
.ds-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;color:var(--fg1);padding:0}.ds-search input::placeholder{color:var(--fg3)}
.ds-search svg{flex:none;color:var(--fg1)}.ds-search:focus-within{box-shadow:0 0 0 2px var(--accent)}
.ds-select{position:relative;display:inline-flex;width:80px;height:28px}.ds-select.wide{width:100%}
.ds-select select{appearance:none;-webkit-appearance:none;width:100%;height:28px;padding:0 28px 0 8px;border:0;border-radius:6px;background:var(--d5);font:inherit;color:var(--fg1)}
.ds-select svg{position:absolute;right:8px;top:6px;pointer-events:none;color:var(--fg2)}
.ds-pg{display:flex;align-items:center;justify-content:space-between;gap:24px;height:44px;padding:8px 16px;flex:none;color:var(--fg3)}
.ds-pg-l{display:flex;align-items:center;gap:12px}.ds-pg-r{display:flex;align-items:center;gap:20px}
.ds-pgs{display:flex;align-items:center;gap:6px}.ds-pgs .ibtn:disabled{opacity:.4;cursor:default}
.ds-pgb{width:28px;height:28px;padding:0;border:0;border-radius:var(--r-full);background:transparent;color:var(--fg-accent)}.ds-pgb.on{background:var(--accent-sub)}.ds-pgb:hover:not(.on){background:var(--d5)}
.ext-tbl td.ext-n{color:var(--fg1)}
.ext-tbl td.ext-d{max-width:380px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ext-tbl td.ext-act,.ext-tbl th.ext-act-h{position:sticky;right:0;z-index:2;width:76px;min-width:76px;padding:0 8px;text-align:center;box-shadow:-6px 0 8px -6px var(--shadow-sticky)}
.ext-tbl th.ext-act-h{z-index:4;border-right:0}
.ext-tbl tr.clgrp td{padding:0 8px}.ext-tbl .clgin{left:8px;gap:10px}.ext-tbl .clgin b{font-weight:500;color:var(--fg1)}
.ext-st{display:inline-flex;align-items:center;gap:6px}.ext-st i{width:8px;height:8px;border-radius:50%;background:var(--success)}
.dlg.form{width:480px}.dlg.form h2{margin:0 0 12px}
.fld{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}.fld label{font-weight:500;color:var(--fg1)}.fld i{font-style:normal;color:var(--fg3);font-size:12px}.fld i.bad{color:var(--danger)}
.fld .ag-ta{margin-top:0}
.sk-all{display:flex;align-items:center;gap:8px;margin:0;color:var(--fg2)}.sk-all svg{color:var(--fg-accent)}

/* agent builder: one centered column (hello, a large text box, the instructions below it) */
.bx{flex:1;min-height:0;overflow:auto;display:flex;padding:40px 24px;position:relative;background:var(--base)}
.bx-back{position:absolute;left:16px;top:16px}
.bx-in{width:min(720px,100%);margin:auto;display:flex;flex-direction:column;gap:16px}
.bx-hero{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;margin-bottom:8px}
.bx-hero h1{margin:0;font-size:32px;line-height:40px;font-weight:600;letter-spacing:-.01em;color:var(--fg1)}
.bx-hero p{margin:0;font-size:16px;color:var(--fg2)}
.bx-tile{display:grid;place-items:center;width:72px;height:72px;border-radius:50%;background:var(--base);border:1px solid var(--bs);box-shadow:0 4px 16px rgba(17,50,238,.08)}
.bx-in.started .bx-tile{width:48px;height:48px}.bx-in.started .bx-hero{gap:8px;margin-bottom:0}.bx-in.started .bx-hero h1{font-size:24px;line-height:32px}
.bx-comp{border:1px solid var(--bst);border-radius:16px;background:var(--base);box-shadow:0 2px 12px rgba(0,0,0,.06);padding:14px 16px 10px}
.bx-comp:focus-within{border-color:var(--accent);box-shadow:0 2px 12px rgba(17,50,238,.12)}
.bx-comp textarea{display:block;width:100%;border:0;outline:0;resize:none;background:transparent;font:inherit;font-size:16px;line-height:24px;color:var(--fg1);padding:0;max-height:160px}
.bx-comp textarea::placeholder{color:var(--fg3)}
.bx-comp textarea:focus-visible{outline:none}
.bx-tools{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px}
.bx-hint{color:var(--fg3);font-size:12px}
.bx-tools .send{width:32px;height:32px;border-radius:50%;border:0;background:var(--accent);color:#fff;display:grid;place-items:center;padding:0}.bx-tools .send:disabled{background:var(--d10);color:var(--fg-dis)}
.bx-starters{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.bx-st{display:flex;align-items:center;gap:10px;min-height:48px;padding:8px 14px;border:1px solid var(--bs);border-radius:12px;background:var(--base);color:var(--fg1);text-align:left}.bx-st:hover{background:var(--bg1);border-color:var(--bst)}
.bx-sti{width:28px;height:28px;flex:none;border-radius:8px;background:var(--d5);display:grid;place-items:center;color:var(--fg2)}
.bx-thread{display:flex;flex-direction:column;gap:8px}
.bx-m{display:flex;align-items:flex-start;gap:8px;line-height:21px}
.bx-m.you{align-self:flex-end;max-width:85%;padding:6px 12px;border-radius:12px;background:var(--accent-sub);color:var(--fg1)}
.bx-m.bot{color:var(--fg1)}.bx-m.bot svg{flex:none;margin-top:1px}
.bx-chips{display:flex;flex-wrap:wrap;gap:8px}
.bx-chip{height:28px;padding:0 12px;border:1px solid var(--bs);border-radius:var(--r-full);background:var(--base);color:var(--fg1)}.bx-chip:hover{background:var(--d5)}
.bx-card{border:1px solid var(--bs);border-radius:16px;background:var(--base);box-shadow:0 1px 3px rgba(0,0,0,.04);animation:bx-in .25s ease-out}
.bx-sec{padding:16px 20px;border-bottom:1px solid var(--bs)}.bx-sec:last-child{border-bottom:0}
.bx-sh{display:flex;align-items:center;gap:10px;margin-bottom:10px}.bx-sh h2{margin:0;font-size:14px;font-weight:500;color:var(--fg1)}
.bx-pill{padding:2px 10px;border-radius:var(--r-soft);background:var(--d5);color:var(--fg2);font-size:12px}
.bx-skel{display:flex;flex-direction:column;gap:10px}.bx-skel i{display:block;height:12px;border-radius:6px;background:var(--d5);animation:bx-pulse 1.2s ease-in-out infinite}

/* agent setup cards (icon tile, title, description), expand to edit */
.bx-cards{display:flex;flex-direction:column;gap:12px}
.bx-c{border:1px solid var(--bs);border-radius:16px;background:var(--base)}
.bx-ch{display:flex;align-items:center;gap:16px;width:100%;padding:16px 20px;border:0;background:transparent;text-align:left;border-radius:16px;cursor:pointer}
.bx-ch:hover .bx-ct b{color:var(--fg-accent)}
.bx-ci{width:36px;height:36px;flex:none;border-radius:10px;background:var(--d5);display:grid;place-items:center;color:var(--fg1)}
.bx-ct{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.bx-ct b{font-size:15px;font-weight:500;color:var(--fg1)}.bx-ct span{color:var(--fg2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bx-cv{flex:none;color:var(--fg3);transition:transform .12s}.bx-cv.up{transform:rotate(180deg)}
.bx-cb{padding:0 20px 18px 72px}
.bx-empty{margin:0;color:var(--fg3)}
.bx-form{display:flex;flex-direction:column;gap:12px}
.bx-form select{height:36px;max-width:320px;padding:0 10px;border:1px solid var(--bst);border-radius:var(--r-soft);background:var(--base);font:inherit;color:var(--fg1)}
.bx-ck{display:flex;align-items:center;gap:8px;color:var(--fg1)}
.bx-row{display:flex;gap:20px;flex-wrap:wrap}
.bx-opts{display:flex;flex-direction:column;gap:8px}.bx-opt{display:flex;align-items:center;gap:8px;color:var(--fg1)}
.bx-lv{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:1px solid var(--bs);border-radius:12px;cursor:pointer}.bx-lv.on{border-color:var(--accent);background:var(--accent-sub)}
.bx-lv span{display:flex;flex-direction:column;gap:2px}.bx-lv b{font-weight:500;color:var(--fg1)}.bx-lv i{font-style:normal;color:var(--fg2)}.bx-lv input{margin-top:3px}
.bx-perms{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.bx-perms li{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--bs)}.bx-perms li:last-child{border-bottom:0}
.bx-perms li>span:first-child{flex:1;color:var(--fg1)}.bx-pn{color:var(--fg3);font-size:12px}
.bx-starters{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.bx-st{min-height:36px;padding:4px 14px 4px 6px;border-radius:var(--r-full)}
.bx-sti{width:26px;height:26px;border-radius:50%}


/* agent builder, version 2: a calm start, then a title, Instructions, a settings grid and a pinned footer */
.bx{background:var(--bg1)}
.bx-in{gap:16px}
.bx-title{display:flex;align-items:center;gap:12px;margin-bottom:4px}
.bx-tile.sm{width:44px;height:44px;flex:none;box-shadow:none}
.bx-name{flex:1;min-width:0;height:44px;padding:0 4px;border:0;border-bottom:2px solid transparent;border-radius:0;outline:0;background:transparent;font:inherit;font-size:24px;font-weight:600;letter-spacing:-.01em;color:var(--fg1)}
.bx-name:hover{border-bottom-color:var(--bs)}.bx-name:focus{border-bottom-color:var(--accent)}.bx-name::placeholder{color:var(--fg3);font-weight:400}
.bx-skel.one{flex:1}.bx-skel.one i{height:20px;width:46%}
.bx-ins{background:var(--base);border:1px solid var(--bs);border-radius:16px;padding:16px 20px 20px;box-shadow:0 1px 3px rgba(0,0,0,.04);animation:bx-in .25s ease-out}
.bx-sh{display:flex;align-items:center;gap:12px;margin-bottom:12px}.bx-sh h2{margin:0;font-size:15px;font-weight:500;color:var(--fg1)}.bx-sh p{margin:0;color:var(--fg2)}
.bx-ins .ag-ta{width:100%;box-sizing:border-box}
.bx-h2{margin:8px 0 10px;font-size:15px;font-weight:500;color:var(--fg1)}
.bx-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.bx-tl{display:flex;align-items:center;gap:12px;min-height:64px;padding:10px 14px;border:1px solid var(--bs);border-radius:14px;background:var(--base);text-align:left;cursor:pointer}
.bx-tl:hover:not(:disabled){border-color:var(--bst)}.bx-tl.on{border-color:var(--accent);background:var(--accent-sub)}.bx-tl:disabled{cursor:default}
.bx-ci{width:36px;height:36px;flex:none;border-radius:10px;background:var(--d5);display:grid;place-items:center;color:var(--fg1)}.bx-tl.on .bx-ci{background:var(--base);color:var(--fg-accent)}
.bx-ct{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.bx-ct b{font-weight:500;color:var(--fg1)}.bx-ct span{color:var(--fg2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bx-ct .bx-skel{gap:0}.bx-ct .bx-skel i{height:10px;width:70%}
.bx-cv{flex:none;color:var(--fg3);transition:transform .12s}.bx-cv.up{transform:rotate(180deg)}
.bx-ed{margin-top:10px;background:var(--base);border:1px solid var(--bs);border-radius:16px;padding:16px 20px 20px;box-shadow:0 1px 3px rgba(0,0,0,.04);animation:bx-in .2s ease-out}
.bx-eh{display:flex;align-items:center;gap:12px;margin-bottom:14px}.bx-eh b{flex:1;font-size:15px;font-weight:500;color:var(--fg1)}
.bx-foot{position:sticky;bottom:0;display:flex;align-items:center;gap:8px;padding:12px 16px;margin-top:4px;border:1px solid var(--bs);border-radius:16px;background:var(--base);box-shadow:0 -4px 16px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04);z-index:5}

/* builder: the empty state is the same layout as the draft */
.bx-in .bx-starters{justify-content:flex-start;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.bx-in .bx-starters::-webkit-scrollbar{display:none}
.bx-in .bx-st{flex:none;white-space:nowrap;gap:8px;min-height:34px;padding:3px 12px 3px 4px}
.bx-in .bx-sti{width:24px;height:24px}
.bx-in .bx-starters{gap:6px}
.bx-foot .btn.primary:disabled{background:var(--d10);border-color:transparent;color:var(--fg-dis);cursor:default;opacity:1}
.bx-name:placeholder-shown{border-bottom-color:var(--bs)}
.bx-ins .ag-ta::placeholder{color:var(--fg3)}


/* builder: a header bar with Create agent, a Name box like Instructions */
.bx{padding:0;flex-direction:column}
.bx-bar{position:sticky;top:0;z-index:6;flex:none;display:flex;align-items:center;gap:10px;height:56px;padding:0 16px;background:var(--base);border-bottom:1px solid var(--bs)}
.bx-bar .bx-tile{width:32px;height:32px;box-shadow:none}
.bx-bt{margin:0;font-size:16px;font-weight:600;color:var(--fg1)}
.bx-bar .bx-fmsg{flex:none;margin-right:4px}
.bx-body{flex:1;display:flex;padding:32px 24px 56px}
.bx-body .bx-in{margin:0 auto}
.bx-ins .bld-f{width:100%;box-sizing:border-box}
@media (max-width:900px){.bx-bar .bx-fmsg{display:none}}


/* builder: one Instructions box with the AI draft and the templates inside */
.bx-sh .bx-draft{margin-left:auto;flex:none;display:inline-flex;align-items:center;gap:6px;align-self:flex-start}
.bx-nt{display:flex;align-items:flex-start;gap:8px;margin-top:12px;padding:10px 12px;border-radius:12px;background:var(--bg1);color:var(--fg1);line-height:21px}.bx-nt svg{flex:none;margin-top:1px}.bx-nt span{flex:1}
.bx-tpl{display:flex;flex-direction:column;gap:8px;margin-top:14px}
.bx-tl-l{font-size:12px;color:var(--fg3)}
.bx-ins .bx-starters{gap:4px}
.bx-ins .bx-st{padding:3px 10px 3px 4px;gap:6px;min-height:34px}.bx-ins .bx-sti{width:22px;height:22px}
.bx-ins .bx-st:disabled,.bx-ins .bx-chip:disabled{opacity:.5;cursor:default}


/* builder: the name is inferred and lives in the header as an editable title */
.bx-nm{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 8px;border-radius:8px;cursor:text;color:var(--fg3);max-width:420px;min-width:0}
.bx-nm:hover{background:var(--d5)}.bx-nm:focus-within{background:var(--base);box-shadow:0 0 0 2px var(--accent)}
.bx-nm input{min-width:90px;max-width:340px;border:0;outline:0;background:transparent;font:inherit;font-size:16px;font-weight:600;color:var(--fg1);text-overflow:ellipsis}
.bx-nm input::placeholder{color:var(--fg3);font-weight:400}
.bx-nm.flash{animation:bx-flash 1.4s ease-out}
@keyframes bx-flash{from{background:var(--accent-sub)}to{background:transparent}}
@media (prefers-reduced-motion:reduce){.bx-nm.flash{animation:none}}


/* builder: settings as one column, the editor opens inside the card, right below its header */
.bx-list{display:flex;flex-direction:column;gap:10px}
.bx-sc{border:1px solid var(--bs);border-radius:14px;background:var(--base)}
.bx-sc.on{border-color:var(--accent)}
.bx-sc .bx-tl{width:100%;border:0;border-radius:14px;background:transparent;min-height:64px}
.bx-sc .bx-tl:hover{background:var(--bg1)}
.bx-sc.on .bx-ci{background:var(--accent-sub);color:var(--fg-accent)}
.bx-sc .bx-ed{margin:0;padding:2px 18px 18px 64px;border:0;border-radius:0;box-shadow:none;background:transparent;animation:bx-in .2s ease-out}


/* triggers (Claude style rows: icon, frequency pill, "at", time pill, trash) */
.tg{display:flex;flex-direction:column;gap:8px}
.tg-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px;min-height:52px;padding:8px 12px;border:1px solid var(--bs);border-radius:16px;background:var(--base)}
.tg-ic{width:20px;display:grid;place-items:center;color:var(--fg1);flex:none}
.tg-w{color:var(--fg3)}
.pm{position:relative}
.tg-pill{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:1px solid var(--bs);border-radius:10px;background:var(--base);font:inherit;color:var(--fg1);cursor:pointer}
.tg-pill:hover,.tg-pill.on{background:var(--d5)}
.pm-pop{position:absolute;top:calc(100% + 6px);left:0;z-index:30;min-width:200px;max-height:280px;overflow:auto;margin:0;padding:8px;list-style:none;border:1px solid var(--bs);border-radius:16px;background:var(--base);box-shadow:0 8px 24px var(--pop-shadow)}
.pm-pop button{display:block;width:100%;height:40px;padding:0 12px;border:0;border-radius:10px;background:transparent;text-align:left;font:inherit;font-size:15px;color:var(--fg1);white-space:nowrap}
.pm-pop button:hover{background:var(--d5)}.pm-pop button.on{font-weight:500}
.tp-pop{position:absolute;top:calc(100% + 6px);left:0;z-index:30;display:flex;align-items:center;gap:8px;padding:10px;border:1px solid var(--bs);border-radius:16px;background:var(--base);box-shadow:0 8px 24px var(--pop-shadow)}
.tp-in{width:56px;height:40px;text-align:center;border:1px solid transparent;border-radius:10px;background:var(--d5);font:inherit;font-size:18px;font-weight:500;color:var(--fg1)}
.tp-in:focus{outline:0;border-color:var(--accent);background:var(--base)}
.tg-side .tg-row{position:relative;padding:8px 44px 8px 10px;gap:6px}.tg-side .tg-row .grow{display:none}.tg-side .tg-row>.ibtn{position:absolute;top:10px;right:8px}.tg-side .pm-pop,.tg-side .tp-pop{left:auto;right:0}

/* templates, slash picker */
.tpl-meta{color:var(--fg3);font-size:12px}
.sl-wrap{position:relative}.sl-wrap .ag-ta{width:100%;box-sizing:border-box}
.sl-pop{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:40;margin:0;padding:6px;list-style:none;max-height:280px;overflow:auto;border:1px solid var(--bs);border-radius:14px;background:var(--base);box-shadow:0 8px 24px var(--pop-shadow)}
.sl-pop button{display:flex;flex-direction:column;align-items:flex-start;gap:1px;width:100%;padding:8px 10px;border:0;border-radius:10px;background:transparent;text-align:left;font:inherit;color:var(--fg1)}
.sl-pop button.on{background:var(--accent-sub)}.sl-pop b{font-weight:500}.sl-pop span{color:var(--fg2);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.sl-hint{margin-top:6px;color:var(--fg3);font-size:12px;display:flex;flex-wrap:wrap;align-items:center;gap:6px}.sl-hint kbd{padding:0 6px;border:1px solid var(--bst);border-radius:6px;background:var(--bg1);font:inherit;font-size:11px;color:var(--fg2)}
.sl-used{display:inline-flex;flex-wrap:wrap;align-items:center;gap:4px}.sl-used .ext-chip{height:20px;line-height:20px;font-size:11px}
.bx-browse{font-size:13px}


/* Add an agent modal */
.dlg.am{width:720px;max-width:calc(100vw - 32px);max-height:min(86vh,820px);padding:0;display:flex;flex-direction:column;overflow:hidden;outline:0}
.am-h{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px 20px 12px}.am-h h2{margin:0 0 4px;font-size:18px}.am-h p{margin:0;color:var(--fg2)}
.am-b{flex:1;min-height:0;overflow:auto;padding:0 20px}.am-b .hx-item:last-child{border-bottom:0}
.am-f{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;border-top:1px solid var(--bs);color:var(--fg2)}


/* catalog: chips, details, grouped templates */
.ext-sub{display:flex;align-items:center;gap:8px;margin:18px 0 2px;font-size:12px;font-weight:500;color:var(--fg3);text-transform:uppercase;letter-spacing:.04em}.ext-sub span{font-weight:400;letter-spacing:0}.ext-sec .hx-list .ext-sub:first-child{margin-top:4px}

/* skills structure: title, category chips, collapsible groups, legend */
.ext-title{margin:0 0 4px;font-size:24px;font-weight:600;letter-spacing:-.01em;color:var(--fg1)}
.ext-lead{margin:0 0 20px;color:var(--fg2)}
.ext-top{margin-bottom:16px}
.ext-top .seg{height:28px;padding:2px;border:0;background:rgba(0,0,0,.05);border-radius:8px;box-sizing:border-box}
.ext-top .seg button{height:24px;padding:0 12px;font-size:13px;border-radius:6px}.ext-top .seg button.on{box-shadow:0 1px 2px rgba(0,0,0,.1)}
.ext-top .ds-search{width:240px}
.ext-cats{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin:0 0 20px}
.ext-chips{display:flex;flex-wrap:wrap;gap:6px;min-width:0}
.ext-cat{height:30px;padding:0 12px;border:1px solid var(--bs);border-radius:var(--r-full);background:var(--base);color:var(--fg1);font:inherit;display:inline-flex;align-items:center;gap:6px;cursor:pointer}
.ext-cat span{color:var(--fg3);font-size:12px}.ext-cat:hover{background:var(--d5)}
.ext-cat.on{background:var(--accent-sub);border-color:transparent;color:var(--fg-accent);font-weight:500}.ext-cat.on span{color:var(--fg-accent)}
.ext-tools{display:flex;gap:16px;flex:none;padding-top:5px}
.ext-legend{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin:-6px 0 20px;padding:14px 16px;border:1px solid var(--bs);border-radius:14px;background:var(--bg1)}
.ext-legend b{font-weight:500;color:var(--fg1)}.ext-legend p{margin:4px 0 0;color:var(--fg2);font-size:12px;line-height:18px}.ext-legend i{font-style:normal;font-weight:500;color:var(--fg1);margin-right:4px}
.ext-gh{display:flex;align-items:center;gap:8px;width:100%;margin:12px 0 0;padding:8px 0;border:0;border-bottom:1px solid var(--bs);background:transparent;color:var(--fg2);font:inherit;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.04em;text-align:left;cursor:pointer}
.ext-gh:hover{color:var(--fg1)}.ext-gh svg{color:var(--fg3);transition:transform .12s}.ext-gh.shut svg{transform:rotate(-90deg)}
.ext-gh .n{color:var(--fg3);text-transform:none;letter-spacing:0;font-weight:400}
.ext-sec .hx-list .ext-gh:first-child{margin-top:4px}
@media (max-width:900px){.ext-cats{flex-direction:column}.ext-legend{grid-template-columns:1fr}}



/* the agent's thread */
.cmsg-card{max-width:620px;padding:14px 16px;border:1px solid var(--bs);border-radius:14px;background:var(--base)}
.cmsg-t{margin:0 0 10px!important;padding:0!important;border:0!important;background:transparent!important;font-weight:500;color:var(--fg1)}
.cmsg-rows{margin:0;display:flex;flex-direction:column}.cmsg-rows div{display:grid;grid-template-columns:96px minmax(0,1fr);gap:12px;padding:7px 0;border-top:1px solid var(--bs)}.cmsg-rows dt{color:var(--fg3)}.cmsg-rows dd{margin:0;color:var(--fg1)}
.cmsg-x{margin:10px 0 0!important;padding:0!important;border:0!important;background:transparent!important;color:var(--fg2)}
.cmsg-acts{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.cmsg.agent .cmsg-card p{border:0}
.ag-thread{display:flex;flex-direction:column;gap:12px}.ag-thread .cmsgs{overflow:visible;padding:4px 0;flex:none}.ag-thread .cmp{position:sticky;bottom:12px;box-shadow:0 4px 16px rgba(0,0,0,.06)}

.dlg.sd{width:560px}
.sd-l{margin:0;padding:0 20px 20px;overflow:auto}.sd-l div{display:grid;grid-template-columns:150px minmax(0,1fr);gap:12px;padding:8px 0;border-top:1px solid var(--bs)}.sd-l dt{color:var(--fg3)}.sd-l dd{margin:0;color:var(--fg1)}
.am-b .ext-sec{margin-bottom:20px}.am-b .ext-sec h2{font-size:15px;margin-top:8px}

.tp-date{height:40px;padding:0 10px;border:1px solid var(--bst);border-radius:10px;font:inherit;color:var(--fg1)}
.tp-ap{display:inline-flex;padding:3px;border-radius:12px;background:var(--d5)}
.tp-ap button{height:34px;padding:0 14px;border:0;border-radius:9px;background:transparent;font:inherit;font-size:16px;color:var(--fg2)}
.tp-ap button.on{background:var(--base);color:var(--fg1);font-weight:500;box-shadow:0 1px 3px rgba(0,0,0,.12)}

.bx-fmsg{flex:1;min-width:0;color:var(--fg2)}
@media (max-width:760px){.bx-grid{grid-template-columns:1fr}}

.bx-note{margin:0;text-align:center;color:var(--fg3);font-size:12px}
@keyframes bx-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes bx-pulse{0%,100%{opacity:.5}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.bx-card{animation:none}.bx-skel i{animation:none}}
@media (max-width:760px){.bx-starters{grid-template-columns:1fr}}


.ag-skills li{display:flex;align-items:center;gap:8px}.ag-skills li span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sk-tag{flex:none;font-style:normal;padding:0 8px;height:20px;line-height:20px;border-radius:var(--r-full);background:var(--accent-sub);color:var(--fg-accent);font-size:11px}


/* Skills, connectors and plugins: list of sections and rows */
.ext{padding-top:20px}
.ext-top{padding:0;height:auto;min-height:28px;margin-bottom:24px;flex-wrap:wrap}
.ext-sec{margin-bottom:32px}.ext-sec h2{display:flex;align-items:center;gap:10px;margin:0 0 8px;font-size:16px;font-weight:500}
.cnt{min-width:24px;height:24px;padding:0 8px;border-radius:12px;background:var(--d5);color:var(--fg2);font-size:12px;font-weight:400;display:inline-grid;place-items:center}
.ext-nm{display:flex;align-items:center;gap:8px;overflow:visible}
.ext-chip{flex:none;padding:0 10px;height:22px;line-height:22px;border-radius:var(--r-full);background:var(--d5);color:var(--fg2);font-size:12px}
.ext-when,.ext-used{flex:none;color:var(--fg3);white-space:nowrap}.ext-when{min-width:56px;text-align:right}
.ext .hx-list .hx-item:first-child .hx-row{padding-top:8px}

.hx-panels{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;padding:0 0 20px 60px}
.hx-pn{background:var(--bg1);border-radius:var(--r-card);padding:16px;min-height:140px}
.hx-pn h3{margin:0 0 8px;font-size:13px;font-weight:500;color:var(--fg1)}
.hx-pn p{margin:0 0 8px;color:var(--fg2);line-height:21px}
.hx-ev,.hx-why{list-style:none;margin:0 0 8px;padding:0;display:flex;flex-direction:column;gap:8px}
.hx-ev li{display:flex;flex-direction:column;color:var(--fg1)}.hx-ev em{font-style:normal;color:var(--fg3);font-size:12px}
.hx-why li{display:flex;align-items:baseline;gap:8px;color:var(--fg2)}.hx-why b{min-width:24px;font-weight:600;color:var(--fg1)}
.hx-ft{grid-column:1 / -1;display:flex;gap:8px;justify-content:flex-end}
@media (max-width:900px){.hub-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.hx-panels{grid-template-columns:1fr;padding-left:0}}

/* agent builder */
.canvas:has(> .bld){overflow:hidden}
.bld{display:grid;grid-template-columns:minmax(0,1fr) 380px;height:100%;min-height:0}
.bld-main{display:flex;flex-direction:column;min-width:0;min-height:0}
.bld-scroll{flex:1;overflow:auto;padding:56px 40px 16px}
.bld-hero{max-width:820px;margin:0 auto;text-align:center;display:flex;flex-direction:column;align-items:center}
.bld-tile{width:88px;height:88px;border-radius:20px;border:1px solid var(--bst);display:grid;place-items:center;margin-bottom:20px;background:var(--base)}
.bld-hello{color:var(--fg3)}.bld-h{font-size:30px;font-weight:600;letter-spacing:-.015em;margin:4px 0 32px}
.bld-starters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;width:100%}
.bld-st{border:1px solid var(--bs);border-radius:var(--r-extra);background:var(--base);padding:16px;text-align:left;display:flex;flex-direction:column;gap:20px;min-height:128px;color:var(--fg1);font-weight:500}.bld-st:hover{background:var(--d5)}
.bld-sti{width:36px;height:36px;border-radius:var(--r-soft);display:grid;place-items:center;background:var(--solid2);color:var(--fg2)}
.bld-thread{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.bld-m{max-width:82%;padding:10px 14px;border-radius:var(--r-extra);display:flex;gap:10px;align-items:flex-start;line-height:1.5}.bld-m.you{align-self:flex-end;background:var(--accent-sub)}.bld-m.bot{align-self:flex-start;background:var(--solid2)}.bld-m.bot svg{margin-top:3px;flex:none}
.bld-foot{padding:8px 40px 20px;max-width:840px;width:100%;margin:0 auto}
.bld-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.bld-chip{height:28px;padding:0 12px;border:1px solid var(--bs);border-radius:var(--r-full);background:var(--base);color:var(--fg1)}.bld-chip:hover{background:var(--d5)}
.bld-in{display:flex;align-items:center;gap:8px;border:1px solid var(--bst);border-radius:var(--r-card);padding:8px 8px 8px 16px;background:var(--base)}.bld-in:focus-within{border-color:var(--accent)}
.bld-in input{flex:1;border:0;outline:0;font:inherit;font-size:15px;background:transparent;color:var(--fg1);min-width:0}
.bld-note{color:var(--fg3);font-size:12px;margin:8px 0 0}
.bld-side{border-left:1px solid var(--bs);display:flex;flex-direction:column;min-height:0;background:var(--base)}
.bld-sh{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--bs)}.bld-sh b{font-weight:500}
.bld-sc{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.bld-sf{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--bs)}
.tcard{border:1px solid var(--bs);border-radius:var(--r-extra);padding:14px}
.tcard-h{display:flex;gap:12px;align-items:flex-start}.tcard-i{width:36px;height:36px;border-radius:var(--r-soft);background:var(--solid2);display:grid;place-items:center;flex:none;color:var(--fg2)}
.tcard h3{margin:0;font-size:14px;font-weight:500}.tcard p{margin:2px 0 0;color:var(--fg3);font-size:12px}
.tcard-b{margin-top:12px}
.bld-f{width:100%;height:32px;border:1px solid var(--bst);border-radius:var(--r-soft);padding:0 10px;font:inherit}.bld-f:focus{outline:2px solid var(--accent);border-color:transparent}
.bld-rule{display:flex;align-items:center;justify-content:space-between;gap:12px}
.bld-rule select{flex:1;height:32px;border:1px solid var(--bst);border-radius:var(--r-soft);background:var(--base);font:inherit;padding:0 8px}
.sw:disabled{opacity:.4;cursor:default}
@media (max-width:1200px){.bld{grid-template-columns:1fr}.bld-side{display:none}.bld-starters{grid-template-columns:repeat(2,minmax(0,1fr))}}

.cpanel.fx{position:fixed;top:44px;right:8px;bottom:8px;width:440px;border:1px solid var(--bs);border-radius:var(--r-soft)}
.cp-done{display:flex;gap:8px;align-items:flex-start;margin:8px 0;color:var(--fg1)}.cp-done svg{color:var(--success);flex:none;margin-top:3px}
.tkrow{cursor:pointer}.tkrow.open td{background-image:linear-gradient(var(--accent-sub-h),var(--accent-sub-h))}
.cpanel{position:absolute;top:0;right:0;bottom:0;width:440px;max-width:100%;z-index:20;background:var(--base);border-left:1px solid var(--bs);box-shadow:-8px 0 24px var(--pop-shadow);display:flex;flex-direction:column}
.cp-h{display:flex;justify-content:space-between;align-items:flex-start;padding:16px 16px 12px 20px;border-bottom:1px solid var(--bs);flex:none}
.cp-h h2{margin:0 0 4px;font-size:16px;font-weight:600}.cp-sub{display:flex;align-items:center;gap:8px}
.cp-body{flex:1;min-height:0;overflow:auto;padding:16px 20px}
.cp-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px}
.cp-f span{display:block;color:var(--fg3);font-size:12px}.cp-f b{display:block;font-weight:400;color:var(--fg1)}.cp-own{display:flex !important;align-items:center;gap:6px}
.cp-sec{margin-top:20px;padding-top:16px;border-top:1px solid var(--bs);display:flex;flex-direction:column;gap:12px}
.cp-sech{display:flex;align-items:center;justify-content:space-between;gap:8px}.cp-sech h3{margin:0;font-size:14px;font-weight:600}
.outcome{font-weight:500;color:var(--fg2)}
.cp-find{margin:0;color:var(--fg1)}
.cp-prop{background:var(--solid2);border-radius:var(--r-soft);padding:10px 12px}.cp-prop p{margin:4px 0 0;color:var(--fg1)}.cp-proph span{font-size:12px;color:var(--fg3);font-weight:500}
.cp-src{display:flex;align-items:center;flex-wrap:wrap;gap:6px}
.cp-act{display:flex;gap:8px}
.cp-chat{flex:none;border-top:1px solid var(--bs);padding:12px 20px 16px;display:flex;flex-direction:column;gap:8px}
.cp-thread{max-height:150px;overflow:auto;display:flex;flex-direction:column;gap:6px}
.cp-m{max-width:85%;padding:6px 10px;border-radius:var(--r-extra);background:var(--d5)}.cp-m.you{align-self:flex-end;background:var(--accent-sub);color:var(--fg1)}
.cp-in{display:flex;gap:8px;align-items:center}.cp-in input{flex:1;min-width:0;height:32px;border:1px solid var(--bst);border-radius:var(--r-soft);padding:0 10px;font:inherit}.cp-in input:focus{outline:2px solid var(--accent);border-color:transparent}

/* dialog */
.dlg-back{position:fixed;inset:0;z-index:80;background:var(--scrim);display:grid;place-items:center}
.dlg{width:420px;max-width:calc(100vw - 32px);background:var(--base);border-radius:var(--r-card);padding:20px;box-shadow:0 16px 48px var(--pop-shadow)}
.dlg h2{margin:0 0 8px;font-size:16px;font-weight:600}.dlg-b p{margin:0 0 8px;color:var(--fg2)}.dlg-b ul{margin:0 0 8px;padding-left:18px;color:var(--fg1)}

/* agent page additions */
.ag-actions{display:flex;align-items:center;gap:12px}
.ag-pill{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:var(--r-full);background:var(--info-sub);color:var(--info);font-weight:500}
.ag-note{display:flex;align-items:center;gap:6px;margin:4px 0 12px;color:var(--fg2)}
.ag-act{list-style:none;margin:0;padding:0}
.ag-act li{display:grid;grid-template-columns:96px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid var(--bs);color:var(--fg1)}
.ag-t{color:var(--fg3)}.ag-sep:before{content:"";display:inline-block;width:3px;height:3px;border-radius:50%;background:var(--fg3);margin:0 8px;vertical-align:middle}
.tk{border:1px solid var(--bs);border-radius:var(--r-soft);overflow-x:auto}
.tk .cltbl th{position:static}
.bulk-btn.primary{background:var(--accent);color:var(--on-accent)}.bulk-btn.primary:hover{background:var(--accent-h)}
.canvas:has(> .ag) .bulk{position:fixed;bottom:32px;left:calc(50% + 116px)}

.toast{position:fixed;bottom:76px;left:50%;transform:translateX(-50%);background:var(--toast-bg);color:var(--toast-fg);padding:8px 16px;border-radius:var(--r-soft);z-index:50;box-shadow:0 6px 8px var(--shadow-sticky);max-width:80vw}
@media (max-width:1000px){.shell{grid-template-columns:1fr}.sidecol{display:none}.hdr-c{display:none}}

/* Home: one line of compact metric tiles, a Templates section */
.hub-stats{grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:8px}
.hub-stat{padding:12px 14px;border-radius:14px;display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:8px;row-gap:2px;align-items:center}
.hub-ic{width:auto;height:auto;margin:0;border:0;background:transparent;border-radius:0}
.hub-sl{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hub-stat b{grid-column:1 / -1;font-size:22px;line-height:28px}
.hub-note{display:none}
@media (max-width:1100px){.hub-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:700px){.hub-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
.hm-tpl{margin:0 0 32px}
.hm-th{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.hm-th .hub-h2{margin:0 0 2px}
.hm-ts{margin:0 0 16px;color:var(--fg2)}
.hm-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.hm-card{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-height:164px;padding:18px;border:0;border-radius:20px;text-align:left;cursor:pointer;background:linear-gradient(145deg,var(--hm-a),var(--hm-b));transition:transform .16s ease,box-shadow .16s ease}
.hm-card:hover{transform:translateY(-3px);box-shadow:0 12px 24px rgba(20,30,80,.12)}
.hm-card:focus-visible{outline:2px solid var(--hm-fg);outline-offset:3px}
.hm-ci{width:46px;height:46px;border-radius:15px;background:rgba(255,255,255,.85);box-shadow:0 1px 3px rgba(0,0,0,.08);display:grid;place-items:center;color:var(--hm-fg);margin-bottom:14px}
.hm-card b{font-size:15px;font-weight:600;color:var(--fg1)}
.hm-d{color:var(--fg2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.hm-go{position:absolute;top:18px;right:18px;color:var(--hm-fg);opacity:0;transform:translateX(-6px);transition:opacity .16s,transform .16s}
.hm-card:hover .hm-go,.hm-card:focus-visible .hm-go{opacity:1;transform:none}
@media (max-width:1100px){.hm-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){.hm-card,.hm-go{transition:none}.hm-card:hover{transform:none}}

/* Home templates: icon on the left, wrapping the name and the description; metrics first */
.hm-tpl{margin:24px 0 8px}
.hm-th{align-items:center;margin-bottom:12px}.hm-th .hub-h2{margin:0}
.hm-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
.hm-card{display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-rows:auto auto;column-gap:14px;row-gap:2px;align-items:center;min-height:0;padding:16px 20px;border-radius:18px}
.hm-ci{grid-row:1 / 3;margin:0}
.hm-card b{grid-column:2;align-self:end}
.hm-d{grid-column:2;align-self:start}
.hm-go{top:50%;right:18px;margin-top:-9px}
@media (max-width:760px){.hm-grid{grid-template-columns:1fr}}
/* Home templates, built from the same parts as the metric tiles and the agent rows: white card, 1px border, 14px corners, tinted icon tile, small lift and arrow on hover */
.hm-card{background:var(--base);border:1px solid var(--bs);border-radius:14px;padding:14px 16px;box-shadow:none;min-height:0}
.hm-card:hover{transform:translateY(-2px);border-color:var(--bst);box-shadow:0 6px 16px rgba(0,0,0,.06)}
.hm-card:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.hm-ci{width:44px;height:44px;border-radius:12px;background:linear-gradient(145deg,var(--hm-a),var(--hm-b));box-shadow:none;color:var(--hm-fg)}
.hm-card b{font-size:15px;font-weight:500;color:var(--fg1)}
.hm-d{color:var(--fg2)}
.hm-go{color:var(--fg3)}
.hm-card:hover .hm-go{color:var(--hm-fg)}

/* the agent picker (modal, Tools > Agents, Discover): compact rows, the whole row is the button */
.hx-row.tpr{padding:10px 12px;gap:12px}
.tpr .hx-tile{width:40px;height:40px;border-radius:10px}
.tpr .hx-txt{gap:0}
.tpr .tpr-use{flex:none;pointer-events:none}
.am-h{padding:20px 20px 12px;align-items:center}.am-h h2{margin:0}
.am-s{gap:8px}.am-s>svg{flex:none;color:var(--fg3)}
.am-x{width:22px;height:22px;flex:none;border:0;border-radius:50%;background:var(--d10);color:var(--fg2);display:grid;place-items:center;padding:0;cursor:pointer}.am-x:hover{background:var(--bst)}
.am-n{margin:0 20px 4px;color:var(--fg3);font-size:12px}
.am-s input:focus,.am-s input:focus-visible{outline:none;box-shadow:none}
.dlg.am{width:900px}
.am-body{flex:1;min-height:0;display:flex;border-top:1px solid var(--bs)}
.am-rail{flex:none;width:210px;padding:10px;border-right:1px solid var(--bs);overflow:auto;display:flex;flex-direction:column;gap:2px}
.am-c{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:7px 10px;border:0;border-radius:8px;background:transparent;color:var(--fg1);font:inherit;text-align:left;cursor:pointer}
.am-c:hover{background:var(--d5)}.am-c.on{background:var(--accent-sub);color:var(--fg-accent);font-weight:500}
.am-c i{font-style:normal;font-size:12px;color:var(--fg3)}.am-c.on i{color:var(--fg-accent)}
.am-main{flex:1;min-width:0;display:flex;flex-direction:column;padding-top:10px}
.am-main .am-s{margin:0 20px 8px}
@media (max-width:760px){.am-body{flex-direction:column}.am-rail{width:auto;flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid var(--bs)}.am-c{width:auto;white-space:nowrap}}
/* pick, then continue */
.am-blank{display:flex;align-items:center;gap:12px;margin:0 20px 10px;padding:12px 14px;border:1px dashed var(--bst);border-radius:14px;background:var(--base);text-align:left;font:inherit;cursor:pointer;transition:background .12s,border-color .12s}
.am-blank:hover{background:var(--d5)}
.am-blank.sel{border:1px solid var(--accent);background:var(--accent-sub)}
.am-bi{width:40px;height:40px;flex:none;border-radius:10px;background:var(--d5);display:grid;place-items:center;color:var(--fg1)}.am-blank.sel .am-bi{background:var(--base);color:var(--fg-accent)}
.am-bt{flex:1;min-width:0;display:flex;flex-direction:column}.am-bt b{font-weight:500;color:var(--fg1)}.am-bt span{color:var(--fg2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rd{width:20px;height:20px;flex:none;border-radius:50%;border:1.5px solid var(--bst);display:grid;place-items:center;color:#fff}.rd.on{background:var(--accent);border-color:var(--accent)}
.hx-row.tpr.sel,.hx-row.tpr.sel:hover{background:var(--accent-sub)}
.am-sel{color:var(--fg2);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.am-fb{display:flex;gap:8px;flex:none}
/* flow strip, badge, rail headings */
.tb{flex:none;height:20px;line-height:20px;padding:0 8px;border-radius:var(--r-full);background:var(--d5);color:var(--fg2);font-size:11px;font-weight:400;letter-spacing:0}
.tb.ro{background:#e4f6ec;color:#0f7a4f}
.hm-card{grid-template-rows:auto auto auto}
.hm-ci{grid-row:1 / 3;align-self:start}
.hm-nm{grid-column:2;align-self:end;display:flex;align-items:center;gap:8px}
.hm-go{top:16px;margin-top:0}
.flow{grid-column:1 / -1;display:flex;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid rgba(0,0,0,.07);width:100%;box-sizing:border-box}
.flow i{width:18px;border-top:1.5px dashed var(--bst);flex:none}
.fl-n{width:26px;height:26px;flex:none;border-radius:50%;background:rgba(255,255,255,.9);box-shadow:0 0 0 1px rgba(0,0,0,.06);display:grid;place-items:center;color:var(--fg2)}
.fl-n.big{width:34px;height:34px;color:var(--hm-fg)}
.fl-cap{margin-left:12px;color:var(--fg2);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.am-rh{margin:12px 10px 4px;font-size:11px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:var(--fg3)}.am-rh:first-child{margin-top:2px}
.am-cn{display:inline-flex;align-items:center;gap:8px;min-width:0}.am-cn svg{flex:none;color:var(--fg3)}.am-c.on .am-cn svg{color:var(--fg-accent)}
.am-rail{width:220px}
/* agent rows borrow from the Home cards: tinted icon tile and the flow strip */
.fl-row{display:flex;align-items:center;flex:none}
.flow.mini{flex-direction:column;align-items:flex-start;gap:3px;margin:0;padding:0;border:0;width:auto;flex:none}
.flow.mini .fl-n{width:22px;height:22px}.flow.mini .fl-n.big{width:28px;height:28px}
.flow.mini i{width:12px}
.flow.mini .fl-cap{margin:0;max-width:150px;font-size:11px;color:var(--fg3)}
.tpr .hx-tile{background:linear-gradient(145deg,var(--hm-a),var(--hm-b));border-color:transparent;color:var(--hm-fg)}
.tpr .fl-n{background:var(--base)}
.am-b .flow.mini .fl-cap{display:none}
@media (max-width:760px){.tpr .flow{display:none}}
/* demo control and the billing manager's Home */
.persona{position:fixed;left:248px;bottom:16px;z-index:15;display:flex;align-items:center;gap:4px;background:var(--toast-bg);color:var(--toast-fg);border-radius:var(--r-full);padding:4px 5px 4px 12px;font-size:12px}
.persona span{margin-right:4px;opacity:.7}
.persona button{height:24px;padding:0 10px;border:0;border-radius:var(--r-full);background:transparent;color:inherit;font:inherit;opacity:.7;cursor:pointer}
.persona button.on{background:rgba(255,255,255,.2);opacity:1;font-weight:500}
.demo{left:520px}
.mg-sec{margin:28px 0 0}.mg-sec .hub-h2{margin:0 0 10px}
.mg-att{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.mg-att li{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--bs);border-radius:14px;background:var(--base)}
.mg-ic{width:36px;height:36px;flex:none;border-radius:10px;display:grid;place-items:center}
.mg-ic.amber{background:#fdf1d3;color:#b17508}.mg-ic.blue{background:#e4e9ff;color:#3b4fd8}.mg-ic.gray{background:var(--d5);color:var(--fg2)}
.mg-tx{flex:1;min-width:0;display:flex;flex-direction:column}.mg-tx b{font-weight:500;color:var(--fg1)}.mg-tx span{color:var(--fg2)}
.mg-tbl{width:100%;border-collapse:collapse;border:1px solid var(--bs);border-radius:14px;overflow:hidden}
.mg-tbl th{text-align:left;font-weight:400;font-size:12px;color:var(--fg3);padding:10px 14px;background:var(--bg1);border-bottom:1px solid var(--bs)}
.mg-tbl td{padding:10px 14px;border-bottom:1px solid var(--bs)}.mg-tbl tr:last-child td{border-bottom:0}
.mg-tbl td:nth-child(2){width:46%}.mg-tbl td:nth-child(3){width:18%}
.mg-who{display:inline-flex;align-items:center;gap:10px}.mg-who em{font-style:normal;font-size:11px;color:var(--fg-accent);background:var(--accent-sub);border-radius:var(--r-full);padding:0 8px;line-height:18px}
.mg-av{width:28px;height:28px;border-radius:50%;background:var(--d10);display:grid;place-items:center;font-size:11px;font-weight:500;color:var(--fg2)}
.mg-bar{display:inline-block;vertical-align:middle;width:calc(100% - 52px);height:8px;border-radius:4px;background:var(--d5);margin-right:10px;overflow:hidden}.mg-bar i{display:block;height:100%;background:var(--accent);border-radius:4px}
.mg-tbl td b{font-weight:500;color:var(--fg1)}
/* the bottom strip is gone: back to the icon centered beside the name and the description */
.hm-ci{align-self:center}
.hm-go{top:50%;margin-top:-9px}
.am-b .ext-sec{margin-bottom:6px}.am-b .ext-gh{margin-top:6px}
.am-b .hx-item:last-child{border-bottom:0}
.am-s{display:flex;align-items:center;gap:8px;height:32px;margin:0 20px 8px;padding:0 10px;border-radius:8px;background:var(--d5);color:var(--fg1)}
.am-s input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;color:var(--fg1)}.am-s input::placeholder{color:var(--fg3)}.am-s:focus-within{box-shadow:0 0 0 2px var(--accent)}
`;
