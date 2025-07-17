#import "RNSound.h"

#if __has_include("RCTUtils.h")
#import "RCTUtils.h"
#else
#import <React/RCTUtils.h>
#endif

@implementation RNSound {
    NSMutableDictionary *_playerPool;
    NSMutableDictionary *_callbackPool;
    double _key;  // Add this line to declare _key
    
    // Enhanced Gapless Looping Support
    NSMutableDictionary *_gaplessQueuePlayerPool;
    NSMutableDictionary *_gaplessPlayerLooperPool;
    NSMutableDictionary *_gaplessEnabledPool;
    NSMutableDictionary *_gaplessLoopCountPool;
    NSMutableDictionary *_gaplessTransitionTypePool;
}

RCT_EXPORT_MODULE()
@synthesize _key = _key;

- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"onPlayChange"
  ];
}

#pragma mark - Audio Session Management

- (void)audioSessionChangeObserver:(NSNotification *)notification {
    NSDictionary *userInfo = notification.userInfo;
  
    
    AVAudioSessionRouteChangeReason routeChangeReason =
        (AVAudioSessionRouteChangeReason)[userInfo[@"AVAudioSessionRouteChangeReasonKey"] longValue];
    AVAudioSessionInterruptionType interruptionType =
        (AVAudioSessionInterruptionType)[userInfo[@"AVAudioSessionInterruptionTypeKey"] longValue];
    
    AVAudioPlayer *player = [self playerForKey:self._key];
    
    if (interruptionType == AVAudioSessionInterruptionTypeEnded && player) {
        [player play];
        [self setOnPlay:YES forPlayerKey:self._key];
    } else if (routeChangeReason == AVAudioSessionRouteChangeReasonOldDeviceUnavailable && player) {
        [player pause];
        [self setOnPlay:NO forPlayerKey:self._key];
    } else if (interruptionType == AVAudioSessionInterruptionTypeBegan && player) {
        [player pause];
        [self setOnPlay:NO forPlayerKey:self._key];
    }
}

#pragma mark - Player and Callback Management

- (NSMutableDictionary *)playerPool {
    if (!_playerPool) {
        _playerPool = [NSMutableDictionary new];
    }
    return _playerPool;
}

- (NSMutableDictionary *)callbackPool {
    if (!_callbackPool) {
        _callbackPool = [NSMutableDictionary new];
    }
    return _callbackPool;
}

// Enhanced Gapless Looping Pool Management

- (NSMutableDictionary *)gaplessQueuePlayerPool {
    if (!_gaplessQueuePlayerPool) {
        _gaplessQueuePlayerPool = [NSMutableDictionary new];
    }
    return _gaplessQueuePlayerPool;
}

- (NSMutableDictionary *)gaplessPlayerLooperPool {
    if (!_gaplessPlayerLooperPool) {
        _gaplessPlayerLooperPool = [NSMutableDictionary new];
    }
    return _gaplessPlayerLooperPool;
}

- (NSMutableDictionary *)gaplessEnabledPool {
    if (!_gaplessEnabledPool) {
        _gaplessEnabledPool = [NSMutableDictionary new];
    }
    return _gaplessEnabledPool;
}

- (NSMutableDictionary *)gaplessLoopCountPool {
    if (!_gaplessLoopCountPool) {
        _gaplessLoopCountPool = [NSMutableDictionary new];
    }
    return _gaplessLoopCountPool;
}

- (NSMutableDictionary *)gaplessTransitionTypePool {
    if (!_gaplessTransitionTypePool) {
        _gaplessTransitionTypePool = [NSMutableDictionary new];
    }
    return _gaplessTransitionTypePool;
}

- (AVAudioPlayer *)playerForKey:(double)key {
    NSNumber *keyNumber = @(key);
    return [[self playerPool] objectForKey:keyNumber];
}

- (NSNumber *)keyForPlayer:(AVAudioPlayer *)player {
    return [[[self playerPool] allKeysForObject:player] firstObject];
}

- (RCTResponseSenderBlock)callbackForKey:(NSNumber *)key {
    return [[self callbackPool] objectForKey:key];
}

// Enhanced Gapless Looping Helper Methods

- (AVQueuePlayer *)gaplessQueuePlayerForKey:(double)key {
    NSNumber *keyNumber = @(key);
    return [[self gaplessQueuePlayerPool] objectForKey:keyNumber];
}

- (AVPlayerLooper *)gaplessPlayerLooperForKey:(double)key {
    NSNumber *keyNumber = @(key);
    return [[self gaplessPlayerLooperPool] objectForKey:keyNumber];
}

- (BOOL)isGaplessEnabledForKey:(double)key {
    NSNumber *keyNumber = @(key);
    NSNumber *enabled = [[self gaplessEnabledPool] objectForKey:keyNumber];
    return enabled ? [enabled boolValue] : NO;
}

- (void)setGaplessEnabled:(BOOL)enabled forKey:(double)key {
    NSNumber *keyNumber = @(key);
    [[self gaplessEnabledPool] setObject:@(enabled) forKey:keyNumber];
}

- (int)gaplessLoopCountForKey:(double)key {
    NSNumber *keyNumber = @(key);
    NSNumber *count = [[self gaplessLoopCountPool] objectForKey:keyNumber];
    return count ? [count intValue] : 0;
}

- (void)setGaplessLoopCount:(int)count forKey:(double)key {
    NSNumber *keyNumber = @(key);
    [[self gaplessLoopCountPool] setObject:@(count) forKey:keyNumber];
}

- (NSString *)gaplessTransitionTypeForKey:(double)key {
    NSNumber *keyNumber = @(key);
    NSString *type = [[self gaplessTransitionTypePool] objectForKey:keyNumber];
    return type ? type : @"instant";
}

- (void)setGaplessTransitionType:(NSString *)type forKey:(double)key {
    NSNumber *keyNumber = @(key);
    [[self gaplessTransitionTypePool] setObject:type forKey:keyNumber];
}

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player
                       successfully:(BOOL)flag {
    @synchronized(self) {
        NSNumber *key = [self keyForPlayer:player];
        if (key == nil)
            return;
        [self setOnPlay:NO forPlayerKey:self._key];
        RCTResponseSenderBlock callback = [self callbackForKey:key];
        if (callback) {
            callback(
                [NSArray arrayWithObjects:[NSNumber numberWithBool:flag], nil]);
            [[self callbackPool] removeObjectForKey:key];
        }
    }
}

#pragma mark - File and Directory Access

- (NSString *)getDirectory:(NSSearchPathDirectory)directory {
    return [NSSearchPathForDirectoriesInDomains(directory, NSUserDomainMask, YES) firstObject];
}

- (NSDictionary *)constantsToExport {
    return @{
        @"IsAndroid": @NO,
        @"MainBundlePath": [[NSBundle mainBundle] bundlePath],
        @"NSDocumentDirectory": [self getDirectory:NSDocumentDirectory],
        @"NSLibraryDirectory": [self getDirectory:NSLibraryDirectory],
        @"NSCachesDirectory": [self getDirectory:NSCachesDirectory]
    };
}

#pragma mark - Audio Session Configuration

RCT_EXPORT_METHOD(enable : (BOOL)enabled) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryAmbient error:nil];
    [session setActive:enabled error:nil];
}

RCT_EXPORT_METHOD(setActive:(BOOL)active) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setActive:active error:nil];
}

RCT_EXPORT_METHOD(setMode:(NSString *)modeName) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSString *mode = [self modeForName:modeName];
    if (mode) {
        [session setMode:mode error:nil];
    }
}

- (NSString *)modeForName:(NSString *)modeName {
    NSDictionary *modes = @{
        @"Default": AVAudioSessionModeDefault,
        @"VoiceChat": AVAudioSessionModeVoiceChat,
        @"VideoChat": AVAudioSessionModeVideoChat,
        @"GameChat": AVAudioSessionModeGameChat,
        @"VideoRecording": AVAudioSessionModeVideoRecording,
        @"Measurement": AVAudioSessionModeMeasurement,
        @"MoviePlayback": AVAudioSessionModeMoviePlayback,
        @"SpokenAudio": AVAudioSessionModeSpokenAudio
    };
    return modes[modeName];
}

RCT_EXPORT_METHOD(setCategory:(NSString *)categoryName mixWithOthers:(NSNumber *)mixWithOthers) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSString *category = [self categoryForName:categoryName];
    
    if (category) {
        if (mixWithOthers.boolValue) {
            [session setCategory:category
                     withOptions:AVAudioSessionCategoryOptionMixWithOthers | AVAudioSessionCategoryOptionAllowBluetooth
                           error:nil];
        } else {
            [session setCategory:category error:nil];
        }
    }
}

- (NSString *)categoryForName:(NSString *)categoryName {
    NSDictionary *categories = @{
        @"Ambient": AVAudioSessionCategoryAmbient,
        @"SoloAmbient": AVAudioSessionCategorySoloAmbient,
        @"Playback": AVAudioSessionCategoryPlayback,
        @"Record": AVAudioSessionCategoryRecord,
        @"PlayAndRecord": AVAudioSessionCategoryPlayAndRecord,
        @"MultiRoute": AVAudioSessionCategoryMultiRoute
    };
    return categories[categoryName];
}

RCT_EXPORT_METHOD(enableInSilenceMode:(BOOL)enabled) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayback error:nil];
    [session setActive:enabled error:nil];
}

#pragma mark - Audio Control Methods

RCT_EXPORT_METHOD(prepare:(NSString *)fileName key:(double)key options:(JS::NativeSoundIOS::SoundOptionTypes &)options callback:(RCTResponseSenderBlock)callback ) {
    NSError *error;
    NSURL *fileNameUrl;
    AVAudioPlayer *player;
    
    if ([fileName hasPrefix:@"http"]) {
        fileNameUrl = [NSURL URLWithString:fileName];
        NSData *data = [NSData dataWithContentsOfURL:fileNameUrl];
        player = [[AVAudioPlayer alloc] initWithData:data error:&error];
    } else if ([fileName hasPrefix:@"ipod-library://"]) {
        fileNameUrl = [NSURL URLWithString:fileName];
        player = [[AVAudioPlayer alloc] initWithContentsOfURL:fileNameUrl
                                                        error:&error];
    } else {
        fileNameUrl = [NSURL URLWithString:fileName];
        player = [[AVAudioPlayer alloc] initWithContentsOfURL:fileNameUrl error:&error];
    }
    
    if (player) {
        @synchronized(self) {
            player.delegate = self;
            player.enableRate = YES;
            [player prepareToPlay];
            NSNumber *myNumber = @(key);
            [[self playerPool] setObject:player forKey:myNumber];
            callback(@[
                [NSNull null],
                @{
                    @"duration": @(player.duration),
                    @"numberOfChannels": @(player.numberOfChannels)
                }
            ]);
        }
    } else {
        callback(@[RCTJSErrorFromNSError(error)]);
    }
}

RCT_EXPORT_METHOD(play:(double)key callback:(RCTResponseSenderBlock)callback) {
    [[AVAudioSession sharedInstance] setActive:YES error:nil];
    
    [[NSNotificationCenter defaultCenter]
     addObserver:self
        selector:@selector(audioSessionChangeObserver:)
            name:AVAudioSessionRouteChangeNotification
          object:[AVAudioSession sharedInstance]];
    
    [[NSNotificationCenter defaultCenter]
     addObserver:self
        selector:@selector(audioSessionChangeObserver:)
            name:AVAudioSessionInterruptionNotification
          object:[AVAudioSession sharedInstance]];
    
    self._key = key;
    
    // Check if gapless looping is enabled for this key
    if ([self isGaplessEnabledForKey:key]) {
        AVQueuePlayer *queuePlayer = [self gaplessQueuePlayerForKey:key];
        if (queuePlayer) {
            NSNumber *myNumber = @(key);
            [[self callbackPool] setObject:[callback copy] forKey:myNumber];
            [queuePlayer play];
            [self setOnPlay:YES forPlayerKey:key];
            return;
        }
    }
    
    // Fallback to regular AVAudioPlayer
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        NSNumber *myNumber = @(key);
        [[self callbackPool] setObject:[callback copy] forKey:myNumber];
        [player play];
        [self setOnPlay:YES forPlayerKey:key];
    }
}

RCT_EXPORT_METHOD(pause:(double)key callback:(RCTResponseSenderBlock)callback) {
    // Check if gapless looping is enabled for this key
    if ([self isGaplessEnabledForKey:key]) {
        AVQueuePlayer *queuePlayer = [self gaplessQueuePlayerForKey:key];
        if (queuePlayer) {
            [queuePlayer pause];
            [self setOnPlay:NO forPlayerKey:key];
            callback(@[]);
            return;
        }
    }
    
    // Fallback to regular AVAudioPlayer
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        [player pause];
        [self setOnPlay:NO forPlayerKey:key];
        callback(@[]);
    }
}

RCT_EXPORT_METHOD(stop:(double)key callback:(RCTResponseSenderBlock)callback) {
    // Check if gapless looping is enabled for this key
    if ([self isGaplessEnabledForKey:key]) {
        AVQueuePlayer *queuePlayer = [self gaplessQueuePlayerForKey:key];
        if (queuePlayer) {
            [queuePlayer pause];
            [queuePlayer seekToTime:kCMTimeZero];
            [self setOnPlay:NO forPlayerKey:key];
            callback(@[]);
            return;
        }
    }
    
    // Fallback to regular AVAudioPlayer
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        [player stop];
        player.currentTime = 0;
        [self setOnPlay:NO forPlayerKey:key];
        callback(@[]);
    }
}

RCT_EXPORT_METHOD(release:(double)key) {
    @synchronized(self) {
        NSNumber *myNumber = @(key);
        
        // Clean up gapless resources
        AVPlayerLooper *looper = [self gaplessPlayerLooperForKey:key];
        if (looper) {
            [looper disableLooping];
            [[self gaplessPlayerLooperPool] removeObjectForKey:myNumber];
        }
        
        AVQueuePlayer *queuePlayer = [self gaplessQueuePlayerForKey:key];
        if (queuePlayer) {
            [queuePlayer pause];
            [[self gaplessQueuePlayerPool] removeObjectForKey:myNumber];
        }
        
        // Clean up gapless settings
        [[self gaplessEnabledPool] removeObjectForKey:myNumber];
        [[self gaplessLoopCountPool] removeObjectForKey:myNumber];
        [[self gaplessTransitionTypePool] removeObjectForKey:myNumber];
        
        // Clean up regular player resources
        AVAudioPlayer *player = [self playerForKey:key];
        if (player) {
            [player stop];
            [[self callbackPool] removeObjectForKey:myNumber];
            [[self playerPool] removeObjectForKey:myNumber];
            [[NSNotificationCenter defaultCenter] removeObserver:self];
        }
    }
}

RCT_EXPORT_METHOD(setNumberOfLoops:(double)key loops:(double)loops) {
                 
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        NSNumber *myValue = @(loops);
        player.numberOfLoops = [myValue intValue];
    }
}

RCT_EXPORT_METHOD(setVolume:(double)key left:(double)left right:(double)right) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.volume = (float)left;
    }
}

RCT_EXPORT_METHOD(getSystemVolume:(RCTResponseSenderBlock)callback) {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    callback(@[@(session.outputVolume)]);
}

RCT_EXPORT_METHOD(getCurrentTime:(double)key callback:(RCTResponseSenderBlock)callback) {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        callback([NSArray
            arrayWithObjects:[NSNumber numberWithDouble:player.currentTime],
                             [NSNumber numberWithBool:player.isPlaying], nil]);
    } else {
        callback([NSArray arrayWithObjects:[NSNumber numberWithInteger:-1],
                                           [NSNumber numberWithBool:NO], nil]);
    }
}

#pragma mark - Playback Controls


- (void)setCurrentTime:(double)key currentTime:(double)currentTime {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.currentTime = currentTime;
    }
}

- (void)setPan:(double)key pan:(double)pan {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.pan = (float)pan;
    }
}

- (void)setSpeakerPhone:(double)key isSpeaker:(BOOL)isSpeaker {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    
    if (isSpeaker) {
        [session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:nil];
    } else {
        [session overrideOutputAudioPort:AVAudioSessionPortOverrideNone error:nil];
    }
    
    [session setActive:YES error:nil];
}

- (void)setSpeed:(double)key speed:(double)speed {
    AVAudioPlayer *player = [self playerForKey:key];
    if (player) {
        player.rate = (float)speed;
    }
}

#pragma mark - Enhanced Gapless Looping

RCT_EXPORT_METHOD(setGaplessLooping:(double)key enabled:(BOOL)enabled) {
    [self setGaplessEnabled:enabled forKey:key];
    
    if (enabled) {
        // Create gapless setup for this key
        AVAudioPlayer *originalPlayer = [self playerForKey:key];
        if (originalPlayer && originalPlayer.url) {
            NSError *error;
            AVPlayerItem *playerItem = [[AVPlayerItem alloc] initWithURL:originalPlayer.url];
            AVQueuePlayer *queuePlayer = [[AVQueuePlayer alloc] initWithPlayerItem:playerItem];
            
            NSNumber *keyNumber = @(key);
            [[self gaplessQueuePlayerPool] setObject:queuePlayer forKey:keyNumber];
            
            // Set default loop count if not already set
            if ([self gaplessLoopCountForKey:key] == 0) {
                [self setGaplessLoopCount:-1 forKey:key]; // Default to infinite
            }
        }
    } else {
        // Clean up gapless resources
        NSNumber *keyNumber = @(key);
        AVQueuePlayer *queuePlayer = [self gaplessQueuePlayerForKey:key];
        AVPlayerLooper *looper = [self gaplessPlayerLooperForKey:key];
        
        if (looper) {
            [looper disableLooping];
            [[self gaplessPlayerLooperPool] removeObjectForKey:keyNumber];
        }
        
        if (queuePlayer) {
            [queuePlayer pause];
            [[self gaplessQueuePlayerPool] removeObjectForKey:keyNumber];
        }
    }
}

RCT_EXPORT_METHOD(setGaplessLoopCount:(double)key count:(double)count) {
    [self setGaplessLoopCount:(int)count forKey:key];
    
    if ([self isGaplessEnabledForKey:key]) {
        AVQueuePlayer *queuePlayer = [self gaplessQueuePlayerForKey:key];
        if (queuePlayer && queuePlayer.currentItem) {
            NSNumber *keyNumber = @(key);
            
            // Remove existing looper if any
            AVPlayerLooper *existingLooper = [self gaplessPlayerLooperForKey:key];
            if (existingLooper) {
                [existingLooper disableLooping];
                [[self gaplessPlayerLooperPool] removeObjectForKey:keyNumber];
            }
            
            // Create new looper with specified count
            if (count != 0) {
                NSInteger loopCount = (count == -1) ? NSIntegerMax : (NSInteger)count;
                AVPlayerLooper *looper = [AVPlayerLooper playerLooperWithPlayer:queuePlayer 
                                                                   templateItem:queuePlayer.currentItem 
                                                                      timeRange:kCMTimeRangeInvalid];
                [[self gaplessPlayerLooperPool] setObject:looper forKey:keyNumber];
            }
        }
    }
}

RCT_EXPORT_METHOD(setGaplessTransitionType:(double)key type:(NSString *)type) {
    [self setGaplessTransitionType:type forKey:key];
    // Note: Currently only 'instant' is supported. 'crossfade' is for future enhancement.
}

RCT_EXPORT_METHOD(getGaplessInfo:(double)key callback:(RCTResponseSenderBlock)callback) {
    BOOL isGaplessSupported = YES; // iOS 10+ supports AVPlayerLooper
    BOOL isGaplessEnabled = [self isGaplessEnabledForKey:key];
    int loopCount = [self gaplessLoopCountForKey:key];
    NSString *transitionType = [self gaplessTransitionTypeForKey:key];
    
    // Estimate memory usage (simplified calculation)
    double memoryUsage = 0.0;
    AVAudioPlayer *player = [self playerForKey:key];
    if (player && player.duration > 0) {
        // Rough estimate: duration * channels * sample_rate * bytes_per_sample / MB
        memoryUsage = player.duration * [player numberOfChannels] * 44100 * 2 / (1024 * 1024);
    }
    
    callback(@[@{
        @"isGaplessSupported": @(isGaplessSupported),
        @"memoryUsage": @(memoryUsage)
    }]);
}

RCT_EXPORT_METHOD(preloadForGapless:(double)key callback:(RCTResponseSenderBlock)callback) {
    if (![self isGaplessEnabledForKey:key]) {
        callback(@[@NO, @"Gapless looping not enabled for this sound"]);
        return;
    }
    
    AVQueuePlayer *queuePlayer = [self gaplessQueuePlayerForKey:key];
    if (!queuePlayer) {
        callback(@[@NO, @"No gapless queue player found"]);
        return;
    }
    
    // Preload by ensuring the player item is ready
    AVPlayerItem *item = queuePlayer.currentItem;
    if (item) {
        if (item.status == AVPlayerItemStatusReadyToPlay) {
            callback(@[@YES]);
        } else {
            // Add observer for when item becomes ready
            [[NSNotificationCenter defaultCenter] addObserverForName:AVPlayerItemDidPlayToEndTimeNotification
                                                              object:item
                                                               queue:[NSOperationQueue mainQueue]
                                                          usingBlock:^(NSNotification *note) {
                callback(@[@YES]);
            }];
        }
    } else {
        callback(@[@NO, @"No player item available"]);
    }
}

#pragma mark - Event Handling

- (NSDictionary *)getDirectories {
    return [self constantsToExport];
}

- (void)setOnPlay:(BOOL)isPlaying forPlayerKey:(double)playerKey {
    [self sendEventWithName:@"onPlayChange"
                       body:@{
                           @"isPlaying": @(isPlaying),
                           @"playerKey": @(playerKey)
                       }];
}

#pragma mark - Turbo Module

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeSoundIOSSpecJSI>(params);
}
#endif

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end
