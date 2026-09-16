export interface SampleContract {
  id: string;
  title: string;
  type: string;
  description: string;
  targetAudience: 'Tenant' | 'Freelancer' | 'Consumer' | 'Student';
  text: string;
}

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: 'residential-lease',
    title: 'Residential Apartment Lease Agreement',
    type: 'Residential Lease',
    description: 'A 12-month standard apartment rental containing automatic renewal lock-ins, excessive move-out cleaning penalties, and unlimited landlord entry rights.',
    targetAudience: 'Tenant',
    text: `STANDARD RESIDENTIAL LEASE AGREEMENT

PARTIES & PREMISES:
This Lease Agreement is entered into between Metro Urban Living LLC ("Landlord") and Tenant for the residential property located at 442 Skyline Blvd, Apt 4B.

SECTION 4: AUTOMATIC EXTENSION & NOTICE REQUIREMENTS
Unless Tenant delivers formal written notice via certified courier no less than ninety (90) days prior to the expiration of the Initial Term, this Lease shall automatically renew for an additional full twelve (12) month term at a rental rate determined exclusively by Landlord, not to exceed an increase of twenty-five percent (25%). Any notice given via email, text message, or oral communication shall be deemed invalid and of no legal effect.

SECTION 7: SECURITY DEPOSIT & FORFEITURE
The Security Deposit of $2,400.00 shall be retained in Landlord's general operating account. Landlord shall deduct a mandatory non-refundable turnover inspection fee of $450.00, regardless of the condition of the premises. Landlord reserves ninety (90) business days following surrender of possession to calculate remaining deductions and remit balances.

SECTION 11: ACCESS AND ENTRY
Landlord and Landlord's authorized contractors may enter the premises at any hour of the day or night without prior notice for inspections, aesthetic appraisals, maintenance evaluation, or to exhibit the apartment to potential purchasers, investors, or subsequent prospective tenants.

SECTION 14: REPAIRS AND MAINTENANCE EXCLUSIONS
Tenant acknowledges sole responsibility for all internal plumbing stoppages, appliance repairs, electrical fuse replacements, and HVAC filter changes costing less than $500.00 per occurrence. Failure of Landlord to provide functioning heat, cooling, or hot water for periods of less than fourteen (14) continuous business days shall not entitle Tenant to any rent withholding or constructive eviction claims.

SECTION 19: DISPUTE RESOLUTION & JURY WAIVER
Tenant irrevocably waives all rights to trial by jury and agrees that any dispute arising out of or relating to this Lease shall be resolved through confidential, mandatory binding arbitration conducted by a single arbitrator selected by Landlord. Tenant waives all rights to join or maintain class, collective, or representative actions. All legal fees incurred by Landlord in enforcing any term hereof shall be reimbursed immediately by Tenant as Additional Rent.`,
  },
  {
    id: 'freelance-contract',
    title: 'Freelance Design & Development Contract',
    type: 'Freelance Agreement',
    description: 'A client-provided work-for-hire contract with unlimited revisions, net-90 payment terms, unconditional indemnity, and broad non-compete restrictions.',
    targetAudience: 'Freelancer',
    text: `MASTER PROFESSIONAL SERVICES AGREEMENT

This Agreement is made between Apex Digital Innovations Corp ("Client") and the Independent Contractor ("Contractor").

1. SCOPE OF DELIVERABLES AND REVISIONS
Contractor agrees to provide custom UI/UX design and frontend implementation. Contractor shall provide unlimited iterative revisions at no additional charge until Client provides final, unconditional written acceptance. Client reserves the sole discretion to determine whether deliverables meet acceptable professional standards.

2. COMPENSATION AND PAYMENT SCHEDULE
Client shall pay Contractor a flat fixed sum of $4,500.00 upon final approved completion of all milestones. Payment shall be made on Net-90 terms from the date of final client sign-off. If Client cancels the project at any time prior to completion, Contractor shall forfeit all accrued milestone fees and receive no kill-fee or partial compensation.

3. INTELLECTUAL PROPERTY & MORAL RIGHTS
Contractor unconditionally assigns to Client all right, title, and interest throughout the universe in and to all work product, source code, design systems, algorithms, pre-existing tools, and conceptual ideas generated prior to or during the engagement. Contractor expressly waives all "moral rights" and covenants never to display the work in any professional portfolio, resume, case study, or promotional medium without express written notarized approval.

4. INDEMNIFICATION & LIABILITY
Contractor shall defend, indemnify, and hold harmless Client, its officers, partners, and affiliates from and against any and all claims, damages, liabilities, losses, and legal fees arising directly or indirectly from Contractor's deliverables or any alleged breach of third-party patents, copyrights, trade secrets, or general performance delays, with no financial cap on Contractor's liability.

5. NON-COMPETE & NON-SOLICITATION
During the term of this Agreement and for a period of twenty-four (24) months thereafter, Contractor shall not directly or indirectly provide software design, consulting, or development services to any entity, startup, or individual operating within the digital, e-commerce, or web media sectors worldwide.`,
  },
  {
    id: 'fitness-membership',
    title: 'Boutique Gym & Health Club Membership',
    type: 'Consumer Agreement',
    description: 'A monthly health club agreement with certified mail cancellation obstacles, automatic fee escalations, and total bodily injury liability disclaimers.',
    targetAudience: 'Consumer',
    text: `TITAN FITNESS & WELLNESS CLUB - MEMBER CONTRACT

1. MEMBERSHIP TERM & DUES
Member enrolls in the 24-Month Premium Tier at an initial rate of $89.00/month. Club reserves the unilateral right to adjust monthly dues and assess bi-annual "facility maintenance enhancement surcharges" of up to $120.00 without advance written consent.

2. CANCELLATION REQUIREMENTS
Cancellation of membership must be made strictly by hand-delivered physical notarized letter or certified postal mail with return receipt requested, postmarked between the 1st and 3rd calendar day of the month preceding the desired cancellation month. In-person verbal cancellations, emails, app requests, or telephone calls shall be null and void. In the event of early termination before 24 months, a liquidated damages fee of $350.00 plus 50% of remaining term dues will be automatically charged.

3. UNCONDITIONAL RELEASE OF LIABILITY
Member voluntarily assumes all risks of personal injury, illness, permanent disability, cardiac arrest, equipment collapse, slips and falls, or death occurring on Club premises. Member releases Club, owners, and trainers from all liability, including claims founded upon the ordinary or gross negligence of Club personnel, defective machinery, or inadequate sanitation.

4. BINDING ARBITRATION & CLASS ACTION WAIVER
All claims shall be submitted exclusively to individual binding arbitration. Member waives any right to participate in any class action, mass arbitration, or attorney general action against Club.`,
  },
  {
    id: 'app-terms-of-service',
    title: 'SaaS Platform & Mobile App Terms of Service',
    type: 'App Terms of Service',
    description: 'Consumer cloud platform terms containing perpetual content licensing, zero warranty disclaimers, unilateral modification clauses, and location tracking consent.',
    targetAudience: 'Student',
    text: `CLOUDSTUDY AI & NOTES PLATFORM - TERMS OF SERVICE

1. LICENSE TO USER CONTENT
By uploading, creating, or submitting any class notes, diagrams, study guides, research papers, or media ("User Content"), you grant CloudStudy a worldwide, irrevocable, perpetual, royalty-free, transferable, and sublicensable license to use, reproduce, modify, train proprietary commercial AI foundation models, distribute, and monetize your content without attribution or compensation to you.

2. PRIVACY & TELEMETRY SURVEILLANCE
You expressly authorize CloudStudy to collect device telemetry, clipboard contents, background location data, and browser history, and to share anonymized or pseudonymized demographic and behavioural dossiers with third-party advertising exchanges and marketing partners.

3. UNILATERAL MODIFICATIONS
CloudStudy reserves the absolute right to revise these Terms at any time without individual notice. Your continued access or use of the application following the posting of modifications constitutes binding acceptance of the updated terms.

4. NO WARRANTY & SEVERE LIMITATION OF LIABILITY
The service is provided "AS-IS" and "AS-AVAILABLE". CloudStudy disclaims all express or implied warranties. Under no circumstances shall CloudStudy's aggregate liability for all damages, data loss, academic penalties, or service interruptions exceed the total amount paid by you in the preceding one (1) month, or $10.00 USD, whichever is less.`,
  },
];
