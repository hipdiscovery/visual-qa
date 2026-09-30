# AI UI Review Workflow

## Purpose

This repository is the required visual verification layer before approving UI work.
The goal is to prevent code-only approval when the rendered experience is wrong.

## Required workflow

1. Make the UI change in the source repository.
2. Deploy a preview or public build.
3. Run Visual QA screenshots automatically.
4. Review rendered screenshots before approval.
5. Fix visual issues and rerun.
6. Only approve after the final pass.

## Required review checks

### Visual
- Hero/layout hierarchy feels intentional.
- No large accidental empty spaces.
- Sections align correctly.
- Images use correct crops and assets.
- Typography does not feel compressed or oversized.

### Technical
- No console errors.
- No failed network assets.
- No clipped text.
- No horizontal overflow.
- No missing images or fonts.

### Responsive
Check at minimum:
- Desktop owner viewport.
- Compact desktop.
- Mobile.
- Small mobile.

## Three-pass rule

Every major UI change should pass:

1. Intentional failure test: verify the QA system catches a known layout issue.
2. Real feature test: verify the changed UI renders correctly.
3. Regression test: verify unrelated pages remain functional.

Screenshots are the source of truth for visual approval. Diagnostics are supporting evidence only.
