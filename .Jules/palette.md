## 2024-05-23 - Icon-only buttons require tooltips
**Learning:** Icon-only buttons (like Floating Action Buttons) are often ambiguous without context. While `aria-label` supports screen readers, visual users benefit from tooltips to understand the action before clicking.
**Action:** Always wrap icon-only buttons with a `Tooltip` component that displays the action name on hover. Ensure the button also has an `aria-label` (which can default to the tooltip text).
