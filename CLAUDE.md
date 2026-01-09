# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fallter is a word-puzzle game built with React that combines falling letter tiles (similar to Tetris) with word formation mechanics. Players must form valid English words (4+ letters) horizontally or vertically on a 9x9 grid to clear tiles and score points.

## Development Commands

```bash
# Start development server (accessible on network via --host flag)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Architecture

### Core Game Mechanics (GameBoard.jsx)

The `GameBoard` component (src/components/GameBoard.jsx) is the central game controller containing all game logic:

- **Grid System**: 9x9 grid (`GRID_WIDTH` × `GRID_HEIGHT`) where tiles fall and settle
- **Letter Generation**: Uses frequency-weighted randomization based on English language statistics (E: 12.02%, T: 9.10%, etc.)
- **Word Validation**: Uses `an-array-of-english-words` package to validate 4+ letter words
- **Word Detection**: Scans grid horizontally and vertically after each tile placement
- **Gravity System**: After word clearing, applies gravity to make remaining tiles fall
- **Scoring**: Base points = word length × 10, with combo multipliers for consecutive word clears
- **Game Loop**: 500ms tick speed (TICK_SPEED), with hard drop acceleration to 50ms
- **State Management**: All game state (grid, score, position, combo, etc.) managed via React hooks

### Component Structure

- **App.jsx**: Root component, manages game start state and displays IntroOverlay
- **GameBoard.jsx**: Main game logic and state management
- **Grid.jsx**: Renders the 9×9 game board with current tile position and cleared cell animations
- **ScoreDisplay.jsx**: Shows current score and combo multiplier
- **NextTiles.jsx**: Displays upcoming 5 letter tiles
- **IntroOverlay.jsx**: Rules screen shown at game start and when paused (via rules button)
- **Countdown.jsx**: Animated 3-2-1 countdown before game starts/resumes
- **WordList.jsx**: Debug component for displaying found words

### Input Handling

The game supports both keyboard and touch inputs:

- **Keyboard**: Arrow keys for movement, Space for hard drop, P for pause, D to toggle word list
- **Touch**: Swipe gestures via `react-swipeable` (left/right to move, down for hard drop)
- **On-screen Buttons**: Mobile-friendly controls with React Icons (FaArrowLeft, FaArrowRight, FaArrowDown)

### Game State Flow

1. **Initialization**: Generate 5 next tiles, spawn first tile at grid center top
2. **Falling**: Tile descends every 500ms (or 50ms during hard drop)
3. **Lock**: When tile can't move down, lock it into grid at current position
4. **Word Check**: Scan entire grid for valid words (horizontal + vertical)
5. **Clear & Score**: Mark found word cells, apply combo scoring, animate clearing
6. **Gravity**: After 400ms animation, remove cleared cells and drop remaining tiles
7. **Spawn**: Load next tile from queue, add new random tile to end of queue
8. **Game Over**: Triggered if spawn position is already occupied

### Styling

- Uses glassmorphism design pattern (glass-panel class)
- CSS files are co-located with components
- Responsive design with mobile-first approach

## Important Constants

Located in GameBoard.jsx:
- `GRID_WIDTH = 9`
- `GRID_HEIGHT = 9`
- `TICK_SPEED = 500` (ms between automatic tile movements)
- `LETTER_POINTS = 10` (base points per letter in a word)

## Dependencies

- **React 19**: Core framework
- **an-array-of-english-words**: Word dictionary for validation
- **react-swipeable**: Touch gesture support
- **react-icons**: UI icons (Font Awesome)
- **@vercel/analytics**: Analytics integration (see vercel-analytics-integration.txt)
- **Vite**: Build tool and dev server (v6.3.4 for compatibility)

## Deployment

The project is configured for Vercel deployment with analytics enabled. The dev server runs with `--host` flag to allow network access during development.
