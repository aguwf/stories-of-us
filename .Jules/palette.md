## 2025-02-18 - [Tooltip vs Title]
**Learning:** Replacing native `title` attributes with custom `Tooltip` components provides a more consistent visual experience and allows for better styling, while `aria-label` ensures robust accessibility. This pattern should be preferred for icon-only buttons.
**Action:** When auditing icon-only buttons, look for `title` attributes and upgrade them to `Tooltip` + `aria-label`.
