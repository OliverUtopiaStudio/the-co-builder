# Fellow Experience Plan: Domain Expert Journey
## Making The Co-Builder Exceptionally Useful for Domain Expert Fellows

**Version:** 1.0  
**Date:** 2026-02-12  
**Goal:** Transform The Co-Builder into the essential daily tool for domain experts building ventures through the Co-Build framework, with effective co-building collaboration.

---

## Executive Summary

This plan redesigns The Co-Builder experience to be **exceptionally useful** for domain expert fellows—those with deep domain knowledge but potentially less experience in startup building. The focus is on:

1. **Clear daily prioritization** — "What should I work on right now and why?"
2. **Business setup guidance** — Step-by-step company formation and operational setup
3. **Marketing asset planning** — Integrated marketing material creation within the framework
4. **Personalized next steps** — Tailored recommendations based on venture context and progress
5. **Effective co-building** — Seamless collaboration with the studio team

---

## 1. Landing Page Experience

### Current State
- Generic login page with role selection
- No value proposition for domain experts
- No preview of what they'll build

### Target State: "Your Venture Starts Here"

#### Hero Section
- **Headline:** "Turn Your Domain Expertise Into a World-Leading Company"
- **Subheadline:** "The Co-Build framework guides you from invention thesis to investable company in 27 structured assets"
- **Visual:** Animated pathway visualization showing 7 stages → 27 assets → Spinout
- **CTA:** "Start Building" (for new) / "Continue Building" (for returning)

#### Value Propositions (3-column layout)
1. **"Built for Domain Experts"**
   - "You know the problem deeply. We guide you through building the solution, validating demand, and raising capital."
   - Icon: Domain expert → Founder journey

2. **"27 Assets, One Clear Path"**
   - "From problem quantification to investor pitch—every step is structured, guided, and connected."
   - Icon: Pathway visualization

3. **"Co-Built With You"**
   - "Your studio team reviews, challenges, and supports you at every stage gate."
   - Icon: Collaboration/co-building

#### Social Proof
- Fellow testimonials (with permission)
- "X ventures spun out" counter
- "Average time to first customer: Y weeks"

#### For Returning Fellows
- Quick login → Dashboard
- "Welcome back, [Name]" with last asset worked on
- "Continue where you left off" CTA

### Implementation Priority
- **Phase 1:** Hero + value props + quick login
- **Phase 2:** Social proof + testimonials
- **Phase 3:** Personalized returning experience

---

## 2. Onboarding Experience: "Your Journey Begins"

### Current State
- 7-step linear checklist
- Some steps blocked by admin actions
- No context for "why" each step matters

### Target State: Contextual, Adaptive Onboarding

#### Step 0: Welcome & Orientation (New)
**Purpose:** Set expectations and build excitement

- **Video/Interactive Tour:** "What is The Co-Builder?" (2-3 min)
  - Show the dashboard, asset workflow, pathway visualization
  - Explain the co-building relationship with studio team
- **Your Role:** "You're building. We're co-building alongside you."
- **Timeline:** "Most fellows complete the framework in 12-16 weeks"
- **Success Stories:** Brief examples of completed ventures

#### Step 1-2: Admin-Controlled Steps (Agreement, KYC)
**Improvement:** Show progress even while waiting

- **Status:** "Waiting for studio team" with estimated timeline
- **What's Next:** Preview of steps 3-7 they can prepare for
- **Why It Matters:** "These steps ensure you're set up for success"

#### Step 3: Toolstack Setup
**Enhancement:** Make it feel like empowerment, not chores

- **For Each Tool:**
  - "Why you need this" explanation
  - "How you'll use it" in the framework
  - Quick setup guide with screenshots
  - "Test it" mini-challenge (e.g., "Create a markdown file in GitHub")
- **Progress Indicator:** "3/3 tools ready" with celebration

#### Step 4: Compute Budget
**Enhancement:** Make it actionable, not just informational

- **Interactive Budget Planner:**
  - Drag sliders for each tool category
  - Real-time total calculation
  - "Recommended" vs "Your Plan" comparison
  - Save and export as PDF
- **Why It Matters:** "This budget supports your entire build journey"

#### Step 5: Framework Introduction
**Enhancement:** Make it interactive and memorable

- **Interactive Stage Explorer:**
  - Click through each of the 7 stages
  - See asset count, purpose, example deliverables
  - "This is where you'll spend your time" messaging
- **Your Pathway Preview:** Show their personalized pathway based on venture type
- **"Got it" Quiz:** 3-5 questions to ensure understanding (optional but gamified)

#### Step 6: Browser Setup
**Enhancement:** Make it feel like setting up their workspace

- **Visual Guide:** Screenshot walkthrough
- **Test:** "Can you access The Co-Builder from your toolbar?"
- **Why:** "This becomes your daily workspace—make it easy to access"

#### Step 7: Create Your Venture
**Enhancement:** Make it feel like starting something real

- **Venture Creation Wizard:**
  - Step 1: Name & Description (with examples)
  - Step 2: Industry Selection (with pod context if assigned)
  - Step 3: Google Drive Setup (create folder, link it)
  - Step 4: "Your Venture is Ready!" celebration
- **Preview:** Show what their dashboard will look like with this venture

#### Onboarding Completion
- **Celebration Screen:** "You're ready to build!"
- **Next Steps:** "Your first asset is Asset #1: Risk Capital + Invention One-Pager"
- **Quick Tour:** Optional 30-second dashboard tour
- **Auto-advance:** Lifecycle stage → "building" (if all steps complete)

### Implementation Priority
- **Phase 1:** Enhanced toolstack setup, framework intro, venture creation wizard
- **Phase 2:** Welcome orientation, interactive elements
- **Phase 3:** Adaptive paths based on experience profile

---

## 3. Daily Dashboard: "Your Command Center"

### Current State
- Basic welcome message
- Diagnosis component (good but could be more prominent)
- Stipend status
- Venture list
- Framework overview

### Target State: Action-Oriented Daily Workspace

#### Above the Fold: "What Should I Work On Right Now?"

**Primary Action Card (Large, Prominent)**
```
┌─────────────────────────────────────────────────┐
│ 🎯 YOUR NEXT ACTION                            │
│                                                 │
│ Asset #3: Problem Deep Dive                    │
│ Stage 01: Problem Deep Dive                    │
│                                                 │
│ "Quantify the problem with economic evidence"  │
│                                                 │
│ Why this matters:                              │
│ → Builds evidence base for pricing (Asset #19) │
│ → Required before Solution Architecture        │
│ → Estimated: 5 days                            │
│                                                 │
│ [Start Working →]                              │
└─────────────────────────────────────────────────┘
```

**Enhanced Diagnosis Display**
- **Critical Actions:** Top 3 prioritized actions with clear "why"
- **Pathway Progress:** Visual stage-by-stage progress with current position highlighted
- **Velocity Tracker:** "You're completing X assets/week. At this pace, spinout in Y weeks."
- **Blockers Alert:** Prominent warnings for blockers or outwith activities

#### Secondary Actions: "Quick Wins & Context"

**Today's Focus (3-column cards)**
1. **Current Asset**
   - Progress within asset (e.g., "3/7 questions answered")
   - "Continue Asset #3" CTA
   - Estimated time remaining

2. **Studio Team Updates**
   - "Sarah reviewed Asset #2" with link to feedback
   - "Stage 00 gate approved" notifications
   - "New comment on Asset #5"

3. **Upcoming Milestones**
   - "Stipend Milestone #1: 3 assets away"
   - "Stage 01 gate review: Next week"
   - "Estimated spinout: 12 weeks"

#### Progress Visualization

**Pathway View (Expandable)**
- Visual representation of all 7 stages
- Current stage highlighted
- Completed stages green, future stages gray
- Click to expand → see all 27 assets with completion status

**Velocity Chart**
- Assets completed over time (line chart)
- Trend indicator (↑ accelerating, → steady, ↓ slowing)
- "You're ahead/on track/behind" messaging

#### Co-Building Section

**Studio Team Activity**
- Recent reviews, comments, approvals
- "Your studio team is here" indicator when team is active
- Link to view all feedback

**Collaboration Queue**
- Assets awaiting studio team review
- Assets with pending questions/comments
- "Request review" button for completed assets

#### Stipend & Resources

**Stipend Status (Compact)**
- Current milestone progress
- Next payment trigger
- Payment history

**Quick Links**
- Co-Build Tools page
- Framework reference
- Help/Support
- Export assets to Google Drive

### Implementation Priority
- **Phase 1:** Enhanced primary action card, improved diagnosis display
- **Phase 2:** Studio team activity feed, collaboration queue
- **Phase 3:** Velocity charts, pathway visualization enhancements

---

## 4. Daily Prioritization System

### Current State
- Diagnosis system provides critical actions
- Basic "first incomplete asset" logic
- No time-based prioritization

### Target State: Intelligent Daily Prioritization

#### "What Should I Work On Today?" Algorithm

**Inputs:**
1. **Asset Completion Status** (what's done)
2. **Prerequisites** (what must be done first)
3. **Asset Requirements** (required vs optional per venture)
4. **Velocity** (how fast they're moving)
5. **Stage Gates** (what's blocking advancement)
6. **Studio Team Feedback** (what needs revision)
7. **Time Estimates** (how long each asset takes)
8. **Downstream Dependencies** (what this unlocks)

**Outputs:**
1. **Primary Action** (what to work on right now)
2. **Secondary Actions** (what to prepare next)
3. **Blockers** (what's preventing progress)
4. **Quick Wins** (low-effort, high-impact actions)

#### Prioritization Logic

**Critical Path Analysis**
- Identify the longest path to spinout
- Prioritize assets on the critical path
- Show "why this matters" with downstream connections

**Context-Aware Recommendations**
- **If stuck on Stage 01:** "Focus on problem evidence—this unlocks everything else"
- **If approaching Stage Gate:** "Complete these 3 assets to unlock Stage 02 review"
- **If behind velocity:** "These assets are quick wins to catch up"
- **If ahead of schedule:** "Consider deepening these assets for stronger positioning"

**Time-Based Prioritization**
- "You have 2 hours today → Work on Asset #3 (estimated 2 hours)"
- "You have a full day → Complete Asset #5 (estimated 6 hours)"
- "Quick 30-min task → Review and save Asset #2 to Google Drive"

#### Daily Action Plan View

**Morning View (What to do today)**
```
Today's Plan
─────────────
🎯 Primary: Asset #3 - Problem Deep Dive (5 hours)
   → Complete questions 1-3, start question 4
   
📋 Secondary: Review Asset #2 feedback (30 min)
   → Sarah left 3 comments, address before Stage Gate
   
⚡ Quick Win: Export Asset #1 to Google Drive (15 min)
   → Keep your Drive folder up to date
   
📊 Check-in: Update velocity tracker (5 min)
   → You're 2 days ahead of schedule!
```

**Evening View (What you accomplished)**
- Celebration of completed work
- "Tomorrow's focus" preview
- Velocity update

### Implementation Priority
- **Phase 1:** Enhanced critical path analysis, context-aware recommendations
- **Phase 2:** Time-based prioritization, daily action plan
- **Phase 3:** Machine learning from patterns (what works for similar ventures)

---

## 5. Business Setup Guidance

### Current State
- Framework covers business aspects but not operational setup
- No dedicated business formation guidance
- Legal/incorporation mentioned but not detailed

### Target State: Integrated Business Setup Workflow

#### Business Setup Assets (New or Enhanced)

**Asset #0.5: Company Formation Planning** (Pre-Asset #1)
- **Purpose:** Set up legal entity before deep work begins
- **Guided Questions:**
  1. Jurisdiction selection (Qatar, Delaware, UK, etc.)
  2. Entity type (LLC, C-Corp, etc.)
  3. Co-founder equity split (if applicable)
  4. Legal counsel selection
- **Deliverables:**
  - Entity selection rationale
  - Incorporation checklist
  - Legal counsel contact info
- **Integration:** Feeds into Asset #23 (Operating Model) and Asset #26 (Spinout Legal Pack)

**Asset #23: Operating Model** (Enhanced)
- **Current:** High-level operating model
- **Enhanced:** Detailed operational setup
  - Bank account setup
  - Accounting system selection (QuickBooks, Xero, etc.)
  - Payroll provider (if hiring)
  - Insurance requirements
  - Compliance checklist (industry-specific)
- **Templates:** Operating agreement templates, compliance checklists

**Asset #26: Spinout Legal Pack** (Enhanced)
- **Current:** Legal documents for spinout
- **Enhanced:** Complete legal setup
  - Incorporation documents
  - IP assignment agreements
  - Employment agreements (if applicable)
  - Cap table setup
  - Data room preparation checklist

#### Business Setup Wizard (New Feature)

**Step-by-Step Business Formation**
- **Step 1: Entity Selection**
  - Interactive decision tree
  - "For your venture type, we recommend..."
  - Links to legal resources

- **Step 2: Incorporation Checklist**
  - Jurisdiction-specific checklist
  - Document templates
  - Legal counsel recommendations

- **Step 3: Operational Setup**
  - Bank account (which bank, what type)
  - Accounting system (setup guide)
  - Compliance requirements (industry-specific)

- **Step 4: Team Setup** (if applicable)
  - Employment agreements
  - Equity allocation
  - Payroll setup

**Integration with Framework**
- Business setup assets appear in pathway at appropriate stages
- Completion tracked like other assets
- Studio team can review and approve

### Implementation Priority
- **Phase 1:** Enhanced Asset #23 and #26 with business setup details
- **Phase 2:** Business Setup Wizard as standalone feature
- **Phase 3:** Asset #0.5 (Company Formation Planning) integrated into framework

---

## 6. Marketing Asset Planning

### Current State
- Marketing mentioned in some assets (e.g., Asset #20: Sales Pack)
- No dedicated marketing asset planning workflow
- No integration with business development activities

### Target State: Marketing-First Asset Workflow

#### Marketing Assets Integration

**Asset #15: PRD** (Enhanced)
- **Add:** Marketing requirements section
  - Target audience personas
  - Messaging framework
  - Value proposition statements
  - Competitive positioning (marketing angle)

**Asset #20: Sales Pack** (Enhanced)
- **Current:** Sales materials
- **Enhanced:** Complete marketing asset library
  - One-pager (investor-facing)
  - One-pager (customer-facing)
  - Pitch deck (modular slides)
  - Website copy framework
  - Social media positioning
  - Email templates (outreach, follow-up)

**New Asset #20.5: Marketing Asset Plan** (Between #20 and #21)
- **Purpose:** Plan all marketing materials needed for launch
- **Guided Questions:**
  1. What marketing channels will you use?
  2. What assets do you need for each channel?
  3. What's your messaging hierarchy?
  4. What's your brand positioning?
- **Deliverables:**
  - Marketing asset checklist
  - Content calendar (if applicable)
  - Brand guidelines (basic)
  - Asset production timeline

#### Marketing Asset Builder (New Feature)

**Template Library**
- One-pager templates (investor, customer)
- Pitch deck templates (modular)
- Website copy templates
- Email template library

**Asset Generator**
- Input: Completed framework assets (PRD, ICP, positioning, etc.)
- Output: Pre-filled marketing materials
- Customization: Edit and refine generated content

**Marketing Asset Tracker**
- Track which assets are created
- Link to Google Drive where assets are stored
- Version control (v1, v2, etc.)
- "Ready for review" status

**Integration with Sales Activities**
- Link marketing assets to pilot outreach (Asset #17)
- Track which assets convert best
- Iterate based on customer feedback

### Implementation Priority
- **Phase 1:** Enhanced Asset #20 with marketing asset library
- **Phase 2:** Marketing Asset Builder with templates
- **Phase 3:** Asset #20.5 (Marketing Asset Plan) integrated into framework

---

## 7. Personalized Next Steps

### Current State
- Diagnosis system provides recommendations
- Basic "first incomplete asset" logic
- No personalization based on venture context

### Target State: Context-Aware Personalization

#### Personalization Factors

**Venture Context**
- Industry (affects which assets are most critical)
- Stage (early vs. late-stage considerations)
- Market type (B2B vs. B2C vs. B2B2C)
- Geographic focus (affects legal/compliance requirements)

**Fellow Profile**
- Experience level (first-time builder vs. experienced)
- Domain expertise (deep vs. broad)
- Learning style (prefers examples vs. guided questions)

**Progress Patterns**
- Velocity (fast vs. slow)
- Quality patterns (which assets are strong/weak)
- Stuck points (where they typically get blocked)

**Studio Team Input**
- Custom requirements per venture
- Specific guidance from reviews
- Stage gate feedback

#### Personalized Recommendations Engine

**"For Your Venture" Section**
```
Based on your [Industry] venture in [Market Type]:
─────────────────────────────────────────────────
✓ Focus Areas:
  → Problem quantification is critical (Assets #3-8)
  → Early customer validation (Assets #15-18)
  
⚠️ Watch Out For:
  → Regulatory compliance (Asset #13)
  → Competitive positioning (Asset #14)
  
💡 Quick Wins:
  → Asset #5 (ICP Definition) unlocks customer work
  → Asset #12 (Data Rights) strengthens your moat
```

**Adaptive Guidance**
- **If first-time builder:** More examples, step-by-step walkthroughs
- **If experienced:** Focus on Co-Build-specific methodology
- **If domain expert:** Emphasize translating expertise to business logic

**Learning from Patterns**
- "Fellows in your industry typically spend 2x longer on Asset #8 (Data Map)"
- "Your velocity suggests you'll complete Stage 01 in 3 weeks (vs. average 4 weeks)"
- "Consider deepening Asset #12—similar ventures found this critical"

### Implementation Priority
- **Phase 1:** Basic personalization based on venture context (industry, market type)
- **Phase 2:** Fellow profile-based adaptation
- **Phase 3:** Machine learning from cohort patterns

---

## 8. Co-Building Collaboration

### Current State
- Studio team can review assets (future feature)
- No real-time collaboration
- No feedback loop visible to fellows

### Target State: Seamless Co-Building

#### Studio Team Presence Indicators

**"Studio Team is Here" Badge**
- Shows when studio team is active
- "Sarah is reviewing your work" indicator
- Recent activity timeline

**Activity Feed**
- "Sarah reviewed Asset #2"
- "Stage 00 gate approved"
- "New comment on Asset #5"
- "Stipend milestone #1 met"

#### Feedback System

**Inline Comments**
- Studio team can comment on specific answers
- Fellows can respond
- Threaded conversations
- "@mentions" for specific team members

**Review Status**
- Draft → Submitted → Under Review → Approved/Needs Revision
- Visual status indicators
- "Request Review" button for fellows
- "Mark as Reviewed" for studio team

**Revision Workflow**
- "Needs Revision" → Shows what needs to change
- Fellow updates → Resubmits
- Studio team approves → Asset marked complete

#### Co-Building Sessions

**Scheduled Check-ins**
- Calendar integration
- "Upcoming: Stage 01 Gate Review (Friday)"
- Preparation checklist before check-ins

**Office Hours**
- "Studio team office hours: Tuesdays 2-4pm"
- Book a slot
- Come with specific questions

**Asynchronous Q&A**
- "Ask Studio Team" button on each asset
- Questions visible to studio team
- Responses appear in activity feed

#### Collaboration Dashboard (Studio Team View)

**Fellow Progress Overview**
- Which fellows need attention
- Stuck assets
- Upcoming stage gates
- Quality concerns

**Co-Building Queue**
- Assets awaiting review
- Questions from fellows
- Revision requests

### Implementation Priority
- **Phase 1:** Activity feed, review status system
- **Phase 2:** Inline comments, revision workflow
- **Phase 3:** Co-building sessions, office hours integration

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Improve daily prioritization and dashboard experience

1. **Enhanced Dashboard**
   - [ ] Redesign primary action card (prominent "what to work on")
   - [ ] Improve diagnosis display (critical actions, pathway, velocity)
   - [ ] Add studio team activity feed

2. **Daily Prioritization**
   - [ ] Enhanced critical path analysis
   - [ ] Context-aware recommendations ("why this matters")
   - [ ] Time-based prioritization ("you have 2 hours → work on X")

3. **Onboarding Improvements**
   - [ ] Enhanced toolstack setup (interactive, empowering)
   - [ ] Framework introduction (interactive explorer)
   - [ ] Venture creation wizard

**Deliverables:**
- Redesigned dashboard
- Enhanced diagnosis system
- Improved onboarding flow

### Phase 2: Business & Marketing (Weeks 3-4)
**Goal:** Add business setup and marketing asset planning

1. **Business Setup**
   - [ ] Enhanced Asset #23 (Operating Model) with setup details
   - [ ] Enhanced Asset #26 (Spinout Legal Pack) with formation checklist
   - [ ] Business setup wizard (optional standalone feature)

2. **Marketing Assets**
   - [ ] Enhanced Asset #20 (Sales Pack) with marketing library
   - [ ] Marketing asset builder with templates
   - [ ] Marketing asset tracker

**Deliverables:**
- Business setup guidance integrated
- Marketing asset planning workflow
- Template library

### Phase 3: Personalization & Co-Building (Weeks 5-6)
**Goal:** Add personalization and collaboration features

1. **Personalization**
   - [ ] Venture context-based recommendations
   - [ ] Fellow profile adaptation (experience level)
   - [ ] "For Your Venture" section

2. **Co-Building**
   - [ ] Review status system (draft → submitted → reviewed)
   - [ ] Inline comments and feedback
   - [ ] Revision workflow
   - [ ] Activity feed enhancements

**Deliverables:**
- Personalized recommendations
- Full co-building collaboration system

### Phase 4: Polish & Optimization (Weeks 7-8)
**Goal:** Refine based on usage and add advanced features

1. **Advanced Features**
   - [ ] Machine learning from cohort patterns
   - [ ] Predictive spinout timeline
   - [ ] Quality scoring integration

2. **UX Polish**
   - [ ] Loading states and skeletons
   - [ ] Error handling and recovery
   - [ ] Mobile responsiveness
   - [ ] Performance optimization

**Deliverables:**
- Polished, production-ready experience
- Advanced personalization
- Performance optimizations

---

## 10. Success Metrics

### Fellow Engagement
- **Daily Active Users:** Target 80%+ of active fellows open dashboard daily
- **Time to First Asset:** Target <24 hours from onboarding completion
- **Asset Completion Rate:** Target 70%+ of required assets completed
- **Velocity:** Target consistent 2-3 assets/week average

### Co-Building Effectiveness
- **Review Response Time:** Studio team responds within 48 hours
- **Revision Cycles:** Average <2 revisions per asset
- **Stage Gate Approval Rate:** 80%+ pass on first review

### Business Outcomes
- **Time to Spinout:** Target 12-16 weeks average
- **Venture Quality:** Studio team quality scores (when implemented)
- **Fellow Satisfaction:** Survey scores on "usefulness" and "co-building effectiveness"

---

## 11. Design Principles

1. **Action Over Information** — Every screen should answer "what should I do next?"
2. **Context Over Completion** — Show why things matter, not just that they're done
3. **Co-Building Over Solo Work** — Make studio team collaboration visible and seamless
4. **Progress Over Perfection** — Celebrate forward movement, not just completion
5. **Personalization Over Generic** — Tailor to venture context and fellow profile
6. **Clarity Over Complexity** — Simple, clear, actionable guidance

---

## Next Steps

1. **Review & Prioritize** — Review this plan and prioritize features based on impact
2. **Design Mockups** — Create detailed designs for Phase 1 features
3. **Technical Planning** — Break down features into implementation tasks
4. **User Testing** — Test with current fellows to validate assumptions
5. **Iterate** — Refine based on feedback and usage patterns

---

**Document Status:** Draft for review  
**Last Updated:** 2026-02-12  
**Owner:** Product Team
