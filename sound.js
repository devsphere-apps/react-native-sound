'use strict';

var ReactNative = require('react-native');
var RNSound = ReactNative.NativeModules.RNSound;
var IsAndroid = RNSound.IsAndroid;
var IsWindows = RNSound.IsWindows;
var resolveAssetSourceModule = require("react-native/Libraries/Image/resolveAssetSource");
var resolveAssetSource = resolveAssetSourceModule && resolveAssetSourceModule.__esModule
  ? resolveAssetSourceModule.default
  : resolveAssetSourceModule;
var eventEmitter = new ReactNative.NativeEventEmitter(RNSound);

var nextKey = 0;

function isRelativePath(path) {
  return !/^(\/|http(s?)|asset|file)/.test(path);
}

function calculateRelativeVolume(volume, pan) {
  // calculates a lower volume relative to the pan value
  const relativeVolume = (volume * (1 - Math.abs(pan)));
  return Number(relativeVolume.toFixed(1));
}

function setAndroidVolumes(sound) {
  // calculates the volumes for left and right channels
  if (sound._pan) {
    const relativeVolume = calculateRelativeVolume(sound._volume, sound._pan);
    if (sound._pan < 0) {
      // left is louder
      RNSound.setVolume(sound._key, sound._volume, relativeVolume);
    } else {
      // right is louder
      RNSound.setVolume(sound._key, relativeVolume, sound._volume);
    }
  } else {
    // no panning, same volume on both channels
    RNSound.setVolume(sound._key, sound._volume, sound._volume);
  }
}

function Sound(filename, basePath, onError, options) {
  var asset = resolveAssetSource(filename);
  if (asset) {
    this._filename = asset.uri;
    onError = basePath;
  } else {
    this._filename = basePath ? basePath + '/' + filename : filename;

    if (IsAndroid && !basePath && isRelativePath(filename)) {
      this._filename = filename.toLowerCase().replace(/\.[^.]+$/, '');
    }
  }

  this.registerOnPlay = function() {
    if (this.onPlaySubscription != null) {
      console.warn('On Play change event listener is already registered');
      return;
    }

    if (!IsWindows) {
      this.onPlaySubscription = eventEmitter.addListener(
        'onPlayChange',
        (param) => {
          const { isPlaying, playerKey } = param;
          if (playerKey === this._key) {
            if (isPlaying) {
              this._playing = true;
            }
            else {
              this._playing = false;
            }
          }
        },
      );
    }
  }

  this._loaded = false;
  this._key = nextKey++;
  this._playing = false;
  this._duration = -1;
  this._numberOfChannels = -1;
  this._volume = 1;
  this._pan = 0;
  this._numberOfLoops = 0;
  this._speed = 1;
  this._pitch = 1;
  
  // Enhanced Gapless Looping Properties
  this._gaplessLoopingEnabled = false;
  this._gaplessLoopCount = 0;
  this._gaplessTransitionType = 'instant';
  this._totalLoopsCompleted = 0;
  
  RNSound.prepare(this._filename, this._key, options || {}, (error, props) => {
    if (props) {
      if (typeof props.duration === 'number') {
        this._duration = props.duration;
      }
      if (typeof props.numberOfChannels === 'number') {
        this._numberOfChannels = props.numberOfChannels;
      }
    }
    if (error === null) {
      this._loaded = true;
      this.registerOnPlay();
    }
    onError && onError(error, props);
  });
}

Sound.prototype.isLoaded = function() {
  return this._loaded;
};

Sound.prototype.play = function(onEnd) {
  if (this._loaded) {
    RNSound.play(this._key, (successfully) => onEnd && onEnd(successfully));
  } else {
    onEnd && onEnd(false);
  }
  return this;
};

Sound.prototype.pause = function(callback) {
  if (this._loaded) {
    RNSound.pause(this._key, () => {
      this._playing = false;
      callback && callback();
    });
  }
  return this;
};

Sound.prototype.stop = function(callback) {
  if (this._loaded) {
    RNSound.stop(this._key, () => {
      this._playing = false;
      callback && callback();
    });
  }
  return this;
};

Sound.prototype.reset = function() {
  if (this._loaded && IsAndroid) {
    RNSound.reset(this._key);
    this._playing = false;
  }
  return this;
};

Sound.prototype.release = function() {
  if (this._loaded) {
    RNSound.release(this._key);
    this._loaded = false;
    if (!IsWindows) {
      if (this.onPlaySubscription != null) {
        this.onPlaySubscription.remove();
        this.onPlaySubscription = null;
      }
    }
  }
  return this;
};

Sound.prototype.getFilename = function() {
  return this._filename;
};

Sound.prototype.getDuration = function() {
  return this._duration;
};

Sound.prototype.getNumberOfChannels = function() {
  return this._numberOfChannels;
};

Sound.prototype.getVolume = function() {
  return this._volume;
};

Sound.prototype.getSpeed = function() {
  return this._speed;
};

Sound.prototype.getPitch = function() {
  return this._pitch;
};

Sound.prototype.setVolume = function(value) {
  this._volume = value;
  if (this._loaded) {
    if (IsAndroid) {
      setAndroidVolumes(this)
    } else {
      // iOS also needs left and right volume parameters
      RNSound.setVolume(this._key, value, value);
    }
  }
  return this;
};

Sound.prototype.setPan = function(value) {
  this._pan = value;
  if (this._loaded) {
    if (IsWindows) {
      throw new Error('#setPan not supported on windows');
    } else if (IsAndroid) {
      setAndroidVolumes(this)
    } else {
      RNSound.setPan(this._key, value);
    }
  }
  return this;
};

Sound.prototype.getSystemVolume = function(callback) {
  if(!IsWindows) {
    RNSound.getSystemVolume(callback);
  }
  return this;
};

Sound.prototype.setSystemVolume = function(value) {
  if (IsAndroid) {
    RNSound.setSystemVolume(value);
  }
  return this;
};

Sound.prototype.getPan = function() {
  return this._pan;
};

Sound.prototype.getNumberOfLoops = function() {
  return this._numberOfLoops;
};

Sound.prototype.setNumberOfLoops = function(value) {
  this._numberOfLoops = value;
  
  // Backward compatibility enhancement: 
  // For infinite loops (-1), automatically enable gapless if supported
  if (value === -1 && this._loaded) {
    // Try to enable gapless looping for seamless infinite loops
    this._gaplessLoopingEnabled = true;
    this._gaplessLoopCount = -1;
    if (RNSound.setGaplessLooping) {
      RNSound.setGaplessLooping(this._key, true);
      RNSound.setGaplessLoopCount(this._key, -1);
    }
  }
  
  if (this._loaded) {
    if (IsAndroid || IsWindows) {
      RNSound.setLooping(this._key, !!value);
    } else {
      RNSound.setNumberOfLoops(this._key, value);
    }
  }
  return this;
};

Sound.prototype.setSpeed = function(value) {
  this._speed = value;
  if (this._loaded) {
    if (!IsWindows) {
      RNSound.setSpeed(this._key, value);
    }
  }
  return this;
};

Sound.prototype.setPitch = function(value) {
  this._pitch = value;
  if (this._loaded) {
    if (IsAndroid) {
      RNSound.setPitch(this._key, value);
    }
  }
  return this;
};

Sound.prototype.getCurrentTime = function(callback) {
  if (this._loaded) {
    RNSound.getCurrentTime(this._key, callback);
  }
};

Sound.prototype.setCurrentTime = function(value) {
  if (this._loaded) {
    RNSound.setCurrentTime(this._key, value);
  }
  return this;
};

// android only
Sound.prototype.setSpeakerphoneOn = function(value) {
  if (IsAndroid) {
    RNSound.setSpeakerphoneOn(this._key, value);
  }
};

// ios only

// This is deprecated.  Call the static one instead.

Sound.prototype.setCategory = function(value) {
  Sound.setCategory(value, false);
}

Sound.prototype.isPlaying = function() {
  return this._playing;
}

// Enhanced Gapless Looping API for Professional Audio Applications

Sound.prototype.setGaplessLooping = function(enabled) {
  if (typeof enabled !== 'boolean') {
    throw new Error('setGaplessLooping expects a boolean value');
  }
  
  this._gaplessLoopingEnabled = enabled;
  if (this._loaded && RNSound.setGaplessLooping) {
    // Call native method to enable/disable gapless looping
    RNSound.setGaplessLooping(this._key, enabled);
  }
  return this;
};

Sound.prototype.isGaplessLoopingEnabled = function() {
  return this._gaplessLoopingEnabled;
};

Sound.prototype.setGaplessLoopCount = function(count) {
  if (typeof count !== 'number' || !Number.isInteger(count)) {
    throw new Error('setGaplessLoopCount expects an integer value');
  }
  
  this._gaplessLoopCount = count;
  if (this._loaded && this._gaplessLoopingEnabled && RNSound.setGaplessLoopCount) {
    // Call native method to set gapless loop count
    RNSound.setGaplessLoopCount(this._key, count);
  }
  return this;
};

Sound.prototype.getGaplessLoopCount = function() {
  return this._gaplessLoopCount;
};

Sound.prototype.setGaplessTransitionType = function(type) {
  if (type !== 'instant' && type !== 'crossfade') {
    throw new Error('setGaplessTransitionType expects "instant" or "crossfade"');
  }
  
  this._gaplessTransitionType = type;
  if (this._loaded && this._gaplessLoopingEnabled && !IsAndroid && !IsWindows && RNSound.setGaplessTransitionType) {
    // iOS only feature for now
    RNSound.setGaplessTransitionType(this._key, type);
  }
  return this;
};

Sound.prototype.getGaplessInfo = function(callback) {
  if (typeof callback !== 'function') {
    throw new Error('getGaplessInfo expects a callback function');
  }
  
  if (this._loaded && RNSound.getGaplessInfo) {
    var self = this;
    RNSound.getGaplessInfo(this._key, function(nativeInfo) {
      callback({
        isGaplessSupported: nativeInfo.isGaplessSupported || false,
        isGaplessEnabled: self._gaplessLoopingEnabled,
        currentLoopCount: self._gaplessLoopCount,
        totalLoopsCompleted: self._totalLoopsCompleted,
        transitionType: self._gaplessTransitionType,
        memoryUsage: nativeInfo.memoryUsage
      });
    });
  } else {
    // Return default info if not loaded or method not available
    callback({
      isGaplessSupported: false,
      isGaplessEnabled: this._gaplessLoopingEnabled,
      currentLoopCount: this._gaplessLoopCount,
      totalLoopsCompleted: this._totalLoopsCompleted,
      transitionType: this._gaplessTransitionType
    });
  }
};

Sound.prototype.preloadForGapless = function(callback) {
  if (typeof callback !== 'function') {
    throw new Error('preloadForGapless expects a callback function');
  }
  
  if (!this._loaded) {
    callback(false, 'Sound must be loaded before preloading for gapless');
    return;
  }

  if (!this._gaplessLoopingEnabled) {
    callback(false, 'Gapless looping must be enabled before preloading');
    return;
  }

  if (RNSound.preloadForGapless) {
    RNSound.preloadForGapless(this._key, function(success, error) {
      callback(success, error);
    });
  } else {
    callback(false, 'Gapless preloading not supported on this platform');
  }
};

// Convenience method to enable gapless mode (alias for setGaplessLooping)
Sound.prototype.enableGaplessMode = function() {
  return this.setGaplessLooping(true);
};

Sound.enable = function(enabled) {
  RNSound.enable(enabled);
};

Sound.enableInSilenceMode = function(enabled) {
  if (!IsAndroid && !IsWindows) {
    RNSound.enableInSilenceMode(enabled);
  }
};

Sound.setActive = function(value) {
  if (!IsAndroid && !IsWindows) {
    RNSound.setActive(value);
  }
};

Sound.setCategory = function(value, mixWithOthers = false) {
  if (!IsWindows) {
    RNSound.setCategory(value, mixWithOthers);
  }
};

Sound.setMode = function(value) {
  if (!IsAndroid && !IsWindows) {
    RNSound.setMode(value);
  }
};

Sound.setSpeakerPhone = function(value) {
  if (!IsAndroid && !IsWindows) {
    RNSound.setSpeakerPhone(value)
  }
}

Sound.MAIN_BUNDLE = RNSound.MainBundlePath;
Sound.DOCUMENT = RNSound.NSDocumentDirectory;
Sound.LIBRARY = RNSound.NSLibraryDirectory;
Sound.CACHES = RNSound.NSCachesDirectory;

module.exports = Sound;
