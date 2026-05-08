# HomestayDorm Performance UI

**version:** 1.0.0-alpha
**name:** HomestayDorm Management System
**description:** A high-density, task-critical operational interface designed for hospitality management. Optimizes for rapid data entry, real-time inventory monitoring, and keyboard-driven workflows in fast-paced lodging environments.

## Colors
**primary:** "#1A237E"  // Deep Navy: Focus and authority
**primary-light:** "#283593"
**primary-container:** "#E8EAF6"
**secondary:** "#F0F2F5"  // Light Gray: Main work surface
**secondary-dark:** "#E2E5EA"
**secondary-darker:** "#C8CDD6"
**on-secondary:** "#8A93A6"
**success:** "#2E7D32"  // Actionable/Available
**success-container:** "#E8F5E9"
**error:** "#C62828"    // Conflict/Critical Alert
**error-container:** "#FFEBEE"
**warning:** "#E65100"  // Pending/Warning
**warning-container:** "#FFF3E0"
**surface:** "#FFFFFF"
**on-surface:** "#1A1F36"
**on-surface-secondary:** "#4A5568"
**border:** "#DDE1E9"

## Typography
**headline-lg:**
  fontFamily: "Segoe UI, system-ui, sans-serif"
  fontSize: 15px
  fontWeight: 600
  lineHeight: 1.3
**headline-md:**
  fontFamily: "Segoe UI, system-ui, sans-serif"
  fontSize: 13px
  fontWeight: 600
  lineHeight: 1.4
**body-md:**
  fontFamily: "Segoe UI, system-ui, sans-serif"
  fontSize: 13px
  fontWeight: 400
  lineHeight: 1.5
**body-sm:**
  fontFamily: "Segoe UI, system-ui, sans-serif"
  fontSize: 12px
  fontWeight: 400
  lineHeight: 1.5
**label-md:**
  fontFamily: "Segoe UI, system-ui, sans-serif"
  fontSize: 11px
  fontWeight: 600
  lineHeight: 1
  letterSpacing: 0.06em
  textTransform: uppercase
**label-sm:**
  fontFamily: "Segoe UI, system-ui, sans-serif"
  fontSize: 10px
  fontWeight: 500
  lineHeight: 1
**mono:**
  fontFamily: "Consolas, monospace"
  fontSize: 11px
  fontWeight: 400

## Spacing & Measurements
**xs:** 4px
**sm:** 8px
**md:** 12px
**lg:** 16px
**xl:** 24px
**topbar-height:** 44px
**sidebar-width:** 240px
**gutter:** 10px
**content-padding:** 16px

## Rounding
**none:** 0px
**xs:** 3px     // Hotkeys
**sm:** 5px     // Buttons, Inputs, Panels
**md:** 8px     // Grid Cards
**lg:** 12px
**full:** 9999px // Status Pills/Chips

## Components

### Shell
**topbar:**
  backgroundColor: "{colors.primary}"
  textColor: "#FFFFFF"
  height: "{spacing.topbar-height}"
  content: "Left-aligned HomestayDorm brand title only"
  brandTypography:
    fontFamily: "serif"
    fontSize: "22px mobile / 26px desktop"
    fontWeight: 700
    lineHeight: 1
  behavior: "No logo badge, active module label, search hint, hotkey, or logout action in the header"
**sidebar:**
  backgroundColor: "{colors.surface}"
  textColor: "{colors.on-surface-secondary}"
  width: "{spacing.sidebar-width}"
  borderRight: "1px solid {colors.border}"
  layout: "Grouped navigation sections with uppercase labels"
  sectionTypography:
    fontSize: 10px
    fontWeight: 600
    letterSpacing: 0.08em
    textTransform: uppercase
    textColor: "{colors.on-secondary}"
  item:
    display: "icon + label + optional badge"
    padding: "8px 14px"
    borderLeft: "3px solid transparent"
    fontSize: 12px
    textColor: "{colors.on-surface-secondary}"
  itemHover:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.primary}"
  itemActive:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.primary}"
    borderLeft: "3px solid {colors.primary}"
    fontWeight: 500
  badge:
    backgroundColor: "{colors.error-container}"
    textColor: "{colors.error}"
    rounded: "8px"
    fontSize: 10px
**nav-tab-active:**
  borderBottom: "2px solid #69F0AE"
  textColor: "#FFFFFF"

### Controls
**button-primary:**
  backgroundColor: "{colors.primary}"
  textColor: "#FFFFFF"
  rounded: "{rounded.sm}"
  padding: "7px 14px"
  typography: "{typography.body-sm}"
**input:**
  backgroundColor: "{colors.surface}"
  border: "1px solid {colors.border}"
  rounded: "{rounded.sm}"
  padding: "7px 10px"
**hotkey:**
  backgroundColor: "{colors.secondary}"
  textColor: "{colors.on-surface-secondary}"
  rounded: "{rounded.xs}"
  typography: "{typography.mono}"

### Feedback & Status
**status-pill-success:**
  backgroundColor: "{colors.success-container}"
  textColor: "{colors.success}"
  rounded: "{rounded.full}"
  padding: "3px 9px"
**status-pill-error:**
  backgroundColor: "{colors.error-container}"
  textColor: "{colors.error}"
  rounded: "{rounded.full}"
**status-pill-warning:**
  backgroundColor: "{colors.warning-container}"
  textColor: "{colors.warning}"
  rounded: "{rounded.full}"
**toast:**
  backgroundColor: "{colors.primary}"
  textColor: "#FFFFFF"
  rounded: "{rounded.md}"
  padding: "8px 12px"
  typography: "{typography.body-sm}"
  role: "status"
  placement: "Inline in the active page flow, usually below the page header and above the main content"
  behavior: "Appears after an action completes; remains visible until the user changes context or another message replaces it"
**success-toast:**
  example: "Đã chuyển phiếu thanh toán sang trạng thái chờ kế toán xử lý."
  backgroundColor: "{colors.primary}"
  textColor: "#FFFFFF"
  rounded: "{rounded.md}"
  padding: "8px 12px"
  typography:
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  width: "Full available content width"
  border: "none"
  icon: "none by default"
  shadow: "none"
  usage: "Use for successful user actions, completed saves, submitted forms, or completed state transitions"

### Data Display
**panel:**
  backgroundColor: "{colors.surface}"
  border: "1px solid {colors.border}"
  rounded: "{rounded.md}"
**stat-card:**
  backgroundColor: "{colors.surface}"
  padding: "{spacing.md}"
  rounded: "{rounded.md}"
**grid-cell-active:**
  backgroundColor: "{colors.success-container}"
  textColor: "{colors.success}"
  rounded: "{rounded.md}"
**grid-cell-blocked:**
  backgroundColor: "{colors.error-container}"
  textColor: "{colors.error}"
**grid-cell-selected:**
  border: "2.5px solid {colors.primary}"

### Overlays & Modals
**modal-backdrop:**
  backgroundColor: "rgba(0, 0, 0, 0.6)"
  backdropFilter: "blur(4px)"
  zIndex: 100
**modal-container:**
  backgroundColor: "{colors.surface}"
  rounded: "{rounded.xl}"
  shadow: "xl (High elevation to distinct from main surface)"
  width: "Responsive, max-width typically between 400px and 640px"
  layout: "Vertical flex column: Header -> Scrollable Body -> Footer"
**modal-header:**
  backgroundColor: "{colors.primary}"
  textColor: "#FFFFFF"
  padding: "16px 20px"
  typography: "{typography.headline-md} or larger"
  closeButtonPlacement: "Top right corner, vertically centered with title. Uses translucent white color."
**modal-body:**
  backgroundColor: "{colors.surface}"
  padding: "20px 24px"
  layout: "Vertical flow with appropriate gaps (16px to 24px) between input sections."
**modal-footer:**
  backgroundColor: "#FAFBFF"
  borderTop: "1px solid {colors.border}"
  padding: "16px 20px"
  layout: "Flexbox, horizontal right-aligned (justify-end)."
  buttonPlacement: "Primary/Submit action button MUST be placed on the extreme right. Secondary/Cancel action buttons MUST be placed immediately to the left of the Primary button. This ensures a consistent forward-moving workflow."

## Layout Strategy
*   **Architecture:** Fixed shell (topbar + sidebar) with a fluid, multi-pane content area.
*   **Density:** Aim for >50% information density. Use 10px gutters to keep elements tight but distinct.
*   **Elevation:** No shadows. Use color layers: Background (#F0F2F5) -> Surface (#FFFFFF) -> Interactive Hover (#F0F2F5).
*   **Grid:** 4-column stat row followed by 1.3fr / 1fr split panes for operational workflows.

## Guiding Principles
*   **Performance First:** Zero decorative animations or illustrations. Every pixel must serve a functional purpose.
*   **Color as Meaning:** Green/Red/Amber are reserved for status semantics only. Navy is for action and structure.
*   **Keyboard Fluency:** Include visible hotkey hints (`[F1]`, `[D]`) for all primary actions.
*   **Validation:** Surface errors immediately via high-contrast border changes and dedicated status panels rather than layout-shifting inline text.
*   **Typographic Rigor:** Only two weights (400, 600). Use `label-md` (all-caps) to separate metadata from operational data.
