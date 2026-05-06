# Design Brief

## Direction

Government Recruitment Portal — A modern recruitment dashboard combining formal government aesthetics with contemporary card-based UI, delivering authority and clarity without bureaucratic coldness. Admin panel is a separate, minimal professional interface with no public branding.

## Tone

**Public:** Formal, trustworthy, and accessible — deep navy authority tempered by warm saffron accents. **Admin:** Utilitarian, professional, functional — cool grays with semantic status colors.

## Differentiation

**Public:** Dense information architecture in cards with loading skeletons and smooth transitions. **Admin:** Clean data tables, card-based forms, minimal sidebar navigation, green/red/yellow status badges — no decorative elements.

## Color Palette

### Public Site
| Token      | OKLCH           | Role                                |
|------------|-----------------|-------------------------------------|
| background | 0.98 0 0        | Light cream page background         |
| foreground | 0.18 0.02 263   | Deep navy text (government primary) |
| primary    | 0.35 0.16 263   | Deep navy authority color           |
| accent     | 0.70 0.24 72    | Saffron/amber highlights & CTAs     |
| secondary  | 0.90 0.04 263   | Light navy for subtle hierarchy     |
| muted      | 0.88 0 0        | Light gray for disabled/secondary   |
| card       | 0.99 0 0        | White elevated surfaces             |
| border     | 0.92 0.01 263   | Subtle navy dividers                |
| sidebar    | 0.22 0.04 263   | Dark navy sidebar background        |

### Admin Panel
| Token           | OKLCH           | Role                      |
|-----------------|-----------------|---------------------------|
| admin-bg        | 0.97 0 0        | White admin page bg       |
| admin-sidebar   | 0.25 0.02 263   | Cool gray sidebar         |
| admin-card      | 0.99 0 0        | White card surfaces       |
| admin-table-alt | 0.95 0.01 263   | Alternating table rows    |
| admin-success   | 0.65 0.16 142   | Green approval badge      |
| admin-warning   | 0.72 0.18 72    | Amber pending badge       |
| admin-danger    | 0.55 0.22 25    | Red rejection badge       |
| admin-header    | 0.24 0.02 263   | Dark header bar           |

## Typography

- **Display**: Fraunces — public site page headings only (government authority)
- **Body**: DM Sans — all text (public + admin), labels, descriptions
- **Mono**: Geist Mono — data fields, form inputs, code blocks
- **Admin Scale**: H1 `text-2xl font-body font-bold`, Label `text-sm font-body font-medium`, Body `text-base font-body font-normal`

## Elevation & Depth

**Public:** 4-level shadow system (base, hover, elevated, modal). **Admin:** Minimal shadows; depth via borders and background color alternation. Admin tables use row striping, no shadow stacking.

## Structural Zones

| Zone              | Background           | Border              | Notes                                                           |
|-------------------|----------------------|--------------------|----------------------------------------------------------------|
| Public Header     | `bg-card border-b`   | `border-border`    | Logo, portal name, saffron accent bar below                     |
| Public Sidebar    | `bg-sidebar`         | `border-sidebar-border` | Sticky dark navy nav with saffron hover accents          |
| Admin Header      | `bg-admin-header`    | None               | "Admin Panel" text, user/logout, minimal styling                |
| Admin Sidebar     | `bg-admin-sidebar`   | Right border only   | Fixed left nav, blue accent borders on active items             |
| Admin Content     | `bg-admin-bg`        | None               | White background, card forms, striped tables                    |
| Public Content    | Alternating `bg-background` / `bg-muted/10` | — | Sections alternate for rhythm; cards on white    |
| Footer            | `bg-muted/5 border-t` | `border-border`   | Government disclaimers, small text, center-aligned             |

## Spacing & Rhythm

16px base unit (rem: 1). **Public sections:** 24px gap, card 16px padding. **Admin:** tables use 12px row height padding, sidebar 12px internal, forms 16px cards with 24px sections.

## Component Patterns

- **Public Buttons**: Rounded 4px, saffron primary, navy secondary
- **Admin Buttons**: Rounded 4px, muted gray, blue accent for actions
- **Admin Badges**: Green (success), red (danger), yellow (pending), blue (info) — 4px radius, 4px-8px padding
- **Admin Sidebar Items**: 12px-16px padding, left 4px border indicator (blue when active), `bg-admin-sidebar-accent/20` on hover
- **Admin Tables**: Alternating rows (`admin-table-alt`), minimal borders, 12px cell padding, status badges inline

## Motion

- **Public:** Cards fade-in + slide-up (300ms), staggered 50ms, skeleton pulse-subtle (2s)
- **Admin:** Minimal motion; sidebar item left-border slide (150ms), button background shift (200ms), no page-level animations

## Constraints

- **Public:** No full-page gradients; depth through cards + chroma variation
- **Admin:** No decorative elements; data clarity prioritized; semantic token colors only
- **Both:** 16px minimum padding (mobile); 24px+ on desktop; semantic token colors; no raw hex in components
- **Admin Sidebar:** Fixed left position, scrollable if content exceeds viewport height

## Signature Details

**Public:** Saffron left-border accent (3px) on active sidebar items, animated in. **Admin:** Blue left-border accent (4px) on active sidebar items, crisp government office minimal aesthetic.
