## TicketChain Design System

Version: 1.0 (derived from `src/theme/tokens.js`)

### Theme Modes
Two primary modes: 
- Neon Night (dark) – immersive, glassy, neon accent glow.
- Anime Daylight (light) – soft pastel gradients, airy surfaces.

### Color Tokens
Dark Mode Core:
- Background gradient: #060b17 → #101b2a
- Surface: #101b2a / Alt: #162335
- Text primary: #e4ecff, secondary: #8aa2c2
- Accents: cyan #00e5ff, pink #ff29e6, violet #8f6eff, lime #b5ff3b
- States: success #35d49a, warning #ffb347, error #ff4d61, info #42b7ff

Light Mode Core:
- Background gradient: #ffffff → #f5f8ff
- Surface: #ffffff / Alt: #f1f5ff
- Text primary: #1d2442, secondary: #54627d
- Accents: cyan #2ab9e6, pink #ff4fcf, violet #8f6eff, lime #98d92e
- States: success #1fa971, warning #ff9a2f, error #e2304c, info #268ad6

### Elevation & Surfaces
- Glass panel (dark): backdrop blur 10px, rgba(16,27,42,0.85), subtle border rgba(255,255,255,0.10)
- Glass panel (light): rgba(255,255,255,0.85), border rgba(0,0,0,0.12)
- Hover glow: accent confluence with soft drop shadows.

### Spacing Scale
`4, 8, 12, 16, 20, 24, 32` (see `theme/tokens.js` mapping). Use multiples of 4.

### Radius Scale
- 6 (sm), 12 (md default), 18 (lg), 999 (pill)

### Shadows
- glowAccent: neon composite; use sparingly (limit simultaneous glow to reduce GPU overdraw)
- focus ring: 0 0 0 2px rgba(0,229,255,0.65)

### Typography
- Font stack: Inter, fallback to Roboto / system
- Headings: h1/h2 weight 700; h3/h4 weight 600
- Body1 line-height 1.55
- Buttons: 600 weight, no uppercase

### Motion
- Base durations: fast 120ms, base 240ms, slow 400ms
- Theme blast: 900ms cubic-bezier(.65,.02,.35,1)
- Respect `prefers-reduced-motion`; suppress blast & long-running glow loops.

### Components (Guidelines)
Navbar:
- Gradient / glass background with subtle border
- Theme toggle triggers radial blast
- Network chip + balance visible when connected

SeatMap:
- Grid semantics: role=grid, gridcell children, arrow key navigation
- Seat ID: RowLetter-Number (A-1)
- Booked vs Selected states must meet contrast AA on both backgrounds

Transaction Panel:
- Max width 360, scrollable past ~6 items
- Status chips color-coded (pending/warning, mining/info, confirmed/success, error/error)

Buttons:
- Primary: filled accent or network color
- Secondary: outline with gradient underline on hover (optionally)

Chips:
- Use for network and filters; maintain accessible color contrast (text contrast ≥ 4.5:1)

Cards:
- Soft glow on hover; remove heavy transitions in perf mode

### Accessibility
- Min tap target: 40px for interactive seat & nav items
- Focus outlines always visible (do not rely solely on color shift)
- Contrast targets: Body text 4.5:1, Large text 3:1, Icons 3:1 vs background
- Provide reduced motion fallback (`body.perf-mode` or `prefers-reduced-motion`)

### Theme Toggle Blast
- Element: `.theme-blast`
- Expands transform scale from 0 → screen diameter factor
- Mix-blend: screen for luminous effect in dark, subtle fade in light
- Auto cleaned after animation end

### Real-Time Extensions (Planned)
- WebSocket or on-chain event subscription updating services and seat states
- Transaction queue streaming state changes to panel

### Token JSON Export (Minimal Example)
See `src/theme/tokens.js` for programmatic source; keep this doc human-aligned with code.

### Maintenance
- When adding a new accent, update both modes & contrast test.
- Run a contrast audit after modifying base surfaces.

---
Last updated: (auto-generated baseline). Update when token or palette changes.