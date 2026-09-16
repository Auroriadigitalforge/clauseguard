export interface GlossaryTerm {
  id: string;
  term: string;
  category:
    | 'Liability & Risk'
    | 'Intellectual Property'
    | 'Termination & Renewal'
    | 'Payment & Financial'
    | 'Dispute Resolution'
    | 'General Boilerplate';
  formalLegalese: string;
  plainEnglish: string;
  whyItMatters: string;
  typicalClauseSnippet: string;
  negotiationTip: string;
  riskTier: 'SAFE' | 'CAUTION' | 'HIDDEN_TRAP';
  detectionPatterns: RegExp[];
}

export const GLOSSARY_CATEGORIES = [
  'All',
  'In This Document',
  'Liability & Risk',
  'Termination & Renewal',
  'Intellectual Property',
  'Payment & Financial',
  'Dispute Resolution',
  'General Boilerplate',
] as const;

export type GlossaryCategory = (typeof GLOSSARY_CATEGORIES)[number];

export const LEGAL_GLOSSARY: GlossaryTerm[] = [
  {
    id: 'indemnification',
    term: 'Indemnification (Hold Harmless)',
    category: 'Liability & Risk',
    riskTier: 'HIDDEN_TRAP',
    formalLegalese:
      'An agreement where one party promises to absorb the legal defense costs and financial liabilities incurred by another party in third-party claims.',
    plainEnglish:
      'You promise to pay the other party’s legal bills, court fees, and damage awards if someone sues them over your work, behavior, or presence.',
    whyItMatters:
      'If asymmetrical, you could face devastating out-of-pocket financial liability for lawsuits, even if the other company was partially at fault.',
    typicalClauseSnippet:
      '"Contractor shall defend, indemnify, and hold harmless Client from and against any and all claims, losses, damages, liabilities, and expenses (including attorneys\' fees)..."',
    negotiationTip:
      'Always demand that indemnification be strictly reciprocal (mutual), limited to direct damages caused by your gross negligence, and capped at total fees paid under the contract.',
    detectionPatterns: [
      /indemnif/i,
      /hold\s+harmless/i,
      /defend,\s+indemnify/i,
    ],
  },
  {
    id: 'liquidated-damages',
    term: 'Liquidated Damages',
    category: 'Payment & Financial',
    riskTier: 'CAUTION',
    formalLegalese:
      'A contractually predetermined sum of money that one party must pay if they breach a specific obligation, set without requiring proof of actual financial loss.',
    plainEnglish:
      'A pre-set cash fine you must pay immediately if you break a rule or miss a deadline, regardless of whether the other party actually lost any money.',
    whyItMatters:
      'Often weaponized as punitive fees (e.g. $500 for breaking a house rule or terminating early) rather than a realistic reflection of real damages.',
    typicalClauseSnippet:
      '"Tenant agrees that in the event of an unauthorized pet or late vacation, Tenant shall pay liquidated damages of $150 per day as a reasonable estimate of Landlord\'s administrative cost."',
    negotiationTip:
      'Courts frequently strike down liquidated damages if they constitute a penalty rather than a genuine pre-estimate of loss. Request a 5-day cure window before damages accrue.',
    detectionPatterns: [
      /liquidated\s+damages/i,
      /penalty\s+of\s+\$?\d+/i,
    ],
  },
  {
    id: 'automatic-renewal',
    term: 'Automatic Renewal (Evergreen Clause)',
    category: 'Termination & Renewal',
    riskTier: 'HIDDEN_TRAP',
    formalLegalese:
      'A contractual provision by which the agreement automatically extends its duration for another recurring term unless explicit cancellation notice is submitted within a strict window.',
    plainEnglish:
      'The contract quietly locks you in for another full year (or billing cycle) unless you send a formal cancellation notice months in advance.',
    whyItMatters:
      'Missing the narrow cancellation window by even a single day can legally trap you into 12 more months of rent payments or subscription fees.',
    typicalClauseSnippet:
      '"This Agreement shall automatically renew for successive twelve (12) month periods unless either party delivers written notice of non-renewal by certified mail at least sixty (60) days prior to expiration."',
    negotiationTip:
      'Insist on mutual written opt-in for renewals, or stipulate that notice can be delivered via standard email at least 30 days prior, without certified mail hurdles.',
    detectionPatterns: [
      /automatic\s+renewal/i,
      /renew(s)?\s+automatically/i,
      /evergreen/i,
      /successive\s+(one-year|twelve|12|annual)\s+(terms|periods)/i,
      /shall\s+automatically\s+renew/i,
    ],
  },
  {
    id: 'binding-arbitration',
    term: 'Binding Mandatory Arbitration',
    category: 'Dispute Resolution',
    riskTier: 'CAUTION',
    formalLegalese:
      'A dispute resolution clause requiring disputes to be resolved by a private arbitrator rather than through public courts and jury proceedings.',
    plainEnglish:
      'You give up your constitutional right to take a dispute to a public judge or jury, agreeing to use a private corporate referee whose decision is final.',
    whyItMatters:
      'Arbitration is private, restricts discovery of evidence, limits appeals, and research shows repeat-player corporations win significantly more often.',
    typicalClauseSnippet:
      '"Any dispute, claim, or controversy arising out of or relating to this Agreement shall be determined by binding arbitration administered by the American Arbitration Association (AAA)..."',
    negotiationTip:
      'Preserve the right for either party to bring small individual disputes in local Small Claims Court, or check for a 30-day post-signing opt-out right.',
    detectionPatterns: [
      /binding\s+arbitration/i,
      /arbitrator/i,
      /american\s+arbitration\s+association/i,
      /jams/i,
    ],
  },
  {
    id: 'class-action-waiver',
    term: 'Class Action Waiver',
    category: 'Dispute Resolution',
    riskTier: 'HIDDEN_TRAP',
    formalLegalese:
      'A waiver barring parties from initiating or joining collective, aggregated, or class action litigation against the counterparty.',
    plainEnglish:
      'You promise that you will only ever fight legal battles completely alone, never teaming up with other affected customers or tenants.',
    whyItMatters:
      'Makes it economically impossible to challenge widespread small unfair fees ($20-$50) that collectively net a company millions.',
    typicalClauseSnippet:
      '"You agree that any arbitration or proceeding shall be limited to the dispute between us individually, and you waive any right to bring or participate in a class, representative, or private attorney general action."',
    negotiationTip:
      'Standard in consumer and employment agreements, but always check whether applicable local state laws (like California PAGA) protect your right to collective redress.',
    detectionPatterns: [
      /class\s+action\s+waiver/i,
      /representative\s+action/i,
      /class\s+or\s+consolidated/i,
      /private\s+attorney\s+general/i,
    ],
  },
  {
    id: 'work-made-for-hire',
    term: 'Work Made for Hire (IP Assignment)',
    category: 'Intellectual Property',
    riskTier: 'HIDDEN_TRAP',
    formalLegalese:
      'A statutory doctrine under copyright law where the commissioning entity is legally deemed the author and owner of all created works ab initio.',
    plainEnglish:
      'The client owns everything you create from the split second you make it, as if they created it with their own hands.',
    whyItMatters:
      'Can accidentally strip you of ownership of your own pre-existing code libraries, design starter kits, proprietary algorithms, and career tools.',
    typicalClauseSnippet:
      '"All works, inventions, designs, and deliverables created by Contractor shall be deemed \'work made for hire\' and all intellectual property rights shall belong solely and exclusively to Client."',
    negotiationTip:
      'Expressly carve out your "Background IP" and pre-existing tools, granting the client an irrevocable license rather than surrendering complete ownership.',
    detectionPatterns: [
      /work\s+made\s+for\s+hire/i,
      /intellectual\s+property/i,
      /sole\s+and\s+exclusive\s+property/i,
      /inventions\s+conceived/i,
      /moral\s+rights/i,
    ],
  },
  {
    id: 'unilateral-modification',
    term: 'Unilateral Modification (Right to Change Terms)',
    category: 'Termination & Renewal',
    riskTier: 'HIDDEN_TRAP',
    formalLegalese:
      'A reservation of rights allowing one party to unilaterally alter terms, conditions, pricing, or service scope without counterparty assent.',
    plainEnglish:
      'The company or landlord can rewrite the contract rules and price tags whenever they want, simply by posting an update on their website.',
    whyItMatters:
      'You are bound to future rules that you never agreed to and cannot predict when signing today.',
    typicalClauseSnippet:
      '"Company reserves the right to amend or modify these terms at any time in its sole discretion. Continued use of the service constitutes acceptance of revised terms."',
    negotiationTip:
      'Require at least 30 days advance written notification for any material changes, with the right to cancel penalty-free and receive a pro-rata refund.',
    detectionPatterns: [
      /sole\s+discretion\s+to\s+(modify|change|amend)/i,
      /modify\s+these\s+terms/i,
      /without\s+prior\s+notice/i,
      /reserve\s+the\s+right\s+to\s+change/i,
    ],
  },
  {
    id: 'termination-for-convenience',
    term: 'Termination for Convenience',
    category: 'Termination & Renewal',
    riskTier: 'CAUTION',
    formalLegalese:
      'A contractual right permitting one or both parties to terminate the agreement without having to establish cause, fault, or material breach.',
    plainEnglish:
      'The right to cancel the contract at any time for zero reason, even if the other person did everything right.',
    whyItMatters:
      'If only the client has this right, they can drop you abruptly after you turned away other clients, leaving you with unpaid reserved time.',
    typicalClauseSnippet:
      '"Client may terminate this Agreement at any time for convenience, with or without cause, upon five (5) business days written notice to Contractor."',
    negotiationTip:
      'Ensure the right is strictly reciprocal (you can also terminate for convenience), requires at least 30 days notice, and guarantees immediate payment for all hours worked.',
    detectionPatterns: [
      /termination\s+for\s+convenience/i,
      /terminate\s+without\s+cause/i,
      /terminate\s+at\s+any\s+time\s+(with\s+or\s+without\s+cause)?/i,
    ],
  },
  {
    id: 'net-payment-terms',
    term: 'Payment Windows (Net 30 / 60 / 90)',
    category: 'Payment & Financial',
    riskTier: 'CAUTION',
    formalLegalese:
      'Credit terms indicating that total payment is due within 30, 60, or 90 calendar days following the invoice date or client delivery acceptance.',
    plainEnglish:
      'The client takes 1 to 3 months after you complete the work before transferring the money to your bank account.',
    whyItMatters:
      'Net 60 or Net 90 means you are essentially acting as an interest-free lending bank for a large company while waiting months to pay your own bills.',
    typicalClauseSnippet:
      '"Payment shall be made Net 90 days following Client\'s formal written acceptance of all milestone deliverables in its sole discretion."',
    negotiationTip:
      'Push for Net 15 or Net 30, add a 50% upfront deposit before starting work, and insert a 1.5% monthly late fee for overdue balances.',
    detectionPatterns: [
      /net\s+(15|30|45|60|90|120)/i,
      /payable\s+within\s+\d+\s+days/i,
      /satisfaction\s+guarantee/i,
    ],
  },
  {
    id: 'severability',
    term: 'Severability',
    category: 'General Boilerplate',
    riskTier: 'SAFE',
    formalLegalese:
      'A clause providing that if a specific term is held to be invalid or unenforceable, the remaining provisions continue with full legal force.',
    plainEnglish:
      'If a judge rules that one sentence in this contract is illegal, that sentence is thrown away, but the rest of the contract stays in effect.',
    whyItMatters:
      'Prevents an entire 20-page agreement from collapsing just because one minor legal clause had a technical phrasing defect.',
    typicalClauseSnippet:
      '"If any provision of this Agreement is held to be invalid, illegal, or unenforceable, the validity, legality, and enforceability of the remaining provisions shall not in any way be affected."',
    negotiationTip:
      'Standard and protective boilerplate. Ensure that it applies symmetrically to both parties\' protections.',
    detectionPatterns: [
      /severab(le|ility)/i,
      /shall\s+be\s+severed/i,
      /held\s+to\s+be\s+invalid/i,
    ],
  },
  {
    id: 'entire-agreement',
    term: 'Entire Agreement (Merger / Integration Clause)',
    category: 'General Boilerplate',
    riskTier: 'SAFE',
    formalLegalese:
      'A clause stating that the written document constitutes the complete and final agreement, superseding all prior oral or written representations.',
    plainEnglish:
      'Only what is written on this paper counts. Any verbal promises made over coffee, phone, or email before signing are legally void.',
    whyItMatters:
      'If a landlord or client promised "free parking" or "a 10% holiday bonus" verbally, but it is missing from this paper, you cannot enforce it.',
    typicalClauseSnippet:
      '"This Agreement contains the entire agreement of the parties relating to the subject matter and supersedes all prior negotiations, understandings, or agreements, written or oral."',
    negotiationTip:
      'Before signing, make sure every single verbal promise, email commitment, or discount is written into the contract as an exhibit or amendment.',
    detectionPatterns: [
      /entire\s+agreement/i,
      /merger\s+clause/i,
      /supersedes\s+all\s+prior/i,
      /integration\s+clause/i,
    ],
  },
  {
    id: 'governing-law',
    term: 'Governing Law & Jurisdiction (Venue)',
    category: 'Dispute Resolution',
    riskTier: 'CAUTION',
    formalLegalese:
      'A choice of law and forum selection clause designating the substantive legal jurisdiction and physical courthouse for litigating disputes.',
    plainEnglish:
      'The specific state or country whose laws apply, and the exact city where you must travel to appear in court if a dispute arises.',
    whyItMatters:
      'If you live in Oregon and the contract designates Delaware or New York, you would have to spend thousands on flights and out-of-state lawyers to enforce a contract.',
    typicalClauseSnippet:
      '"This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, and the parties submit to the exclusive jurisdiction of the state and federal courts located in Wilmington, Delaware."',
    negotiationTip:
      'Propose governing law and venue in your own home state, or select a neutral jurisdiction or mutual hometown.',
    detectionPatterns: [
      /governing\s+law/i,
      /choice\s+of\s+law/i,
      /exclusive\s+jurisdiction/i,
      /venue\s+shall\s+be/i,
      /construed\s+in\s+accordance/i,
    ],
  },
  {
    id: 'limitation-of-liability',
    term: 'Limitation of Liability & Damage Caps',
    category: 'Liability & Risk',
    riskTier: 'CAUTION',
    formalLegalese:
      'A provision capping the maximum financial compensation one party can recover from the other, typically disclaiming consequential and indirect damages.',
    plainEnglish:
      'A ceiling on how much money the other company has to pay you if they screw up, lose your data, or cause you financial harm.',
    whyItMatters:
      'A SaaS company or vendor might limit their liability to "$100" or "last month’s subscription", even if their outage cost your business $50,000.',
    typicalClauseSnippet:
      '"In no event shall Company\'s aggregate liability arising out of this agreement exceed the total fees paid by Customer in the preceding twelve (12) months. Neither party shall be liable for indirect, incidental, or consequential damages."',
    negotiationTip:
      'Ensure the liability cap is mutual, and carve out exclusions for data breaches, gross negligence, and breach of confidentiality.',
    detectionPatterns: [
      /limitation\s+of\s+liability/i,
      /aggregate\s+liability/i,
      /consequential\s+damages/i,
      /in\s+no\s+event\s+shall/i,
    ],
  },
  {
    id: 'non-disparagement',
    term: 'Non-Disparagement (Gag Clause)',
    category: 'Dispute Resolution',
    riskTier: 'HIDDEN_TRAP',
    formalLegalese:
      'A covenant prohibiting one or both parties from communicating negative, critical, or derogatory statements about the other party or its affiliates.',
    plainEnglish:
      'A legal ban forbidding you from ever saying, writing, or posting negative or critical remarks about the company or landlord.',
    whyItMatters:
      'Can be used to threaten you if you post an honest 1-star review on Google or warn other freelancers about bad payment practices.',
    typicalClauseSnippet:
      '"Customer agrees that it shall not at any time make, publish, or communicate to any person or entity any defamatory, derogatory, or disparaging statements regarding Company or its services."',
    negotiationTip:
      'The federal Consumer Review Fairness Act protects honest consumer reviews. Request that non-disparagement be deleted, or explicitly protect truthful statements.',
    detectionPatterns: [
      /non-disparagement/i,
      /shall\s+not\s+disparage/i,
      /derogatory\s+or\s+critical/i,
      /disparaging\s+remarks/i,
    ],
  },
  {
    id: 'force-majeure',
    term: 'Force Majeure ("Act of God")',
    category: 'General Boilerplate',
    riskTier: 'SAFE',
    formalLegalese:
      'A clause excusing contractual performance obligations when extraordinary unforeseeable events beyond either party\'s control render performance impossible.',
    plainEnglish:
      'A legal hall-pass excusing you or the other side from contract duties if an uncontrollable catastrophe strikes (such as war, floods, or pandemics).',
    whyItMatters:
      'Protects you from being sued for breach of contract if a natural disaster or lockdown makes it physically impossible to deliver your work.',
    typicalClauseSnippet:
      '"Neither party shall be liable for failure or delay in performance caused by circumstances beyond its reasonable control, including acts of God, fire, flood, war, civil unrest, or governmental action."',
    negotiationTip:
      'Check that it does not excuse payment obligations already owed, and ensures prompt written notice when invoked.',
    detectionPatterns: [
      /force\s+majeure/i,
      /act(s)?\s+of\s+god/i,
      /unforeseeable\s+circumstances/i,
    ],
  },
  {
    id: 'quiet-enjoyment',
    term: 'Quiet Enjoyment',
    category: 'General Boilerplate',
    riskTier: 'SAFE',
    formalLegalese:
      'An implied or express covenant assuring a tenant the uninterrupted legal possession and peaceful use of leased real property without landlord interference.',
    plainEnglish:
      'Your fundamental right as a renter to live in your home peacefully without constant landlord harassment, surprise entries, or unbearable building conditions.',
    whyItMatters:
      'A core tenant protection. If a landlord frequently barged in without notice or failed to remedy serious noise/mold, they breach this covenant.',
    typicalClauseSnippet:
      '"Landlord covenants that Tenant, upon paying the rent and performing all covenants, shall peaceably and quietly have, hold, and enjoy the leased premises throughout the term."',
    negotiationTip:
      'Verify this clause is explicitly present in any lease agreement, and guard against any waivers of peaceful possession.',
    detectionPatterns: [
      /quiet\s+enjoyment/i,
      /peaceabl(y|e)\s+and\s+quiet/i,
      /peaceful\s+enjoyment/i,
    ],
  },
  {
    id: 'right-of-entry',
    term: 'Right of Entry / Landlord Access',
    category: 'General Boilerplate',
    riskTier: 'CAUTION',
    formalLegalese:
      'A reservation specifying circumstances and notice periods under which a lessor or premises owner may physically inspect or enter leased property.',
    plainEnglish:
      'The exact rules stating when and how a landlord or repairman is allowed to unlock your door and walk into your rented apartment.',
    whyItMatters:
      'Clauses allowing "entry at any time without notice" destroy your privacy and compromise personal safety.',
    typicalClauseSnippet:
      '"Landlord or its agents may enter the premises upon twenty-four (24) hours advance notice to inspect the property, make repairs, or exhibit the premises to prospective buyers."',
    negotiationTip:
      'Ensure the clause mandates at least 24 (or 48) hours advance written notice, restricts entry to normal business hours, and restricts unannounced entry strictly to genuine emergencies.',
    detectionPatterns: [
      /right\s+of\s+entry/i,
      /landlord\s+may\s+enter/i,
      /access\s+to\s+premises/i,
      /inspect\s+the\s+premises/i,
    ],
  },
  {
    id: 'joint-several-liability',
    term: 'Joint and Several Liability',
    category: 'Liability & Risk',
    riskTier: 'HIDDEN_TRAP',
    formalLegalese:
      'A liability structure where each co-obligor is independently liable for the full amount of the obligation, permitting the creditor to seek 100% recovery from any single party.',
    plainEnglish:
      'If you sign a lease with roommates or business partners, the landlord can legally force you alone to pay 100% of the rent if your roommates disappear.',
    whyItMatters:
      'You are legally guaranteeing your roommates’ debts. If they don’t pay, your savings and credit score take the full hit.',
    typicalClauseSnippet:
      '"Each person executing this Lease as Tenant shall be jointly and severally liable for all payments, rent installments, and covenants hereunder."',
    negotiationTip:
      'Standard on residential leases, but always create a signed internal "Roommate Agreement" detailing individual rent allocations and security deposit shares.',
    detectionPatterns: [
      /joint(ly)?\s+and\s+several(ly)?/i,
      /joint\s+and\s+several\s+liability/i,
    ],
  },
  {
    id: 'sublease-assignment',
    term: 'Sublease & Assignment Restrictions',
    category: 'Termination & Renewal',
    riskTier: 'CAUTION',
    formalLegalese:
      'Covenants conditioning or prohibiting a party from transferring its contractual rights or subleasing real estate to a third party without prior consent.',
    plainEnglish:
      'Rules determining whether you can let someone else take over your lease or contract if you need to move or change plans before the lease ends.',
    whyItMatters:
      'An outright ban on subletting means if you have to move for a job or family emergency, you must still pay rent on an empty apartment.',
    typicalClauseSnippet:
      '"Tenant shall not assign, mortgage, or encumber this lease, nor sublet the premises, without Landlord\'s prior written consent, which shall not be unreasonably withheld or delayed."',
    negotiationTip:
      'Always confirm the magic legal words: "consent shall not be unreasonably withheld, conditioned, or delayed."',
    detectionPatterns: [
      /sublet/i,
      /sublease/i,
      /assign(ment)?\s+of\s+(this\s+)?lease/i,
      /assignment\s+and\s+subletting/i,
    ],
  },
  {
    id: 'security-deposit-forfeiture',
    term: 'Security Deposit Forfeiture & Deductions',
    category: 'Payment & Financial',
    riskTier: 'CAUTION',
    formalLegalese:
      'Provisions governing the retention, lawful deductions, and refund timetable of funds held in escrow as security against property damage or default.',
    plainEnglish:
      'The specific rules and conditions dictating whether you get your security deposit back or if the landlord gets to keep it.',
    whyItMatters:
      'Unfair clauses attempt to charge you for normal everyday wear-and-tear or impose mandatory non-refundable "cleaning or administrative fees".',
    typicalClauseSnippet:
      '"The security deposit shall be returned within thirty (30) days of surrender of possession, less lawful deductions for damages exceeding ordinary wear and tear."',
    negotiationTip:
      'Take timestamped photos and video during move-in and move-out. Check your local state laws, which often mandate statutory return deadlines (14-30 days) and interest payments.',
    detectionPatterns: [
      /security\s+deposit/i,
      /deposit\s+forfeiture/i,
      /return\s+of\s+deposit/i,
      /ordinary\s+wear\s+and\s+tear/i,
    ],
  },
];

/**
 * Scans document text and detected clauses to find which glossary terms appear in the document
 */
export function identifyDocumentGlossaryTerms(
  documentText: string,
  clauses?: Array<{ clauseName?: string; originalSnippet?: string; plainEnglishTranslation?: string }>
): Set<string> {
  const detectedTermIds = new Set<string>();
  const combinedSearchText = [
    documentText || '',
    ...(clauses?.map((c) => `${c.clauseName || ''} ${c.originalSnippet || ''} ${c.plainEnglishTranslation || ''}`) || []),
  ].join(' ');

  for (const item of LEGAL_GLOSSARY) {
    for (const pattern of item.detectionPatterns) {
      if (pattern.test(combinedSearchText)) {
        detectedTermIds.add(item.id);
        break;
      }
    }
  }

  return detectedTermIds;
}
