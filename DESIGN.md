---
version: alpha
name: Lumina
description: Mobile-first Korean lost-and-found matching service. Calm indigo trust, clear money and status, no decorative chrome.
colors:
  primary: "#4338CA"
  on-primary: "#FFFFFF"
  primary-hover: "#3730A3"
  on-primary-hover: "#FFFFFF"
  secondary: "#4B5563"
  on-secondary: "#FFFFFF"
  background: "#F8FAFC"
  on-background: "#111827"
  surface: "#FFFFFF"
  on-surface: "#111827"
  border: "#CBD5E1"
  success: "#166534"
  on-success: "#FFFFFF"
  warning: "#92400E"
  on-warning: "#FFFFFF"
  danger: "#B91C1C"
  on-danger: "#FFFFFF"
  demo: "#FEF3C7"
  on-demo: "#92400E"
typography:
  headline-lg:
    fontFamily: ui-sans-serif, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  headline-md:
    fontFamily: ui-sans-serif, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.01em
  title-lg:
    fontFamily: ui-sans-serif, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.35
  body-md:
    fontFamily: ui-sans-serif, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: ui-sans-serif, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
  label-md:
    fontFamily: ui-sans-serif, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
  label-sm:
    fontFamily: ui-sans-serif, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.25
rounded:
  control: 10px
  card: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  "2xl": 32px
  "3xl": 48px
  gutter: 16px
  margin: 24px
components:
  page-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    typography: "{typography.body-md}"
    padding: "{spacing.xl}"
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.xl}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.control}"
    padding: "{spacing.lg}"
    height: 44px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.control}"
    padding: "{spacing.lg}"
    height: 44px
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.control}"
    padding: "{spacing.lg}"
    height: 44px
  caption:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.body-sm}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  badge-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-success}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
  badge-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-warning}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
  badge-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-danger}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
  banner-demo:
    backgroundColor: "{colors.demo}"
    textColor: "{colors.on-demo}"
    typography: "{typography.label-sm}"
    padding: "{spacing.md}"
  nav-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.control}"
    padding: "{spacing.sm}"
---

# Lumina DESIGN.md

Visual contract for the Lumina (Trainthon) frontend. Agents must follow these tokens and rules before inventing UI. Product, money, and API contracts live in `PRODUCT_CONTRACT.md` and `FE_MASTER.md`; this file is the look-and-feel source of truth.

## Overview

Lumina is a **calm, trustworthy, mobile-first Korean service** that connects people who lost something with people who found it. It is not a bounty marketplace and must not look like a flash sale, auction, or game.

The brand personality is **clear, careful, and human**. Screens should feel like a reliable messenger: short steps, readable Korean, obvious next actions. Indigo is the only brand accent. Money (5,000원 / 3,500원 / 1,500원) and status are always explicit. Demo or mock money must stay visually distinct from live payment.

Use generous whitespace, large touch targets, and system Korean sans-serif. Avoid novelty fonts, heavy shadows, gradients, and decorative illustration. If a value is not in this file, do not invent it.

## Colors

The palette is a single indigo accent on cool slate neutrals, plus semantic greens/ambers/reds for status. Color never carries meaning alone — pair it with text or an icon.

- **Primary (#4338CA):** The only brand accent. Primary buttons, selected nav, key focus. One primary action per screen.
- **Primary hover (#3730A3):** Pressed/hover of primary. Do not use as a second brand color.
- **On-background / on-surface (#111827):** Titles and body text.
- **Secondary (#4B5563):** Captions, helper text, secondary buttons. Not a second brand hue.
- **Background (#F8FAFC):** Page canvas.
- **Surface (#FFFFFF):** Cards, dialogs, sheets, inputs.
- **Border (#CBD5E1):** Fields and dividers. Prefer 1px borders over drop shadows.
- **Success (#166534):** Completed states (반환 완료, 지급 완료).
- **Warning (#92400E):** Waiting, pending, attention (결제 확인 중, 지급 대기).
- **Danger (#B91C1C):** Errors and destructive actions only.
- **Demo (#FEF3C7 / #92400E):** Persistent demo banner and “모의 데이터 · 실제 지급 아님” labels. Never style demo money as if it were live KRW settlement.

Do not add extra accent colors (pink CTAs, gold coins, probability meters). Do not use primary for success or danger.

## Typography

Use the **system Korean sans-serif stack** (`ui-sans-serif`, `system-ui`, Apple SD Gothic Neo, Noto Sans KR). Do not load paid or remote webfonts.

- **Headlines (28–36px, bold):** Page titles. Keep Korean line length short.
- **Title (20px, semibold):** Card and section headings.
- **Body (16px, regular):** Default copy. Mobile inputs must stay at **16px or larger** to avoid iOS zoom.
- **Secondary / labels (14px):** Helper text, badges, nav labels. Do not go below 14px for readable UI copy.
- Amounts use the same type scale with tabular, unambiguous `5,000원` formatting — never invent a display font for money.

## Layout

Mobile-first. Verify 360px, 390px, 768px, and 1440px.

- **Rhythm:** 4 / 8 / 12 / 16 / 24 / 32 / 48px. Do not introduce one-off spacing.
- **Touch:** Interactive targets are at least **44×44px**. Bottom nav and sticky CTAs must not cover content; add safe-area padding.
- **Width:** Forms max 640px. Page content max ~1200px, centered on desktop.
- **Desktop:** Brand left, primary nav, “분실물 찾기” / “습득물 등록”, profile. Mobile: home / 찾기 / 습득물 등록 / 내 활동 / 내 정보, with register visually primary but never icon-only.
- **Chat intake:** Chat bubbles are visual wrapping around a real form (label, error, submit). Do not fake an uneditable transcript.

## Elevation & Depth

Hierarchy is **tonal layers and borders**, not heavy shadow.

- Page sits on background; content on white surface cards with 1px `border`.
- Dialogs/sheets may use a light overlay; keep shadow soft and optional.
- Selected nav and primary buttons use fill, not glow.
- Honor `prefers-reduced-motion`. Motion is short and purposeful (150ms color/opacity), never decorative bounce.

## Shapes

Soft but not pill-everything.

- **Controls (buttons, inputs):** 10px radius.
- **Cards and modals:** 16px radius.
- **Badges and avatars:** full pill only for compact status chips.
- Do not mix sharp 0px corners with large squircles on the same screen.

## Components

### Buttons and inputs

Primary fill uses indigo; hover/active uses the darker indigo. Secondary is a surface button with secondary text and a border — not a second colored fill. Destructive actions use danger and require confirmation copy. Disable duplicate submits while a request is in flight.

Inputs share control radius and 16px body type. Labels stay visible (never placeholder-only). Invalid fields use danger text plus `aria-invalid`, not color-only outlines.

### Cards, badges, and demo

Cards are white, 16px radius, 24px padding. Status badges reuse success/warning/danger with on-* text. Demo mode keeps `banner-demo` visible on every screen that can show money, including checkout, rewards, and refund.

### Navigation and locked content

Active nav matches primary fill. Locked pickup/contact regions use secondary caption text such as “소유권 확인 후 안내” — never a teasing map pin, blurred address, or fake coordinates.

## Do's and Don'ts

- Do use only the colors, type, spacing, and radii in this file.
- Don't introduce a new hex, gradient, shadow, or font “to make it pop.”
- Do show 5,000원 / 3,500원 / 1,500원 from shared amount constants, not copied literals per screen.
- Don't dress demo or mock payments as live settlement.
- Do pair status color with a Korean label (완료, 대기, 오류).
- Don't encode state with color alone, or with fake metrics like “일치 확률 98%.”
- Do keep one primary CTA per screen and 44×44px targets.
- Don't hide precise storage location, phone numbers, or handoff codes in the visual design before the server allows them.
- Do render user and AI copy as plain text.
- Don't use `dangerouslySetInnerHTML` or runtime CSS CDNs.
