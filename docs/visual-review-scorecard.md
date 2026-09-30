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
