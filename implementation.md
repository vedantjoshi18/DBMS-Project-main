# React + Next.js Migration Implementation Plan

## Goal

Migrate the current Angular frontend in this repository to a modern React stack using the latest stable Next.js App Router while preserving existing backend APIs, user flows, and the current visual design direction.

## Current State Summary

- Frontend framework: Angular 21 standalone components
- Backend: Node/Express in `backend/`
- Key frontend features:
  - public landing page
  - event list and event detail pages
  - booking flow
  - login and signup modal
  - profile page
  - admin dashboard
  - route guards and auth interceptor
  - Angular services for API access
- Styling approach: component-scoped CSS plus global design tokens in `frontend/src/styles.css`

## Target Stack

- Next.js latest stable version with App Router
- React latest stable version
- TypeScript strict mode
- Tailwind CSS or CSS Modules
  - recommendation: CSS Modules for a lower-risk migration because the current UI already relies on component-local styling patterns
- TanStack Query for server state
- Zustand or React Context for lightweight auth/UI state
- React Hook Form plus Zod for forms and validation
- Next.js middleware for route protection where needed
- Axios or native `fetch` wrapper for API access

## Recommended Project Structure

```text
web/
  app/
    (public)/
      page.tsx
      events/
        page.tsx
        [id]/page.tsx
      clubs/page.tsx
      departments/page.tsx
      profile/page.tsx
    admin/
      page.tsx
      layout.tsx
    api/
      auth/
        route.ts
  components/
    layout/
    home/
    events/
    auth/
    admin/
    ui/
  lib/
    api/
    auth/
    utils/
    validation/
  hooks/
  types/
  styles/
```

## Mapping Angular Concepts to Next.js

### Routing

- Angular routes in `app.routes.ts` map to folders in `app/`
- `routerLink` becomes `Link`
- route params become Next.js dynamic segments like `events/[id]/page.tsx`

### Services

- Angular services become plain TypeScript API clients in `lib/api/`
- Example:
  - `event.service.ts` becomes `lib/api/events.ts`
  - `auth.service.ts` becomes `lib/api/auth.ts`
  - `booking.service.ts` becomes `lib/api/bookings.ts`

### Guards and Interceptors

- auth guard becomes Next.js middleware or layout-level auth checks
- auth interceptor becomes a shared `fetch` or Axios client that injects tokens

### Component State

- local Angular component state becomes React `useState` and `useReducer`
- observable-based server state becomes TanStack Query

### Forms

- template-driven and reactive Angular forms become React Hook Form + Zod schemas

## Migration Strategy

### Phase 1: Foundation

1. Create a new `web/` Next.js app inside the repository.
2. Configure TypeScript, ESLint, Prettier, and path aliases.
3. Port design tokens from `frontend/src/styles.css` into global CSS variables.
4. Port fonts and base layout.
5. Set up API base URL configuration for the existing backend.

### Phase 2: Shared Infrastructure

1. Build a shared API client.
2. Implement auth token storage and session helpers.
3. Build reusable UI primitives:
   - buttons
   - inputs
   - dropdowns
   - modal shell
   - cards
   - section headers
4. Port navbar and global layout.

### Phase 3: Public Pages

1. Migrate home page.
2. Migrate event list page.
3. Migrate event detail page.
4. Migrate clubs and departments views.
5. Migrate booking flow.

### Phase 4: Auth and Profile

1. Rebuild login/signup modal.
2. Rebuild protected profile page.
3. Add token refresh and logout handling.

### Phase 5: Admin Area

1. Rebuild dashboard shell.
2. Rebuild event management modals.
3. Rebuild organizer management.
4. Rebuild user management tables.

### Phase 6: Hardening

1. Add loading, error, and empty states.
2. Add route protection and role checks.
3. Add component and integration tests.
4. Run visual QA against the Angular version.
5. Cut over traffic once parity is reached.

## Component Migration Order

Recommended order for lowest risk:

1. global layout and navbar
2. home page
3. event list
4. event detail
5. login/signup modal
6. booking form
7. profile page
8. admin dashboard

This order gets the marketing and browse flows live first, then moves into authenticated and admin features.

## Data Layer Plan

Create typed API functions for each backend area:

- `getEvents`
- `getEventById`
- `getHotEvents`
- `getFeaturedEvents`
- `getRecentEvents`
- `login`
- `register`
- `getProfile`
- `createBooking`
- `getAdminStats`
- `createEvent`
- `updateEvent`
- `deleteEvent`

Then wrap these with TanStack Query hooks such as:

- `useEvents`
- `useEvent`
- `useFeaturedEvents`
- `useLoginMutation`
- `useCreateBookingMutation`

## Styling Migration Plan

Keep the current visual system and port it directly:

1. move all CSS variables from Angular global styles into Next.js global CSS
2. port component-specific CSS into CSS Modules or colocated styles
3. normalize spacing, radii, and typography tokens first
4. only redesign after behavior parity is done

## Risks

### Moderate risk

- auth flow parity
- admin dashboard behavior parity
- modal interactions and scroll locking
- route protection differences between Angular and Next.js

### Low risk

- landing page and static sections
- event browse pages
- basic API service migration

## Recommended Execution Model

Best practical approach:

1. keep `backend/` unchanged initially
2. create `web/` for Next.js alongside the Angular app
3. migrate page by page while using the same backend APIs
4. run both frontends during transition
5. remove Angular frontend only after parity and QA are complete

## Estimated Work Breakdown

- foundation and tooling: 1 to 2 days
- public pages: 2 to 4 days
- auth and profile: 1 to 2 days
- admin dashboard: 3 to 5 days
- QA and cleanup: 1 to 2 days

Total realistic range for one engineer: 8 to 15 working days depending on how much refactoring and testing is added.

## Definition of Done

The migration is complete when:

- all Angular routes have matching Next.js routes
- all backend integrations work from Next.js
- auth and admin flows are protected correctly
- UI matches current design intent
- build, lint, and tests pass
- Angular frontend can be removed without feature loss

## First Implementation Steps

If starting now, I would do this first:

1. scaffold `web/` with Next.js and TypeScript
2. port global tokens, fonts, and layout shell
3. migrate navbar and auth modal
4. migrate home page and event list
5. wire TanStack Query to the current backend

## Notes Specific to This Repository

- the backend API can remain the source of truth during migration
- the existing Angular services provide a direct map for React API clients
- the current design system is already strong enough to port without a redesign
- the admin dashboard should be migrated after public pages because it has the highest behavior density