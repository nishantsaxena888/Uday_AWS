/**
 * ============================================================
 * MODULE 49 — Forward Deployed Engineer (FDE)
 * Senior SWE → Enterprise Applied AI: agentic workflows, MCP,
 * enterprise RAG, eval pipelines, production hardening.
 * Video: FDE transition masterclass (Facebook share)
 * ============================================================
 */
const MODULE_49_DATA = {
  id: 'fde-masterclass',
  moduleId: 'module-49',
  title: 'Forward Deployed Engineer (FDE) — Senior SWE to Enterprise AI',
  description: 'The hottest role in applied AI: embed with enterprise customers and turn LLM prototypes into hardened, production-grade agentic systems. Covers the skill stack, agentic architecture, MCP connectors, eval pipelines, and FDE interview strategy.',
  difficulty: 'advanced',
  duration: '2.5 hours',
  prerequisites: ['Senior-level software engineering experience', 'Module 37: Amazon Bedrock & GenAI recommended'],
  objectives: [
    'Understand what a Forward Deployed Engineer actually does day-to-day',
    'Map your SWE skills to the FDE skill stack (and fill the gaps)',
    'Architect agentic workflows: planners, tools, memory, multi-agent patterns',
    'Integrate enterprise data via MCP servers and secure connectors',
    'Build evaluation pipelines that make LLM systems measurable',
    'Harden prototypes for production: auth, tenancy, cost, observability',
    'Prepare for FDE interviews: system design + customer scenario rounds'
  ],

  sections: [
    {
      id: 'watch-video',
      type: 'video',
      title: 'Featured FDE Masterclass',
      content: {
        url: 'https://www.facebook.com/share/v/19hUGE3sWY/',
        title: 'Forward Deployed Engineer — Transition & Interview Prep Masterclass',
        caption: 'Full walkthrough of the SWE→FDE transition: the role, the skills, the interview loop. Watch first, then work through the sections below.'
      }
    },

    {
      id: 'why-fde',
      type: 'why',
      title: 'Why FDE Is the Premium AI Role',
      content: {
        html: `
          <div class="alert alert-info">
            <span class="alert-icon">🚀</span>
            <div class="alert-content">
              <div class="alert-title">Palantir invented it; every AI lab now hires it</div>
              <div class="alert-text">Forward Deployed Engineers embed directly with customers — half software engineer, half consultant, half product person (yes, three halves). OpenAI, Anthropic, and the applied-AI ecosystem now hire FDEs at a premium because <strong>shipping LLM features to enterprises is the bottleneck</strong>, not model quality.</div>
            </div>
          </div>
          <h4>FDE vs. the roles you already know</h4>
          <table>
            <thead><tr><th>Role</th><th>Owns</th><th>Distance to customer</th><th>Success metric</th></tr></thead>
            <tbody>
              <tr><td><strong>Senior SWE</strong></td><td>Features, systems</td><td>Far (via PM/EM)</td><td>Code shipped, uptime</td></tr>
              <tr><td><strong>Solutions Architect</strong></td><td>Designs, demos</td><td>Near (pre-sales)</td><td>Deals influenced</td></tr>
              <tr><td><strong>Forward Deployed Engineer</strong></td><td><strong>Working systems in the customer's environment</strong></td><td><strong>Embedded on-site</strong></td><td><strong>Customer outcomes in production</strong></td></tr>
            </tbody>
          </table>
          <h4>Why it pays a premium</h4>
          <ul>
            <li><strong>Scarce combination</strong> — production engineering + customer empathy + AI literacy in one person</li>
            <li><strong>Direct revenue line</strong> — your work literally closes and expands accounts</li>
            <li><strong>Frontier work</strong> — you ship patterns (agents, evals, MCP) that barely have playbooks yet</li>
          </ul>
          <div class="alert alert-warning">
            <span class="alert-icon">⚠️</span>
            <div class="alert-content">
              <div class="alert-title">The catch</div>
              <div class="alert-text">FDE is not "prompt engineering." You will debug a flaky enterprise SSO flow at 10pm, design a multi-tenant data plane, AND explain tokens-per-dollar to a CFO — sometimes in the same week.</div>
            </div>
          </div>
        `
      }
    },

    {
      id: 'fde-skill-stack',
      type: 'concept',
      title: 'The FDE Skill Stack',
      content: {
        html: `
          <h4>Four layers — interviewers probe all of them</h4>
          <table>
            <thead><tr><th>Layer</th><th>What they test</th><th>Your SWE transfer</th></tr></thead>
            <tbody>
              <tr><td><strong>1. Engineering</strong></td><td>APIs, data pipelines, distributed systems, security</td><td>You have this — sharpen Python/TS speed</td></tr>
              <tr><td><strong>2. Applied AI</strong></td><td>Agents, RAG, evals, model tradeoffs, cost curves</td><td>Learnable — this module + Bedrock/GenAI module</td></tr>
              <tr><td><strong>3. Customer</strong></td><td>Discovery, scoping, demoing, managing stakeholders</td><td>Practice narrating tradeoffs to non-engineers</td></tr>
              <tr><td><strong>4. Production</strong></td><td>Multi-tenancy, authZ, observability, incident response</td><td>Your cloud/architecture experience — the edge most candidates lack</td></tr>
            </tbody>
          </table>
          <h4>The 30-day gap-fill plan</h4>
          <ol>
            <li><strong>Week 1:</strong> Build one agentic workflow end-to-end (tools + memory + evals) — not a chatbot, a system that DOES something</li>
            <li><strong>Week 2:</strong> Stand up an MCP server against a real API; learn where it breaks (auth, rate limits, schema drift)</li>
            <li><strong>Week 3:</strong> Write evals: golden dataset, LLM-as-judge, regression gate in CI</li>
            <li><strong>Week 4:</strong> Package it as a demo: architecture diagram, cost model, security story, live walkthrough</li>
          </ol>
        `
      }
    },

    {
      id: 'agentic-architecture',
      type: 'architecture',
      title: 'Agentic Workflow Architecture',
      content: {
        title: 'Production Agent Loop — the pattern FDEs ship',
        width: 780,
        height: 300,
        nodes: [
          { id: 'user', label: 'Customer App', icon: '👤', x: 10, y: 130, type: 'client', description: 'Enterprise user issues a task — e.g. "summarize this week\'s escalations". The FDE owns the whole path from here to a verified answer.', eventPayload: { Input: 'task + context + tenant_id', SLA: '< 30s interactive' } },
          { id: 'orchestrator', label: 'Agent Orchestrator', icon: '🧠', x: 190, y: 130, type: 'compute', description: 'Planner/executor loop: decomposes tasks, picks tools, reflects on results. This is where reliability is won or lost — retries, timeouts, budget caps, and fallbacks live here.' },
          { id: 'tools', label: 'Tool Layer (MCP)', icon: '🔧', x: 190, y: 20, type: 'trigger', description: 'MCP servers expose enterprise tools (Jira, Salesforce, internal DBs) as typed, auditable tool calls. Never let the model touch systems without a contract.' },
          { id: 'rag', label: 'Enterprise RAG', icon: '📚', x: 400, y: 20, type: 'storage', description: 'Retrieval over the customer\'s corpus: vector store + keyword hybrid, permission-trimmed results, citation tracking. Data never leaves the customer boundary.' },
          { id: 'evals', label: 'Eval Pipeline', icon: '✅', x: 400, y: 130, type: 'monitoring', description: 'Golden datasets, LLM-as-judge graders, and regression gates in CI. The unglamorous layer that separates "cool demo" from "production system".' },
          { id: 'guardrails', label: 'Guardrails', icon: '🛡️', x: 400, y: 240, type: 'security', description: 'PII redaction, prompt-injection defense, output schema validation, cost budgets per tenant. Enterprises will not deploy without this.' },
          { id: 'observability', label: 'Traces & Metrics', icon: '📊', x: 600, y: 130, type: 'monitoring', description: 'Every run traced: tokens, latency, tool calls, judge scores. When a customer says "it gave a wrong answer", you replay the trace, not the vibes.' },
          { id: 'human', label: 'Human Review', icon: '🧑‍⚖️', x: 600, y: 240, type: 'client', description: 'High-stakes actions route to humans: approve, edit, reject. The trust contract with enterprise customers is human-in-the-loop by default.' }
        ],
        edges: [
          { from: 'user', to: 'orchestrator', label: 'task', animated: true },
          { from: 'orchestrator', to: 'tools', label: 'call MCP tools' },
          { from: 'orchestrator', to: 'rag', label: 'retrieve context' },
          { from: 'tools', to: 'evals', label: 'outputs' },
          { from: 'evals', to: 'guardrails', label: 'score + check' },
          { from: 'guardrails', to: 'human', label: 'gate', animated: true },
          { from: 'orchestrator', to: 'observability', label: 'trace' },
          { from: 'human', to: 'user', label: 'verified result' }
        ]
      }
    },

    {
      id: 'mcp-enterprise',
      type: 'concept',
      title: 'MCP & Enterprise Connectors',
      content: {
        html: `
          <h4>Model Context Protocol in one paragraph</h4>
          <p>MCP standardizes how LLM apps discover and call external tools/data — think "USB-C for AI integrations". A server exposes <strong>tools</strong> (functions), <strong>resources</strong> (readable data), and <strong>prompts</strong> (templates); clients (Claude, IDEs, your agent) consume them through one protocol instead of N bespoke integrations.</p>
          <h4>What an FDE actually builds with it</h4>
          <pre>Enterprise data → MCP server (auth, schema, audit) → Agent client
     Jira      →  tool: jira.search_issues(jql)
     Salesforce→  tool: sf.get_account(id)
     Postgres  →  resource: db://customers/{id}
     Wiki      →  resource: doc://spaces/ENG/*</pre>
          <ul>
            <li><strong>Typed contracts</strong> — every tool call is schema-validated; no free-form SQL from a model</li>
            <li><strong>Auth at the edge</strong> — the server holds credentials; the model only sees sanitized results</li>
            <li><strong>Audit trail</strong> — every call logged for enterprise compliance reviews</li>
          </ul>
          <div class="alert alert-warning">
            <span class="alert-icon">⚠️</span>
            <div class="alert-content">
              <div class="alert-title">Where projects die</div>
              <div class="alert-text">Enterprise data access: OAuth flows against legacy IdPs, row-level permissions that must flow into retrieval, and rate limits on APIs built in 2009. Budget serious time for the connector layer — it is usually the hardest part.</div>
            </div>
          </div>
        `
      }
    },

    {
      id: 'evals-production',
      type: 'code',
      title: 'Evals: Making LLMs Measurable',
      content: {
        title: 'Minimal eval pipeline — golden set → judge → CI gate',
        languages: [
          {
            id: 'python',
            label: 'Python',
            code: `import json, pathlib

GOLDEN = json.loads(pathlib.Path("evals/golden.json").read_text())
# [{"input": "...", "expected_facts": [...], "judge_rubric": "..."}]

def run_eval(agent_fn, judge_fn):
    results = []
    for case in GOLDEN:
        output = agent_fn(case["input"])           # real agent run
        grade = judge_fn(case, output)              # LLM-as-judge
        results.append({
            "id": case["id"],
            "passed": grade["score"] >= 0.8,
            "missing_facts": [f for f in case["expected_facts"]
                              if f.lower() not in output.lower()],
            "latency_ms": grade.get("latency_ms"),
        })
    passed = sum(r["passed"] for r in results)
    score = passed / len(results)
    print(f"Eval: {passed}/{len(results)}  score={score:.0%}")
    return score >= 0.85   # CI gate threshold — blocks deploy if regressed`,
            explanations: [
              { line: 2, text: 'Golden dataset — curated (input, expected) pairs. This is your unit test suite for a non-deterministic system.' },
              { line: 8, text: 'LLM-as-judge: a strong model grades output against a rubric. Cheaper than humans, consistent enough for regression testing.' },
              { line: 11, text: 'Track missing expected facts explicitly — judge scores alone hide WHY quality dropped.' },
              { line: 17, text: 'The gate: evals wired into CI so a prompt/model change that regresses quality fails the build, like any other test.' }
            ]
          }
        ]
      }
    },

    { id: 'lab', type: 'lab', title: 'Practical Lab: Design a Deployable Agent', content: {
      title: 'FDE Design Lab — Escalation Summarizer Agent',
      description: 'Design (and optionally build) an agent for a fictional customer, Acme Logistics: it reads Jira escalations, summarizes them for the ops team every morning, and must be deployable inside Acme\'s AWS account.',
      difficulty: 'advanced',
      steps: [
        { id: 'step-1', title: 'Scope the contract', instruction: 'Write the success criteria: input sources, output format, latency budget, and what "wrong" means. Which failures are tolerable vs. unacceptable?', expectedResult: 'A one-page spec: JQL query in, 5-bullet summary out, P95 < 60s, zero fabricated ticket IDs.', hint: 'FDE scoping means defining measurable success BEFORE touching a model.' },
        { id: 'step-2', title: 'Design the tool layer', instruction: 'Sketch the MCP surface: which tools does the agent need? Define signatures for jira.search_issues and jira.get_comments.', expectedResult: 'Tool schema with typed params, auth story (service account + OAuth), and an audit log line per call.', hint: 'Tools should be narrow and typed — one generic "query anything" tool is how incidents happen.' },
        { id: 'step-3', title: 'Draft the loop', instruction: 'Decide: single LLM call with all context, or retrieve→draft→verify steps? Justify with cost and reliability.', expectedResult: 'Chosen architecture + reasoning. Verify step catches hallucinated ticket numbers.', hint: 'A verify pass (check claims against retrieved docs) is cheap and kills the worst failure class.' },
        { id: 'step-4', title: 'Build the eval set', instruction: 'Write 5 golden cases: normal day, no escalations, 100-ticket day, non-English ticket, injection attempt in a ticket title.', expectedResult: '5 cases with expected facts and a judge rubric. The adversarial cases are the important ones.', hint: 'Prompt-injection-in-data is the #1 enterprise worry — eval it explicitly.' },
        { id: 'step-5', title: 'Harden it', instruction: 'List the production checklist: tenancy, secrets, PII, rate limits, cost cap per run, tracing.', expectedResult: 'A checklist where every item has an owner and a mechanism, not just a wish.', hint: 'Cost cap: tokens_per_run × runs/day × $/token — show the CFO the math.' },
        { id: 'step-6', title: 'Demo narrative', instruction: 'Write the 3-minute demo script: problem → architecture → live run → eval results → cost.', expectedResult: 'A demo that sells the system to both engineers (architecture) and execs (outcome + cost).', hint: 'FDE demos lead with the customer outcome; architecture is the evidence, not the story.' }
      ] } },

    {
      id: 'quiz',
      type: 'quiz',
      title: 'Knowledge Check',
      content: {
        title: 'FDE & Applied AI Quiz',
        type: 'knowledge-check',
        questions: [
          {
            id: 'q1',
            question: 'What primarily differentiates an FDE from a Solutions Architect?',
            options: [
              { id: 'a', text: 'FDEs write more code' },
              { id: 'b', text: 'FDEs own working systems inside the customer environment — not just designs and demos' },
              { id: 'c', text: 'FDEs work only with startups' },
              { id: 'd', text: 'FDEs focus on model training rather than applications' }
            ],
            correctId: 'b',
            explanation: 'SAs influence deals with designs and demos; FDEs are accountable for systems actually running in production at the customer. Outcome ownership is the defining trait.',
            difficulty: 'beginner'
          },
          {
            id: 'q2',
            question: 'Why does MCP matter for enterprise agent deployments?',
            options: [
              { id: 'a', text: 'It makes models faster' },
              { id: 'b', text: 'It standardizes tool/data access with typed contracts, auth at the edge, and an audit trail' },
              { id: 'c', text: 'It removes the need for evals' },
              { id: 'd', text: 'It trains models on customer data' }
            ],
            correctId: 'b',
            explanation: 'MCP gives agents structured, auditable access to enterprise systems — credentials stay in the server, calls are schema-checked and logged. Enterprises demand exactly that.',
            difficulty: 'intermediate'
          },
          {
            id: 'q3',
            question: 'What is the core purpose of an eval pipeline in an LLM system?',
            options: [
              { id: 'a', text: 'Reduce inference cost' },
              { id: 'b', text: 'Make quality measurable and block regressions in CI, the way unit tests do for code' },
              { id: 'c', text: 'Generate training data' },
              { id: 'd', text: 'Speed up prompt iteration' }
            ],
            correctId: 'b',
            explanation: 'LLMs are non-deterministic — without golden datasets + judge scores + CI gates, quality changes are invisible until customers complain. Evals are the test suite for behavior.',
            difficulty: 'intermediate'
          },
          {
            id: 'q4',
            question: 'A customer asks you to summarize Jira tickets daily with an agent. The BIGGEST production risk to design for first is…',
            options: [
              { id: 'a', text: 'Choosing the wrong model size' },
              { id: 'b', text: 'Prompt injection embedded in ticket text + hallucinated ticket references' },
              { id: 'c', text: 'The summary being too long' },
              { id: 'd', text: 'Python vs TypeScript for the orchestrator' }
            ],
            correctId: 'b',
            explanation: 'Untrusted data inside prompts is the classic enterprise failure. A verify step (claims checked against retrieved docs) + injection defenses are the first design requirements.',
            difficulty: 'advanced'
          },
          {
            id: 'q5',
            question: 'In an FDE interview you\'re asked "how would you handle X for a customer?" The strongest answer structure is…',
            options: [
              { id: 'a', text: 'Immediately propose the most sophisticated architecture' },
              { id: 'b', text: 'Clarify success criteria and constraints → propose options with tradeoffs → commit to the simplest thing that works → describe how you\'d verify it' },
              { id: 'c', text: 'List every technology you know' },
              { id: 'd', text: 'Ask what the interviewer wants to hear' }
            ],
            correctId: 'b',
            explanation: 'FDE interviews test customer-thinking, not just engineering. Success criteria first, tradeoffs in the open, simplest solution that meets them, and a verification plan — that IS the job.',
            difficulty: 'intermediate'
          }
        ]
      }
    },

    {
      id: 'challenge',
      type: 'challenge',
      title: 'Challenge: Write the Verify Step',
      content: {
        title: 'Anti-Hallucination Verifier',
        description: 'Write the verification function for the escalation-summarizer agent: given the agent\'s summary and the raw retrieved tickets, flag any ticket ID (pattern: PROJ-123) mentioned in the summary that does not appear in the source tickets.',
        difficulty: 'advanced',
        requirements: [
          'Extract ticket IDs matching the pattern <UPPERCASE>-<digits> from the summary',
          'Compare against IDs present in the raw ticket data',
          'Return a result object: { verified: bool, hallucinated: [ids] }',
          'verified is true ONLY when every cited ID exists in sources',
          'Handle the edge case: summary cites no IDs at all (verified = true, hallucinated = [])'
        ],
        starterCode: `function verifySummary(summary, tickets) {\n  // summary: string   tickets: [{ key, summary }]\n  // return { verified: bool, hallucinated: [ids] }\n}`,
        language: 'javascript',
        hints: [
          'A regex like /[A-Z]+-\\d+/g extracts the IDs',
          'Set operations make the comparison one line',
          'new Set([...]) removes duplicates for free'
        ],
        testCases: [
          { description: 'Extracts ticket ID pattern', expectedOutput: '/[A-Z]+-\\d+/g' },
          { description: 'Builds a valid ID set', expectedOutput: 'Set' },
          { description: 'Flags hallucinated IDs', expectedOutput: 'hallucinated' },
          { description: 'Returns verified flag', expectedOutput: 'verified' }
        ]
      }
    },

    {
      id: 'interview',
      type: 'interview',
      title: 'FDE Interview Preparation',
      content: { questions: [
        { difficulty: 'beginner', question: 'What is a Forward Deployed Engineer?', shortAnswer: 'A software engineer embedded with customers who ships working systems in their environment — engineering + consulting + product sense in one role.', deepExplanation: 'Coined by Palantir. FDEs write code, but they also scope with stakeholders, demo, handle auth/data edge cases on-site, and are measured on customer outcomes in production — not tickets closed.', example: 'An FDE at an AI lab spends Monday writing an MCP connector to the customer\'s ticketing system and Friday demoing a working agent to their ops VP.', commonMistake: 'Describing it as "a salesperson who codes" — it is an engineering role accountable for production systems.', followUp: 'How does FDE differ from a Solutions Architect in accountability?' },
        { difficulty: 'intermediate', question: 'Walk me through taking an LLM prototype to production at an enterprise.', shortAnswer: 'Scope measurable success → build the connector/tool layer → add guardrails + verify steps → build evals → harden (tenancy, auth, cost, observability) → shadow launch → iterate.', deepExplanation: 'The prototype is ~20% of the work. The long tail is enterprise reality: IdP integration, data permissions flowing into retrieval, injection defenses, eval gates in CI, cost budgets, and tracing for when it goes wrong.', example: 'Summarizer agent: JQL in, verified summaries out, golden-set eval gate at 85%, cost-capped runs, traces per run.', commonMistake: 'Answering only about the model — interviewers want the production-and-customer story.', followUp: 'Which step do candidates underestimate most?' },
        { difficulty: 'intermediate', question: 'How do you prevent an agent from hallucinating references (ticket IDs, order numbers)?', shortAnswer: 'Constrain and verify: typed retrieval + a verify step that checks every cited entity against sources, plus output schema validation.', deepExplanation: 'Generate claims → extract entity references (regex/structured output) → compare to the retrieved corpus → block or flag mismatches. Citations should come FROM retrieval, not be invented by the model.', example: 'verifySummary() flags PROJ-999 cited but never retrieved; the run fails closed and retries or escalates.', commonMistake: 'Trusting the model\'s own "confidence" — self-reported certainty does not survive production.', followUp: 'How do you eval this defense?' },
        { difficulty: 'advanced', question: 'An agent works in the demo but fails intermittently at the customer. Debug strategy?', shortAnswer: 'Reproduce from traces, not vibes: identify the failing input class → replay against the eval set → bisect (prompt? retrieval? tool failure? data edge case?) → add a regression case.', deepExplanation: 'Instrument everything first (tool calls, prompts, latency, judge scores). Most "random" failures are a data class the golden set never covered — adversarial content, empty results, timeouts. Every production failure becomes a permanent eval case.', example: 'Trace shows tool timeout on Mondays (report volume spike) → add bulk-input eval case + batching + backoff.', commonMistake: 'Retrying the same input and declaring it flaky — intermittency is a signal, not noise.', followUp: 'How do you keep the eval set from growing stale?' }
      ] }
    },

    { id: 'next', type: 'next', title: '', content: { prev: { title: 'Chapter 48: Linux Command Line', url: 'module-48.html' }, next: { title: 'Course Home', url: '../index.html' } } }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MODULE_49_DATA;
} else {
  window.MODULE_49_DATA = MODULE_49_DATA;
}
