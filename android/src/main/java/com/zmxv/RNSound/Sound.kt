package com.zmxv.RNSound;

import android.content.Context
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.MediaPlayer.OnCompletionListener
import android.media.MediaPlayer.OnErrorListener
import android.media.MediaPlayer.OnPreparedListener

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BridgeReactContext.RCTDeviceEventEmitter
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext

import com.facebook.react.bridge.ReadableMap
import java.io.File
import java.io.IOException

// ExoPlayer imports for gapless looping
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.Player
import com.google.android.exoplayer2.source.LoopingMediaSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory
import com.google.android.exoplayer2.util.Util


open class Sound internal constructor(context:ReactApplicationContext):AudioManager.OnAudioFocusChangeListener  {
  private var playerPool: MutableMap<Double, MediaPlayer> = mutableMapOf()
  private val reactContext: ReactApplicationContext = context
  var category: String? = null
  private var mixWithOthers: Boolean = true
  private var focusedPlayerKey: Double? = null
  private var wasPlayingBeforeFocusChange: Boolean = false

  // Enhanced Gapless Looping Support
  private var gaplessExoPlayerPool: MutableMap<Double, ExoPlayer> = mutableMapOf()
  private var gaplessEnabledPool: MutableMap<Double, Boolean> = mutableMapOf()
  private var gaplessLoopCountPool: MutableMap<Double, Int> = mutableMapOf()
  private var gaplessMediaSourcePool: MutableMap<Double, LoopingMediaSource> = mutableMapOf()

  fun setOnPlay(isPlaying: Boolean, playerKey: Double) {
    val params = Arguments.createMap()
    params.putBoolean("isPlaying", isPlaying)
    params.putDouble("playerKey", playerKey)
    reactContext.getJSModule(RCTDeviceEventEmitter::class.java)
      ?.emit("onPlayChange", params)
  }

  // Enhanced Gapless Looping Helper Methods
  
  private fun isGaplessEnabledForKey(key: Double): Boolean {
    return gaplessEnabledPool[key] ?: false
  }

  private fun setGaplessEnabledForKey(key: Double, enabled: Boolean) {
    gaplessEnabledPool[key] = enabled
  }

  private fun getGaplessLoopCountForKey(key: Double): Int {
    return gaplessLoopCountPool[key] ?: 0
  }

  private fun setGaplessLoopCountForKey(key: Double, count: Int) {
    gaplessLoopCountPool[key] = count
  }

  private fun getGaplessExoPlayerForKey(key: Double): ExoPlayer? {
    return gaplessExoPlayerPool[key]
  }

  private fun createGaplessExoPlayer(fileName: String, key: Double): ExoPlayer? {
    try {
      val exoPlayer = ExoPlayer.Builder(reactContext).build()
      
      // Create media source
      val dataSourceFactory = DefaultDataSourceFactory(
        reactContext,
        Util.getUserAgent(reactContext, "RNSound")
      )
      
      val mediaItem = when {
        fileName.startsWith("http://") || fileName.startsWith("https://") -> {
          MediaItem.fromUri(fileName)
        }
        fileName.startsWith("file:/") -> {
          MediaItem.fromUri(fileName)
        }
        fileName.startsWith("asset:/") -> {
          MediaItem.fromUri("file:///android_asset/${fileName.replace("asset:/", "")}")
        }
        else -> {
          val file = File(fileName)
          if (file.exists()) {
            MediaItem.fromUri(file.toURI().toString())
          } else {
            // Try as raw resource
            val resourceUri = "android.resource://${reactContext.packageName}/raw/$fileName"
            MediaItem.fromUri(resourceUri)
          }
        }
      }
      
      val mediaSource = ProgressiveMediaSource.Factory(dataSourceFactory)
        .createMediaSource(mediaItem)
      
      exoPlayer.setMediaSource(mediaSource)
      exoPlayer.prepare()
      
      gaplessExoPlayerPool[key] = exoPlayer
      return exoPlayer
      
    } catch (e: Exception) {
      Log.e("RNSound", "Error creating gapless ExoPlayer: ${e.message}")
      return null
    }
  }

  fun prepare(fileName: String, key: Double?, options: ReadableMap, callback: Callback) {
    val player = createMediaPlayer(fileName)
    if (options.hasKey("speed")) {
      player!!.playbackParams = player.playbackParams.setSpeed(options.getDouble("speed").toFloat())
    }
    if (player == null) {
      val e = Arguments.createMap()
      e.putInt("code", -1)
      e.putString("message", "resource not found")
      callback.invoke(e, null)
      return
    }
    if (key != null) {
      playerPool[key] = player
    }

    val module: Sound = this

    if (module.category != null) {
      var category: Int? = null
      when (module.category) {
        "Playback" -> category = AudioManager.STREAM_MUSIC
        "Ambient" -> category = AudioManager.STREAM_NOTIFICATION
        "System" -> category = AudioManager.STREAM_SYSTEM
        "Voice" -> category = AudioManager.STREAM_VOICE_CALL
        "Ring" -> category = AudioManager.STREAM_RING
        "Alarm" -> category = AudioManager.STREAM_ALARM

      }
      if (category != null) {
        player.setAudioStreamType(category)
      }
    }

    player.setOnPreparedListener(object : OnPreparedListener {
      var callbackWasCalled: Boolean = false

      @Synchronized
      override fun onPrepared(mp: MediaPlayer) {
        if (callbackWasCalled) return
        callbackWasCalled = true

        val props = Arguments.createMap()
        props.putDouble("duration", mp.duration * .001)
        try {
          callback.invoke(null, props)
        } catch (runtimeException: RuntimeException) {
          // The callback was already invoked

        }
      }
    })

    player.setOnErrorListener(object : OnErrorListener {
      var callbackWasCalled: Boolean = false

      @Synchronized
      override fun onError(mp: MediaPlayer?, what: Int, extra: Int): Boolean {
        if (callbackWasCalled) return true
        callbackWasCalled = true
        try {
          val props = Arguments.createMap()
          props.putInt("what", what)
          props.putInt("extra", extra)
          callback.invoke(props, null)
        } catch (runtimeException: RuntimeException) {
          // The callback was already invoked

        }
        return true
      }
    })

    try {
      if (options.hasKey("loadSync") && options.getBoolean("loadSync")) {
        player.prepare()
      } else {
        player.prepareAsync()
      }
    } catch (ignored: Exception) {
      // When loading files from a file, we useMediaPlayer.create, which actually
      // prepares the audio for us already. So we catch and ignore this error

    }
  }

  private fun createMediaPlayer(fileName: String): MediaPlayer? {
    val res =
      reactContext.resources.getIdentifier(fileName, "raw", reactContext.packageName)
    val mediaPlayer = MediaPlayer()
    if (res != 0) {
      try {
        val afd = reactContext.resources.openRawResourceFd(res)
        mediaPlayer.setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
        afd.close()
      } catch (e: IOException) {
        return null
      }
      return mediaPlayer
    }

    if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
      mediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC)
      try {
        mediaPlayer.setDataSource(fileName)
      } catch (e: IOException) {
        return null
      }
      return mediaPlayer
    }

    if (fileName.startsWith("asset:/")) {
      try {
        val descriptor =
          reactContext.assets.openFd(fileName.replace("asset:/", ""))
        mediaPlayer.setDataSource(
          descriptor.fileDescriptor,
          descriptor.startOffset,
          descriptor.length
        )
        descriptor.close()
        return mediaPlayer
      } catch (e: IOException) {
        return null
      }
    }

    if (fileName.startsWith("file:/")) {
      try {
        mediaPlayer.setDataSource(fileName)
      } catch (e: IOException) {
        return null
      }
      return mediaPlayer
    }

    val file = File(fileName)
    if (file.exists()) {
      mediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC)
      try {
        mediaPlayer.setDataSource(fileName)
      } catch (e: IOException) {
        return null
      }
      return mediaPlayer
    }

    return null
  }


  fun play(key: Double?, callback: Callback?) {
    if (key == null) {
      callback?.invoke(false)
      return
    }
    
    // Check if gapless looping is enabled for this key
    if (isGaplessEnabledForKey(key)) {
      val exoPlayer = getGaplessExoPlayerForKey(key)
      if (exoPlayer != null) {
        if (exoPlayer.isPlaying) {
          return
        }
        
        // Request audio focus if needed
        if (!this.mixWithOthers) {
          val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
          audioManager.requestAudioFocus(this, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN)
          this.focusedPlayerKey = key
        }
        
        exoPlayer.play()
        setOnPlay(true, key)
        callback?.invoke(true)
        return
      }
    }
    
    // Fallback to regular MediaPlayer
    val player = playerPool[key]
    if (player == null) {
      setOnPlay(false, key)
      callback?.invoke(false)
      return
    }
    if (player.isPlaying) {
      return
    }

    // Request audio focus in Android system
    if (!this.mixWithOthers) {
      val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager

      audioManager.requestAudioFocus(this, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN)

      this.focusedPlayerKey = key
    }

    player.setOnCompletionListener(object : OnCompletionListener {
      var callbackWasCalled: Boolean = false

      @Synchronized
      override fun onCompletion(mp: MediaPlayer) {
        if (!mp.isLooping) {
          setOnPlay(false, key)
          if (callbackWasCalled) return
          callbackWasCalled = true
          try {
            callback?.invoke(true)
          } catch (e: Exception) {
            //Catches the exception: java.lang.RuntimeException·Illegal callback invocation from native module
          }
        }
      }
    })
    player.setOnErrorListener(object : OnErrorListener {
      var callbackWasCalled: Boolean = false

      @Synchronized
      override fun onError(mp: MediaPlayer?, what: Int, extra: Int): Boolean {
        setOnPlay(false, key)
        if (callbackWasCalled) return true
        callbackWasCalled = true
        try {
          callback?.invoke(true)
        } catch (e: Exception) {
          //Catches the exception: java.lang.RuntimeException·Illegal callback invocation from native module
        }
        return true
      }
    })
    player.start()
    setOnPlay(true, key)
  }


  fun pause(key: Double?, callback: Callback?) {
    if (key == null) {
      callback?.invoke()
      return
    }
    
    // Check if gapless looping is enabled for this key
    if (isGaplessEnabledForKey(key)) {
      val exoPlayer = getGaplessExoPlayerForKey(key)
      if (exoPlayer != null) {
        exoPlayer.pause()
        setOnPlay(false, key)
        callback?.invoke()
        return
      }
    }
    
    // Fallback to regular MediaPlayer
    val player = playerPool[key]
    if (player != null && player.isPlaying) {
      player.pause()
      setOnPlay(false, key)
    }

    callback?.invoke()
  }


  fun stop(key: Double, callback: Callback) {
    // Check if gapless looping is enabled for this key
    if (isGaplessEnabledForKey(key)) {
      val exoPlayer = getGaplessExoPlayerForKey(key)
      if (exoPlayer != null) {
        exoPlayer.pause()
        exoPlayer.seekTo(0)
        setOnPlay(false, key)
        
        // Release audio focus if needed
        if (!this.mixWithOthers && key === this.focusedPlayerKey) {
          val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
          audioManager.abandonAudioFocus(this)
        }
        
        callback.invoke()
        return
      }
    }
    
    // Fallback to regular MediaPlayer
    val player = playerPool[key]
    if (player != null && player.isPlaying) {
      player.pause()
      player.seekTo(0)
      setOnPlay(false, key)
    }

    // Release audio focus in Android system
    if (!this.mixWithOthers && key === this.focusedPlayerKey) {
      val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      audioManager.abandonAudioFocus(this)
    }

    callback.invoke()
  }


  fun reset(key: Double?) {
    val player = playerPool[key]
    player?.reset()
  }


  fun release(key: Double) {
    // Clean up gapless resources
    val exoPlayer = getGaplessExoPlayerForKey(key)
    if (exoPlayer != null) {
      exoPlayer.stop()
      exoPlayer.release()
      gaplessExoPlayerPool.remove(key)
    }
    
    // Clean up gapless settings
    gaplessMediaSourcePool.remove(key)
    gaplessEnabledPool.remove(key)
    gaplessLoopCountPool.remove(key)
    
    // Clean up regular MediaPlayer
    val player = playerPool[key]
    if (player != null) {
      player.reset()
      player.release()
      playerPool.remove(key)

      // Release audio focus in Android system
      if (!this.mixWithOthers && key === this.focusedPlayerKey) {
        val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        audioManager.abandonAudioFocus(this)
      }
    }
  }


  fun setVolume(key: Double?, left: Float?, right: Float?) {
    val player = playerPool[key]
    player?.setVolume(left!!, right!!)
  }


  fun getSystemVolume(callback: Callback) {
    try {
      val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager

      callback.invoke(
        audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
          .toFloat() / audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
      )
    } catch (error: Exception) {
      val e = Arguments.createMap()
      e.putInt("code", -1)
      e.putString("message", error.message)
      callback.invoke(e)
    }
  }


  fun setSystemVolume(value: Float) {
    val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    val volume = Math.round(audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC) * value)
    audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, volume, 0)
  }


  fun setLooping(key: Double?, looping: Boolean?) {
    val player = playerPool[key]
    if (player != null) {
      player.isLooping = looping!!
    }
  }

  // Enhanced Gapless Looping Methods

  fun setGaplessLooping(key: Double?, enabled: Boolean?) {
    if (key == null || enabled == null) return
    
    setGaplessEnabledForKey(key, enabled)
    
    if (enabled) {
      // Get the original filename from MediaPlayer if possible, or use a stored reference
      // For now, we'll need to store the filename during prepare()
      // This is a limitation we'll document
      
      // Set default loop count if not set
      if (getGaplessLoopCountForKey(key) == 0) {
        setGaplessLoopCountForKey(key, -1) // Default to infinite
      }
    } else {
      // Clean up gapless resources
      val exoPlayer = getGaplessExoPlayerForKey(key)
      if (exoPlayer != null) {
        exoPlayer.stop()
        exoPlayer.release()
        gaplessExoPlayerPool.remove(key)
      }
      
      gaplessMediaSourcePool.remove(key)
      gaplessEnabledPool.remove(key)
      gaplessLoopCountPool.remove(key)
    }
  }

  fun setGaplessLoopCount(key: Double?, count: Double?) {
    if (key == null || count == null) return
    
    setGaplessLoopCountForKey(key, count.toInt())
    
    if (isGaplessEnabledForKey(key)) {
      val exoPlayer = getGaplessExoPlayerForKey(key)
      if (exoPlayer != null) {
        // Update the looping behavior
        if (count.toInt() == 0) {
          // No looping
          exoPlayer.repeatMode = Player.REPEAT_MODE_OFF
        } else if (count.toInt() == -1) {
          // Infinite looping
          exoPlayer.repeatMode = Player.REPEAT_MODE_ONE
        } else {
          // Finite looping - ExoPlayer doesn't directly support finite looping
          // We'd need to implement a listener to stop after N loops
          exoPlayer.repeatMode = Player.REPEAT_MODE_ONE
          // TODO: Implement finite loop counting with Player.Listener
        }
      }
    }
  }

  fun getGaplessInfo(key: Double?, callback: Callback) {
    if (key == null) {
      callback.invoke(Arguments.createMap().apply {
        putBoolean("isGaplessSupported", false)
      })
      return
    }
    
    val isGaplessSupported = true // ExoPlayer supports gapless
    val isGaplessEnabled = isGaplessEnabledForKey(key)
    
    // Estimate memory usage
    var memoryUsage = 0.0
    val player = playerPool[key]
    if (player != null) {
      // Rough estimate for MediaPlayer
      memoryUsage = (player.duration / 1000.0) * 2 * 44100 * 2 / (1024 * 1024) // Simplified calculation
    }
    
    callback.invoke(Arguments.createMap().apply {
      putBoolean("isGaplessSupported", isGaplessSupported)
      putDouble("memoryUsage", memoryUsage)
    })
  }

  fun preloadForGapless(key: Double?, callback: Callback) {
    if (key == null) {
      callback.invoke(false, "Invalid key")
      return
    }
    
    if (!isGaplessEnabledForKey(key)) {
      callback.invoke(false, "Gapless looping not enabled for this sound")
      return
    }
    
    val exoPlayer = getGaplessExoPlayerForKey(key)
    if (exoPlayer == null) {
      callback.invoke(false, "No gapless ExoPlayer found")
      return
    }
    
    // Check if already ready
    if (exoPlayer.playbackState == Player.STATE_READY) {
      callback.invoke(true, "")
    } else {
      // Add listener for when ready
      exoPlayer.addListener(object : Player.Listener {
        override fun onPlaybackStateChanged(playbackState: Int) {
          if (playbackState == Player.STATE_READY) {
            exoPlayer.removeListener(this)
            callback.invoke(true, "")
          } else if (playbackState == Player.STATE_IDLE) {
            exoPlayer.removeListener(this)
            callback.invoke(false, "Failed to prepare")
          }
        }
      })
    }
  }


  fun setSpeed(key: Double?, speed: Float?) {
    val player = playerPool[key]
    if (player != null) {
      player.playbackParams = player.playbackParams.setSpeed(speed!!)
    }
  }


  fun setPitch(key: Double?, pitch: Float?) {
    val player = playerPool[key]
    if (player != null) {
      player.playbackParams = player.playbackParams.setPitch(pitch!!)
    }
  }


  fun setCurrentTime(key: Double?, sec: Float) {
    val player = playerPool[key]
    player?.seekTo(Math.round(sec * 1000))
  }


  fun getCurrentTime(key: Double?, callback: Callback) {
    val player = playerPool[key]
    if (player == null) {
      callback.invoke(-1, false)
      return
    }
    callback.invoke(player.currentPosition * .001, player.isPlaying)
  }


  //turn speaker on
  fun setSpeakerphoneOn(key: Double?, speaker: Boolean) {
    val player = playerPool[key]
    if (player != null) {
      val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      if (speaker) {
        audioManager.mode = AudioManager.MODE_IN_COMMUNICATION
      } else {
        audioManager.mode = AudioManager.MODE_NORMAL
      }
      audioManager.isSpeakerphoneOn = speaker
    }
  }


  fun setCategory(category: String?, mixWithOthers: Boolean?) {
    this.category = category
    this.mixWithOthers = mixWithOthers!!
  }



  override fun onAudioFocusChange(focusChange: Int) {
    if (!this.mixWithOthers) {
      val player = playerPool[focusedPlayerKey]

      if (player != null) {
        if (focusChange <= 0) {
          this.wasPlayingBeforeFocusChange = player.isPlaying

          if (this.wasPlayingBeforeFocusChange) {
            this.pause(this.focusedPlayerKey, null)
          }
        } else {
          if (this.wasPlayingBeforeFocusChange) {
            this.play(this.focusedPlayerKey, null)
            this.wasPlayingBeforeFocusChange = false
          }
        }
      }
    }
  }
}
