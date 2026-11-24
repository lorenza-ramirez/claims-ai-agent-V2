import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  ShieldPlus, Lightbulb, Calendar, Wrench, BookOpen, ChevronDown, ChevronsDownUp, Bell, Search, Mic, Sparkles,
  Settings, CircleHelp, Users, Ban, Repeat1, Circle, CircleCheck, UserPlus, Split, FilePlus, ListX,
  X, Command, Info, SearchX, Plus, ClipboardCheck, FileText, Pencil, ShieldCheck, ArrowUp, MailOpen, Wallet, CircleSlash, FileX, Gavel, RefreshCw, LayoutGrid, Trash2, Pause, Play, Zap, Clock, ArrowLeft, ExternalLink, ThumbsUp, ThumbsDown, Link2, Check, Send, MessageSquareText, Copy, Archive, ArchiveRestore, Tag as TagIcon, Receipt, CircleDollarSign, FolderUp, TimerOff, Download, Stethoscope, ArrowRight, CornerDownLeft, MoreHorizontal,
} from "lucide-react";

/* ============================================================
   AIR prototype: Claims, Agents hub, Agent pages, Agent builder
   Variant: My Claims context band (Where things stand, Suggested Actions)
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
/* My Claims has no header at the top of the table. Each expanded group shows its own column header instead. Set false to drop that one too. Other tabs keep the top header. */
const NESTED_HEADER = true;
/* "More actions" sits in each group's header bar, to the right of the assignee. Set true to show it on every claim row too. */
const ROW_MORE = false;
/* Only Medicare Agent is seeded, from the brief. Payer groups for the rule are an assumption. */
const PAYER_GROUPS = ["Medicare", "Medicaid", "Commercial"];
const payerGroup = (payer) => (payer.startsWith("MEDICARE") ? "Medicare" : payer.includes("MEDICAID") ? "Medicaid" : "Commercial");
const SEED_AGENTS = [
  {
    id: "medicare", name: "Medicare Agent", init: "MA",
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
];
const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "AG";
const toAssignee = (a) => ({ id: a.id, name: a.name, init: a.init, color: "agent", kind: "agent" });
/* My Claims groups: names, chips, amounts and counts from the product screenshots. Every claim in them is yours. */
const REJ = "Acknowledgement/Rejected for Invalid Information - The claim/encounter has invalid information as specified by the payer";
const MY_GROUPS = [
  { key: "m1", status: "Rejections", chips: ["WELLCARE HEALTH PLAN SIMPLE MA", REJ], amount: 15142.0, count: "65", payer: "WELLCARE HEALTH PLAN SIMPLE MA" },
  { key: "m2", status: "Full Denials", chips: ["WELLMARK BLUE CROSS BLUE SHIELD OF IOWA", "Diagnosis Code", "CO16", "M76"], amount: 9105.0, count: "32", payer: "WELLMARK BLUE CROSS BLUE SHIELD OF IOWA" },
  { key: "m3", status: "Full Denials", chips: ["IOWA BLUE SHIELD", "Diagnosis Code", "CO16", "M76"], amount: 7048.0, count: "25", payer: "IOWA BLUE SHIELD" },
  { key: "m4", status: "Full Denials", chips: ["ILLINOIS BLUE SHIELD", "Diagnosis Code", "CO16", "M76"], amount: 6899.0, count: "25", payer: "ILLINOIS BLUE SHIELD" },
  { key: "m5", status: "Full Denials", chips: ["ANTHEM ILLINOIS BLUE SHIELD", "Medical Necessity", "CO11"], amount: 4297.0, count: "17", payer: "ANTHEM ILLINOIS BLUE SHIELD" },
  { key: "m6", status: "Payment Posting", chips: ["Manual Review Required", "Negative Payer Balance"], amount: 3575.88, count: "32" },
  { key: "m7", status: "Full Denials", chips: ["IOWA BLUE SHIELD", "Service Not Covered", "PR167", "N30"], amount: 3320.0, count: "20", payer: "IOWA BLUE SHIELD" },
  { key: "m8", status: "Rejections", chips: ["WELLCARE HEALTH PLAN SIMPLE MA", REJ], amount: 3313.0, count: "16", payer: "WELLCARE HEALTH PLAN SIMPLE MA" },
  { key: "m9", status: "Full Denials", chips: ["WELLMARK BLUE CROSS BLUE SHIELD OF SOUTH DAKOTA", "Diagnosis Code", "CO16", "M76"], amount: 2393.0, count: "9", payer: "WELLMARK BLUE CROSS BLUE SHIELD OF SOUTH DAKOTA" },
  { key: "m10", status: "Full Denials", chips: ["IOWA MEDICARE", "Benefit Maximum", "CO119", ["M25", "N362"]], amount: 2371.0, count: "10", payer: "IOWA MEDICARE" },
  { key: "m11", status: "Full Denials", chips: ["ANTHEM IOWA BLUE SHIELD", "Diagnosis Code", "CO16", "M76"], amount: 2210.0, count: "8", payer: "ANTHEM IOWA BLUE SHIELD" },
  { key: "m12", status: "Full Denials", chips: ["IOWA BLUE SHIELD", "Coordination of Benefits", "CO22"], amount: 2059.0, count: "10", payer: "IOWA BLUE SHIELD" },
  { key: "m13", status: "Full Denials", chips: ["IOWA BLUE SHIELD", "Patient Coverage", ["PR27", "PR59"]], amount: 1844.0, count: "7", payer: "IOWA BLUE SHIELD" },
  { key: "m14", status: "Payment Posting", chips: ["Manual Review Required", "Balance Exceeds Billed Amount"], amount: 1628.28, count: "14" },
  { key: "m15", status: "Full Denials", chips: ["AETNA MA", "Diagnosis Code", "CO16", "M76"], amount: 1565.0, count: "8", payer: "AETNA MA" },
  { key: "m16", status: "Payment Posting", chips: ["Manual Review Required", "Unbalanced Payment Item"], amount: 1395.0, count: "8" },
  { key: "m17", status: "Payment Posting", chips: ["Awaiting Deposit Verification"], amount: 1259.0, count: "7" },
  { key: "m18", status: "Rejections", chips: ["WELLCARE HEALTH PLAN SIMPLE MA", REJ], amount: 1236.0, count: "6", payer: "WELLCARE HEALTH PLAN SIMPLE MA" },
  { key: "m19", status: "Full Denials", chips: ["UNITED HEALTHCARE", "Coordination of Benefits", "PR22", "N479"], amount: 1100.0, count: "5", payer: "UNITED HEALTHCARE" },
  { key: "m20", status: "Full Denials", chips: ["ILLINOIS BLUE SHIELD", "Diagnosis Code", ["CO16", "COB13"], "M76"], amount: 1090.0, count: "4", payer: "ILLINOIS BLUE SHIELD" },
  { key: "m21", status: "Full Denials", chips: ["WELLMARK BLUE CROSS BLUE SHIELD OF IOWA", "Invalid Procedure Code", "CO16", ["M51", "N56"]], amount: 1025.0, count: "4", payer: "WELLMARK BLUE CROSS BLUE SHIELD OF IOWA" },
  { key: "m22", status: "Full Denials", chips: ["UNITED MEDICAL RESOURCES", "Payer Requested Info", ["CO45", "PR227"], "MA92"], amount: 1012.0, count: "5", payer: "UNITED MEDICAL RESOURCES" },
  { key: "m23", status: "Full Denials", chips: ["ILLINOIS BLUE SHIELD", ["Workers Comp", "Wrong Payer"], "PR19", "N418"], amount: 941.0, count: "3", payer: "ILLINOIS BLUE SHIELD" },
  { key: "m24", status: "Full Denials", chips: ["MASSACHUSETTS MEDICARE", "Patient Identifier", "CO16", ["MA130", "N382"]], amount: 938.68, count: "5", payer: "MASSACHUSETTS MEDICARE" },
  { key: "m25", status: "Full Denials", chips: ["MASSACHUSETTS MEDICARE", "Wrong Payer", "OA109"], amount: 926.47, count: "4", payer: "MASSACHUSETTS MEDICARE" },
  { key: "m26", status: "Full Denials", chips: ["TRICARE - WEST REGION", "Medical Necessity", "CO50", "N180"], amount: 832.0, count: "4", payer: "TRICARE - WEST REGION" },
  { key: "m27", status: "Payment Posting", chips: ["Manual Review Required", "Other Manual Review"], amount: 808.14, count: "27" },
  { key: "m28", status: "Full Denials", chips: ["IOWA BLUE SHIELD", "Patient Coverage", ["PR26", "PR59"]], amount: 794.0, count: "3", payer: "IOWA BLUE SHIELD" },
  { key: "m29", status: "Full Denials", chips: ["IOWA BLUE SHIELD", ["Medical Necessity", "Service Not Covered"], "PR50", "N130"], amount: 783.0, count: "4", payer: "IOWA BLUE SHIELD" },
  { key: "m30", status: "Full Denials", chips: ["WELLMARK BLUE CROSS BLUE SHIELD OF IOWA", "Patient Coverage", "PR27"], amount: 760.0, count: "3", payer: "WELLMARK BLUE CROSS BLUE SHIELD OF IOWA" },
  { key: "m31", status: "Full Denials", chips: ["ILLINOIS BLUE SHIELD", ["Diagnosis Code", "Service Not Covered"], "PR96", "N569"], amount: 733.0, count: "3", payer: "ILLINOIS BLUE SHIELD" },
  { key: "m32", status: "Full Denials", chips: ["IOWA MEDICARE", "Patient Identifier", "CO16", ["MA130", "N382"]], amount: 704.0, count: "3", payer: "IOWA MEDICARE" },
  { key: "m33", status: "Payment Posting", chips: ["Manual Review Required", ["Balance Exceeds Billed Amount", "Other Manual Review"]], amount: 665.0, count: "3" },
].map((g) => ({ ...g, mine: true }));
const ALL_GROUPS = [...GROUPS, ...MY_GROUPS];
const GROUP_BY_KEY = Object.fromEntries(ALL_GROUPS.map((g) => [g.key, g]));
const REVIEWER = "Lena Rowe";
const WORK_LABEL = { working: "Agent working", ready: "Ready for review" };
const PROPOSAL_TITLE = { "Portal check": "Proposed action", "Denial fix": "Suggested fix", "Secondary claim draft": "Draft secondary claim", "Posting suggestion": "Suggested posting" };
const isCode = (x) => /^[A-Z]{1,2}\d+$/.test(x);
/* Design: the reason and its codes read as one chip, for example "Diagnosis Code: CO16 - M76". The payer chip and all other chips stay. */
function mergeChips(chips) {
  const codes = chips.flat().filter(isCode);
  if (!codes.length) return chips;
  const li = chips.findIndex((c, i) => i > 0 && (Array.isArray(c) ? c.every((x) => !isCode(x)) : !isCode(c)));
  if (li < 0) return chips;
  const out = [];
  chips.forEach((c, i) => {
    if (i === li) out.push((Array.isArray(c) ? c.join(" / ") : c) + ": " + codes.join(" - "));
    else if (typeof c === "string" && isCode(c)) return;
    else if (Array.isArray(c) && c.every(isCode)) return;
    else out.push(c);
  });
  return out;
}
ALL_GROUPS.forEach((g) => { g.shown = mergeChips(g.chips); });

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
  const ids = base.filter((c) => !c.mine && payerGroup(c.payer) === "Medicare").map((c) => c.id);
  const a = doAssign(base, ids, "medicare", { auto: true, agentIds: ["medicare"], now, instant: 4, backdate: true, reason: "Assigned by the Medicare rule" });
  const b = advance(a.claims, now, true);
  return { claims: b.claims, activity: [...b.events, ...a.events].sort((x, y) => y.t - x.t) };
}

/* ---------- Hub numbers: all read from the live claims and activity ---------- */
const MIN_PER_RESULT = 6; /* assumption: minutes saved per approved result */
function agentStats(a, claims) {
  const work = claims.filter((c) => c.work && c.work.agentId === a.id);
  return { worked: work.length, ready: work.filter((c) => c.work.state === "ready").length, approved: work.filter((c) => c.work.state === "approved").length };
}
/* Running: auto-assign is on or it has worked a claim. Draft: neither yet. Paused: you paused it. */
function agentStatus(a, claims) {
  if (a.paused) return "Paused";
  return (a.rule && a.rule.on) || agentStats(a, claims).worked > 0 ? "Running" : "Draft";
}

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
    : "Here is a first draft called " + d.name + ". " + (parts.length ? "I added " + parts.join(" and ") + "." : "I did not find specifics yet.") + ruleNote + " Change anything on the right, then create the agent.";
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

/* One claim per (group, index), so "Load more" can create the next ones. The first two of every group belong to you (My Claims). */
function makeClaimFor(g, gi, k, forceMine = false) {
  let seed = 7 + gi * 977 + k * 131;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  rnd(); rnd();
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const id = 99000000 - gi * 1000000 - (k + 1) * 3000 + Math.floor(rnd() * 2500);
  const dos = new Date(TODAY); dos.setDate(dos.getDate() - (5 + (k % 14) * 2 + Math.floor(rnd() * 3)));
  const r = rnd();
  const mine = forceMine || !!g.mine;
  return {
    id: String(id), idx: k, group: g.key, status: g.status, days: 1 + Math.floor(rnd() * 33), stage: "Payer 1",
    patient: pick(FN) + " " + pick(LN), provider: pick(PROVIDERS), dos: mdy(dos),
    payer: k === 0 && ["g6", "g25", "g28"].includes(g.key) ? "MEDICARE PART B" : g.payer || pick(PAYERS),
    amount: Math.round((200 + rnd() * 3800) * 100) / 100,
    assignee: mine ? ME : r < 0.28 ? null : AGENTS[Math.floor(rnd() * 7)].id,
    ...(mine ? { mine: true } : {}),
  };
}
function makeClaims() {
  const out = [];
  GROUPS.forEach((g, gi) => {
    const n = Math.min(8, parseInt(g.count.replace(/,/g, ""), 10));
    for (let i = 0; i < n; i++) out.push(makeClaimFor(g, gi, i));
  });
  /* My Claims groups: all of your claims in each group exist from the start */
  MY_GROUPS.forEach((g, i) => {
    const gi = GROUPS.length + i, n = parseInt(g.count.replace(/,/g, ""), 10);
    for (let k = 0; k < n; k++) out.push(makeClaimFor(g, gi, k));
  });
  return out;
}
/* How many claims are yours in a group (the number in the My Claims group header). */
const groupCap = (g) => parseInt(g.count.replace(/,/g, ""), 10);
function myTotalFor(g, gi) {
  const cap = groupCap(g);
  if (g.mine) return cap;
  return cap <= 8 ? Math.min(cap, 2) : Math.min(cap, [32, 17, 24, 12, 28, 9, 20, 15][gi % 8]);
}
const myAmountFor = (g, n) => Math.round((g.amount * n / groupCap(g)) * 100) / 100;

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

function NavGroup({ group, open, onToggle, page, onGo }) {
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
            {group.items.map((it) => <NavItem key={it.l} item={it} active={it.page === page} onClick={() => onGo(it)} />)}
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

function SideNav({ page, onGo, notify, agents, readyCounts }) {
  const groups = [{ id: "agents", label: "Agents", icon: AgentsIcon, items: [{ l: "Hub", page: "agents", icon: LayoutGrid }, ...agents.map((a) => ({ l: a.name, page: "agent:" + a.id, badge: readyCounts[a.id] })), { l: "Add agent", page: "agent:new", icon: Plus }] }, ...NAV];
  const [open, setOpen] = useState({ agents: true, ehr: true, insights: true, daily: true, utilities: true, admin: true });
  return (
    <nav className="sidecol" aria-label="Main">
      <AirLogo />
      <div className="sidescroll">
        {groups.map((g) => (
          <NavGroup key={g.id} group={g} open={open[g.id]} onToggle={() => setOpen({ ...open, [g.id]: !open[g.id] })} page={page} onGo={onGo} />
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

function Dialog({ title, children, confirmLabel, onConfirm, onCancel }) {
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onCancel(); }; document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [onCancel]);
  return (
    <div className="dlg-back" onMouseDown={onCancel}>
      <div className="dlg" role="alertdialog" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="dlg-b">{children}</div>
        <div className="ag-btns"><button className="btn" onClick={onCancel}>Cancel</button><button className="btn primary" autoFocus onClick={onConfirm}>{confirmLabel}</button></div>
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


/* ---------- My Claims context band: fake content, one per group ---------- */
const longDate = (d) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const parseMDY = (x) => { const [m, d, y] = x.split("/").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const KEEP = new Set(["MA", "HMO", "PPO", "EPS", "PT", "NF", "WC", "LTD", "LLC"]);
const tcase = (x) => x.split(/(\s+)/).map((w) => (KEEP.has(w.replace(/[()]/g, "")) ? w : w.toLowerCase().replace(/\b[a-z]/g, (m) => m.toUpperCase()))).join("").replace(/ (Of|And|The) /g, (m) => m.toLowerCase());
const PRACTICE = "Northgate Therapy Group";
const CODE_TEXT = { CO16: "claim lacks information or has a billing error", CO11: "diagnosis is inconsistent with the procedure", CO22: "this care may be covered by another payer", CO45: "charge exceeds the fee schedule", CO50: "not deemed a medical necessity", CO119: "benefit maximum for this period has been reached", PR19: "this is a work-related injury", PR22: "this care may be covered by another payer", PR26: "expenses were incurred before coverage began", PR27: "expenses were incurred after coverage ended", PR50: "not deemed a medical necessity", PR59: "processed under multiple procedure rules", PR96: "non-covered charge", PR167: "diagnosis is not covered", PR227: "requested information was not provided", OA109: "claim not covered by this payer, send it to the correct payer", MA130: "claim has incomplete or invalid information", M76: "missing or invalid diagnosis or condition", M51: "missing or invalid procedure codes", N30: "patient is ineligible for this service", N56: "procedure code is not correct for the service", N362: "units of service exceed the maximum", N418: "misrouted claim", N479: "missing explanation of benefits" };
/* What to fix, by denial reason. Returns { title, sug, chg, act, resub }. Order matters: the first match wins. */
function denialPlan(reason, who, total) {
  const r = reason.toLowerCase();
  const patient = (title, sug, act) => ({ title, sug, act, resub: false, chg: [["Claim: Responsibility", who, "Patient"], ["Claim: Open balance", total, "$0.00 (moved to patient)"]] });
  if (/diagnosis/.test(r)) return { title: "Remove Diagnoses", sug: "Remove R42, which has an Excludes1 conflict with H81.22. Dizziness is integral to the documented left vestibular neuronitis, which is the confirmed diagnosis and the reason for the vestibular rehab. This addresses the M76 invalid-diagnosis denial. All lines now point only to H81.22, the sole remaining diagnosis.", chg: [["Claim", "H81.22, R42", "H81.22"], ["Procedure 97112", "H81.22, R42", "H81.22"], ["Procedure 97110", "H81.22, R42", "H81.22"], ["Procedure 97530", "H81.22, R42", "H81.22"]], act: "Review the diagnosis codes on the denied lines", resub: true };
  if (/invalid procedure/.test(r)) return { title: "Correct Procedure Codes", sug: "Replace the invalid procedure code with the code that matches the documented service and the date of service, then resubmit.", chg: [["Procedure code", "Invalid for the service", "Corrected"], ["Claim: Modifier", "none", "GP"]], act: "Correct the procedure codes on the denied lines", resub: true };
  if (/payer requested/.test(r)) return { title: "Send Requested Information", sug: "Send the records the payer asked for, with a cover letter that names the claim, then resubmit.", chg: [["Claim: Attachments", "none", "Requested records"]], act: "Gather the records the payer requested", resub: true };
  if (/workers comp/.test(r)) return { title: "Bill Workers Compensation", sug: "Bill the workers compensation carrier on file. " + who + " is not responsible for a work-related injury.", chg: [["Claim: Primary payer", who, "Workers compensation carrier"]], act: "Confirm the workers compensation carrier", pre: true, resub: true, to: "the workers compensation carrier" };
  if (/patient identifier/.test(r)) return { title: "Correct Patient Identifier", sug: "Correct the member ID and the patient name so they match the insurance card, then resubmit.", chg: [["Claim: Member ID", "Not on file", "Matches the card"], ["Claim: Patient name", "Mismatch", "Matches the card"]], act: "Correct the patient identifiers", resub: true };
  if (/wrong payer/.test(r)) return { title: "Update Payer", sug: "Move each claim to the payer that covers the patient on the date of service, then resubmit.", chg: [["Claim: Payer", who, "Covering payer"]], act: "Find the payer that covers the patient", pre: true, resub: true, to: "the covering payer" };
  if (/patient coverage/.test(r)) return { title: "Update Insurance", sug: "Verify eligibility on the date of service and update each claim to the coverage that was active, then resubmit.", chg: [["Claim: Insurance", who, "Active coverage"]], act: "Verify eligibility on the date of service", pre: true, resub: true, to: "the payer with active coverage" };
  if (/coordination/.test(r)) return { title: "Bill Primary Carrier First", sug: "Bill the carrier that is primary first and keep " + who + " as secondary, then resubmit with the primary remittance attached.", chg: [["Claim: Primary payer", "Other carrier", "Billed first"], ["Claim: Secondary payer", "none", who]], act: "Bill the primary carrier first", pre: true, resub: true, to: "the primary carrier and then to " + who + " as secondary" };
  if (/medical necessity/.test(r)) return { title: "Prepare Appeal", sug: "Appeal with the clinical notes and cite the payer's coverage policy for the diagnosis and the service.", chg: [["Claim: Appeal", "none", "Level 1 appeal"], ["Claim: Attachments", "none", "Clinical notes"]], act: "Appeal with the clinical notes", resub: true };
  if (/benefit maximum/.test(r)) return patient("Bill Patient For Benefit Maximum", "The benefit maximum for the period has been reached. Confirm the accumulators on the payer portal, then move the balance to the patient.", "Confirm the benefit maximum and move the balance to the patient");
  if (/service not covered/.test(r)) return patient("Move Balance to Patient", "The plan does not cover this service. Confirm it on the payer portal, then move the balance to the patient.", "Confirm the service is not covered and move the balance to the patient");
  if (/prior auth/.test(r)) return { title: "Request Retro Authorization", sug: "Request a retro-authorization from " + who + " and attach the number to each claim before resubmitting.", chg: [["Claim: Authorization", "none", "Retro authorization number"]], act: "Request a retro-authorization and attach the number", resub: true };
  if (/bundled/.test(r)) return { title: "Add Modifier", sug: "Add modifier 59 to the second procedure so the two lines are not bundled, then resubmit.", chg: [["Procedure: Modifier", "none", "59"]], act: "Add modifier 59 where lines were bundled", resub: true };
  if (/documentation/.test(r)) return { title: "Attach Documentation", sug: "Attach the signed progress notes and resubmit with the documentation flag set.", chg: [["Claim: Attachments", "none", "Progress notes"]], act: "Attach the signed progress notes", resub: true };
  if (/contractual/.test(r)) return { title: "Write Off Adjustment", sug: "Write off the contractual adjustment. No appeal is needed.", chg: [["Claim: Open balance", total, "$0.00"]], act: "Write off the contractual adjustment", resub: false };
  return { title: "Correct Claim", sug: "Correct what the payer flagged and resubmit.", chg: [["Claim: Status", "Denied", "Corrected and resubmitted"]], act: "Correct what the payer flagged", resub: true };
}
/* The band summarizes the whole group (all its claims), not one claim. The wording follows the product's claim summaries. */
function bandFor(g, rows) {
  const gi = ALL_GROUPS.findIndex((x) => x.key === g.key);
  const n = Math.max(1, parseInt(String(g.count).replace(/,/g, ""), 10) || rows.length || 1);
  const one = n === 1;
  const cl = one ? "1 claim" : n + " claims";
  const all = one ? "this claim" : "all " + n + " claims";
  const them = one ? "it" : "them";
  const total = money(g.total);
  const payer = g.payer ? tcase(g.payer) : "";
  const who = payer || "the payer";
  const flat = GROUP_BY_KEY[g.key].chips.flat();
  const codes = flat.filter(isCode);
  const reasonAll = flat.slice(g.payer ? 1 : 0).filter((x) => !isCode(x)).join(" / ");
  const d = (k) => longDate(addDays(TODAY, -k));
  const dShort = (k) => addDays(TODAY, -k).toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const mk = (title, stand, next, suggestion, changes, revise = false) => ({ title, stand, next, suggestion, changes: one ? changes : [["Claims updated", "0", String(n)], ...changes], revise });
  const st = g.status;

  if (st === "Rejections") return mk("Create Primary Insurance",
    [PRACTICE + " billed " + who + " " + total + " across " + cl + ", and " + (one ? "it has" : "every one has") + " been rejected on each attempt. ", { link: "The initial submission" }, " and ", { link: "a first resubmission" }, " were rejected because the member ID was not on file. After updating the insurance name, ", { link: "a second resubmission on " + d(34) }, " was also rejected for the same reason: subscriber and subscriber ID not found. On " + d(2) + ", Athelas left a note " + (one ? "on the claim" : "on each claim") + " confirming the rejection and stating that a correction and resubmission would follow within 14 days. No resubmission has gone out since."],
    ["The open " + (one ? "note is" : "notes are") + " unresolved, and an available suggestion may explain the repeated subscriber ID failures: an insurance-detection check identified Iowa Medicare as an alternate active payer for " + (one ? "this patient" : "these patients") + ", with a different member ID than what has been submitted. Review that suggestion and, if the Iowa Medicare coverage is correct, update " + (one ? "the claim" : "the claims") + " to Iowa Medicare with the detected member ID" + (one ? "" : "s") + " and resubmit. That would address the root cause of all " + (one ? "the" : n) + " rejections."],
    ["We reviewed " + all + " after " + (one ? "it was" : "they were") + " rejected for coverage-related reasons. ", { bold: "Create Iowa Medicare as the primary insurance" }, " with the member ID found by the insurance-detection check, then resubmit " + them + " to Iowa Medicare."],
    [["Claim: Primary insurance", who, "Iowa Medicare"], ["Claim: Member ID", "Not on file", "Found by insurance detection"]]);

  if (st === "Full Denials" || st === "Partial Denials") {
    const prim = codes.find((x) => /^(CO|PR|OA)\d+$/.test(x));
    const rem = codes.find((x) => /^(M|N|MA)\d+$/.test(x));
    const pm = prim ? prim + (CODE_TEXT[prim] ? " (" + CODE_TEXT[prim] + ")" : "") : "a denial code";
    const rm = rem ? ", with remark " + rem + (CODE_TEXT[rem] ? " citing " + CODE_TEXT[rem] : "") : "";
    const plan = denialPlan(reasonAll, who, total);
    const next = /diagnosis/.test(reasonAll.toLowerCase())
      ? "Review the diagnosis codes on all denied lines. Remark " + (rem || "M76") + " points to a problem with the diagnosis or condition information as submitted: either a code is missing, incomplete, or invalid for " + who + ". Correct the diagnosis coding and resubmit to " + who + ". Other claims for " + (one ? "this patient" : "these patients") + " with this payer are also sitting in full denials, so it is worth checking whether the same diagnosis issue is present across those encounters as well."
      : plan.act + (plan.pre ? " for " : " on ") + all + (plan.resub ? ", then resubmit to " + (plan.to || who) : "") + ". Start with the oldest claims. " + (plan.resub ? "Check back in about 14 days for the new remittance." : "No resubmission is needed.");
    return mk(plan.title,
      [{ link: "The initial claim to " + who + " on " + d(40 + gi % 5) }, " billed " + total + " across " + cl + " for " + PRACTICE + ". ", { link: (payer ? payer + "'s" : "The payer's") + " remittance dated " + d(8 + gi % 4) }, " denied " + all + " under " + pm + rm + ". Nothing has been paid, and the full " + total + " remains open."],
      [next],
      [plan.sug + (one ? "" : " The same change applies to all " + n + " claims in this group.")], plan.chg);
  }

  if (st === "Payment Posting") {
    const has = (re) => re.test(reasonAll.toLowerCase());
    const sec = money(g.total * 0.2);
    const sterlingLink = { link: "Sterling's remittance dated " + d(0) };
    if (has(/awaiting deposit/)) return mk("Verify Deposit and Post",
      ["Payments for " + cl + " (" + total + ") arrived on ", { link: "the remittance dated " + d(3) }, ". The deposit for " + (one ? "it" : "them") + " has not been verified, so nothing is posted yet. ", { link: "The deposit report" }, " does not list the deposit."],
      ["Confirm the deposit with the bank or the lockbox report. Once it matches the remittance total, post the payments, oldest first."],
      ["Verify the deposit against the remittance total, then ", { bold: "post each payment" }, " and close the claims with a zero balance."],
      [["Deposit", "Not verified", "Verified"], ["Claim: Posted", "$0.00", total]], true);
    const tailR = has(/negative payer balance/) ? " Posting as it stands would leave a negative payer balance on " + (one ? "the claim." : "each claim.")
      : has(/exceeds billed/) ? " The payments and adjustments together are more than the billed amount."
      : has(/unbalanced/) ? " The line payments and adjustments do not add up to the remittance total."
      : " The remittance was held for a review reason that is not tied to the amounts.";
    const next = has(/negative payer balance/)
      ? ["Review ", sterlingLink, " and post the line payments. The remittance also carries a PI-96 adjustment (non-covered charges) with a negative offset; confirm those figures are correct before posting, as doing so will produce a negative secondary balance, which reflects the coinsurance the primary already placed on the patient and should be verified before finalizing."]
      : has(/exceeds billed/)
        ? ["Review ", sterlingLink, " and compare the payments and adjustments with the billed amount on " + (one ? "the claim" : "each claim") + ". Correct the adjustment that pushes the total over the billed amount, then post the line payments."]
        : has(/unbalanced/)
          ? ["Review ", sterlingLink, " and match each line payment and adjustment to the remittance total. Correct the line that does not balance, then post the line payments."]
          : ["Open " + (one ? "the claim" : "each claim") + " in the review queue for ", sterlingLink, ", clear the review reason, then post the line payments."];
    return mk("Posting secondary payments from Sterling Life Medicare Supplement",
      ["Iowa Medicare paid " + cl + " (" + total + " billed in total) on ", { link: "its remittance dated " + d(10) }, ", now fully posted, and left the patient coinsurance (PR-1). Iowa Medicare automatically forwarded " + (one ? "the claim" : "the claims") + " to Sterling Life Medicare Supplement, and ", sterlingLink, " paid the secondary amounts across the therapy lines. That remittance is in manual review and has not posted." + tailR],
      next,
      ["The secondary payments of ", { bold: sec + " across " + cl }, " from Sterling Life Medicare Supplement (", { link: dShort(0) + " remit" }, ") are stuck in review, so " + (one ? "it is" : "they are") + " not posted. The primary payments are already posted (", { link: dShort(10) + " remit" }, "). ", { bold: "Post the secondary line payments on " + (one ? "the claim" : "each claim") }, ", which are different amounts from the primary payments."],
      [["Claim: Secondary posted", "$0.00", sec], ["Remittance", "In manual review", "Posted"]], true);
  }

  return mk("Review Claims",
    [cl.replace(/^./, (m) => m.toUpperCase()) + " (" + total + ") need attention. ", { link: "The claim list" }, " has the details."],
    ["Open the claims, oldest first, and work them in order."],
    ["Review " + all + " and decide the next step."], [["Claim: Status", "Open", "Reviewed"]]);
}
function ExtLink({ children, onClick }) {
  const t = String(children), i = t.lastIndexOf(" ");
  const head = i < 0 ? "" : t.slice(0, i + 1), tail = i < 0 ? t : t.slice(i + 1);
  return <a className="xlink" href="#" role="button" onClick={(e) => { e.preventDefault(); onClick(); }}>{head}<span className="nw">{tail}<ExternalLink size={12} /></span></a>;
}
function ClaimContextCard({ g, rows, st, onVote, onAccept, notify }) {
  const b = bandFor(g, rows);
  const seg = (arr) => arr.map((x, i) => (typeof x === "string" ? <React.Fragment key={i}>{x}</React.Fragment> : x.link ? <ExtLink key={i} onClick={notify}>{x.link}</ExtLink> : <b key={i} className="b-strong">{x.bold}</b>));
  return (
    <div className="band">
      <section className="bcard" aria-label="Where things stand">
        <h3>Where things stand</h3>
        <p>{seg(b.stand)}</p>
        <h3>What to do next</h3>
        <p>{seg(b.next)}</p>
      </section>
      <section className="bcard" aria-label="Suggested Actions">
        <h3>Suggested Actions</h3>
        <div className="b-head">
          <span className="b-upd">
            <b>{b.title}</b>
            <button className={"vbtn" + (st.vote === "up" ? " on" : "")} aria-label="Helpful" aria-pressed={st.vote === "up"} onClick={() => onVote("up")}><ThumbsUp size={16} /></button>
            <button className={"vbtn" + (st.vote === "down" ? " on" : "")} aria-label="Not helpful" aria-pressed={st.vote === "down"} onClick={() => onVote("down")}><ThumbsDown size={16} /></button>
          </span>
          <span className="b-acts">
            {b.revise && <button className="btn tert" onClick={notify}><AgentEmblem size={16} animate={false} />Revise</button>}
            <button className="btn sec" disabled={!!st.accepted} onClick={onAccept}>{st.accepted ? <><Check size={16} />Accepted</> : "Accept"}</button>
          </span>
        </div>
        <p>{seg(b.suggestion)}</p>
        <div className="b-div" />
        <div className="b-chg"><b>What will change:</b>{b.changes.map(([l, f, t], i) => <span key={i} className="b-chip">{l}: <s>{f}</s> &rarr; {t}</span>)}</div>
        <div className="b-foot"><button className="btn tert" onClick={notify}><Link2 size={16} />View Medical Record</button></div>
      </section>
    </div>
  );
}

function ClaimsTable({ state, groups, sel, open, onOpen, onToggle, onToggleGroup, onToggleAll, onAssignClick, onAgentClick, onOpenClaim, canOpen, tab, dir, fb, onVote, onAccept, onLoadMore, notify, solvedAny, onMoreClick, cOpen, onToggleClaims }) {
  const rows = groups.flatMap((g) => g.rows);
  const nSel = rows.filter((r) => sel.has(r.id)).length;
  const mine = tab === "mine";
  const rowEl = (r, withAssignee = true) => (
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
      {withAssignee && (
      <td className="asg-c">
        <span className="asgwrap">
          {r.assignee
            ? <button className="asgb" aria-label={"Assigned to " + dir[r.assignee].name + ", change assignee"} onClick={(e) => (dir[r.assignee].kind === "agent" ? onAgentClick(e.currentTarget, r) : onAssignClick(e.currentTarget, [r.id]))}><Avatar agent={dir[r.assignee]} /></button>
            : <button className="asgb empty" aria-label={"Assign " + r.id} onClick={(e) => onAssignClick(e.currentTarget, [r.id])}><UserPlus size={16} /></button>}
          {ROW_MORE && <button className="ibtn more" aria-label={"More actions for claim " + r.id} aria-haspopup="menu" onClick={(e) => onMoreClick(e.currentTarget, [r.id])}><MoreHorizontal size={18} /></button>}
        </span>
      </td>
      )}
    </tr>
  );
  /* My Claims: an expanded group shows the context band, then its claims in a framed table with "Load more" */
  const nested = (g, gSel) => {
    return (
      <tr className="clctx" key={g.key + "-ctx"}>
        <td colSpan={COLS.length + 3}>
          <div className="ctxwrap">
            <ClaimContextCard g={g} rows={g.rows} st={fb[g.key] || {}} onVote={(v) => onVote(g.key, v)} onAccept={() => onAccept(g)} notify={notify} />
            <div className="nest">
              <button className="nest-h" aria-expanded={!!cOpen[g.key]} aria-controls={"claims-" + g.key} onClick={() => onToggleClaims(g.key)}>
                <ChevronDown size={18} className={cOpen[g.key] ? "" : "rot"} /><span className="nest-t">Claims</span><span className="nest-c">{g.count}</span>
              </button>
              {cOpen[g.key] && (
              <div className="nest-b" id={"claims-" + g.key}>
              <table className="cltbl nt">
                <colgroup><col style={{ width: 14 }} /><col style={{ width: 32 }} />{COLS.map(([k, , w]) => <col key={k} style={{ width: w }} />)}</colgroup>
                {NESTED_HEADER && (
                  <thead>
                    <tr>
                      <th className="exp" />
                      <th className="sel"><Cb label={"Select all in " + g.status} checked={g.rows.length > 0 && gSel === g.rows.length} indeterminate={gSel > 0 && gSel < g.rows.length} onChange={() => onToggleGroup(g)} /></th>
                      {COLS.map(([k, l]) => <th key={k}>{l}</th>)}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {g.rows.map((r) => rowEl(r, false))}
                </tbody>
              </table>
              </div>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  };
  return (
    <div className="clwrap">
      <table className="cltbl" aria-busy={state === "loading"}>
        {!mine && (
          <thead>
            <tr>
              <th className="exp" />
              <th className="sel"><Cb label="Select all claims" checked={rows.length > 0 && nSel === rows.length} indeterminate={nSel > 0 && nSel < rows.length} disabled={state !== "live"} onChange={onToggleAll} /></th>
              {COLS.map(([k, l, w]) => <th key={k} style={{ minWidth: w, width: w }}>{l}</th>)}
              <th className="asg-h">Assignee</th>
            </tr>
          </thead>
        )}
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
          {state === "empty" && <tr className="clempty"><td colSpan={COLS.length + 3}><div className="empty"><SearchX size={20} /><b>{tab === "mine" ? (solvedAny ? "You are all caught up." : "No claims are assigned to you.") : "No claims match."}</b><span>{tab === "mine" ? (solvedAny ? "Claims you solve leave this list." : "Claims you assign to yourself show up here.") : "Try a different tab."}</span></div></td></tr>}
          {state === "live" && groups.map((g) => {
            const isOpen = !!open[g.key];
            const gSel = g.rows.filter((r) => sel.has(r.id)).length;
            return (
              <React.Fragment key={g.key}>
                <tr className={"clgrp" + (mine ? " nosel" : "") + (isOpen && mine ? " ctxopen" : "")}>
                  <td className="exp"><button className="ibtn" aria-label={isOpen ? "Collapse group" : "Expand group"} aria-expanded={isOpen} onClick={() => onOpen(g.key)}><ChevronDown size={18} className={isOpen ? "" : "rot"} /></button></td>
                  {!mine && <td className="sel"><Cb label={"Select all in " + g.status} checked={g.rows.length > 0 && gSel === g.rows.length} indeterminate={gSel > 0 && gSel < g.rows.length} onChange={() => onToggleGroup(g)} /></td>}
                  <td colSpan={mine ? COLS.length + 1 : COLS.length}>
                    <div className="clgin">
                      <Tag status={g.status} filled />
                      {g.shown.map((c, i) => Array.isArray(c)
                        ? <span key={i} className="chipset">{c.map((x) => <span key={x} className="chip">{x}</span>)}</span>
                        : <span key={c} className="chip">{c}</span>)}
                      <span className="chip amt"><Circle size={16} />{money(g.total)} | {g.count}</span>
                    </div>
                  </td>
                  <td className="asg-c">
                    {mine ? (
                      <span className="asgwrap hdr">
                        <button className="btn more" aria-label={"More actions for " + g.status + " group"} aria-haspopup="dialog" disabled={g.rows.length === 0} onClick={(e) => onMoreClick(e.currentTarget, g.rows.map((r) => r.id), g.rows.length)}>More actions<ChevronDown size={16} /></button>
                        <AssigneeStack dir={dir} ids={g.rows.map((r) => r.assignee).filter(Boolean)} />
                      </span>
                    ) : <AssigneeStack dir={dir} ids={g.rows.map((r) => r.assignee).filter(Boolean)} />}
                  </td>
                </tr>
                {isOpen && (mine ? nested(g, gSel) : g.rows.map((r) => rowEl(r)))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
const notifyNoop = (e) => e.stopPropagation();

/* Row "More actions": the two row-level actions that already exist in the Bulk Actions bar */
/* ---------- More actions: command palette (from the screen recording) ---------- */
const SINGLE = "Please select claims from a single patient.";
function paletteSections(n, single) {
  const cl = n === 1 ? "1 claim" : n + " claims", have = n === 1 ? "has" : "have", are = n === 1 ? "is" : "are";
  const sp = single ? null : SINGLE;
  return [
    { section: null, items: [
      { id: "submit", label: "Submit Claims", icon: Send },
      { id: "comment", label: "Comment on Claims", icon: MessageSquareText },
      { id: "ids", label: "Copy Claim IDs", icon: Copy },
      { id: "urls", label: "Copy Claim URLs", icon: Link2 },
      { id: "notbill", label: "Mark as Not Intended to Bill", icon: Archive, disabled: "Cannot mark as not intended to bill because " + cl + " " + have + " a submission that reached the payer." },
      { id: "bill", label: "Mark as Intended to Bill", icon: ArchiveRestore },
      { id: "assign", label: "Assign", icon: UserPlus, key: "A" },
      { id: "tag", label: "Tag", icon: TagIcon, key: "T" },
      { id: "adjust", label: "Adjust", icon: Receipt },
      { id: "pr", label: "Push to PR", icon: CircleDollarSign },
      { id: "next", label: "Push to Next Payer", icon: FolderUp },
      { id: "defer", label: "Defer", icon: Clock },
      { id: "undefer", label: "Cancel Deferral", icon: TimerOff, disabled: "Cannot cancel deferral because " + cl + " " + are + " not deferred." },
      { id: "forms", label: "Download Submission Forms", icon: Download },
      { id: "ai", label: "Ask Athelas AI", icon: Sparkles },
    ] },
    { section: "Insurances", items: [
      { id: "ins1", label: "Update Primary Insurance", icon: ShieldPlus, disabled: sp },
      { id: "ins2", label: "Update Secondary Insurance", icon: ShieldPlus, disabled: sp },
      { id: "ins3", label: "Update Tertiary Insurance", icon: ShieldPlus, disabled: sp },
    ] },
    { section: "Providers", items: [
      { id: "prov1", label: "Update Supervising Provider", icon: Stethoscope },
      { id: "prov2", label: "Update Referring Provider", icon: Stethoscope },
    ] },
    { section: "Prior Authorizations", items: [
      { id: "pa1", label: "Edit Primary Prior Authorization", icon: ShieldCheck, disabled: sp },
      { id: "pa2", label: "Edit Secondary Prior Authorization", icon: ShieldCheck, disabled: sp },
      { id: "pa3", label: "Edit Tertiary Prior Authorization", icon: ShieldCheck, disabled: sp },
    ] },
    { section: "Navigation", items: [
      { id: "recent", label: "See Recently Viewed Claims", icon: ArrowRight },
    ] },
  ];
}
function CommandPalette({ badge, n, single, onRun, onClose }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(null);
  const listRef = useRef(null);
  const term = q.trim().toLowerCase();
  const sections = paletteSections(n, single).map((sec) => ({ ...sec, items: sec.items.filter((i) => i.label.toLowerCase().includes(term)) })).filter((sec) => sec.items.length);
  const enabled = sections.flatMap((sec) => sec.items).filter((i) => !i.disabled);
  const cur = enabled.find((i) => i.id === active) || enabled[0] || null;
  useEffect(() => { const el = listRef.current && listRef.current.querySelector('[data-active="true"]'); if (el) el.scrollIntoView({ block: "nearest" }); }, [cur && cur.id]);
  const move = (d) => { if (!enabled.length) return; const i = Math.max(0, enabled.findIndex((x) => cur && x.id === cur.id)); setActive(enabled[(i + d + enabled.length) % enabled.length].id); };
  const onKey = (e) => {
    if (e.key === "Escape") { e.preventDefault(); onClose(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter" && cur) { e.preventDefault(); onRun(cur); }
  };
  return (
    <div className="pal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pal" role="dialog" aria-modal="true" aria-label="More actions" onKeyDown={onKey}>
        <div className="pal-h">
          <Search size={20} />
          <input autoFocus aria-label="Search commands" placeholder="Type a command or search..." value={q} onChange={(e) => { setQ(e.target.value); setActive(null); }} />
          <span className="pal-badge">{badge}</span>
        </div>
        <div className="pal-l" ref={listRef} role="listbox" aria-label="Commands">
          {sections.length === 0 && <div className="pal-none">No commands match "{q}".</div>}
          {sections.map((sec, si) => (
            <div key={si}>
              {sec.section && <div className="pal-sec">{sec.section}</div>}
              {sec.items.map((it) => {
                const I = it.icon, on = !!cur && cur.id === it.id;
                return (
                  <button key={it.id} role="option" aria-selected={on} aria-disabled={!!it.disabled} data-active={on} className={"pal-i" + (on ? " on" : "") + (it.disabled ? " dis" : "")}
                    onMouseMove={() => { if (!it.disabled && !on) setActive(it.id); }} onClick={() => { if (!it.disabled) onRun(it); }}>
                    <I size={20} />
                    <span className="pal-t"><span className="pal-n">{it.label}</span>{it.disabled && <span className="pal-r">{it.disabled}</span>}</span>
                    {on && !it.disabled ? <span className="pal-hint"><CornerDownLeft size={14} />Enter</span> : it.key ? <kbd className="pal-key">{it.key}</kbd> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
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

function BulkBar({ n, onAssign, onAsk, onMore, onClear }) {
  return (
    <div className="bulk" role="region" aria-label="Bulk actions">
      <span className="bulk-tab">Bulk Actions</span>
      <span className="bulk-n">{n} Selected</span>
      <span className="bulk-sep" />
      <button className="bulk-btn" data-assign-anchor onClick={(e) => onAssign(e.currentTarget)}><UserPlus size={16} />Assign</button>
      <button className="bulk-btn" onClick={onAsk}><Sparkles size={16} />Ask Athelas AI</button>
      <span className="tipwrap">
        <button className="bulk-btn bulk-more" aria-haspopup="dialog" onClick={(e) => onMore(e.currentTarget)}><Command size={16} />More Actions</button>
        <span className="tip" role="tooltip">More Actions <kbd>&#8984;</kbd><kbd>K</kbd></span>
      </span>
      <button className="bulk-x" aria-label="Clear selection" onClick={onClear}><X size={18} /></button>
    </div>
  );
}

function DemoSwitch({ value, onChange }) {
  return (
    <label className="demo">
      <span>Demo state</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Demo state">
        <option value="live">Live data</option><option value="loading">Loading</option><option value="empty">Empty</option><option value="error">Error</option>
      </select>
    </label>
  );
}

function ClaimsPage({ notify, claims, agents, assign, review, editProposal, sendChat, intent, clearIntent, goAgent, onLoadMore, solved, onSolve, onAccepted }) {
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
  const [fb, setFb] = useState({}); /* My Claims band: thumbs and Accept, per group */
  const [cOpen, setCOpen] = useState({}); /* My Claims: which groups have their Claims table expanded (all start collapsed) */
  const [menu, setMenu] = useState(null); /* row More actions: { anchor, claim } */

  useEffect(() => { setBusy(true); setSel(new Set()); setPop(null); setCard(null); setMenu(null); const t = setTimeout(() => setBusy(false), 650); return () => clearTimeout(t); }, [tab, demo]);

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
  const inTab = (c) => (tab === "mine" ? c.assignee === ME && !solved.includes(c.group) : tab === "under" ? false : true) && passAssignee(c);
  const groups = (tab === "mine" ? MY_GROUPS : GROUPS).map((g) => {
    const gi = ALL_GROUPS.indexOf(g);
    const rows = claims.filter((c) => c.group === g.key && inTab(c));
    const sum = rows.reduce((t, r) => t + r.amount, 0);
    if (tab === "mine") {
      const lost = claims.filter((c) => c.group === g.key && c.mine && c.assignee !== ME).length; /* your claims you handed to someone else */
      const base = Math.max(0, myTotalFor(g, gi) - lost), count = Math.max(base, rows.length);
      return { ...g, rows, myTotal: count, total: rows.length > base ? sum : myAmountFor(g, base), count: String(count) };
    }
    return { ...g, rows, myTotal: rows.length, total: fAssignee ? sum : g.amount, count: fAssignee ? String(rows.length) : g.count };
  }).filter((g) => g.rows.length || (tab === "mine" && !solved.includes(g.key) && Number(g.count) > 0));
  const state = demo !== "live" ? demo : busy ? "loading" : groups.length ? "live" : "empty";
  const rows = groups.flatMap((g) => g.rows);

  const toggle = (id) => setSel((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleGroup = (g) => setSel((p) => { const n = new Set(p); const all = g.rows.every((r) => n.has(r.id)); g.rows.forEach((r) => (all ? n.delete(r.id) : n.add(r.id))); return n; });
  const toggleAll = () => setSel((p) => (rows.every((r) => p.has(r.id)) ? new Set() : new Set(rows.map((r) => r.id))));
  const rect = (el) => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; };
  const [palette, setPalette] = useState(null); /* More actions: { ids, badge, anchor, fromBar } */
  const openPalette = (el, ids, badge, fromBar) => { setPop(null); setCard(null); setPalette({ ids, badge, anchor: rect(el), fromBar: !!fromBar }); };
  const copyText = (text) => { try { if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {}); } catch (e) { /* clipboard not available */ } };
  const runCommand = (item) => {
    const pl = palette; setPalette(null); if (!pl) return;
    const n = pl.ids.length;
    if (item.id === "assign") { setPop({ anchor: { ...pl.anchor, above: pl.fromBar }, ids: pl.ids, bulk: pl.fromBar }); return; }
    if (item.id === "ids") { copyText(pl.ids.join("\n")); notify("Copied " + n + (n === 1 ? " claim ID" : " claim IDs")); return; }
    if (item.id === "urls") { copyText(pl.ids.map((id) => "https://air.athelas.com/claims/" + id).join("\n")); notify("Copied " + n + (n === 1 ? " claim URL" : " claim URLs")); return; }
    notify();
  };
  /* Command K opens More Actions for the selected claims */
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && sel.size > 0) {
        const btn = document.querySelector(".bulk-more"); if (!btn) return;
        e.preventDefault(); openPalette(btn, [...sel], sel.size + " selected", true);
      }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [sel]);
  const openAssign = (el, ids, bulk) => { setCard(null); setPop({ anchor: { ...rect(el), above: !!bulk }, ids, bulk: !!bulk }); };
  const openAgent = (el, claim) => { setPop(null); setCard({ anchor: rect(el), claim }); };
  const pick = (agent, wasAll) => {
    const ids = pop.ids, n = ids.length;
    assign(ids, wasAll ? null : agent.id, false);
    notify(wasAll ? `Unassigned ${n} ${n === 1 ? "claim" : "claims"}` : `Assigned ${n} ${n === 1 ? "claim" : "claims"} to ${agent.name.replace(" (you)", "")}`);
    if (pop.bulk) setSel(new Set());
    setPop(null);
  };
  const onVote = (k, v) => setFb((p) => ({ ...p, [k]: { ...p[k], vote: p[k] && p[k].vote === v ? null : v } }));
  /* Accepting the suggested action solves every claim in the group: show "Accepted", then take the group off the worklist. The next group becomes the first one and opens. */
  const onAccept = (g) => {
    const n = Number(g.count), ids = claims.filter((c) => c.group === g.key).map((c) => c.id);
    const info = acceptInfo(g, g.rows);
    setFb((p) => ({ ...p, [g.key]: { ...p[g.key], accepted: true } }));
    notify("Solved " + n + (n === 1 ? " claim" : " claims") + ". " + (n === 1 ? "It is" : "They are") + " removed from My Claims. Nothing was sent in this prototype.");
    setTimeout(() => { onSolve(g.key); setSel((p) => new Set([...p].filter((x) => !ids.includes(x)))); onAccepted(info); }, 700);
  };
  const firstKey = tab === "mine" && groups.length ? groups[0].key : null;
  /* The first group opens by default, and opens again when another group becomes the first. The user can still close it. */
  useEffect(() => { if (firstKey) setOpen((o) => ({ ...o, [firstKey]: true })); }, [firstKey]);
  const panelClaim = CLAIMS_PANEL && panelId ? claims.find((c) => c.id === panelId) : null;

  return (
    <div className="clpage">
      {state === "error" && <div className="cl-err"><Banner>Claims could not be loaded.<button className="link" onClick={() => setDemo("live")}>Try again</button></Banner></div>}
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
      <ClaimsTable state={state} groups={state === "live" ? groups : []} sel={sel} open={open} tab={tab} dir={dir}
        onOpen={(k) => setOpen((o) => ({ ...o, [k]: !o[k] }))} onToggle={toggle} onToggleGroup={toggleGroup} onToggleAll={toggleAll}
        onAssignClick={(el, ids) => openAssign(el, ids, false)} onAgentClick={openAgent} onOpenClaim={setPanelId} canOpen={CLAIMS_PANEL} solvedAny={solved.length > 0} onMoreClick={(el, ids) => openPalette(el, ids, ids.length + (ids.length === 1 ? " claim" : " claims"), false)}
        fb={fb} onVote={onVote} onAccept={onAccept} onLoadMore={onLoadMore} notify={notify}
        cOpen={cOpen} onToggleClaims={(k) => setCOpen((o) => ({ ...o, [k]: !o[k] }))} />
      {sel.size > 0 && state === "live" && <BulkBar n={sel.size} onAssign={(el) => openAssign(el, [...sel], true)} onAsk={notify} onMore={(el) => openPalette(el, [...sel], sel.size + " selected", true)} onClear={() => { setSel(new Set()); setPop(null); }} />}
      {palette && <CommandPalette badge={palette.badge} n={palette.ids.length} onRun={runCommand} onClose={() => setPalette(null)}
        single={new Set(palette.ids.map((id) => (claims.find((c) => c.id === id) || {}).patient)).size === 1} />}
      {pop && <AssignPopover anchor={pop.anchor} ids={pop.ids} claims={claims} list={assignees} onPick={pick} onClose={() => setPop(null)} />}
      {card && <AgentCard anchor={card.anchor} agent={dir[card.claim.assignee]} claim={card.claim} onClose={() => setCard(null)}
        onOpen={() => { setCard(null); goAgent(card.claim.assignee); }}
        onChange={(e) => { const c = card; setCard(null); setPop({ anchor: { ...c.anchor, above: false }, ids: [c.claim.id], bulk: false }); }} />}
      {panelClaim && <ClaimPanel claim={panelClaim} dir={dir} onClose={() => setPanelId(null)} onReview={review} onEdit={editProposal} onChat={sendChat} goAgent={goAgent} />}
      <DemoSwitch value={demo} onChange={setDemo} />
    </div>
  );
}

/* ---------- Agent pages (layout follows the Claude Projects page) ---------- */

function InstructionsCard({ agent, onSave }) {
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState(agent.instructions);
  useEffect(() => { setText(agent.instructions); setEdit(false); }, [agent.id]);
  return (
    <section className="ag-sec">
      <div className="ag-h"><h2>Instructions</h2><button className="ibtn" aria-label={agent.instructions ? "Edit instructions" : "Add instructions"} onClick={() => setEdit(true)}>{agent.instructions ? <Pencil size={16} /> : <Plus size={18} />}</button></div>
      {edit ? (
        <>
          <textarea className="ag-ta" aria-label="Instructions" autoFocus value={text} onChange={(e) => setText(e.target.value)} rows={9} />
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

function AgentPage({ agent, claims, activity, dir, onUpdate, onRule, onApprove, onReview, onEdit, onChat, goClaims, notify }) {
  const [tab, setTab] = useState("tasks");
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
            <button role="tab" aria-selected={tab === "tasks"} className={"cl-tab" + (tab === "tasks" ? " on" : "")} onClick={() => setTab("tasks")}>Tasks ({mine.length})</button>
            <button role="tab" aria-selected={tab === "activity"} className={"cl-tab" + (tab === "activity" ? " on" : "")} onClick={() => setTab("activity")}>Activity</button>
          </div>
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
          <InstructionsCard agent={agent} onSave={(t) => onUpdate({ instructions: t })} />
          <RuleCard agent={agent} onRule={onRule} notify={notify} />
          <section className="ag-sec"><div className="ag-h"><h2>Memory</h2></div><p className="ag-muted">Memory will show here after the agent works a few claims.</p></section>
          <ContextCard agent={agent} onAdd={(n) => onUpdate({ context: [...agent.context, n] })} onRemove={(n) => onUpdate({ context: agent.context.filter((d) => d !== n) })} />
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

function HubPage({ agents, claims, activity, onOpen, onNew, onPause, onDelete }) {
  const [tab, setTab] = useState("all");
  const [del, setDel] = useState(null);
  const rows = agents.map((a) => ({ a, st: agentStatus(a, claims), s: agentStats(a, claims) }));
  const count = (k) => (k === "all" ? rows.length : rows.filter((r) => r.st.toLowerCase() === k).length);
  const ids = new Set(agents.map((a) => a.id));
  const weekAgo = Date.now() - 7 * 864e5;
  const actions = activity.filter((e) => ids.has(e.agentId) && e.t >= weekAgo).length;
  const approved = rows.reduce((n, r) => n + r.s.approved, 0);
  const mins = approved * MIN_PER_RESULT;
  const saved = mins >= 60 ? (mins / 60).toFixed(1) + " hrs" : mins + " min";
  const shown = rows.filter((r) => tab === "all" || r.st.toLowerCase() === tab);
  const stat = (icon, label, value, note) => (
    <div className="hub-stat"><span className="hub-ic">{icon}</span><span className="hub-sl">{label}</span><b>{value}</b>{note && <span className="hub-note">{note}</span>}</div>
  );
  return (
    <div className="hub">
      <div className="hub-top"><h1>Agents</h1><button className="btn primary" onClick={onNew}><FigIcon name="add" size={18} />New agent</button></div>
      <div className="hub-stats">
        {stat(<AgentEmblem size={20} animate={false} />, "Active agents", count("running") + "/" + rows.length)}
        {stat(<Zap size={18} />, "Actions taken (7d)", actions.toLocaleString())}
        {stat(<CircleCheck size={18} />, "Approved results", approved.toLocaleString())}
        {stat(<Clock size={18} />, "Time saved (est)", saved, MIN_PER_RESULT + " min per approved result")}
      </div>
      <div className="hub-tabs" role="tablist">
        {[["all", "All"], ["running", "Running"], ["paused", "Paused"], ["draft", "Draft"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={"cl-tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{l}{k === "all" ? "" : " (" + count(k) + ")"}</button>
        ))}
      </div>
      <div className="hub-grid">
        {shown.map(({ a, st, s: n }) => (
          <article key={a.id} className="hc" aria-label={a.name}>
            <div className="hc-h">
              <span className="hc-ic"><AgentEmblem size={24} /></span>
              <div className="hc-t"><b>{a.name}</b><span>{a.rule ? a.rule.payer + " claims" : "No rule yet"} &middot; {a.paused ? "Auto-assign paused" : a.rule && a.rule.on ? "Auto-assign on" : "Auto-assign off"}</span></div>
              <span className={"hc-st " + st.toLowerCase()}><i />{st}</span>
            </div>
            <div className="hc-b">
              <div className="hc-r"><span>Claims worked</span><b>{n.worked}</b></div>
              <div className="hc-r"><span>Ready for review</span><b className="acc">{n.ready}</b></div>
              <div className="hc-r"><span>Approved</span><b>{n.approved}</b></div>
              <div className="hc-f">
                <button className="btn" onClick={() => onPause(a)}>{a.paused ? <Play size={16} /> : <Pause size={16} />}{a.paused ? "Resume" : "Pause"}</button>
                <button className="btn" onClick={() => onOpen(a)}>Open</button>
                <span className="grow" />
                <button className="ibtn" aria-label={"Delete " + a.name} onClick={() => setDel(a)}><Trash2 size={18} /></button>
              </div>
            </div>
          </article>
        ))}
        {(tab === "all" || shown.length === 0) && (
          <button className="hc hc-new" onClick={onNew}><span className="hub-ic"><FigIcon name="add" size={18} /></span><b>Create new agent</b></button>
        )}
      </div>
      {del && (
        <Dialog title={"Delete " + del.name + "?"} confirmLabel="Delete agent" onConfirm={() => { onDelete(del); setDel(null); }} onCancel={() => setDel(null)}>
          <p>{agentStats(del, claims).worked} claims it worked go back to unassigned. This cannot be undone.</p>
        </Dialog>
      )}
    </div>
  );
}

const STARTERS = [
  { icon: ShieldCheck, text: "Work Medicare claims as a first pass" },
  { icon: Ban, text: "Suggest fixes for denied claims" },
  { icon: FilePlus, text: "Draft secondary claims for Medicaid" },
  { icon: Wallet, text: "Suggest postings for payments" },
];
const FOLLOWUPS = ["Check the payer portal first", "Only work Medicare claims", "Send every result to me for review"];

function DraftCard({ icon: I, title, desc, children }) {
  return (
    <section className="tcard">
      <div className="tcard-h"><span className="tcard-i"><I size={18} /></span><div><h3>{title}</h3><p>{desc}</p></div></div>
      {children && <div className="tcard-b">{children}</div>}
    </section>
  );
}

/* ---------- After Accept: offer to build an agent for that action ---------- */
const segText = (arr) => arr.map((x) => (typeof x === "string" ? x : x.link || x.bold || "")).join("");
function acceptInfo(g, rows) {
  const b = bandFor(g, rows);
  const chips = GROUP_BY_KEY[g.key].chips.flat();
  return {
    title: b.title, status: g.status, count: Number(g.count) || 1,
    payer: g.payer ? tcase(g.payer) : "", payerGroup: g.payer ? payerGroup(g.payer) : null,
    reason: chips.slice(g.payer ? 1 : 0).filter((x) => !isCode(x)).join(" / "),
    suggestion: segText(b.suggestion), next: segText(b.next),
  };
}
/* A ready draft for the agent builder, made from the action the user just accepted */
function seedFromAction(info, taken) {
  const noun = info.count === 1 ? "claim" : "claims";
  const base = info.title.replace(/ from .*/, "") + " Agent";
  let name = base, k = 2;
  while (taken.includes(name)) name = base + " " + k++;
  const from = info.payer ? " from " + info.payer : "";
  const shortReason = info.reason.length > 60 ? info.reason.slice(0, 57) + "..." : info.reason;
  const scope = [info.payer, shortReason].filter(Boolean).join(", ");
  /* instructions describe the work in general, not today's counts */
  const general = info.suggestion.replace(/ The same change applies to all \d+ claims in this group\./, "").replace(/^We reviewed all \d+ claims after they were rejected for coverage-related reasons\. /, "").replace(/\ball \d+ claims\b/g, "the claims").replace(/\bthis claim\b/g, "the claim");
  const docs = info.status === "Payment Posting" ? ["Contract and fee schedule", "Remittance posting SOP"] : info.status === "Rejections" ? ["Payer policies", "Insurance detection guide"] : ["Payer policies", "Appeals guide"];
  const rule = info.payerGroup ? { payer: info.payerGroup, on: false } : null;
  const lines = [BASE_LINE, "Work claims in " + info.status + (scope ? " (" + scope + ")" : "") + ".", "Do this: " + general, "Prepare claims with the same cause together, oldest first.", UNSURE_LINE];
  return {
    id: Date.now(),
    text: "Build an agent that does \"" + info.title + "\" on " + info.status + " claims" + from + ".",
    reply: "Here is a draft built from the action you just accepted. You used \"" + info.title + "\" on " + info.count + " " + noun + from + ". I added the instructions and suggested context" + (rule ? ", and an auto-assign rule for " + rule.payer + " claims that stays off until you turn it on." : ".") + " Change anything on the right, then create the agent.",
    draft: { name, description: info.title + " for " + info.status + " claims" + from + ".", instructions: lines.join("\n"), context: docs, rule, fromAction: info.title },
  };
}
function AgentOffer({ info, onBuild, onLater }) {
  return (
    <section className="offer" role="region" aria-label="Build an agent">
      <button className="ibtn offer-x" aria-label="Dismiss" onClick={onLater}><X size={16} /></button>
      <div className="offer-h"><span className="offer-i"><AgentEmblem size={26} /></span><h3>Build an agent for this?</h3></div>
      <p>You solved {info.count} {info.count === 1 ? "claim" : "claims"} with &ldquo;{info.title}&rdquo;. An agent can prepare this for you next time and send each result to you for review.</p>
      <div className="offer-b"><button className="btn primary" onClick={onBuild}>Build agent</button><button className="btn" onClick={onLater}>Not now</button></div>
    </section>
  );
}

function AgentBuilder({ agents, onCreate, onCancel, seed }) {
  const [msgs, setMsgs] = useState(seed ? [{ from: "you", text: seed.text }, { from: "bot", text: seed.reply }] : []);
  const [draft, setDraft] = useState(seed ? seed.draft : null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [doc, setDoc] = useState("");
  const endRef = useRef(null);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ block: "end" }); }, [msgs.length, busy]);
  const taken = agents.map((a) => a.name);
  const send = (v) => {
    const t = (typeof v === "string" ? v : text).trim();
    if (!t || busy) return;
    setText(""); setMsgs((m) => [...m, { from: "you", text: t }]); setBusy(true);
    setTimeout(() => { if (!alive.current) return; const r = draftFrom(t, taken, draft); setDraft(r.draft); setMsgs((m) => [...m, { from: "bot", text: r.reply }]); setBusy(false); }, 800);
  };
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const off = !draft;
  return (
    <div className="bld">
      <section className="bld-main">
        <div className="bld-scroll">
          {msgs.length === 0 ? (
            <div className="bld-hero">
              <span className="bld-tile"><AgentEmblem size={56} /></span>
              <span className="bld-hello">Hello, Lena</span>
              <h1 className="bld-h">What should your new agent work on?</h1>
              <div className="bld-starters">
                {STARTERS.map((o) => <button key={o.text} className="bld-st" onClick={() => send(o.text)}><span className="bld-sti"><o.icon size={18} /></span>{o.text}</button>)}
              </div>
            </div>
          ) : (
            <div className="bld-thread" aria-live="polite">
              {msgs.map((m, i) => <div key={i} className={"bld-m " + m.from}>{m.from === "bot" && <AgentEmblem size={20} animate={false} />}<span>{m.text}</span></div>)}
              {busy && <div className="bld-m bot"><AgentEmblem size={20} /><span className="muted">Drafting</span></div>}
              <span ref={endRef} />
            </div>
          )}
        </div>
        <div className="bld-foot">
          {msgs.length > 0 && !busy && <div className="bld-chips">{FOLLOWUPS.map((f) => <button key={f} className="bld-chip" onClick={() => send(f)}>{f}</button>)}</div>}
          <div className="bld-in">
            <input aria-label="Describe the agent" placeholder="Describe what the agent should do" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} />
            <button className="send" aria-label="Send" disabled={!text.trim() || busy} onClick={() => send()}><ArrowUp size={18} /></button>
          </div>
          <p className="bld-note">The builder can make mistakes. Check the draft before you create the agent.</p>
        </div>
      </section>
      <aside className="bld-side" aria-label="Agent draft">
        <div className="bld-sh"><button className="ibtn" aria-label="Back to Agents" onClick={onCancel}><ArrowLeft size={18} /></button><b>Agent draft</b></div>
        <div className="bld-sc">
          <DraftCard icon={Pencil} title="Name" desc={off ? "Filled in once you describe the agent." : "What people see in the nav and the hub."}>
            {draft && <input className="bld-f" aria-label="Agent name" value={draft.name} onChange={(e) => set({ name: e.target.value })} />}
          </DraftCard>
          <DraftCard icon={ClipboardCheck} title="Instructions" desc={off ? "How the agent works a claim." : "One instruction per line."}>
            {draft && <textarea className="ag-ta" aria-label="Instructions" rows={9} value={draft.instructions} onChange={(e) => set({ instructions: e.target.value })} />}
          </DraftCard>
          <DraftCard icon={FileText} title="Context" desc={off ? "Documents the agent should know." : "Suggested from your description."}>
            {draft && (
              <>
                {draft.context.length > 0 && <ul className="ag-docs">{draft.context.map((d) => <li key={d}><FileText size={16} /><span>{d}</span><button className="ibtn rm" aria-label={"Remove " + d} onClick={() => set({ context: draft.context.filter((x) => x !== d) })}><X size={16} /></button></li>)}</ul>}
                <div className="ag-add"><input aria-label="Add a document" placeholder="Add a document" value={doc} onChange={(e) => setDoc(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && doc.trim()) { set({ context: [...draft.context, doc.trim()] }); setDoc(""); } }} /><button className="btn" disabled={!doc.trim()} onClick={() => { set({ context: [...draft.context, doc.trim()] }); setDoc(""); }}>Add</button></div>
              </>
            )}
          </DraftCard>
          <DraftCard icon={Users} title="Auto-assign" desc={off ? "Send matching claims to the agent." : "Off until you turn it on."}>
            {draft && (
              <div className="bld-rule">
                <select aria-label="Payer group" value={draft.rule ? draft.rule.payer : ""} onChange={(e) => set({ rule: e.target.value ? { payer: e.target.value, on: draft.rule ? draft.rule.on : false } : null })}>
                  <option value="">No rule</option>{PAYER_GROUPS.map((g) => <option key={g} value={g}>{g} claims</option>)}
                </select>
                <button className={"sw" + (draft.rule && draft.rule.on ? " on" : "")} role="switch" aria-checked={!!(draft.rule && draft.rule.on)} aria-label="Auto-assign" disabled={!draft.rule} onClick={() => set({ rule: { ...draft.rule, on: !draft.rule.on } })}><span /></button>
              </div>
            )}
          </DraftCard>
        </div>
        <div className="bld-sf"><button className="btn" onClick={onCancel}>Cancel</button><button className="btn primary" disabled={!draft || !draft.name.trim()} onClick={() => onCreate(draft)}>Create agent</button></div>
      </aside>
    </div>
  );
}

/* ---------- App ---------- */


export default function App() {
  const [page, setPage] = useState("claims"); /* first screen: Claims, My Claims tab */
  const [navOff, setNavOff] = useState(false);
  const [msg, setMsg] = useState("");
  const [agents, setAgents] = useState(SEED_AGENTS);
  const [seed] = useState(seedState);
  const [claims, setClaims] = useState(seed.claims);
  const [activity, setActivity] = useState(seed.activity);
  const [intent, setIntent] = useState(null);
  const [solved, setSolved] = useState([]); /* My Claims groups the user has solved */
  const [offer, setOffer] = useState(null); /* the "build an agent for this?" prompt */
  const [asked, setAsked] = useState([]); /* actions we already asked about, so we ask once */
  const [builderSeed, setBuilderSeed] = useState(null);
  const claimsRef = useRef(claims);
  claimsRef.current = claims;
  const pausedRef = useRef(new Set());
  const timer = useRef(null);
  const notify = (m) => { setMsg(typeof m === "string" ? m : "Not part of this demo"); clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(""), 2800); };
  useEffect(() => () => clearTimeout(timer.current), []);
  const go = (it) => { if (it.page) setPage(it.page); else notify(); };

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
      const ids = claims.filter((c) => !c.mine && payerGroup(c.payer) === rule.payer && c.assignee !== agent.id).map((c) => c.id);
      if (ids.length) assign(ids, agent.id, true, `Assigned by the ${rule.payer} rule`);
      notify(ids.length ? `Assigned ${ids.length} ${rule.payer} ${ids.length === 1 ? "claim" : "claims"} to ${agent.name}` : `Auto-assign is on for ${rule.payer} claims`);
    } else notify("Auto-assign is off. Claims already assigned stay with " + agent.name);
  };
  const loadMore = (g, n) => setClaims((p) => {
    const gi = ALL_GROUPS.findIndex((x) => x.key === g.key);
    const start = p.filter((c) => c.group === g.key).reduce((m, c) => Math.max(m, c.idx == null ? -1 : c.idx), -1) + 1;
    return [...p, ...Array.from({ length: n }, (_, i) => makeClaimFor(ALL_GROUPS[gi], gi, start + i, true))];
  });
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
  const onAccepted = (info) => { if (asked.includes(info.title) || agents.some((a) => a.fromAction === info.title)) return; setOffer(info); };
  const buildFromOffer = () => { const info = offer; setAsked((p) => [...p, info.title]); setBuilderSeed(seedFromAction(info, agents.map((a) => a.name))); setOffer(null); setPage("agent:new"); };
  const laterOffer = () => { setAsked((p) => [...p, offer.title]); setOffer(null); };
  useEffect(() => { if (page !== "agent:new") setBuilderSeed(null); }, [page]);
  const create = (d) => {
    const a = { id: "ag" + Date.now(), fromAction: d.fromAction, name: d.name.trim(), init: initials(d.name), description: d.description, instructions: d.instructions, context: d.context, rule: d.rule ? { ...d.rule, on: false } : null, paused: false };
    setAgents((p) => [...p, a]); setPage("agent:" + a.id);
    if (d.rule && d.rule.on) { setTimeout(() => setRule(a, { ...d.rule, on: true }), 0); }
    else notify(`Created ${a.name}`);
  };
  const togglePause = (a) => { update(a.id, { paused: !a.paused }); notify(a.paused ? `Resumed ${a.name}` : `Paused ${a.name}. Its work waits until you resume.`); };
  const removeAgent = (a) => {
    const n = claims.filter((c) => c.work && c.work.agentId === a.id || c.assignee === a.id).length;
    setClaims((p) => p.map((c) => (c.assignee === a.id || (c.work && c.work.agentId === a.id) ? { ...c, assignee: c.assignee === a.id ? null : c.assignee, auto: false, work: null } : c)));
    setAgents((p) => p.filter((x) => x.id !== a.id));
    if (page === "agent:" + a.id) setPage("agents");
    notify(`Deleted ${a.name}. ${n} ${n === 1 ? "claim is" : "claims are"} unassigned.`);
  };
  const goClaims = (assignee, claim) => { setIntent({ assignee, claim, n: Date.now() }); setPage("claims"); };
  const readyCounts = Object.fromEntries(agents.map((a) => [a.id, claims.filter((c) => c.assignee === a.id && c.work && c.work.state === "ready").length]));

  const dir = Object.fromEntries([...AGENTS, ...agents.map(toAssignee)].map((a) => [a.id, a]));
  const agent = page.startsWith("agent:") && page !== "agent:new" ? agents.find((a) => "agent:" + a.id === page) : null;
  const crumb = page === "agents" ? ["Agents", "Hub"] : page === "agent:new" ? ["Agents", "New agent"] : agent ? ["Agents", agent.name] : ["Claims"];

  return (
    <div className="app">
      <style>{CSS}</style>
      <AgentGradient />
      <div className={"shell" + (navOff ? " navoff" : "")}>
        <SideNav page={page} onGo={go} notify={notify} agents={agents} readyCounts={readyCounts} />
        <div className="rightcol">
          <TopBar navOff={navOff} onToggleNav={() => setNavOff(!navOff)} crumb={crumb} notify={notify} />
          <main className="canvas">
            {page === "claims" && <ClaimsPage notify={notify} claims={claims} agents={agents} assign={assign} review={review} editProposal={editProposal} sendChat={sendChat} intent={intent} clearIntent={() => setIntent(null)} goAgent={(id) => setPage("agent:" + id)} onLoadMore={loadMore} solved={solved} onSolve={(k) => setSolved((p) => (p.includes(k) ? p : [...p, k]))} onAccepted={onAccepted} />}
            {agent && <AgentPage key={agent.id} agent={agent} claims={claims} activity={activity} onUpdate={(patch) => update(agent.id, patch)} onRule={(r) => setRule(agent, r)} onApprove={(ids) => review(ids, "approved")} onReview={review} onEdit={editProposal} onChat={sendChat} dir={dir} goClaims={goClaims} notify={notify} />}
            {page === "agents" && <HubPage agents={agents} claims={claims} activity={activity} onOpen={(a) => setPage("agent:" + a.id)} onNew={() => setPage("agent:new")} onPause={togglePause} onDelete={removeAgent} />}
            {page === "agent:new" && <AgentBuilder key={builderSeed ? builderSeed.id : "blank"} seed={builderSeed} agents={agents} onCreate={create} onCancel={() => setPage("agents")} />}
          </main>
        </div>
      </div>
      {offer && <AgentOffer info={offer} onBuild={buildFromOffer} onLater={laterOffer} />}
      {msg && <div className="toast" role="status">{msg}</div>}
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
--shadow-sticky:rgba(0,0,0,.12);--danger:#b52b2b;--danger-sub:rgba(181,43,43,.1);--info:#416bcf;--info-sub:rgba(65,107,207,.1);--info-bd:rgba(65,107,207,.4);--neutral-sub:rgba(89,89,89,.1);--success:#2a9953;--em-orange:#c27023;--em-blue:#405bf2;--em-green:#2a9953;--em-purple:#ae42b0;--ai-from:#f9fafe;--ai-to:#edf0ff;--scrim:rgba(0,0,0,.45);--orange:#c27023;--orange-sub:rgba(194,112,35,.1);--pop-shadow:rgba(0,0,0,.18);--scrim:rgba(0,0,0,.35);
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
.cltbl .asg-h,.cltbl .asg-c{position:sticky;right:0;z-index:2;width:108px;min-width:108px;padding:0 8px;box-shadow:-6px 0 8px -6px var(--shadow-sticky);text-align:center}
.cltbl th.asg-h{z-index:4;border-right:0}
.cltbl td.asg-c .bar{margin:0 auto}
.clgrp td{height:45px;padding:0;background-color:var(--base)}
.asgwrap{display:inline-flex;align-items:center;gap:2px}
.ibtn.more{color:var(--fg2)}.ibtn.more:disabled{opacity:.4}
.asgwrap.hdr{gap:8px}
.clgrp.nosel .clgin{max-width:calc(100vw - 600px)}
.btn.more{padding:0 10px 0 12px;white-space:nowrap}.btn.more:hover:not(:disabled){background:var(--d5)}.btn.more:disabled{opacity:.4;cursor:default}
.rmenu{position:fixed;z-index:60;min-width:196px;padding:4px;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);box-shadow:0 8px 24px var(--pop-shadow)}
.rmenu button{display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 10px;border:0;border-radius:var(--r-semi);background:transparent;color:var(--fg1);text-align:left}
.rmenu button:hover{background:var(--d5)}.rmenu svg{color:var(--fg2)}

/* More actions: command palette */
.tipwrap{position:relative;display:inline-flex}
.tip{position:absolute;bottom:calc(100% + 14px);left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:6px;padding:8px 10px 8px 14px;background:var(--toast-bg);color:var(--toast-fg);border-radius:var(--r-soft);white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s;z-index:14}
.tip kbd{min-width:22px;height:22px;padding:0 5px;display:inline-grid;place-items:center;background:var(--base);color:var(--fg1);border-radius:var(--r-semi);font:inherit;font-size:12px}
.tipwrap:hover .tip,.tipwrap:focus-within .tip{opacity:1}
.pal-scrim{position:fixed;inset:0;z-index:80;background:var(--scrim);display:flex;align-items:center;justify-content:center;padding:24px}
.pal{width:min(600px,100%);max-height:min(520px,calc(100vh - 48px));display:flex;flex-direction:column;background:var(--base);border-radius:var(--r-extra);box-shadow:0 16px 48px var(--pop-shadow);overflow:hidden}
.pal-h{display:flex;align-items:center;gap:12px;padding:0 16px;height:56px;flex:none;border-bottom:1px solid var(--bs);color:var(--fg2)}
.pal-h input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:16px;color:var(--fg1)}.pal-h input::placeholder{color:var(--fg3)}
.pal-h input:focus-visible{outline:none}
.pal-badge{padding:4px 10px;border-radius:var(--r-soft);background:var(--d5);color:var(--fg1);white-space:nowrap}
.pal-l{flex:1;min-height:0;overflow:auto;padding:4px 16px 12px 16px}
.pal-l::-webkit-scrollbar{width:8px}.pal-l::-webkit-scrollbar-thumb{background:var(--bst);border-radius:4px}
.pal-sec{padding:14px 12px 4px;color:var(--fg3);font-size:14px}
.pal-i{display:flex;align-items:center;gap:12px;width:100%;min-height:42px;padding:8px 12px;border:0;border-radius:var(--r-soft);background:transparent;color:var(--fg1);text-align:left;font-size:15px}
.pal-i.on{background:var(--d5)}
.pal-i svg{flex:none;color:var(--fg2)}
.pal-t{flex:1;min-width:0;display:flex;flex-direction:column}
.pal-r{margin-top:2px;color:var(--fg3);font-size:13px;line-height:1.4}
.pal-i.dis{cursor:not-allowed}.pal-i.dis .pal-n,.pal-i.dis svg{color:var(--fg3)}
.pal-hint{display:inline-flex;align-items:center;gap:4px;color:var(--fg2);font-size:13px;white-space:nowrap}
.pal-key{min-width:24px;height:24px;padding:0 6px;display:inline-grid;place-items:center;border:1px solid var(--bst);border-radius:var(--r-semi);background:var(--base);color:var(--fg1);font:inherit;font-size:12px}
.pal-none{padding:32px 12px;color:var(--fg3);text-align:center}


/* build-an-agent offer, shown after Accept */
.offer{position:fixed;right:24px;bottom:72px;z-index:70;width:360px;padding:16px;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-card);box-shadow:0 12px 32px var(--pop-shadow);animation:offer-in .22s ease-out}
.offer h3{margin:0;font-size:14px;font-weight:500}
.offer p{margin:10px 0 14px;color:var(--fg2);line-height:1.5}
.offer-h{display:flex;align-items:center;gap:10px;padding-right:28px}
.offer-i{width:36px;height:36px;border-radius:var(--r-soft);border:1px solid var(--bs);display:grid;place-items:center;flex:none}
.offer-x{position:absolute;top:10px;right:10px}
.offer-b{display:flex;gap:8px}
@keyframes offer-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.offer{animation:none}}

.ibtn:disabled{cursor:default;opacity:1}.ibtn:disabled:hover{background:transparent}
.clgrp.nosel .clgin{left:36px;padding-left:4px}
.clgrp td.asg-c{padding:0 8px}.clgrp td.exp .ibtn{margin:0 auto}
.clgin{position:sticky;left:76px;display:flex;align-items:center;gap:8px;height:45px;padding:0;width:max-content;max-width:calc(100vw - 460px)}
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
.chip.amt{background:var(--neutral-sub);flex:none}.tag.filled,.chipset{flex:none}
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
.hub{max-width:1240px;margin:0 auto;padding:32px 40px 56px}
.hub-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.hub-top h1{font-size:20px;font-weight:600;margin:0}
.hub-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:24px}
.hub-stat{border:1px solid var(--bs);border-radius:var(--r-card);padding:16px 20px;display:flex;flex-direction:column}
.hub-ic{width:36px;height:36px;border-radius:50%;border:1px solid var(--bs);display:grid;place-items:center;margin-bottom:16px;color:var(--fg1);background:var(--base)}
.hub-sl{color:var(--fg3)}.hub-stat b{font-size:24px;font-weight:600;line-height:1.3;letter-spacing:-.01em}.hub-note{color:var(--fg3);font-size:12px;margin-top:2px}
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

/* My Claims context band and framed table */
.clctx td{padding:0;border-bottom:1px solid var(--bs);background-color:var(--base);white-space:normal}
.ctxwrap{display:flex;flex-direction:column;gap:10px;padding:8px 12px 12px;contain:inline-size}
.clgrp.ctxopen td{border-bottom:0}
.band{display:flex;background:linear-gradient(180deg,var(--ai-from),var(--ai-to));border:1px solid var(--bs);border-radius:var(--r-extra);padding:8px 0}
.bcard{flex:1 1 0;min-width:0;padding:0 16px;display:flex;flex-direction:column;white-space:normal}
.bcard + .bcard{border-left:1px solid var(--bs)}
.bcard h3{margin:0;font-size:13px;font-weight:500;color:var(--fg1);line-height:21px}
.bcard p{margin:0 0 8px;color:var(--fg2);line-height:21px;display:block;text-wrap:pretty;overflow-wrap:break-word}.bcard p:last-child{margin-bottom:0}
.xlink{color:var(--fg-accent);cursor:pointer;text-decoration:none}.xlink:hover{text-decoration:underline;text-underline-offset:2px}.xlink svg{display:inline-block;margin-left:2px;vertical-align:-1px}.nw{white-space:nowrap}
.b-head{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin:2px 0 6px}
.b-upd{display:inline-flex;align-items:center;gap:2px}.b-upd b{font-weight:500;color:var(--fg1);margin-right:4px}
.vbtn{width:24px;height:24px;border:0;border-radius:var(--r-soft);background:transparent;color:var(--fg2);display:grid;place-items:center;padding:0}.vbtn:hover{background:var(--d5)}.vbtn.on{background:var(--accent-sub);color:var(--fg-accent)}
.b-acts{display:inline-flex;align-items:center;gap:2px}
.btn.tert{border-color:transparent;background:transparent;color:var(--fg-accent)}.btn.tert:hover{background:var(--accent-sub-h)}
.btn.sec{background:transparent;border-color:var(--accent);color:var(--fg-accent)}.btn.sec:hover:not(:disabled){background:var(--accent-sub-h)}.btn.sec:disabled{opacity:1;cursor:default}
.b-div{height:1px;background:var(--bs);margin:8px 0}
.b-chg{display:flex;flex-wrap:wrap;gap:4px;align-items:center}.b-chg b{font-weight:500;color:var(--fg1);margin-right:4px}
.b-foot{display:flex;margin-top:8px}.b-foot .btn{margin-left:-14px}
.b-strong{font-weight:500;color:var(--fg1)}
.b-chip{display:inline-flex;align-items:center;min-height:28px;padding:3px 8px;background:var(--base);border-radius:var(--r-soft);color:var(--fg1);white-space:normal;max-width:100%;line-height:20px}.b-chip s{color:var(--fg2);margin:0 4px}
.nest{border:1px solid var(--bs);border-radius:var(--r-soft);overflow:clip;contain:inline-size;width:100%}
.nest-h{display:flex;align-items:center;gap:8px;width:100%;height:40px;padding:0 12px 0 8px;border:0;background:var(--base);color:var(--fg1);text-align:left;cursor:pointer}
.nest-h:hover{background:var(--d5)}
.nest-h svg{flex:none;color:var(--fg2);transition:transform .12s}.nest-h svg.rot{transform:rotate(-90deg)}
.nest-t{font-weight:500}
.nest-c{min-width:24px;height:20px;padding:0 6px;border-radius:var(--r-full);background:var(--neutral-sub);color:var(--fg1);font-size:12px;line-height:20px;text-align:center}
.nest-b{overflow:auto;container-type:inline-size;border-top:1px solid var(--bs)}
.nt{width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;min-width:0}
.nt th:not(.asg-h){position:static}
.nt th.exp,.nt td.exp{width:14px;min-width:14px;padding:0}
.nt th.sel,.nt td.sel{width:32px;min-width:32px}
.nt td,.nt th{overflow:hidden;text-overflow:ellipsis}
.nt .loadrow td{height:36px;padding:0;border-bottom:0;overflow:visible}
.loadin{position:sticky;left:0;width:100cqw;height:36px;display:flex;align-items:center;justify-content:center}
@media (max-width:1100px){.band{flex-direction:column}.bcard + .bcard{border-left:0;border-top:1px solid var(--bs);margin-top:12px;padding-top:12px}}

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
`;
