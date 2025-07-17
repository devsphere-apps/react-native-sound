# react-native-sound

> **🎵 Enhanced Fork with Gapless Looping**: This is an enhanced version of react-native-sound featuring true gapless looping for professional audio applications. Based on the original [zmxv/react-native-sound](https://github.com/zmxv/react-native-sound) with additional professional-grade audio capabilities.

[![](https://img.shields.io/npm/v/react-native-sound.svg?style=flat-square)][npm]
[![](https://img.shields.io/npm/l/react-native-sound.svg?style=flat-square)][npm]
[![](https://img.shields.io/npm/dm/react-native-sound.svg?style=flat-square)][npm]

[npm]: https://www.npmjs.com/package/react-native-sound

React Native module for playing sound clips on iOS, Android, and Windows with enhanced gapless looping capabilities.

Be warned, this software is alpha quality and may have bugs. Test on your own
and use at your own risk!

## Feature matrix

React-native-sound does not support streaming. See [#353][] for more info.
Of course, we would welcome a PR if someone wants to take this on.

In iOS, the library uses [AVAudioPlayer][], not [AVPlayer][].

[#353]: https://github.com/zmxv/react-native-sound/issues/353
[AVAudioPlayer]: https://developer.apple.com/documentation/avfoundation/avaudioplayer
[AVPlayer]: https://developer.apple.com/documentation/avfoundation/avplayer

Feature | iOS | Android | Windows
---|---|---|---
Load sound from the app bundle | ✓ | ✓ | ✓
Load sound from other directories | ✓ | ✓ | ✓
Load sound from the network | ✓ | ✓ |
Play sound | ✓ | ✓ | ✓
Playback completion callback | ✓ | ✓ | ✓
Pause | ✓ | ✓ | ✓
Resume | ✓ | ✓ | ✓
Stop | ✓ | ✓ | ✓
Reset |  | ✓ |
Release resource | ✓ | ✓ | ✓
Get duration | ✓ | ✓ | ✓
Get number of channels | ✓ |   |
Get/set volume | ✓ | ✓ | ✓
Get system volume | ✓ | ✓ |
Set system volume |   | ✓ |
Get/set pan | ✓ |   |
Get/set loops | ✓ | ✓ | ✓
Get/set exact loop count | ✓ |   |
Get/set current time | ✓ | ✓ | ✓
Set speed | ✓ | ✓ |
**True gapless looping** | ✓ | ✓ |
**Gapless loop count control** | ✓ | ✓ |
**Gapless transition types** | ✓ |  |
**Gapless preloading** | ✓ | ✓ |
**Gapless info & monitoring** | ✓ | ✓ |

## Installation

### Enhanced Gapless Version (Recommended)

**⚠️ For Gapless Looping Functionality**: Install our enhanced fork with true gapless looping:

```bash
npm install github:devsphere-apps/react-native-sound#feat/enhanced-gapless-looping --save
```

Or using yarn:

```bash
yarn add github:devsphere-apps/react-native-sound#feat/enhanced-gapless-looping
```

### Standard Installation

For basic functionality without gapless looping, install the original package:

```javascript
npm install react-native-sound --save
```

### Platform Setup

Note: If your react-native version is >= 0.60 then linking is done automatically.

If your react-native version is < 0.60 then link it using:

```javascript
react-native link react-native-sound
```

**If you encounter this error**

```
undefined is not an object (evaluating 'RNSound.IsAndroid')
```

you may additionally need to fully clear your build caches for Android. You
can do this using

```bash
cd android
./gradlew cleanBuildCache
```

After clearing your build cache, you should execute a new `react-native` build.

If you still experience issues, **know that this is the most common build issue.** See [#592][] and the several
issues linked from it for possible resolution. A pull request with improved
documentation on this would be welcome!

[#592]: https://github.com/zmxv/react-native-sound/issues/592

### Manual Installation Notes

Please see the Wiki for these details https://github.com/zmxv/react-native-sound/wiki/Installation


## Help with React-Native-Sound

* For react-native-sound developers  [![][gitter badge]](https://gitter.im/react-native-sound/developers)
* For help using react-native-sound  [![][gitter badge]](https://gitter.im/react-native-sound/Help)

[gitter badge]: https://img.shields.io/gitter/room/react-native-sound/developers.svg?format=flat-square

## Demo project

https://github.com/zmxv/react-native-sound-demo

## Player

<img src="https://github.com/benevbright/react-native-sound-playerview/blob/master/docs/demo.gif?raw=true">

https://github.com/benevbright/react-native-sound-playerview

## Basic usage

First you'll need to add audio files to your project.

- Android: Save your sound clip files under the directory `android/app/src/main/res/raw`. Note that files in this directory must be lowercase and underscored (e.g. my_file_name.mp3) and that subdirectories are not supported by Android.
- iOS: Open Xcode and add your sound files to the project (Right-click the project and select `Add Files to [PROJECTNAME]`)

```js
// Import the react-native-sound module
var Sound = require('react-native-sound');

// Enable playback in silence mode
Sound.setCategory('Playback');

// Load the sound file 'whoosh.mp3' from the app bundle
// See notes below about preloading sounds within initialization code below.
var whoosh = new Sound('whoosh.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
  console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());

  // Play the sound with an onEnd callback
  whoosh.play((success) => {
    if (success) {
      console.log('successfully finished playing');
    } else {
      console.log('playback failed due to audio decoding errors');
    }
  });
});

// Reduce the volume by half
whoosh.setVolume(0.5);

// Position the sound to the full right in a stereo field
whoosh.setPan(1);

// Loop indefinitely until stop() is called
whoosh.setNumberOfLoops(-1);

// Get properties of the player instance
console.log('volume: ' + whoosh.getVolume());
console.log('pan: ' + whoosh.getPan());
console.log('loops: ' + whoosh.getNumberOfLoops());

// Seek to a specific point in seconds
whoosh.setCurrentTime(2.5);

// Get the current playback point in seconds
whoosh.getCurrentTime((seconds) => console.log('at ' + seconds));

// Pause the sound
whoosh.pause();

// Stop the sound and rewind to the beginning
whoosh.stop(() => {
  // Note: If you want to play a sound after stopping and rewinding it,
  // it is important to call play() in a callback.
  whoosh.play();
});

// Release the audio player resource
whoosh.release();
```

## Enhanced Gapless Looping

React Native Sound now supports true gapless looping for professional audio applications like meditation apps, ambient sound players, and music applications requiring seamless audio transitions.

> **📖 Complete Documentation**: For comprehensive gapless looping documentation with detailed examples, API reference, and best practices, see [GAPLESS_DOCUMENTATION.md](./GAPLESS_DOCUMENTATION.md)

### Features

- **True Gapless Playback**: No gaps between loop iterations
- **Memory Efficient**: Single audio file in memory, no duplication
- **Cross-Platform**: iOS (AVQueuePlayer + AVPlayerLooper) and Android (ExoPlayer)
- **Backward Compatible**: Existing `setNumberOfLoops(-1)` automatically enables gapless
- **Professional Grade**: Designed for production apps like Headspace and Calm

### Basic Gapless Usage

```javascript
// Load your ambient sound
var ambientSound = new Sound('rain.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  
  // Enable gapless looping
  ambientSound.setGaplessLooping(true);
  
  // Set infinite gapless loops
  ambientSound.setGaplessLoopCount(-1);
  
  // Play with seamless looping
  ambientSound.play();
});

// Backward compatible - this automatically enables gapless!
ambientSound.setNumberOfLoops(-1);
```

### Advanced Gapless API

```javascript
// Check if gapless is supported on this platform
ambientSound.getGaplessInfo((info) => {
  console.log('Gapless supported:', info.isGaplessSupported);
  console.log('Memory usage:', info.memoryUsage, 'MB');
});

// Preload for optimal performance
await ambientSound.preloadForGapless();

// Set finite gapless loops
ambientSound.setGaplessLoopCount(5); // Loop 5 times seamlessly

// Control gapless transition type (iOS only)
ambientSound.setGaplessTransitionType('instant'); // or 'crossfade' (future)

// Check current gapless status
console.log('Gapless enabled:', ambientSound.isGaplessLoopingEnabled());
console.log('Loop count:', ambientSound.getGaplessLoopCount());
```

### Meditation App Example

```javascript
class MeditationPlayer {
  constructor() {
    this.tracks = {};
  }
  
  loadAmbientTrack(name, file) {
    this.tracks[name] = new Sound(file, Sound.MAIN_BUNDLE, (error) => {
      if (!error) {
        // Enable gapless for seamless meditation experience
        this.tracks[name].setGaplessLooping(true);
        this.tracks[name].setGaplessLoopCount(-1); // Infinite
        
        // Preload for instant playback
        this.tracks[name].preloadForGapless();
      }
    });
  }
  
  playAmbientMix(tracks, volumes) {
    tracks.forEach((trackName, index) => {
      const track = this.tracks[trackName];
      if (track) {
        track.setVolume(volumes[index] || 0.5);
        track.play(); // Seamless gapless looping!
      }
    });
  }
}

// Usage
const player = new MeditationPlayer();
player.loadAmbientTrack('rain', 'rain_loop.mp3');
player.loadAmbientTrack('ocean', 'ocean_waves.mp3');
player.loadAmbientTrack('forest', 'forest_birds.mp3');

// Play multiple tracks simultaneously with individual volumes
player.playAmbientMix(['rain', 'ocean'], [0.7, 0.3]);
```

### API Reference

#### Gapless Methods

- `setGaplessLooping(enabled: boolean)` - Enable/disable gapless looping
- `isGaplessLoopingEnabled()` - Check if gapless is enabled
- `setGaplessLoopCount(count: number)` - Set loop count (-1 = infinite, 0 = no loop, >0 = finite)
- `getGaplessLoopCount()` - Get current loop count
- `setGaplessTransitionType(type: 'instant' | 'crossfade')` - Set transition type (iOS only)
- `getGaplessInfo(callback)` - Get detailed gapless information
- `preloadForGapless()` - Preload audio data for optimal performance

#### Gapless Info Object

```javascript
{
  isGaplessSupported: boolean,    // Platform supports gapless
  isGaplessEnabled: boolean,      // Currently enabled for this sound
  currentLoopCount: number,       // Current loop setting
  totalLoopsCompleted: number,    // Total loops completed
  transitionType: string,         // 'instant' or 'crossfade'
  memoryUsage?: number           // Memory usage in MB (if available)
}
```

## Troubleshooting

### React Native Codegen Issues

If you encounter the error "Union types are unsupported in structs" during `npx expo prebuild` or similar build processes:

**Solution**: Update to version 0.12.1 or later, which resolves this React Native codegen compatibility issue.

```bash
npm install github:devsphere-apps/react-native-sound#feat/enhanced-gapless-looping --save
```

This error was caused by union types in TypeScript definitions that React Native's TurboModule codegen couldn't handle. Version 0.12.1+ uses codegen-compatible type definitions while maintaining full backward compatibility.

### Gapless Looping Not Working

1. **Check platform support**:
```javascript
sound.getGaplessInfo((info) => {
  console.log('Gapless supported:', info.isGaplessSupported);
});
```

2. **Verify audio format**: Use MP3, M4A, or WAV for best compatibility
3. **Enable background playback** (iOS):
```javascript
Sound.setCategory('Playback');
Sound.setActive(true);
```

### Common Build Issues

If you encounter build errors:

1. **Clear build caches**:
```bash
cd android && ./gradlew clean
cd ios && rm -rf build/
```

2. **Re-install dependencies**:
```bash
npm install
cd ios && pod install
```

3. **For Expo projects**, ensure you're using compatible React Native version

## Notes

- To minimize playback delay, you may want to preload a sound file without calling `play()` (e.g. `var s = new Sound(...);`) during app initialization. This also helps avoid a race condition where `play()` may be called before loading of the sound is complete, which results in no sound but no error because loading is still being processed.
- You can play multiple sound files at the same time. Under the hood, this module uses `AVAudioSessionCategoryAmbient` to mix sounds on iOS.
- You may reuse a `Sound` instance for multiple playbacks.
- On iOS, the module wraps `AVAudioPlayer` that supports aac, aiff, mp3, wav etc. The full list of supported formats can be found at https://developer.apple.com/library/content/documentation/MusicAudio/Conceptual/CoreAudioOverview/SupportedAudioFormatsMacOSX/SupportedAudioFormatsMacOSX.html
- On Android, the module wraps `android.media.MediaPlayer`. The full list of supported formats can be found at https://developer.android.com/guide/topics/media/media-formats.html
- On Android, the absolute path can start with '/sdcard/'. So, if you want to access a sound called "my_sound.mp3" on Downloads folder, the absolute path will be: '/sdcard/Downloads/my_sound.mp3'.
- You may chain non-getter calls, for example, `sound.setVolume(.5).setPan(.5).play()`.

## Audio on React Native

- [The State of Audio Libraries in React Native (Oct. 2018)][medium]
- [react-native-audio-toolkit][]
- [react-native-video][] (also plays audio)
- [Expo Audio SDK][]
- [#media on awesome-react-native][#media]

[medium]: https://medium.com/@emmettharper/the-state-of-audio-libraries-in-react-native-7e542f57b3b4
[react-native-audio-toolkit]: https://github.com/react-native-community/react-native-audio-toolkit
[react-native-video]: https://github.com/react-native-community/react-native-video
[expo audio sdk]: https://docs.expo.io/versions/latest/sdk/audio/
[#media]: http://www.awesome-react-native.com/#media

## Contributing

Pull requests welcome with bug fixes, documentation improvements, and
enhancements.

When making big changes, please open an issue first to discuss.

## License

This project is licensed under the MIT License.
