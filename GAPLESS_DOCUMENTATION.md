# React Native Sound - Gapless Looping Documentation

> **🎯 Enhanced Fork**: This documentation covers the enhanced gapless looping functionality available in our forked version at [devsphere-apps/react-native-sound](https://github.com/devsphere-apps/react-native-sound/tree/feat/enhanced-gapless-looping). This feature is not yet available in the official react-native-sound package.

### Package Comparison

| Feature | Original Package | Enhanced Fork |
|---------|-----------------|---------------|
| Basic audio playback | ✅ | ✅ |
| Traditional looping | ✅ | ✅ |
| **True gapless looping** | ❌ | ✅ |
| **Professional audio APIs** | ❌ | ✅ |
| **Memory-efficient looping** | ❌ | ✅ |
| **Meditation app ready** | ❌ | ✅ |
| Installation | `npm install react-native-sound` | `npm install github:devsphere-apps/react-native-sound#feat/enhanced-gapless-looping` |

## 🎵 Overview

React Native Sound now supports **true gapless looping** for professional audio applications. This feature provides seamless, zero-gap audio transitions perfect for meditation apps, ambient sound players, and music applications requiring uninterrupted audio experiences.

### ✨ Key Features

- **True Gapless Playback**: Zero audio gaps between loop iterations
- **Cross-Platform**: iOS (AVQueuePlayer + AVPlayerLooper) and Android (ExoPlayer)
- **Memory Efficient**: Single audio file in memory, no duplication
- **Backward Compatible**: Existing `setNumberOfLoops(-1)` automatically enables gapless
- **Professional Grade**: Designed for production apps like Headspace, Calm, and Insight Timer

## 🚀 Installation

### Install Enhanced Gapless Version

**⚠️ Important**: This enhanced gapless functionality is available in our forked version. Install from the specific branch:

```bash
npm install github:devsphere-apps/react-native-sound#feat/enhanced-gapless-looping --save
```

Or using yarn:

```bash
yarn add github:devsphere-apps/react-native-sound#feat/enhanced-gapless-looping
```

### Alternative Installation Methods

**Using HTTPS URL:**
```bash
npm install https://github.com/devsphere-apps/react-native-sound#feat/enhanced-gapless-looping --save
```

**Using Git URL:**
```bash
npm install git+https://github.com/devsphere-apps/react-native-sound.git#feat/enhanced-gapless-looping --save
```

### Platform Setup

For React Native >= 0.60, auto-linking handles the setup. For older versions:

```bash
react-native link react-native-sound
```

### TypeScript Support

```bash
npm install --save-dev @types/react-native @types/node
```

## 📱 Platform Support

| Feature | iOS | Android | Windows |
|---------|-----|---------|---------|
| Gapless Looping | ✅ AVQueuePlayer + AVPlayerLooper | ✅ ExoPlayer | ❌ |
| Gapless Loop Count | ✅ | ✅ | ❌ |
| Gapless Transition Types | ✅ | ❌ | ❌ |
| Gapless Preloading | ✅ | ✅ | ❌ |
| Memory Monitoring | ✅ | ✅ | ❌ |

## 🎯 Quick Start

### Basic Gapless Usage

```javascript
import Sound from 'react-native-sound';

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback');

// Load your audio file
const ambientSound = new Sound('rain.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('Failed to load sound', error);
    return;
  }
  
  // Enable gapless looping
  ambientSound.setGaplessLooping(true);
  
  // Set infinite gapless loops
  ambientSound.setGaplessLoopCount(-1);
  
  // Play with seamless looping
  ambientSound.play((success) => {
    console.log('Gapless playback started:', success);
  });
});
```

### Backward Compatible Usage

```javascript
// This automatically enables gapless looping!
const sound = new Sound('meditation.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (!error) {
    sound.setNumberOfLoops(-1); // Auto-enables gapless for infinite loops
    sound.play();
  }
});
```

## 🔧 API Reference

### Core Gapless Methods

#### `setGaplessLooping(enabled: boolean): Sound`

Enables or disables gapless looping mode.

```javascript
sound.setGaplessLooping(true);  // Enable gapless
sound.setGaplessLooping(false); // Disable gapless
```

#### `isGaplessLoopingEnabled(): boolean`

Returns whether gapless looping is currently enabled.

```javascript
const isEnabled = sound.isGaplessLoopingEnabled();
console.log('Gapless enabled:', isEnabled);
```

#### `setGaplessLoopCount(count: number): Sound`

Sets the number of gapless loops to perform.

- `0`: Play once (no looping)
- `> 0`: Finite number of loops
- `-1`: Infinite gapless loops

```javascript
sound.setGaplessLoopCount(-1);  // Infinite loops
sound.setGaplessLoopCount(5);   // Loop 5 times
sound.setGaplessLoopCount(0);   // No looping
```

#### `getGaplessLoopCount(): number`

Returns the current gapless loop count setting.

```javascript
const loopCount = sound.getGaplessLoopCount();
console.log('Current loop count:', loopCount);
```

### Advanced Gapless Methods

#### `setGaplessTransitionType(type: 'instant' | 'crossfade'): Sound` (iOS Only)

Controls how audio transitions during gapless looping.

```javascript
sound.setGaplessTransitionType('instant');    // Immediate transition
sound.setGaplessTransitionType('crossfade');  // Smooth crossfade (future)
```

#### `getGaplessInfo(callback: Function): void`

Retrieves detailed information about gapless playback status.

```javascript
sound.getGaplessInfo((info) => {
  console.log('Gapless supported:', info.isGaplessSupported);
  console.log('Gapless enabled:', info.isGaplessEnabled);
  console.log('Loop count:', info.currentLoopCount);
  console.log('Loops completed:', info.totalLoopsCompleted);
  console.log('Transition type:', info.transitionType);
  console.log('Memory usage:', info.memoryUsage, 'MB');
});
```

**Info Object Structure:**
```typescript
{
  isGaplessSupported: boolean;    // Platform supports gapless
  isGaplessEnabled: boolean;      // Currently enabled for this sound
  currentLoopCount: number;       // Current loop setting
  totalLoopsCompleted: number;    // Total loops completed
  transitionType: string;         // 'instant' or 'crossfade'
  memoryUsage?: number;          // Memory usage in MB (if available)
}
```

#### `preloadForGapless(): Promise<void>` (TypeScript) / `preloadForGapless(callback)` (JavaScript)

Preloads audio data for optimal gapless performance.

**TypeScript/Promise:**
```typescript
try {
  await sound.preloadForGapless();
  console.log('Preloading complete');
  sound.play();
} catch (error) {
  console.error('Preloading failed:', error);
}
```

**JavaScript/Callback:**
```javascript
sound.preloadForGapless((success, error) => {
  if (success) {
    console.log('Preloading complete');
    sound.play();
  } else {
    console.error('Preloading failed:', error);
  }
});
```

### Convenience Methods

#### `enableGaplessMode(): Sound`

Convenience method to enable gapless looping (alias for `setGaplessLooping(true)`).

```javascript
sound.enableGaplessMode().setGaplessLoopCount(-1).play();
```

## 🎨 Usage Examples

### Meditation App Implementation

```javascript
class MeditationPlayer {
  constructor() {
    this.tracks = {};
    this.loadingPromises = {};
  }
  
  // Load and prepare ambient track
  loadAmbientTrack(name, fileName) {
    return new Promise((resolve, reject) => {
      this.tracks[name] = new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          reject(error);
          return;
        }
        
        const track = this.tracks[name];
        
        // Enable gapless for seamless meditation experience
        track.setGaplessLooping(true);
        track.setGaplessLoopCount(-1); // Infinite
        
        // Preload for instant playback
        track.preloadForGapless((success) => {
          if (success) {
            resolve(track);
          } else {
            reject(new Error('Failed to preload track'));
          }
        });
      });
    });
  }
  
  // Play multiple ambient tracks simultaneously
  async playAmbientMix(trackConfigs) {
    const playPromises = trackConfigs.map(async (config) => {
      const { name, volume = 0.5, pan = 0 } = config;
      const track = this.tracks[name];
      
      if (track) {
        track.setVolume(volume);
        if (pan !== 0) track.setPan(pan);
        
        return new Promise((resolve) => {
          track.play((success) => resolve({ name, success }));
        });
      }
    });
    
    return Promise.all(playPromises);
  }
  
  // Monitor gapless performance
  getPerformanceInfo(trackName) {
    const track = this.tracks[trackName];
    if (!track) return null;
    
    return new Promise((resolve) => {
      track.getGaplessInfo(resolve);
    });
  }
  
  // Stop all tracks
  stopAll() {
    Object.values(this.tracks).forEach(track => {
      track.stop();
    });
  }
  
  // Release resources
  cleanup() {
    Object.values(this.tracks).forEach(track => {
      track.release();
    });
    this.tracks = {};
  }
}

// Usage Example
const player = new MeditationPlayer();

async function setupMeditationSession() {
  try {
    // Load ambient tracks
    await Promise.all([
      player.loadAmbientTrack('rain', 'rain_loop.mp3'),
      player.loadAmbientTrack('ocean', 'ocean_waves.mp3'),
      player.loadAmbientTrack('forest', 'forest_birds.mp3'),
      player.loadAmbientTrack('wind', 'wind_chimes.mp3')
    ]);
    
    // Play layered ambient mix
    const results = await player.playAmbientMix([
      { name: 'rain', volume: 0.7 },
      { name: 'ocean', volume: 0.3, pan: -0.5 },
      { name: 'forest', volume: 0.4, pan: 0.5 },
      { name: 'wind', volume: 0.2 }
    ]);
    
    console.log('Meditation session started:', results);
    
    // Monitor performance
    const rainInfo = await player.getPerformanceInfo('rain');
    console.log('Rain track performance:', rainInfo);
    
  } catch (error) {
    console.error('Failed to setup meditation session:', error);
  }
}
```

### Music Player with Seamless Looping

```javascript
class MusicPlayer {
  constructor() {
    this.currentTrack = null;
    this.playlist = [];
    this.isGaplessEnabled = false;
  }
  
  // Load track with gapless preparation
  async loadTrack(trackInfo) {
    const { file, title, artist } = trackInfo;
    
    return new Promise((resolve, reject) => {
      const sound = new Sound(file, Sound.MAIN_BUNDLE, async (error) => {
        if (error) {
          reject(error);
          return;
        }
        
        // Check if gapless is supported
        sound.getGaplessInfo((info) => {
          if (info.isGaplessSupported) {
            console.log(`Gapless available for: ${title}`);
            this.isGaplessEnabled = true;
          }
          
          resolve({
            sound,
            title,
            artist,
            duration: sound.getDuration(),
            gaplessSupported: info.isGaplessSupported
          });
        });
      });
    });
  }
  
  // Play track with optional looping
  playTrack(track, loopCount = 0) {
    if (this.currentTrack?.sound) {
      this.currentTrack.sound.stop();
    }
    
    this.currentTrack = track;
    const { sound } = track;
    
    if (loopCount !== 0 && this.isGaplessEnabled) {
      // Use gapless for looping
      sound.setGaplessLooping(true);
      sound.setGaplessLoopCount(loopCount);
      console.log(`Playing ${track.title} with gapless looping`);
    } else if (loopCount !== 0) {
      // Fallback to traditional looping
      sound.setNumberOfLoops(loopCount);
      console.log(`Playing ${track.title} with traditional looping`);
    }
    
    sound.play((success) => {
      console.log(`Playback ${success ? 'started' : 'failed'}: ${track.title}`);
    });
  }
  
  // Enable loop mode for current track
  enableLoopMode(infinite = true) {
    if (!this.currentTrack) return;
    
    const loopCount = infinite ? -1 : 3;
    
    if (this.isGaplessEnabled) {
      this.currentTrack.sound.setGaplessLooping(true);
      this.currentTrack.sound.setGaplessLoopCount(loopCount);
    } else {
      this.currentTrack.sound.setNumberOfLoops(loopCount);
    }
    
    console.log(`Loop mode enabled: ${infinite ? 'infinite' : '3 times'}`);
  }
}
```

### Background Audio Service

```javascript
class BackgroundAudioService {
  constructor() {
    this.backgroundSounds = new Map();
    this.isInitialized = false;
  }
  
  // Initialize background audio
  async initialize() {
    // Configure audio session for background playback
    Sound.setCategory('Playback', false);
    Sound.setActive(true);
    
    this.isInitialized = true;
    console.log('Background audio service initialized');
  }
  
  // Register background sound
  async registerBackgroundSound(id, fileName, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const {
      volume = 0.5,
      loops = -1,
      autoPreload = true
    } = options;
    
    return new Promise((resolve, reject) => {
      const sound = new Sound(fileName, Sound.MAIN_BUNDLE, async (error) => {
        if (error) {
          reject(error);
          return;
        }
        
        // Configure for background looping
        sound.setVolume(volume);
        sound.setGaplessLooping(true);
        sound.setGaplessLoopCount(loops);
        
        if (autoPreload) {
          try {
            await sound.preloadForGapless();
          } catch (preloadError) {
            console.warn('Preload failed:', preloadError);
          }
        }
        
        this.backgroundSounds.set(id, {
          sound,
          fileName,
          isPlaying: false,
          options
        });
        
        resolve(sound);
      });
    });
  }
  
  // Start background sound
  startBackgroundSound(id) {
    const soundData = this.backgroundSounds.get(id);
    if (!soundData) {
      throw new Error(`Background sound '${id}' not registered`);
    }
    
    const { sound } = soundData;
    sound.play((success) => {
      if (success) {
        soundData.isPlaying = true;
        console.log(`Background sound '${id}' started`);
      } else {
        console.error(`Failed to start background sound '${id}'`);
      }
    });
  }
  
  // Stop background sound
  stopBackgroundSound(id) {
    const soundData = this.backgroundSounds.get(id);
    if (!soundData) return;
    
    soundData.sound.stop(() => {
      soundData.isPlaying = false;
      console.log(`Background sound '${id}' stopped`);
    });
  }
  
  // Get performance metrics
  async getPerformanceMetrics() {
    const metrics = {};
    
    for (const [id, soundData] of this.backgroundSounds) {
      const info = await new Promise(resolve => {
        soundData.sound.getGaplessInfo(resolve);
      });
      
      metrics[id] = {
        isPlaying: soundData.isPlaying,
        memoryUsage: info.memoryUsage,
        loopsCompleted: info.totalLoopsCompleted,
        gaplessEnabled: info.isGaplessEnabled
      };
    }
    
    return metrics;
  }
}

// Usage
const audioService = new BackgroundAudioService();

async function setupBackgroundAudio() {
  try {
    // Register background sounds
    await audioService.registerBackgroundSound('rain', 'rain_ambient.mp3', {
      volume: 0.6,
      loops: -1
    });
    
    await audioService.registerBackgroundSound('waves', 'ocean_waves.mp3', {
      volume: 0.4,
      loops: -1
    });
    
    // Start background ambience
    audioService.startBackgroundSound('rain');
    audioService.startBackgroundSound('waves');
    
    // Monitor performance every 30 seconds
    setInterval(async () => {
      const metrics = await audioService.getPerformanceMetrics();
      console.log('Background audio metrics:', metrics);
    }, 30000);
    
  } catch (error) {
    console.error('Failed to setup background audio:', error);
  }
}
```

## 🛠️ Best Practices

### 1. Memory Management

```javascript
// Always release sounds when done
sound.release();

// Monitor memory usage for long-running apps
sound.getGaplessInfo((info) => {
  if (info.memoryUsage > 50) { // MB
    console.warn('High memory usage detected');
  }
});
```

### 2. Error Handling

```javascript
// Always handle loading errors
const sound = new Sound('file.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.error('Sound loading failed:', error);
    // Fallback to alternative file or show error
    return;
  }
  
  // Proceed with setup
});

// Handle gapless preloading failures gracefully
sound.preloadForGapless((success, error) => {
  if (!success) {
    console.warn('Gapless preload failed, using regular playback:', error);
    // Continue without gapless - still functional
  }
});
```

### 3. Performance Optimization

```javascript
// Preload critical sounds during app initialization
async function preloadCriticalSounds() {
  const criticalSounds = ['notification.mp3', 'button_click.mp3'];
  
  const preloadPromises = criticalSounds.map(fileName => {
    return new Promise((resolve) => {
      const sound = new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
        if (!error) {
          sound.preloadForGapless(() => resolve(sound));
        } else {
          resolve(null);
        }
      });
    });
  });
  
  const loadedSounds = await Promise.all(preloadPromises);
  return loadedSounds.filter(Boolean);
}
```

### 4. Background Playback

```javascript
// Configure for background playback (iOS)
Sound.setCategory('Playback', false); // Don't mix with others
Sound.setActive(true);

// Enable background audio capability in Info.plist:
// <key>UIBackgroundModes</key>
// <array>
//   <string>audio</string>
// </array>
```

## 🐛 Troubleshooting

### Common Issues

#### "Gapless not working on device"

1. **Check platform support**:
```javascript
sound.getGaplessInfo((info) => {
  console.log('Gapless supported:', info.isGaplessSupported);
});
```

2. **Verify audio file format**: Use MP3, M4A, or WAV for best compatibility
3. **Check file size**: Very large files may have loading delays

#### "Memory usage too high"

```javascript
// Monitor and manage memory
sound.getGaplessInfo((info) => {
  if (info.memoryUsage > 100) { // MB
    // Release unnecessary sounds
    otherSounds.forEach(s => s.release());
  }
});
```

#### "Audio interruptions on iOS"

```javascript
// Proper audio session management
Sound.setCategory('Playback');
Sound.setActive(true);

// Handle interruptions
import { AppState } from 'react-native';

AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'background') {
    // Audio continues in background
  } else if (nextAppState === 'active') {
    Sound.setActive(true);
  }
});
```

#### "Android ExoPlayer errors"

1. **Check ExoPlayer dependency** in `android/build.gradle`:
```gradle
implementation "com.google.android.exoplayer:exoplayer:2.19.1"
```

2. **Verify file paths** are correct for Android assets
3. **Check audio format compatibility** with ExoPlayer

### Debug Information

```javascript
// Get comprehensive debug info
function debugGaplessSetup(sound) {
  sound.getGaplessInfo((info) => {
    console.log('=== Gapless Debug Info ===');
    console.log('Platform:', Platform.OS);
    console.log('Gapless supported:', info.isGaplessSupported);
    console.log('Gapless enabled:', info.isGaplessEnabled);
    console.log('Loop count:', info.currentLoopCount);
    console.log('Memory usage:', info.memoryUsage, 'MB');
    console.log('Transition type:', info.transitionType);
    console.log('========================');
  });
}
```

## 📝 Migration Guide

### From Traditional Looping

**Before:**
```javascript
sound.setNumberOfLoops(-1); // Traditional looping with gaps
```

**After:**
```javascript
// Option 1: Automatic (recommended for backward compatibility)
sound.setNumberOfLoops(-1); // Now automatically enables gapless!

// Option 2: Explicit (recommended for new code)
sound.setGaplessLooping(true);
sound.setGaplessLoopCount(-1);
```

### Performance Considerations

- **Gapless looping uses more advanced audio APIs** but is more memory efficient
- **Traditional looping is simpler** but may have audio gaps
- **Use gapless for professional audio experiences**, traditional for simple use cases

## 🤝 Contributing

Found an issue or want to contribute? Please check our GitHub repository for contribution guidelines.

## 📄 License

This project is licensed under the MIT License.

---

**Happy coding with seamless audio! 🎵** 