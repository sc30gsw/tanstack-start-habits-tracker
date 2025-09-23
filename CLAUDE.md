# Claude Code Spec-Driven Development

Kiro-style Spec Driven Development implementation using claude code slash commands, hooks and agents.

## Project Context

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`
- Commands: `.claude/commands/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines
- Think in English, generate responses in English

## Workflow

### Phase 0: Steering (Optional)
`/kiro:steering` - Create/update steering documents
`/kiro:steering-custom` - Create custom steering for specialized contexts

Note: Optional for new features or small additions. You can proceed directly to spec-init.

### Phase 1: Specification Creation
1. `/kiro:spec-init [detailed description]` - Initialize spec with detailed project description
2. `/kiro:spec-requirements [feature]` - Generate requirements document
3. `/kiro:spec-design [feature]` - Interactive: "Have you reviewed requirements.md? [y/N]"
4. `/kiro:spec-tasks [feature]` - Interactive: Confirms both requirements and design review

### Phase 2: Progress Tracking
`/kiro:spec-status [feature]` - Check current progress and phases

## Development Rules
1. **Consider steering**: Run `/kiro:steering` before major development (optional for new features)
2. **Follow 3-phase approval workflow**: Requirements → Design → Tasks → Implementation
3. **Approval required**: Each phase requires human review (interactive prompt or manual)
4. **No skipping phases**: Design requires approved requirements; Tasks require approved design
5. **Update task status**: Mark tasks as completed when working on them
6. **Keep steering current**: Run `/kiro:steering` after significant changes
7. **Check spec compliance**: Use `/kiro:spec-status` to verify alignment

## Steering Configuration

### Current Steering Files
Managed by `/kiro:steering` command. Updates here reflect command changes.

### Active Steering Files
- `product.md`: Always included - Product context and business objectives
- `tech.md`: Always included - Technology stack and architectural decisions
- `structure.md`: Always included - File organization and code patterns

### Custom Steering Files
<!-- Added by /kiro:steering-custom command -->
<!-- Format:
- `filename.md`: Mode - Pattern(s) - Description
  Mode: Always|Conditional|Manual
  Pattern: File patterns for Conditional mode
-->

### Inclusion Modes
- **Always**: Loaded in every interaction (default)
- **Conditional**: Loaded for specific file patterns (e.g., "*.test.js")
- **Manual**: Reference with `@filename.md` syntax


## AI Operation Principles (Highest Priority)

1. **Pre-execution Confirmation**: AI must always report its work plan before file generation, updates, or program execution, obtain y/n user confirmation, and halt all execution until receiving 'y'.

2. **No Unauthorized Workarounds**: AI must not perform detours or alternative approaches on its own; if the initial plan fails, it must seek confirmation for the next plan.

3. **User Authority**: AI is a tool and decision-making authority always belongs to the user. Even if user suggestions are inefficient or irrational, AI must not optimize but execute as instructed.

4. **Absolute Rule Compliance**: AI must not distort or reinterpret these rules and must absolutely comply with them as top-priority commands.

5. **Compliance with Guidelines**: AI must not violate prohibitions in Claude.md and must develop according to coding-rules.md.

6. **Mandatory Principle Display**: AI must verbatim output these 6 principles at the beginning of every chat before responding.

## Additional Information Files
- @REQUIREMENTS.md.md - Project requirements document
- `.claude/architecture.md` - Project architecture document
- @CODING-STANDARDS.md  - Project coding conventions, directory structure, prohibitions

## Prohibited Items (Highest Priority)
- Excessive use of `any` type (use TypeScript Utility types whenever possible)
- Leaving `console.log` in production environment
- Committing untested code
- Direct writing of security keys

## Important Instruction Reminders (Highest Priority)
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User

## Chat Output Format
```
[AI Operation 6 Principles]
[main_output]
#[n] times. # n = increment for each chat (#1, #2...)
```