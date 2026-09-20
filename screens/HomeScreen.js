import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, type } from '../theme';

export default function HomeScreen({ onStart, permissionError, starting }) {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start listening"
        disabled={starting}
        onPress={onStart}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          starting && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonLabel} allowFontScaling>
          {starting ? 'Starting…' : 'Start Listening'}
        </Text>
      </Pressable>
      {permissionError ? (
        <Text style={styles.error} accessibilityLiveRegion="polite" allowFontScaling>
          {permissionError}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  button: {
    minHeight: 88,
    minWidth: 280,
    maxWidth: 420,
    width: '100%',
    backgroundColor: colors.signal,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  buttonPressed: {
    backgroundColor: colors.signalPressed,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLabel: {
    color: colors.onSignal,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    fontFamily: type.family,
    textAlign: 'center',
  },
  error: {
    marginTop: 32,
    color: colors.deny,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 360,
    fontFamily: type.family,
  },
});
