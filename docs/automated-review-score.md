# Automated Visual Review Score

The goal of Visual QA is not only to capture screenshots. It should produce enough structured information that an agent can review its own UI work before asking for approval.

## Required review order

1. Runtime pass
- Page loads.
- No browser console errors.
- No failed asset requests.
- Required selectors exist.

2. Layout pass
- No horizontal overflow.
- No elements outside the viewport.
- No clipped text.
- No unexpected giant empty areas.
- Major sections maintain alignment.

3. Visual pass
- Compare screenshots against approved references.
- Review hierarchy, spacing, branding, and image usage.
- Flag changes that technically work but reduce quality.

## Suggested scoring

- Runtime: 25 points
- Layout: 35 points
- Visual consistency: 30 points
- Accessibility basics: 10 points

A score is a warning system, not a replacement for final design judgement. A technically perfect page can still have poor taste.

## Future automation rule

Agents should not report a UI task complete until a screenshot artifact and diagnostic report exist for the affected views.
