# Project Development Rules

## API & Data Handling
- **Authentication**: Always check if authentication is required. Use `skipAuth = true` in `apiFetch` for public resources (e.g., course lists) to prevent unauthenticated errors during early app boot.
- **Resilience**: `apiFetch` includes retry logic for 5xx and network errors with an 8-second timeout. Ensure all recursive `apiFetch` calls pass through the `skipAuth` parameter correctly.
- **Error Handling**: Always throw a clear error or handle gracefully if Firebase Auth is not ready.

## Performance
- **Virtualization**: Use `@tanstack/react-virtual` for all large lists (Students, Attendance, Payments).
- **CSS Optimizations**:
    - Add `content-visibility: auto;` and `contain-intrinsic-size` to off-screen heavy components (e.g., Bento Cards).
    - Use `-webkit-overflow-scrolling: touch` for iOS momentum scrolling.
- **Load Balancing**: Use `React.lazy` and `Suspense` for route-level code splitting.

## UI/UX
- **Consistency**: Adhere to the glassmorphism design system defined in `index.css`.
- **Skeleton Screens**: Use static skeletons with `will-change: opacity` to minimize layout shift while loading data.
