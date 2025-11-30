# LostIn — Distraction-Free YouTube Learning Player

A React Native (Expo) mobile app that lets you watch YouTube videos and playlists without distractions. Focus on learning with built-in notes, Pomodoro timer, and saved playlists.

## Features

- **Distraction-free playback**: YouTube embeds without sidebar recommendations or comments
- **Notes**: Auto-saved notes per video/playlist (saves every 1.5 seconds)
- **Pomodoro Timer**: 25/5 minute focus cycles with quick duration presets
- **Saved Playlists**: Save and quickly access your favorite playlists
- **Smart URL parsing**: Handles all YouTube URL formats (youtu.be, watch?v=, playlists, shorts)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
expo start
```

3. Run on your device:
   - Scan the QR code with Expo Go (iOS) or Camera (Android)
   - Or press `i` for iOS simulator, `a` for Android emulator

## Usage

### Watching Videos

1. On the Home screen, paste any YouTube URL:
   - Single video: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Short link: `https://youtu.be/dQw4w9WgXcQ`
   - Playlist: `https://www.youtube.com/playlist?list=PL...`
   - Shorts: `https://www.youtube.com/shorts/VIDEO_ID`

2. Tap "Open" to launch the distraction-free player

### Player Screen

- **Notes button**: Opens a notes panel that auto-saves as you type
- **Save button**: Saves the current video/playlist to your Home screen
- **Timer button**: Opens Pomodoro timer controls

### Notes

Notes are stored locally per video/playlist using AsyncStorage. Each video or playlist has its own notes that persist between sessions.

### Testing

- **Single video flow**: Paste `https://youtu.be/dQw4w9WgXcQ` → Open → Player loads
- **Playlist flow**: Paste a playlist URL → Open → Player loads playlist embed
- **Notes storage**: Open any video, add notes, close and reopen to verify persistence
- **Saved playlists**: Save a playlist, return to Home, tap saved item to reopen

## Project Structure

```
/screens
  HomeScreen.js      - URL input and saved playlists list
  PlayerScreen.js    - WebView player with toolbar
/components
  NotesPanel.js      - Notes editor with auto-save
  Pomodoro.js        - Timer with 25/5 cycle
/utils
  youtube.js         - URL parsing and embed URL building
/styles
  global.js          - Shared colors and styles
App.js               - Navigation setup
```

## Tech Stack

- React Native (Expo)
- React Navigation (Stack)
- react-native-webview
- @react-native-async-storage/async-storage

## Notes

- All data is stored locally on your device
- No external API keys required
- Works offline for saved playlists (requires internet for video playback)
