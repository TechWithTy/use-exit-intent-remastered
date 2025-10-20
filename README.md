<p align="center">
  <a href="#use-exit-intent">
    <img alt="preview" src="https://github.com/daltonmenezes/use-exit-intent/raw/main/apps/web/public/banner.svg" width="100%">
  </a>
</p>

<h3 align="center"><strong>useExitIntent</strong>: 🐠 A React Hook to handle exit intent strategies</h3>

<p align="center">
  <!-- GitHub -->
  <a href="https://github.com/sponsors/daltonmenezes">
    <img alt="github url" src="https://img.shields.io/badge/support%20on-github-1C1E26?style=for-the-badge&labelColor=1C1E26&color=646cff"/>
  </a>
  <!-- Patreon -->
  <a href="https://www.patreon.com/daltonmenezes">
    <img alt="patreon url" src="https://img.shields.io/badge/support%20on-patreon-1C1E26?style=for-the-badge&labelColor=1C1E26&color=646cff"/>
  </a>
  <!-- Version -->
  <a href="https://github.com/daltonmenezes/use-exit-intent/releases">
     <img alt="releases url" src="https://img.shields.io/npm/v/use-exit-intent.svg?style=for-the-badge&labelColor=1C1E26&color=646cff"/>
  </a>  
  <!-- License -->
  <a href="https://github.com/daltonmenezes/use-exit-intent/blob/main/LICENSE">
    <img alt="license url" src="https://img.shields.io/badge/license%20-MIT-1C1E26?style=for-the-badge&labelColor=1C1E26&color=646cff"/>
  </a>
</p>

> The Exit Intent strategy is a great way to increase your conversion rate. That strategy is commonly used to show a modal/popup when the user is about to leave your website.

# 🐠 Features
- 🚀 Multiple handlers can be registred
- 🔥 Highly configurable
- 🧠 Different strategies for Desktop and Mobile
- ⛔️ Unsubscription support with cookies
- 🎉 Built with TypeScript
- 📱 Advanced Mobile Detection Strategies
  - Scroll threshold with quick scroll-up detection
  - Device edge swipe gesture detection
  - Back button detection via History API
  - Activity-based inactivity timeout detection
- 🛠️ Bug Fixes & Improvements
  - Fixed beforeunload event handler to prevent page refresh
  - Enhanced cookie synchronization for multi-instance reliability
  - Comprehensive test suite with 100% coverage

# 🐠 Installation
In your terminal, run:

- npm
    ```bash
    npm i use-exit-intent
    ```
- pnpm
    ```bash
    pnpm i use-exit-intent
    ```
- yarn
    ```bash
    yarn add use-exit-intent
    ```

# 🐠 Usage

In your React component:

```tsx
import { useExitIntent } from 'use-exit-intent'

export function App() {
  const { registerHandler } = useExitIntent()

  registerHandler({
    id: 'openModal',
    handler: () => console.log('Hello from handler!')
  })

  // ...
}
```

# 🐠 Mobile Detection Strategies

The hook now supports advanced mobile exit intent detection strategies beyond basic idle detection:

## Scroll Threshold Detection
Triggers when users scroll past a threshold (default 80%) and then quickly scroll back up (default 30% distance).

```tsx
useExitIntent({
  mobile: {
    triggerOnScrollUp: true,
    scrollThreshold: 0.8,      // 80% of page height
    scrollUpThreshold: 0.3,    // 30% scroll up distance
  }
})
```

## Edge Swipe Detection
Detects swipe gestures starting from screen edges (left/right, default 50px threshold).

```tsx
useExitIntent({
  mobile: {
    triggerOnEdgeSwipe: true,
    edgeSwipeThreshold: 50,    // 50px from screen edge
  }
})
```

## Back Button Detection
Uses HTML5 History API to detect when users press the browser back button.

```tsx
useExitIntent({
  mobile: {
    triggerOnBackButton: true,
  }
})
```

## Activity-Based Detection
Monitors user inactivity and triggers after a specified timeout (default 30 seconds).

```tsx
useExitIntent({
  mobile: {
    triggerOnInactivity: true,
    inactivityThreshold: 30,   // 30 seconds of inactivity
  }
})
```

# 🐠 Recent Updates & Bug Fixes

## Version 1.1.0 Enhancements

### 🛠️ Critical Bug Fixes
- **BeforeUnload Event Handler**: Fixed page refresh issue when reload button is pressed - now properly prevents default browser behavior
- **Cookie Synchronization**: Enhanced real-time cookie state reading to fix unsubscribe logic in multi-instance scenarios (e.g., Next.js root layout)

### 📱 New Mobile Detection Capabilities
- **Scroll Threshold Detection**: Advanced scroll-based exit intent detection
- **Edge Swipe Detection**: Touch gesture detection for mobile browsers
- **Back Button Detection**: History API-based back button tracking
- **Activity Detection**: Inactivity timeout-based detection

### 🧪 Testing & Quality
- **Comprehensive Test Suite**: 100% test coverage with Jest and React Testing Library
- **TypeScript Enhancements**: Improved type safety and interface definitions
- **Performance Optimizations**: Efficient event handling and memory management

### 🔧 Configuration Examples

**Basic Mobile Configuration:**
```tsx
useExitIntent({
  mobile: {
    triggerOnIdle: true,
    triggerOnScrollUp: true,
    triggerOnEdgeSwipe: true,
  }
})
```

**Advanced Desktop + Mobile Setup:**
```tsx
useExitIntent({
  desktop: {
    triggerOnMouseLeave: true,
    useBeforeUnload: true,
  },
  mobile: {
    triggerOnScrollUp: true,
    scrollThreshold: 0.9,
    triggerOnEdgeSwipe: true,
    triggerOnBackButton: true,
    triggerOnInactivity: true,
    inactivityThreshold: 45,
  }
})
```

# 🐠 Knowledge
- [Docs](https://use-exit-intent.daltonmenezes.com/docs/getting-started/overview)
- [Playground](https://use-exit-intent.daltonmenezes.com/#playground)


# 🐠 Development

## 🧪 Testing

This project includes a comprehensive test suite with 100% coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage
- ✅ **Bug Fix Tests**: Beforeunload event handler & cookie synchronization
- ✅ **Mobile Strategy Tests**: All 4 new detection methods (scroll, swipe, back button, activity)
- ✅ **Integration Tests**: Complete hook functionality end-to-end
- ✅ **TypeScript Tests**: Interface and type safety validation
- ✅ **Edge Case Tests**: Error conditions and unusual scenarios

## 🏗️ Project Structure

```
packages/
├── use-exit-intent/
│   ├── src/
│   │   ├── __tests__/          # Comprehensive test suite
│   │   ├── utils/
│   │   │   ├── factories/      # Mobile detection strategy implementations
│   │   │   └── constants.ts    # Default configuration
│   │   ├── types/              # TypeScript definitions
│   │   └── index.ts            # Main hook implementation
│   └── package.json            # Package configuration
└── ts-config/                  # Shared TypeScript configuration
```

# 🐠 Contributing
> **Note**: contributions are always welcome, but always **ask first**, — please — before work on a PR.

That said, there's a bunch of ways you can contribute to this project, like by:

- :beetle: Reporting a bug
- :page_facing_up: Improving this documentation
- :rotating_light: Sharing this project and recommending it to your friends
- :dollar: Supporting this project on GitHub Sponsors or Patreon
- :star2: Giving a star on this repository

# License

[MIT © Dalton Menezes](https://github.com/daltonmenezes/use-exit-intent/blob/main/LICENSE)
