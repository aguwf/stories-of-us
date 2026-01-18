## 2025-02-18 - [Tooltip vs Title]
**Learning:** Replacing native `title` attributes with custom `Tooltip` components provides a more consistent visual experience and allows for better styling, while `aria-label` ensures robust accessibility. This pattern should be preferred for icon-only buttons.
**Action:** When auditing icon-only buttons, look for `title` attributes and upgrade them to `Tooltip` + `aria-label`.

## 2026-01-18 - [Adding Tooltips to Motion Components]
**Learning:** Adding tooltips to `motion.button` (Framer Motion) components works seamlessly with Radix UI `TooltipTrigger` using the `asChild` prop. This allows for accessible, animated floating action buttons without complex wrapper hierarchies.
**Action:** Use `TooltipTrigger asChild` directly wrapping `motion.button` when adding tooltips to animated interactive elements.
