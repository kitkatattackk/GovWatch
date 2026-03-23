# Design System Strategy: The Liquid Obsidian Directive

## 1. Overview & Creative North Star: "The Ethereal Conduit"
This design system moves away from the static, "boxy" nature of traditional news apps. Our Creative North Star is **The Ethereal Conduit**. We are not just displaying data; we are presenting information through a high-end, futuristic lens that feels fluid, tactile, and alive. 

To break the "template" look, this system leans into **intentional depth and atmospheric lighting**. Instead of rigid grids, we use overlapping glass layers and high-contrast typography scales. We lean into the "Obsidian" depth of the background to make the "Cyan" and "Blue" accents feel like they are glowing from within the interface. The goal is a UI that feels like a precision instrument—polished, premium, and undeniably custom.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, nocturnal foundation, punctuated by electric, "liquid" accents.

### The Surface Hierarchy (Nesting Depth)
We do not use flat planes. We use a "stacked" hierarchy to define importance:
*   **Base Layer (`surface` / `#0b0e14`):** The infinite void. Everything starts here.
*   **The Well (`surface_container_lowest` / `#000000`):** Used for inset content or "sunken" search bars to create a sense of carved-out space.
*   **The Plateau (`surface_container_low` / `#0f141a`):** For secondary sectioning of the screen.
*   **The Focus (`surface_container_high` / `#1b2028`):** For interactive components that need to feel closer to the user.

### The "No-Line" Rule
**Strict Prohibition:** 1px solid borders are forbidden for sectioning. 
Boundaries must be defined solely through background color shifts or tonal transitions. Use the difference between `surface_container_low` and `surface_container` to separate news categories. If you feel the need for a line, increase the vertical spacing (Scale `6` or `8`) instead.

### The "Glass & Gradient" Rule
To achieve the signature "Liquid" look, floating elements must use **Glassmorphism**:
*   **Backdrop:** `surface_variant` at 40% - 60% opacity.
*   **Blur:** 20px - 40px Backdrop Blur.
*   **Soul Gradients:** Main CTAs should not be flat. Use a linear gradient from `primary` (`#81ecff`) to `primary_container` (`#00e3fd`) at a 135-degree angle to simulate light hitting a liquid surface.

---

## 3. Typography: Editorial Precision
We use **Manrope** exclusively. It is a modern, geometric sans-serif that maintains high legibility even at small sizes against dark backgrounds.

*   **Display (`display-lg` to `display-sm`):** Reserved for breaking news or high-impact editorial features. Use these sparingly to create a "Signature" look that breaks the grid.
*   **Headline (`headline-lg`):** Our primary story titles. Set with tight letter-spacing (-0.02em) to feel authoritative and "tight."
*   **Body (`body-lg` / `body-md`):** The workhorse. Always use `on_surface` (`#f1f3fc`) for maximum contrast. Never use pure white (#FFFFFF) for long-form reading; the slight blue-grey tint of `on_surface` reduces eye strain in dark mode.
*   **Labels (`label-md`):** Use `primary` (`#81ecff`) for category tags (e.g., "TECH", "POLITICS") in all-caps with 0.05em tracking to create a premium, metadata-heavy feel.

---

## 4. Elevation & Depth: Tonal Layering
We do not use drop shadows to mimic material. We use "Ambient Glow" and "Tonal Stacking."

*   **The Layering Principle:** Place a `surface_container_highest` card on a `surface` background. The subtle 4% difference in luminosity creates a sophisticated "lift" without visual clutter.
*   **Ambient Shadows:** For floating elements (like a navigation bar), use an extra-diffused shadow: `Blur: 40px, Spread: 0, Opacity: 8%`. The shadow color must be the `surface_tint` (`#81ecff`) to simulate light refracting through glass.
*   **The "Ghost Border" Fallback:** If a container requires a boundary (e.g., a card over a complex image), use the `outline_variant` token at **15% opacity**. This creates a "specular highlight" on the edge of the glass rather than a physical stroke.

---

## 5. Components

### Cards (The Hero of the System)
*   **Structure:** No dividers. Use `Spacing 4` (1.4rem) between elements.
*   **Style:** `surface_container_low` background with a `xl` (1.5rem) corner radius.
*   **Refinement:** Apply a subtle top-down gradient highlight (Ghost Border) on the top edge only to simulate "Liquid Glass" catching the light.

### Buttons
*   **Primary:** Gradient of `primary` to `primary_container`. Text color: `on_primary` (`#005762`). Radius: `full` (pill shape).
*   **Tertiary (Ghost):** No background. Use `primary` text. Upon hover/press, a subtle `surface_bright` glow should appear behind the text.

### Inputs & Search
*   **Style:** `surface_container_lowest` (the "Well" effect). 
*   **Focus State:** The border glows with a 1px `primary` Ghost Border at 40% opacity and a subtle `primary_dim` outer glow.

### News Ticker / Chips
*   **Style:** Selection chips use `secondary_container` with `on_secondary_container` text.
*   **Interaction:** When selected, a chip should emit a subtle `secondary` glow.

### The "Liquid" Progress Bar
*   For article reading progress, use a `primary` to `secondary` horizontal gradient. The bar should be thin (2px) but have a high-gloss glow effect that spills slightly onto the content below.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Place a high-impact `display-md` headline overlapping a glass card to create a custom editorial feel.
*   **Embrace Negative Space:** Use the large gaps in the Spacing Scale (`12`, `16`) to let the "Obsidian" background breathe.
*   **Layer Images:** Place text over semi-transparent glass overlays that sit atop high-resolution imagery.

### Don’t:
*   **Don't use Divider Lines:** If you need to separate two news stories, use a background shift from `surface` to `surface_container_low`. Lines are for "legacy" apps.
*   **Don't use Pure Grey:** Every neutral must be tinted with the deep blues of the Obsidian palette.
*   **Don't Over-Glow:** If everything glows, nothing is important. Reserve the high-gloss `primary` accents for actionable items or breaking news alerts only.
*   **Don't Use Sharp Corners:** Every interactive element must use at least the `md` (0.75rem) radius to maintain the "liquid" fluid aesthetic.

---
**Director's Note:** This system is about the tension between the dark, heavy background and the light, ethereal glass layers. Always ask: "Does this feel like it was poured, or was it just placed?" If the latter, add more blur and tonal nesting.