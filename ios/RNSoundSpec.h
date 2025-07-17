#pragma once

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <ReactCommon/RCTTurboModule.h>

namespace JS {
  namespace NativeSoundIOS {
    struct SpecSoundOptions {
      bool enableRate;
      double rate;
      bool enablePitch;
      double pitch;
      bool enableVolume;
      double volume;
      bool enablePan;
      double pan;
      int numberOfLoops;
    };
  }
}

namespace facebook {
namespace react {

class JSI_EXPORT NativeSoundIOSSpec : public TurboModule {
 protected:
  NativeSoundIOSSpec(const ObjCTurboModule::InitParams &params);
};

} // namespace react
} // namespace facebook

#endif // RCT_NEW_ARCH_ENABLED 