import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { useLiveCaptioning } from '../hooks/useLiveCaptioning';
import { colors, type } from '../theme';

function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function CaptionScreen({ onStop }) {
  useKeepAwake();
  const [lines, setLines] = useState([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAt = useRef(Date.now());
  const scrollRef = useRef(null);

  useLiveCaptioning({
    active: true,
    onTranscript: (text) => {
      setLines((prev) => [...prev, text]);
    },
  });

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startedAt.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!lines.length) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [lines]);

  const lastIndex = lines.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.topBar}>
        <Text style={styles.timer} accessibilityLabel={`Session time ${formatElapsed(elapsedMs)}`} allowFontScaling>
          {formatElapsed(elapsedMs)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Stop listening"
          hitSlop={12}
          onPress={onStop}
          style={({ pressed }) => [styles.stop, pressed && styles.stopPressed]}
        >
          <Text style={styles.stopLabel} allowFontScaling>
            Stop
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {lines.length === 0 ? (
          <Text style={styles.waiting} allowFontScaling>
            Listening…
          </Text>
        ) : (
          lines.map((line, index) => (
            <Text
              key={index}
              accessibilityLiveRegion={index === lastIndex ? 'polite' : 'none'}
              style={index === lastIndex ? styles.latest : styles.earlier}
              allowFontScaling
            >
              {line}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  timer: {
    color: colors.paper,
    fontSize: 22,
    fontVariant: ['tabular-nums'],
    fontFamily: type.family,
    fontWeight: '600',
  },
  stop: {
    minHeight: 48,
    minWidth: 88,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: colors.stopBorder,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopPressed: {
    backgroundColor: 'rgba(242, 242, 242, 0.16)',
  },
  stopLabel: {
    color: colors.stop,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: type.family,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  waiting: {
    color: colors.paperMuted,
    fontSize: 28,
    lineHeight: 36,
    fontFamily: type.family,
  },
  earlier: {
    color: colors.paperMuted,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: type.family,
  },
  latest: {
    color: colors.paper,
    fontSize: 34,
    lineHeight: 44,
    fontWeight: '700',
    fontFamily: type.family,
  },
});
