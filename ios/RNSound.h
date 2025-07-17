#import <AVFoundation/AVFoundation.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNSoundSpec.h"

@interface RNSound : RCTEventEmitter <NativeSoundIOSSpec, AVAudioPlayerDelegate>
#else
#import <React/RCTBridgeModule.h>

@interface RNSound : RCTEventEmitter <RCTBridgeModule, AVAudioPlayerDelegate>
#endif

@property (nonatomic, assign) double _key;

- (void)setOnPlay:(BOOL)isPlaying forPlayerKey:(double)playerKey;

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params;
#endif

@end 