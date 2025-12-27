## 2024-05-23 - [RichTextEditor Shortcut Hints]
**Learning:** Adding keyboard shortcut hints to tooltips is a high-value, low-effort way to improve discoverability for power users without cluttering the UI.
**Action:** Look for other areas where keyboard shortcuts exist but are not surfaced (e.g., map controls, media playback).

## 2025-02-18 - [Emoji Picker Accessibility]
**Learning:** Icon-only buttons must have an accessible name (aria-label) and sufficient touch target size (minimum 44x44px or similar standard). Literal emojis as button content can be problematic for screen readers and styling; using SVG icons provides better control and consistency.
**Action:** Always check icon buttons for aria-labels and minimum size. Prefer using SVG icons over text emojis for interactive elements.
