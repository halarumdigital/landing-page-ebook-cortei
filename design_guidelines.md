# Design Guidelines: Barbershop/Salon Lead Capture Page

## Design Approach

**Reference-Based Approach**: Drawing inspiration from high-converting landing pages like Mailchimp, Typeform, and ConvertKit that excel at lead capture, combined with modern service industry aesthetics seen in platforms like Square Appointments and Booksy.

**Design Principles**:
- Conversion-focused: Every element drives toward form completion
- Trust-building: Professional aesthetics that convey expertise
- Clarity: Clear value proposition and minimal friction
- Masculine elegance: Sophisticated barbershop aesthetic

## Layout System

**Split-Screen Architecture** (Desktop):
- Left side (50%): Content area with headline and supporting text
- Right side (50%): Form container with subtle elevation
- Full viewport height (100vh) for immediate impact
- Mobile: Stack vertically (content first, then form)

**Spacing System**:
Primary units: `p-4`, `p-6`, `p-8`, `p-10` for consistent rhythm
Section padding: `py-12` mobile, `py-20` desktop
Form field spacing: `space-y-6`
Container padding: `px-6` mobile, `px-10` desktop

**Grid Structure**:
- Desktop: `grid-cols-2` with `gap-16`
- Tablet: `grid-cols-1` with centered 600px max-width
- Mobile: Full-width with `px-6` gutters

## Typography Hierarchy

**Font Selection**: Google Fonts - Poppins (primary)
- Modern, geometric sans-serif that conveys professionalism
- Excellent readability for both headlines and body text

**Type Scale**:
- Eyebrow text: `text-sm` `font-semibold` `tracking-widest` `uppercase`
- Primary headline (H1): `text-4xl md:text-5xl` `font-bold` `leading-tight`
- Secondary headline (H2): `text-2xl` `font-semibold`
- Body text: `text-base` `leading-relaxed`
- Form labels: `text-lg` `font-bold`
- Legal/fine print: `text-xs`

**Content Hierarchy**:
1. Eyebrow label (attention grabber)
2. Main headline (clear benefit)
3. Sub-headline (pain point/question)
4. Supporting paragraphs (2 blocks of text explaining value)

## Component Library

### Header Component
- Logo/brand mark on left (icon + text lockup)
- Minimal navigation (desktop only, hamburger on mobile)
- Height: `py-8`
- Transparent background over hero image

### Hero Background
- Full-bleed barbershop image (modern interior with barber chairs, mirrors, tools)
- Dark overlay (80% opacity) for text legibility
- Image should show: professional barbershop interior, warm lighting, clean modern aesthetic

### Content Section (Left Side)
- Maximum width: None (fills 50% of grid)
- Vertical centering with `items-center`
- Text hierarchy with progressive disclosure
- Eyebrow → H1 → H2 → 2 body paragraphs

### Form Container (Right Side)
- Elevated card design with `shadow-2xl`
- Rounded corners: `rounded-xl`
- Internal padding: `p-8 md:p-10`
- Form title above fields
- Three input fields + submit button
- Legal disclaimer below button

### Form Elements
**Input Fields**:
- Background: Light neutral fill
- Border: Transparent (focus ring on interaction)
- Rounded: `rounded-lg`
- Padding: `p-4`
- Placeholder text for labels
- Focus state: Ring accent (2px)

**Input Specifications**:
1. Nome completo (text input)
2. Email (email input with validation)
3. WhatsApp com DDD (tel input with pattern validation)

**Submit Button**:
- Full width: `w-full`
- Bold text: `font-bold`
- Generous padding: `py-4 px-4`
- Rounded: `rounded-lg`
- Shadow: `shadow-md`
- Hover state with smooth transition

### Success Message Component
- Modal or inline message after submission
- Clear confirmation text
- Download link/button for PDF
- Thank you message

## Visual Elements

### Images
**Primary Hero Image**:
- Placement: Full background of entire viewport
- Subject: Modern barbershop interior
- Mood: Professional, inviting, masculine, contemporary
- Key elements: Barber chairs, large mirrors, good lighting, clean lines
- Treatment: Dark overlay (60-80% opacity) for text legibility

**Image Specifications**:
- High-resolution (minimum 1920x1080)
- Professional photography quality
- Warm color temperature
- Shallow depth of field acceptable for atmosphere

### Decorative Elements
- Subtle dot pattern accents (top-left and bottom-right corners)
- Small, low-opacity decorative elements
- Do not overpower main content

### Icons
**Icon Library**: Material Design Icons (MDI) via Iconify
- Logo icon: Chart/grid-based geometric mark
- Mobile menu: Hamburger icon
- Form field icons (optional): User, envelope, phone
- Success state: Checkmark icon

## Interaction Patterns

### Form Validation
- Real-time validation on blur
- Visual feedback: Border/ring changes
- Error messages below fields
- Disabled submit until all fields valid

### Submit Flow
1. User fills all required fields
2. Click "GARANTIR MINHA VAGA" (or similar CTA)
3. Brief loading state
4. Success confirmation appears
5. Automatic PDF download triggers
6. Lead data saved to database

### Responsive Behavior
**Desktop (1024px+)**:
- Side-by-side layout
- Full viewport height
- Form sticky on scroll (optional)

**Tablet (768px-1023px)**:
- Stacked layout
- Content first, form second
- Reduced vertical spacing

**Mobile (<768px)**:
- Full-width stacked
- Larger touch targets (48px minimum)
- Simplified header (logo + hamburger only)
- Reduced font sizes appropriately

## Content Structure

### Left Side Content Block:
```
[EYEBROW TEXT]
[MAIN HEADLINE - Bold, Large]
[SUB-HEADLINE - Question format]
[BODY PARAGRAPH 1 - Problem statement]
[BODY PARAGRAPH 2 - Solution/expertise statement]
```

### Right Side Form Block:
```
[FORM TITLE]
[NAME INPUT]
[EMAIL INPUT]
[WHATSAPP INPUT]
[SUBMIT BUTTON]
[DISCLAIMER TEXT]
```

## Accessibility Considerations

- Semantic HTML5 form elements
- Proper label associations (sr-only for visual design)
- ARIA attributes for dynamic states
- Keyboard navigation support
- Focus indicators on all interactive elements
- Contrast ratios meet WCAG AA standards minimum
- Touch targets minimum 44x44px on mobile

## Performance Considerations

- Hero image optimization (WebP format preferred)
- Lazy loading for below-fold elements
- Minimal JavaScript for form validation
- CDN-hosted fonts and icons
- Form submission without page reload (AJAX)

## Conversion Optimization Elements

- Clear value proposition in headline
- Social proof opportunity (optional testimonial badge in header)
- Trust indicators (privacy assurance in disclaimer)
- Strong action-oriented CTA text
- Minimal form fields (only essential information)
- Immediate gratification (instant download promise)
- Professional aesthetics build credibility