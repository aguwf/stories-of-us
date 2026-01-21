## 2025-02-18 - [Tooltip vs Title]
**Learning:** Replacing native `title` attributes with custom `Tooltip` components provides a more consistent visual experience and allows for better styling, while `aria-label` ensures robust accessibility. This pattern should be preferred for icon-only buttons.
**Action:** When auditing icon-only buttons, look for `title` attributes and upgrade them to `Tooltip` + `aria-label`.

## 2025-05-21 - [Tooltip Composition]
**Learning:** When wrapping existing interactive elements (like `Button`) with `Tooltip`, use the `asChild` prop on `TooltipTrigger` to prevent hydration mismatches and ensure the trigger merges props correctly onto the child element.
**Action:** Always verify `asChild` is used when the trigger content is already an interactive component.
