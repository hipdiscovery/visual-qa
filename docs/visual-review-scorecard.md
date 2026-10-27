# Automated Visual Review Scorecard

The Visual QA runner captures evidence. This scorecard defines the automated review layer.

## Required checks

### Critical failures (block approval)

- Text clipped or hidden
- Horizontal overflow
- Missing images/assets
- Browser console errors
- Broken navigation
- Layout outside viewport

### Visual quality checks

Review each screenshot for:

- Hero balance
- Unused large whitespace
- Alignment between related cards
- Consistent spacing rhythm
- Brand color consistency
- Typography hierarchy
- Image cropping quality
- Mobile adaptation

## Stress and interaction review

- Judge the real page against the source project's current design tokens and approved visual identity. Fix hierarchy, navigation, alignment and wasted space before polishing type, icons, imagery and transitions; avoid generic template patterns.
- Include zero/one/many items, unusually long labels, large values, delayed/error/stale states, missing images, open dialogs and nested controls. Use clearly labeled local fixtures, never invented live facts.
- Inspect desktop, mobile, relevant breakpoint edges, short viewports and enlarged text when supported. Check focus order, keyboard dismissal, touch spacing, safe areas, mobile keyboard overlap and purposeful reduced-motion behavior.
- For every changed control, verify initial state, action, resulting state and recovery in a browser journey when available. Visually inspect complete affected screenshots; passing diagnostics alone does not establish design quality.
- Record precisely which states and real-device checks could not be tested. Never expand the runner's public-page safety boundary to force a passing report.

## Three-pass validation

1. **Break test**
   - Introduce an intentional layout problem.
   - Confirm the QA system detects it.

2. **Feature test**
   - Run against the actual UI change.
   - Confirm screenshots and diagnostics match expectations.

3. **Regression test**
   - Confirm existing pages remain visually and functionally stable.

A UI change is not complete until all three passes succeed.
