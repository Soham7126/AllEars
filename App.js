import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import CaptionScreen from './screens/CaptionScreen';
import { requestMicPermission } from './hooks/useLiveCaptioning';
import { colors } from './theme';

const DENY_MESSAGE =
  'Microphone access is off. Turn it on in system settings, then tap Start Listening again.';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [permissionError, setPermissionError] = useState(null);
  const [starting, setStarting] = useState(false);

  const handleStart = useCallback(async () => {
    setStarting(true);
    try {
      const granted = await requestMicPermission();
      if (!granted) {
        setPermissionError(DENY_MESSAGE);
        return;
      }
      setPermissionError(null);
      setScreen('caption');
    } catch {
      setPermissionError(DENY_MESSAGE);
    } finally {
      setStarting(false);
    }
  }, []);

  const handleStop = useCallback(() => {
    setScreen('home');
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        {screen === 'caption' ? (
          <CaptionScreen onStop={handleStop} />
        ) : (
          <HomeScreen onStart={handleStart} permissionError={permissionError} starting={starting} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.ink,
  },
});
