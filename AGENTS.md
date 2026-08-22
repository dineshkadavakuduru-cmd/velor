# VELOR — Engineering & Design Constitution

## 1. Product

VELOR is a premium, cinematic live-sports command center.

It provides:
- Live scores
- Match schedules
- Standings
- Teams
- Players
- Leagues
- Live match events
- Player statistics
- Personalized favorites
- Game-day notifications

VELOR should feel like a combination of:
- A premium sports broadcast interface
- A modern data visualization platform
- A cinematic 3D experience
- A professional command center

It must NOT feel like:
- A generic SaaS dashboard
- An AI-generated landing page
- A template marketplace website
- A cryptocurrency dashboard
- A glassmorphism-heavy UI
- A childish gaming interface

---

# 2. Core Principles

### Premium over flashy

Every visual effect must have a purpose.

Do not add:
- Random gradients
- Excessive glow
- Unnecessary particles
- Constant animations
- Scroll-triggered fade-ins everywhere
- Decorative 3D elements with no relationship to sports

The interface should feel expensive because of:
- Composition
- Typography
- Spacing
- Motion
- Lighting
- Depth
- Information hierarchy

Not because of visual noise.

### Real data over decoration

Sports information is the product.

Visuals must support:
- Scores
- Match states
- Statistics
- Timelines
- Standings
- Player information

Never allow decorative elements to compete with important sports information.

### Motion has hierarchy

Motion should communicate:
- State changes
- Importance
- Direction
- Progress
- Live activity
- Interaction feedback

Animation must never make the interface harder to use.

---

# 3. Technology Stack

## Framework

- Next.js
- TypeScript
- App Router

## Styling

- Tailwind CSS
- CSS variables for design tokens

## UI

- Aceternity UI
- 21st.dev
- Custom components

External components must be adapted to VELOR's design language.

Do not blindly copy entire component libraries into the project.

## Motion

### Anime.js

Use Anime.js for:
- Cinematic opening sequences
- Large hero choreography
- Major visual transitions
- Score celebrations
- Special event sequences

Anime.js should control orchestrated timelines.

### Motion

Use Motion for:
- React UI interactions
- Hover states
- Press states
- Layout transitions
- Drag interactions
- Micro-interactions
- Presence transitions

Do not use Anime.js and Motion for the same interaction.

## 3D

- Three.js
- React Three Fiber
- Drei

3D must remain isolated from ordinary UI logic.

## State

- Zustand

Keep stores separated by responsibility.

Preferred stores:

- sportsStore
- userStore
- uiStore

Never create one giant global store.

## Database

- PostgreSQL
- Prisma
- Neon

## Cache

- Redis
- Upstash

## Authentication

- Auth.js

## Icons

- Lucide

---

# 4. Architecture

Use clear separation between:

Experience
↓
UI
↓
Motion
↓
Domain
↓
Data

Pages should compose features.

Pages should NOT contain:
- Database queries
- Sports API implementation
- Complex business logic
- Large animation timelines
- 3D scene implementation

---

# 5. Component Rules

Components should have one clear responsibility.

Prefer:

components/
├── ui/
├── navigation/
├── sports/
├── live/
├── dashboard/
└── 3d/

Avoid creating components solely to reduce file length.

Do not create unnecessary abstractions.

Do not create a generic component when a domain-specific component is clearer.

For example:

Good:
- MatchCard
- LiveScore
- StandingsTable
- PlayerStatCard

Bad:
- UniversalDataThing
- GenericContainerWrapper
- SuperCard
- UniversalSection

---

# 6. Design System

VELOR uses a dark cinematic visual language.

Core palette:

Background:
#05070B

Surface:
#0A0F17

Surface 2:
#101722

Live Cyan:
#18F0FF

Data Violet:
#7A5CFF

XP / Highlight Gold:
#FFB800

Success:
#20E080

Danger:
#FF4567

Primary text:
#F5F7FA

Muted text:
#8993A4

Do not introduce arbitrary colors when an existing design token is appropriate.

Prefer CSS variables/design tokens over hardcoded colors throughout components.

---

# 7. Typography

Display typography should feel like:
- Sports broadcast
- Editorial
- Technical
- Modern

Body typography should prioritize:
- Readability
- Density
- Clarity

Numbers should use a fixed-width/monospaced typeface where live values can change.

Live scores must not visually jump because of changing digit widths.

Typography hierarchy is more important than decorative effects.

---

# 8. Motion Rules

VELOR should have a deliberate motion language.

## Initial experience

Use one orchestrated cinematic introduction.

The opening sequence may establish:
- Brand
- Environment
- Live state
- Primary navigation
- Hero content

Do not animate every element independently.

## Micro-interactions

Use Motion for:
- Hover
- Press
- Expansion
- Collapse
- Layout changes
- Small state transitions

## Avoid AI-site motion patterns

Do NOT:
- Fade every section into view
- Animate every card on scroll
- Add random floating objects
- Add constant parallax
- Add excessive spring effects
- Animate text character-by-character everywhere

Animation should feel intentional.

---

# 9. 3D Rules

3D exists to strengthen the identity of VELOR.

Possible 3D elements:
- Sports globe
- Stadium environment
- Ball/object centerpiece
- Trophy
- Abstract sports geometry
- Data visualization environment

3D must never make the interface unusable.

Requirements:
- Lazy load heavy scenes
- Provide mobile fallback
- Respect reduced-motion preferences
- Avoid blocking initial content
- Monitor performance
- Avoid unnecessary high-poly assets

Never put complex Three.js implementation directly inside a page.

---

# 10. Performance

Performance is a feature.

Always consider:
- Bundle size
- Image optimization
- 3D asset size
- Animation cost
- Hydration cost
- API requests
- Cache usage
- Mobile GPU performance

Heavy components should be lazy-loaded.

3D should not block meaningful first paint.

Live data should be cached appropriately.

---

# 11. Data Architecture

The internal domain model must remain independent of the sports API provider.

External:

SPORTS API
↓
API ADAPTER
↓
NORMALIZATION
↓
VELOR DOMAIN MODEL
↓
CACHE / DATABASE
↓
APPLICATION
↓
CLIENT

Do not allow provider-specific response shapes to leak into UI components.

If the sports API changes, UI code should not need to change.

---

# 12. Live Data

Live sports data follows:

SPORTS API
↓
INGESTION
↓
NORMALIZATION
↓
REDIS
↓
POSTGRES
↓
REALTIME
↓
CLIENT

Use realtime updates only where they provide meaningful value.

Do not constantly poll every page.

---

# 13. API Rules

API access belongs in dedicated server-side modules.

Never expose private API keys to the browser.

Never put secrets in:
- Components
- Client-side hooks
- Zustand stores
- Public environment variables

Use environment variables.

Validate external API responses before they enter the domain layer.

---

# 14. Database Rules

Prisma is the database access layer.

Database logic belongs in:

lib/db/

Do not perform raw database queries directly inside UI components.

Database schema changes must be deliberate.

Avoid premature normalization when it provides no practical benefit.

---

# 15. Client vs Server

Prefer Server Components by default.

Use `"use client"` only when required for:
- Interaction
- Browser APIs
- Motion
- Three.js
- Zustand
- Client-side state

Do not turn entire page trees into Client Components unnecessarily.

---

# 16. Accessibility

VELOR must remain usable without animation.

Support:
- Keyboard navigation
- Focus states
- Semantic HTML
- Screen readers
- Sufficient contrast
- Reduced motion

Respect:

prefers-reduced-motion

When reduced motion is enabled:
- Disable unnecessary camera movement
- Reduce particles
- Reduce transition duration
- Remove decorative motion

Never remove essential information.

---

# 17. Responsive Design

Design from the beginning for:

- Desktop
- Laptop
- Tablet
- Mobile

Do not treat mobile as an afterthought.

3D experiences may use a simplified mobile composition rather than attempting to reproduce the desktop scene exactly.

---

# 18. AI Coding Rules

AI agents must:

1. Inspect existing code before modifying it.
2. Follow the existing architecture.
3. Reuse existing components.
4. Reuse existing design tokens.
5. Avoid unnecessary dependencies.
6. Avoid duplicate utilities.
7. Avoid duplicate components.
8. Keep business logic out of UI components.
9. Keep secrets out of client code.
10. Preserve existing functionality.
11. Explain architectural changes.
12. Run the relevant checks after modifications.

AI agents must NOT:

- Rewrite the project unnecessarily.
- Replace working architecture without justification.
- Install libraries simply because they are available.
- Generate entire pages without understanding the existing design system.
- Introduce arbitrary colors.
- Introduce arbitrary animation libraries.
- Add random visual effects.
- Create fake sports data when real data is expected.
- Hardcode production API responses.
- Remove existing functionality to make an implementation easier.

---

# 19. Before Adding a Dependency

Before installing a new dependency, determine:

1. Is it actually necessary?
2. Does an existing dependency already solve the problem?
3. Does it increase bundle size significantly?
4. Does it work with Next.js App Router?
5. Does it work with our architecture?
6. Is it actively maintained?

Do not add dependencies casually.

---

# 20. Modification Discipline

Before modifying a file:

- Read the existing implementation.
- Understand its role.
- Preserve unrelated functionality.

When implementing a feature:

1. Plan
2. Inspect
3. Implement
4. Run checks
5. Verify visually
6. Refine
7. Commit

Do not combine unrelated features into one change.

---

# 21. Quality Standard

VELOR should feel:

- Cinematic
- Premium
- Technical
- Confident
- Fast
- Intelligent
- Sport-focused
- Modern

The goal is not:

"Look how many effects we can add."

The goal is:

"Everything feels intentional."

Every major visual decision should answer:

Why does this exist?

If there is no good answer, remove it.