# Chapter 49 — Forward Deployed Engineer (FDE)

> **Senior SWE → Enterprise Applied AI.** FDEs embed with customers and turn LLM prototypes into hardened production systems — the premium role in applied AI right now.

**Companion video:** FDE transition & interview-prep masterclass — https://www.facebook.com/share/v/19hUGE3sWY/

---

## 1. Why FDE Is the Premium AI Role

- Palantir coined the role; OpenAI, Anthropic, and the applied-AI ecosystem now hire FDEs aggressively.
- The bottleneck in enterprise AI is **deployment**, not model quality — FDEs own that gap.
- Success metric: **customer outcomes in production**, not code shipped or deals influenced.

| Role | Owns | Distance to customer |
|---|---|---|
| Senior SWE | Features, systems | Far (via PM/EM) |
| Solutions Architect | Designs, demos | Near (pre-sales) |
| **FDE** | **Working systems on-site** | **Embedded** |

Not "prompt engineering": expect to debug an enterprise SSO flow, design a multi-tenant data plane, and explain tokens-per-dollar to a CFO — same week.

---

## 2. The FDE Skill Stack

| Layer | Tested on | SWE transfer |
|---|---|---|
| Engineering | APIs, pipelines, distributed systems, security | You have it |
| Applied AI | Agents, RAG, evals, model/cost tradeoffs | Learnable |
| Customer | Discovery, scoping, demos, stakeholders | Practice narrating tradeoffs |
| Production | Tenancy, authZ, observability, incidents | Your cloud edge — rare in candidates |

**30-day gap-fill:** wk1 agentic workflow E2E → wk2 MCP server vs real API → wk3 evals (golden set + judge + CI gate) → wk4 demo package (diagram, cost model, security story).

---

## 3. Agentic Workflow Architecture

```
Customer App → Orchestrator (plan→tools→reflect)
                ├→ Tool layer (MCP servers, typed + audited)
                ├→ Enterprise RAG (permission-trimmed retrieval)
                ├→ Eval pipeline (golden set, judge, CI gate)
                ├→ Guardrails (PII, injection, schema, cost cap)
                ├→ Traces & metrics (replay, don't guess)
                └→ Human review gate → verified result
```

Reliability lives in the orchestrator: retries, timeouts, budget caps, fallbacks.

---

## 4. MCP & Enterprise Connectors

Model Context Protocol standardizes how agents discover/call tools and data — "USB-C for AI integrations".

- Server exposes **tools** (functions), **resources** (readable data), **prompts**
- Typed contracts — schema-validated calls, never free-form SQL from a model
- Auth at the edge — server holds credentials, model sees sanitized results
- Audit trail — every call logged for compliance

**Where projects die:** OAuth vs legacy IdPs, row-level permissions flowing into retrieval, rate limits on decade-old APIs. Budget real time for the connector layer.

---

## 5. Evals — Making LLMs Measurable

Golden dataset → LLM-as-judge → CI gate at ~85%. Track missing expected facts explicitly, not just scores. A prompt/model change that regresses quality fails the build like any other test.

---

## 6. Production Hardening Checklist

- Tenancy isolation, secrets management, PII redaction
- Prompt-injection defense + output schema validation
- Verify step: every cited entity must exist in retrieved sources
- Cost cap per run — show the CFO the math
- Per-run traces: tokens, latency, tool calls, judge scores

---

# 🔬 Practical Lab — Design a Deployable Agent

**Scenario:** Acme Logistics — an agent that reads Jira escalations and summarizes them for ops each morning, deployable inside Acme's AWS account.

### Step 1 — Scope the contract
Success criteria: inputs, output format, latency budget, definition of "wrong". Which failures are tolerable?

### Step 2 — Design the tool layer
MCP signatures for `jira.search_issues`, `jira.get_comments`. Auth story + audit line per call.

### Step 3 — Draft the loop
Single call vs retrieve→draft→verify. Justify on cost and reliability. (Verify kills hallucinated ticket numbers.)

### Step 4 — Build the eval set
Five cases: normal day, empty day, 100-ticket day, non-English ticket, **injection attempt in a ticket title**.

### Step 5 — Harden it
Checklist: tenancy, secrets, PII, rate limits, cost cap, tracing — every item needs a mechanism, not a wish.

### Step 6 — Demo narrative
Three minutes: problem → architecture → live run → eval results → cost. Lead with outcome; architecture is evidence.
