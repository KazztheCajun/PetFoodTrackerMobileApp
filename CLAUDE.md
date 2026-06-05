# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
# Start dev server (choose platform interactively)
npm start

# Platform-specific
npm run android
npm run ios
npm run web

# Lint
npm run lint
```

No test runner is configured yet.

## Architecture

This is an **Expo SDK 56** app using **Expo Router** for file-based routing.

### Non-standard source layout

App screens live in **`src/app/`**, not the default `app/`. The `package.json` entry point is `expo-router/entry`, which picks this up via `tsconfig.json` path aliases:

- `@/*` → `./src/*`
- `@/assets/*` → `./assets/*`

New routes, layouts, and shared code all go under `src/`.

### Key dependencies

| Package | Version | Notes |
|---|---|---|
| `expo-router` | ~56.2.8 | File-based routing |
| `react-native-reanimated` | 4.3.1 | Animations |
| `react-native-gesture-handler` | ~2.31.1 | Gestures |
| `@expo/ui` | ~56.0.15 | Expo UI components |
| `expo-glass-effect` | ~56.0.4 | Glass UI primitives |
| `expo-symbols` | ~56.0.5 | SF Symbols + Material icons |

### Enabled experiments (`app.json`)

- `typedRoutes` — Expo Router generates typed `href` params; use `Href` type from `expo-router`.
- `reactCompiler` — React 19 compiler is active; avoid manual `useMemo`/`useCallback` unless profiling shows a need.

### Notable config

- Android `predictiveBackGestureEnabled: false` — back gesture is disabled system-wide.
- Web output is `static` (no server-side rendering).
- Supports automatic light/dark color scheme (`userInterfaceStyle: "automatic"`).

# CLAUDE.md - React Native & Expo Project Guidelines

## Project Summary
- **Stack**: React Native (TypeScript), Expo SDK (latest), Expo Router (File-based navigation)
- **Styling**: NativeWind (Tailwind CSS for React Native) / Tailwind v4
- **State & Data**: TanStack Query (React Query) for async state, Zustand for global synchronous state
- **Database/Storage**: Expo SQLite or expo-file-system + MMKV (Never use AsyncStorage)

## Critical AI Instructions
- ALWAYS prioritize the [Expo Skills for AI agents](https://docs.expo.dev/skills.md) and the [Expo MCP Server](https://docs.expo.dev/eas/ai/mcp.md) capabilities if available.
- NEVER modify `/android` or `/ios` native directories directly. Always use Expo Config Plugins in `app.json` or `app.config.js`.
- Cross-Platform Aware: Test and account for both iOS and Android presentation quirks (e.g., SafeAreas, KeyboardAvoidingView configurations).
- ALWAYS store keys in the .env.local file to ensure no secrets are leaked into a public repo

## Essential Development Commands

### Environment & Dependencies
- `npx expo install <package>` — ALWAYS use this command when adding any Expo SDK native modules
- `npm install <package>` - ALWAYS use this command when adding a Node.js package/module


### Production & Distribution (EAS)
- `eas build -p ios --profile preview` — Create an internal testing build for iOS (TestFlight / AdHoc)
- `eas build -p android --profile preview` — Create an internal testing build APK/AAB for Android
- `eas update --message "Describe change"` — Push an Over-The-Air (OTA) hotfix code update to active devices

## Architecture & Code Conventions

### Project File Structure
Follow a strict **feature-based structure** for modularity:
```text
├── app/                  # Expo Router file-based navigation tree
│   ├── (auth)/           # Protected authentication route group
│   ├── (tabs)/           # Main application nested tab navigation layout
│   │   ├── index.tsx     # Main feed screen
│   │   └── profile.tsx   # User configuration screen
│   ├── _layout.tsx       # Root entry, state provider wrappers, and universal styling
│   └── +not-found.tsx    # Fallback missing route container
├── src/                  # Application core workspace
│   ├── components/       # Global re-usable UI atoms (Buttons, Inputs, Cards)
│   ├── features/         # Feature-bounded functional domains
│   │   └── habits/       # Example domain container
│   │       ├── api/      # Query mutations and network requests
│   │       ├── components/# Isolated sub-components specific to this flow
│   │       └── store.ts  # Domain-specific local or unified state
│   ├── hooks/            # Globally shared hook engines (useAuth, useTheme)
│   ├── utils/            # Pure TypeScript helper functions and utilities
│   └── constants/        # Fixed parameters (Colors, Themes, Feature Flags)
```

### Strict Code Rules
- **Braces** Use Allman-style brace placement: open `{` on its own new line for function bodies, if/else, and other control flow blocks.
- **Imports**: Always use absolute path mapping configurations prefixed with `@/` (e.g., `import { Button } from '@/components/ui/button'`).
- **Components**: Write clean functional components using exact arrow syntax (`const Component = () => {}`).
- **Styling**: Always leverage the NativeWind implementation pattern (`className="..."`). Keep layouts flexible utilizing Flexbox styles. 
- **Lists**: Never use a heavy base `<ScrollView>` for dynamic iterables. Use `<FlashList>` from `@shopify/flash-list` for premium framerate rendering.
- **Forms**: Implement UI inputs using `TanStack Form` paired with validation schemas. Avoid heavier options.
- **Environment Variables**: Always prefix application-accessible keys with `EXPO_PUBLIC_` (e.g., `EXPO_PUBLIC_API_URL`).

## Common Gotchas & Fixes for AI Actions
- **Safe Screen Space**: Always wrap root screens with `SafeAreaView` from `react-native-safe-area-context` to safely handle device status bars and physical notches.
- **Keyboard Behaviors**: When implementing forms, wrap interactive items in a `KeyboardAvoidingView` configured with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` to protect entry views from getting cut off.
- **Icons**: Utilize `@expo/vector-icons` exclusively for base icons. Avoid importing external asset files unnecessarily.
