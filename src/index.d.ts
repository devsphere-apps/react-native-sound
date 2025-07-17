// Type definitions for react-native-sound
// Project: https://github.com/zmxv/react-native-sound
// Definitions by: Kyle Roach <https://github.com/iRoachie>
// TypeScript Version: 2.3.2

type AVAudioSessionCategory =
  | "Ambient"
  | "SoloAmbient"
  | "Playback"
  | "Record"
  | "PlayAndRecord"
  | "AudioProcessing"
  | "MultiRoute"
  | "Alarm";

type AVAudioSessionMode =
  | "Default"
  | "VoiceChat"
  | "VideoChat"
  | "GameChat"
  | "VideoRecording"
  | "Measurement"
  | "MoviePlayback"
  | "SpokenAudio";

type FilenameType = string;

type FileType = any;

type BasePathType = string;

type CallbackType = (
  error: any,
  props: {
    duration?: number;
    numberOfChannels?: number;
  }
) => void;

declare class Sound {
  static MAIN_BUNDLE: string;
  static DOCUMENT: string;
  static LIBRARY: string;
  static CACHES: string;

  /**
   * Sets AVAudioSession as active, which is recommended on iOS to achieve seamless background playback.
   * Use this method to deactivate the AVAudioSession when playback is finished in order for other apps
   * to regain access to the audio stack.
   *
   * @param category AVAudioSession category
   * @param mixWithOthers Can be set to true to force mixing with other audio sessions.
   */
  static setActive(active: boolean): void;

  /**
   * Sets AVAudioSession category, which allows playing sound in background,
   * stop sound playback when phone is locked, etc.
   * Parameter options: "Ambient", "SoloAmbient", "Playback", "Record", "PlayAndRecord", "AudioProcessing", "MultiRoute".
   *
   * @param category AVAudioSession category
   * @param mixWithOthers Can be set to true to force mixing with other audio sessions.
   */
  static setCategory(
    category: AVAudioSessionCategory,
    mixWithOthers?: boolean
  ): void;

  /**
   * Sets AVAudioSession mode, which works in conjunction with the category to determine audio mixing behavior.
   * Parameter options: "Default", "VoiceChat", "VideoChat", "GameChat", "VideoRecording", "Measurement", "MoviePlayback", "SpokenAudio".
   *
   * @param mode AVAudioSession mode
   * @param mixWithOthers Can be set to true to force mixing with other audio sessions.
   */
  static setMode(mode: AVAudioSessionMode): void;

  /**
   * Activates or deactivates the audio session with the ambient category, based on the provided boolean value.(iOS only)
   * @param enabled
   */
  static enable(enabled: boolean): void;

  /**
   * @param filenameOrFile Either absolute or relative path to the sound file or the `require` call.
   * @param basePathOrCallback Optional base path of the file. Omit this or pass '' if filename is an absolute path; you may use one of the predefined directories: Sound.MAIN_BUNDLE, Sound.DOCUMENT, Sound.LIBRARY, Sound.CACHES. If you are using `require` to define filepath, then set the callback function as the second argument.
   * @param callback Optional callback function called when load ends in either success or error. In the event of success, error is undefined.
   */
  constructor(
    filenameOrFile: FilenameType | FileType,
    basePathOrCallback?: BasePathType | CallbackType,
    callback?: CallbackType
  );

  /**
   * Return true if the sound has been loaded.
   */
  isLoaded(): boolean;

  /**
   * Plays the loaded file
   * @param onEnd - Optional callback function that gets called when the playback finishes successfully or an audio decoding error interrupts it
   */
  play(onEnd?: (success: boolean) => void): this;

  /**
   * Pause the sound
   * @param cb - Optional callback function that gets called when the sound has been paused.
   */
  pause(cb?: () => void): this;

  /**
   * Stop playback and set the seek position to 0.
   * @param cb - Optional callback function that gets called when the sound has been stopped.
   */
  stop(cb?: () => void): this;

  /**
   * Reset the audio player to its uninitialized state (android only)
   */
  reset(): this;

  /**
   * Release the audio player resource associated with the instance.
   */
  release(): this;

  /**
   * Return the number of channels
   * (1 for mono and 2 for stereo sound), or -1 before the sound gets loaded.
   */
  getNumberOfChannels(): number;

  /**
   * Return the time of audio (second)
   */
  getDuration(): number;

  /**
   * Return the volume of the audio player (not the system-wide volume),
   * Ranges from 0.0 (silence) through 1.0 (full volume, the default)
   */
  getVolume(): number;

  /**
   * Set the volume
   * @param value - ranging from 0.0 (silence) through 1.0 (full volume)
   */
  setVolume(value: number): this;

  /**
   * Return the stereo pan position of the audio player (not the system-wide pan)
   * Ranges from -1.0 (full left) through 1.0 (full right). The default value is 0.0 (center)
   */
  getPan(): number;

  /**
   * Set the pan value
   * @param value - ranging from -1.0 (full left) through 1.0 (full right).
   */
  setPan(value: number): this;

  /**
   * Return the loop count of the audio player.
   * The default is 0 which means to play the sound once.
   * On iOS a positive number specifies the number of times to return to the start and play again, a negative number indicates an indefinite loop.
   * On Android any non-zero value indicates an indefinite loop.
   */
  getNumberOfLoops(): number;

  /**
   * Set the loop count
   * @param value - iOS: 0 means to play the sound once, a positive number specifies the number of times to return to the start and play again, a negative number indicates an indefinite loop. Android: 0 means to play the sound once, other numbers indicate an indefinite loop.
   */
  setNumberOfLoops(value: number): this;

  /**
   * Callback will receive the current playback position in seconds and whether the sound is being played.
   * @param cb
   */
  getCurrentTime(cb?: (seconds: number, isPlaying: boolean) => void): void;

  /**
   * Seek to a particular playback point in seconds.
   * @param value
   */
  setCurrentTime(value: number): this;

  /**
   * Return the speed of the audio player
   */
  getSpeed(): number;

  /**
   * Speed of the audio playback.
   * @param value
   */
  setSpeed(value: number): this;

  /**
   * Return the pitch of the audio player
   */
  getPitch(): number;

  /**
   * Pitch of the audio playback (Android Only).
   * @param value
   */
  setPitch(value: number): void;

  /**
   * Whether to enable playback in silence mode (iOS only)
   * @deprecated - Use the static method Sound.setCategory('Playback') instead which has the same effect.
   * @param enabled
   */
  enableInSilenceMode(enabled: boolean): void;

  /**
   * Sets AVAudioSession category
   * @deprecated
   * @param value
   */
  setCategory(value: AVAudioSessionCategory): void;

  /**
   * Turn speaker phone on (android only)
   * @platform android
   * @param value
   */
  setSpeakerphoneOn(value: boolean): void;

  /**
   * Whether the player is playing or not.
   */
  isPlaying(): boolean;

  // Enhanced Gapless Looping API for Professional Audio Applications

  /**
   * Enable true gapless looping for seamless audio playback.
   * Uses AVQueuePlayer + AVPlayerLooper on iOS and ExoPlayer on Android.
   * Perfect for meditation apps, ambient sounds, and professional audio applications.
   * @param enabled - true to enable gapless looping, false to disable
   * @returns this instance for method chaining
   */
  setGaplessLooping(enabled: boolean): this;

  /**
   * Check if gapless looping is currently enabled.
   * @returns true if gapless looping is enabled, false otherwise
   */
  isGaplessLoopingEnabled(): boolean;

  /**
   * Set the number of gapless loops to perform.
   * When gapless looping is enabled, this provides seamless looping without audio gaps.
   * @param count - Number of loops: 0 = play once, positive number = finite loops, -1 = infinite gapless loops
   * @returns this instance for method chaining
   */
  setGaplessLoopCount(count: number): this;

  /**
   * Get the current gapless loop count.
   * @returns Current loop count (-1 for infinite, 0 for no loops, positive for finite loops)
   */
  getGaplessLoopCount(): number;

  /**
   * Set the gapless transition behavior (iOS only).
   * Controls how the audio transitions during gapless looping.
   * @param type - 'instant' for immediate transition, 'crossfade' for smooth crossfade (future enhancement)
   * @returns this instance for method chaining
   */
  setGaplessTransitionType(type: 'instant' | 'crossfade'): this;

  /**
   * Get detailed information about gapless playback status.
   * Useful for monitoring and debugging gapless playback.
   * @param callback - Called with gapless status information
   */
  getGaplessInfo(callback: (info: {
    isGaplessSupported: boolean;
    isGaplessEnabled: boolean;
    currentLoopCount: number;
    totalLoopsCompleted: number;
    transitionType: 'instant' | 'crossfade';
    memoryUsage?: number; // in MB, if available
  }) => void): void;

  /**
   * Preload audio data for optimal gapless performance.
   * Ensures smooth gapless looping by pre-buffering audio data.
   * @returns Promise that resolves when preloading is complete
   */
  preloadForGapless(): Promise<void>;
}

export = Sound;
