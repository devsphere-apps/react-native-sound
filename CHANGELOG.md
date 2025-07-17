# Changelog

## 0.12.1 - Codegen Compatibility Fix

### 🔧 Bug Fixes

**React Native Codegen Compatibility:**
- Fixed union types in TypeScript definitions that were causing React Native codegen errors
- Replaced `'instant' | 'crossfade'` union types with `string` types for TurboModule compatibility
- Replaced `AVAudioSessionCategory` and `AVAudioSessionMode` union types with `string` types
- Resolves "Union types are unsupported in structs" error during `npx expo prebuild`
- Maintains full backward compatibility - all string values continue to work as expected

**TypeScript Improvements:**
- Simplified type definitions for better React Native New Architecture compatibility
- Improved codegen reliability for TurboModule interface generation
- Enhanced compatibility with Expo and React Native CLI build processes

### 📚 Documentation

- Updated TypeScript definitions with codegen-compatible types
- Added troubleshooting section for build issues
- Enhanced installation and setup documentation

## 0.12.0 - Enhanced Gapless Looping

> **🎵 Major Feature Release**: This version introduces professional-grade gapless looping capabilities for meditation apps, ambient sound players, and music applications requiring seamless audio experiences.

### ✨ New Features

**True Gapless Looping:**
- iOS: Implemented AVQueuePlayer + AVPlayerLooper for zero-gap audio transitions
- Android: Integrated ExoPlayer with REPEAT_MODE_ONE for seamless looping
- Memory-efficient single-file looping without audio duplication
- Cross-platform API consistency for iOS and Android

**Enhanced JavaScript/TypeScript API:**
- `setGaplessLooping(enabled: boolean)` - Enable/disable gapless mode
- `isGaplessLoopingEnabled(): boolean` - Check gapless status
- `setGaplessLoopCount(count: number)` - Control loop count (-1 = infinite, 0 = no loop, >0 = finite)
- `getGaplessLoopCount(): number` - Get current loop count
- `setGaplessTransitionType(type: 'instant' | 'crossfade')` - Control transition behavior (iOS only)
- `getGaplessInfo(callback)` - Get detailed gapless status and memory usage
- `preloadForGapless()` - Preload audio for optimal performance
- `enableGaplessMode()` - Convenience method for quick setup

**Backward Compatibility Enhancements:**
- `setNumberOfLoops(-1)` now automatically enables gapless looping for seamless infinite loops
- Existing API remains fully functional with traditional MediaPlayer/AVAudioPlayer fallback
- Zero breaking changes - all existing code continues to work

**Professional Audio Features:**
- Background playback support for meditation apps
- Audio focus management for uninterrupted sessions
- Memory usage monitoring and optimization
- Platform capability detection
- Comprehensive error handling and validation

### 🛠️ Technical Improvements

**iOS Implementation:**
- Added AVQueuePlayer and AVPlayerLooper integration
- Enhanced audio session management for background playback
- Comprehensive memory management and cleanup
- Support for gapless transition types

**Android Implementation:**
- ExoPlayer dependency integration (version 2.19.1)
- Memory-efficient gapless looping with ExoPlayer
- Proper audio focus handling for background playback
- Enhanced lifecycle management

**Cross-Platform:**
- Unified JavaScript API across iOS and Android
- TypeScript definitions with complete type safety
- Promise-based async API for modern development
- Comprehensive error handling and validation

### 📚 Documentation & Examples

- Complete gapless looping documentation (GAPLESS_DOCUMENTATION.md)
- Real-world meditation app implementation examples
- Music player with seamless looping examples
- Background audio service implementation
- Best practices and performance optimization guide
- Troubleshooting guide with common issues and solutions
- Migration guide from traditional looping

**Example App Enhancements:**
- Interactive gapless looping demonstration
- Real-time performance monitoring
- Memory usage tracking
- Multiple loop mode testing
- Professional UI with modern controls

### 🎯 Use Cases

Perfect for:
- **Meditation Apps**: Seamless ambient sound looping (Headspace, Calm, Insight Timer style)
- **Music Applications**: Professional-grade looping without gaps
- **Ambient Sound Players**: Continuous nature sounds, white noise, etc.
- **Professional Audio Apps**: Any application requiring uninterrupted audio

### 📦 Installation

**Enhanced Gapless Version:**
```bash
npm install github:devsphere-apps/react-native-sound#feat/enhanced-gapless-looping --save
```

### 🔧 Platform Requirements

- **iOS**: iOS 10+ for AVPlayerLooper support
- **Android**: Android API 16+ with ExoPlayer integration
- **React Native**: 0.60+ (auto-linking support)

---

## 0.11.0

New features:

- Add support for `Sound.setCategory('Alarm')` on Android
- Update Visual Studio path definition to support Windows UWP in CI.

Bug fixes:

- Use incrementing keys instead of a filename hash to allow multiple Sound
  instances for the same filename.
- Update Podfile reference to fix build under React Native 0.60.
- Fix getSystemVolume callback on Android for parity with iOS.
- Prevent a crash under iOS 8.

Other improvements:

- Documentation improvements.
