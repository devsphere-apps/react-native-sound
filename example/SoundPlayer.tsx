import * as React from 'react';

import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  type ImageStyle,
  StatusBar,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Slider from '@react-native-community/slider';
import Sound from 'react-native-sound';

const getImageStyle = (size: number, tinColor: string = '#000') => {
  return {
    width: size,
    height: size,
    tinColor,
  } as ImageStyle;
};
Sound.setCategory('Playback');
const secondsToMMSS = (seconds: number) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

export default () => {
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const sound = React.useRef<Sound>();
  const timerRef = React.useRef<NodeJS.Timeout>();
  const [isLoading, setIsLoading] = React.useState(true);

  // Enhanced Gapless Looping State
  const [isGaplessEnabled, setIsGaplessEnabled] = React.useState(false);
  const [gaplessLoopCount, setGaplessLoopCount] = React.useState(-1);
  const [gaplessInfo, setGaplessInfo] = React.useState<any>(null);
  const [isPreloading, setIsPreloading] = React.useState(false);

  React.useEffect(() => {
    sound.current = new Sound(
      'https://cdn.pixabay.com/download/audio/2024/10/27/audio_694158870e.mp3?filename=abnormal-for-you-255737.mp3',
      Sound.MAIN_BUNDLE,
      (error, props) => {
        setIsLoading(false);
        if (error) {
          Alert.alert('Error', 'failed to load the sound' + error);
          return;
        }
        if (props.duration) {
          setDuration(props.duration);
        }
        
        // Load initial gapless info
        if (sound.current) {
          sound.current.getGaplessInfo((info) => {
            setGaplessInfo(info);
          });
        }
      },
    );
  }, []);

  const stopListening = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startListening = () => {
    stopListening();
    timerRef.current = setInterval(() => {
      if (sound.current) {
        sound.current.getCurrentTime(setCurrentTime);
      }
    }, 1000);
  };

  const onPressPlayPause = () => {
    if (sound.current) {
      if (isPlaying) {
        sound.current.pause();
        setIsPlaying(false);
        stopListening();
      } else {
        sound.current.play();
        setIsPlaying(true);
        startListening();
      }
    }
  };

  const onPressBackward = () => {
    if (sound.current) {
      sound.current.getCurrentTime(sec => {
        sound.current?.setCurrentTime(sec - 10);
      });
    }
  };

  const onPressFastFoward = () => {
    if (sound.current) {
      sound.current.getCurrentTime(sec => {
        sound.current?.setCurrentTime(sec + 10);
      });
    }
  };

  // Enhanced Gapless Looping Handlers

  const onToggleGapless = () => {
    if (sound.current) {
      const newEnabled = !isGaplessEnabled;
      sound.current.setGaplessLooping(newEnabled);
      setIsGaplessEnabled(newEnabled);
      
      if (newEnabled) {
        sound.current.setGaplessLoopCount(gaplessLoopCount);
        
        // Update gapless info
        sound.current.getGaplessInfo((info) => {
          setGaplessInfo(info);
        });
      }
    }
  };

  const onChangeLoopCount = (count: number) => {
    setGaplessLoopCount(count);
    if (sound.current && isGaplessEnabled) {
      sound.current.setGaplessLoopCount(count);
    }
  };

  const onPreloadGapless = async () => {
    if (sound.current && isGaplessEnabled) {
      setIsPreloading(true);
      try {
        await sound.current.preloadForGapless();
        Alert.alert('Success', 'Gapless preloading completed!');
        
        // Update info after preloading
        sound.current.getGaplessInfo((info) => {
          setGaplessInfo(info);
        });
      } catch (error) {
        Alert.alert('Error', `Gapless preloading failed: ${error}`);
      } finally {
        setIsPreloading(false);
      }
    }
  };

  const onTestLegacyGapless = () => {
    if (sound.current) {
      // Test backward compatibility: setNumberOfLoops(-1) should enable gapless
      sound.current.setNumberOfLoops(-1);
      Alert.alert('Info', 'Legacy infinite loop enabled - should automatically use gapless!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
      <Text style={styles.now_playing_text}> Now Playing </Text>

      <View>
        <Image
          source={require('./assets/logo.jpg')}
          style={[styles.image_view, getImageStyle(250)]}
        />
        {isLoading && (
          <ActivityIndicator
            style={StyleSheet.absoluteFill}
            size={'large'}
            color={'#e75480'}
          />
        )}
      </View>
      <View style={styles.name_of_song_View}>
        <Text style={styles.name_of_song_Text1}>#02 - Practice</Text>
        <Text style={styles.name_of_song_Text2}>
          Digital Marketing - By Setup Cast
        </Text>
      </View>

      <View style={styles.slider_view}>
        <Text style={styles.slider_time}> {secondsToMMSS(currentTime)} </Text>
        <Slider
          style={styles.slider_style}
          minimumValue={0}
          onSlidingComplete={value => {
            sound.current?.setCurrentTime(value);
          }}
          maximumValue={duration}
          minimumTrackTintColor="#e75480"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#e75480"
          value={currentTime}
        />
        <Text style={styles.slider_time}>{secondsToMMSS(duration)}</Text>
      </View>

      <View style={styles.functions_view}>
        <TouchableOpacity onPress={onPressBackward}>
          <Image
            source={require('./assets/left_foward.png')}
            style={getImageStyle(24, '#e75480')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressPlayPause}>
          <Image
            source={
              isPlaying
                ? require('./assets/pause.png')
                : require('./assets/play.png')
            }
            style={getImageStyle(50, '#e75480')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressFastFoward}>
          <Image
            source={require('./assets/right_foward.png')}
            style={getImageStyle(24, '#e75480')}
          />
        </TouchableOpacity>
      </View>

      {/* Enhanced Gapless Looping Controls */}
      <View style={styles.gapless_section}>
        <Text style={styles.section_title}>🎵 Gapless Looping Controls</Text>
        
        <View style={styles.gapless_controls}>
          <TouchableOpacity 
            style={[styles.gapless_button, isGaplessEnabled && styles.gapless_button_active]}
            onPress={onToggleGapless}
          >
            <Text style={[styles.gapless_button_text, isGaplessEnabled && styles.gapless_button_text_active]}>
              {isGaplessEnabled ? 'Gapless ON' : 'Gapless OFF'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.loop_controls}>
            <Text style={styles.control_label}>Loop Count:</Text>
            <View style={styles.loop_buttons}>
              <TouchableOpacity 
                style={[styles.small_button, gaplessLoopCount === 0 && styles.small_button_active]}
                onPress={() => onChangeLoopCount(0)}
              >
                <Text style={styles.small_button_text}>Once</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.small_button, gaplessLoopCount === 3 && styles.small_button_active]}
                onPress={() => onChangeLoopCount(3)}
              >
                <Text style={styles.small_button_text}>3x</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.small_button, gaplessLoopCount === -1 && styles.small_button_active]}
                onPress={() => onChangeLoopCount(-1)}
              >
                <Text style={styles.small_button_text}>∞</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.advanced_controls}>
          <TouchableOpacity 
            style={[styles.action_button, !isGaplessEnabled && styles.action_button_disabled]}
            onPress={onPreloadGapless}
            disabled={!isGaplessEnabled || isPreloading}
          >
            <Text style={styles.action_button_text}>
              {isPreloading ? 'Preloading...' : 'Preload Gapless'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.action_button}
            onPress={onTestLegacyGapless}
          >
            <Text style={styles.action_button_text}>Test Legacy API</Text>
          </TouchableOpacity>
        </View>

        {gaplessInfo && (
          <View style={styles.info_section}>
            <Text style={styles.info_title}>Gapless Info:</Text>
            <Text style={styles.info_text}>
              Supported: {gaplessInfo.isGaplessSupported ? '✅' : '❌'}
            </Text>
            <Text style={styles.info_text}>
              Enabled: {gaplessInfo.isGaplessEnabled ? '✅' : '❌'}
            </Text>
            <Text style={styles.info_text}>
              Loop Count: {gaplessInfo.currentLoopCount === -1 ? 'Infinite' : gaplessInfo.currentLoopCount}
            </Text>
            <Text style={styles.info_text}>
              Loops Completed: {gaplessInfo.totalLoopsCompleted}
            </Text>
            {gaplessInfo.memoryUsage && (
              <Text style={styles.info_text}>
                Memory: {gaplessInfo.memoryUsage.toFixed(2)} MB
              </Text>
            )}
          </View>
        )}
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-evenly',
  },

  now_playing_text: {
    fontSize: 19,
    alignSelf: 'center',
    marginVertical: 15,
  },

  image_view: {
    alignSelf: 'center',
    borderRadius: 10,
  },
  name_of_song_View: {
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    rowGap: 20,
  },
  name_of_song_Text1: {
    fontSize: 19,
    fontWeight: '500',
  },
  name_of_song_Text2: {
    color: '#808080',
  },
  slider_view: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginVertical: 20,
  },
  slider_style: {
    flex: 1,
  },
  slider_time: {
    fontSize: 15,
    color: '#808080',
  },
  functions_view: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  gapless_section: {
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingVertical: 15,
  },
  section_title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  gapless_controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  gapless_button: {
    backgroundColor: '#e75480',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gapless_button_active: {
    backgroundColor: '#d32f50',
  },
  gapless_button_text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gapless_button_text_active: {
    color: 'white',
  },
  loop_controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  control_label: {
    fontSize: 16,
    color: '#555',
    marginRight: 10,
  },
  loop_buttons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  small_button: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  small_button_active: {
    backgroundColor: '#e75480',
  },
  small_button_text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  advanced_controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  action_button: {
    backgroundColor: '#e75480',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action_button_disabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  action_button_text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info_section: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  info_title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info_text: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
});
