import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';


export default function App() {
  const [inputUrl, setInputUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); 

  const buildEmbedUrl = useCallback((rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return '';

    const url = rawUrl.trim();

    const looksLikeId = /^[a-zA-Z0-9_-]{10,}$/.test(url);
    if (looksLikeId && !url.includes('http')) {
      return `https://www.youtube.com/embed/${url}?modestbranding=1&rel=0&playsinline=1`;
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch (e) {
      return '';
    }


    const list = parsed.searchParams.get('list');
    if (list) {
      return `https://www.youtube.com/embed/videoseries?list=${list}&modestbranding=1&rel=0&playsinline=1`;
    }

    const shortsMatch = parsed.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{6,})/);
    if (shortsMatch && shortsMatch[1]) {
      const vid = shortsMatch[1];
      return `https://www.youtube.com/embed/${vid}?modestbranding=1&rel=0&playsinline=1`;
    }

    // youtu.be short links
    if (parsed.hostname.includes('youtu.be')) {
      const vid = parsed.pathname.replace('/', '');
      if (vid) {
        return `https://www.youtube.com/embed/${vid}?modestbranding=1&rel=0&playsinline=1`;
      }
    }


    const v = parsed.searchParams.get('v');
    if (v) {
      return `https://www.youtube.com/embed/${v}?modestbranding=1&rel=0&playsinline=1`;
    }

    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const last = pathParts[pathParts.length - 1];
    if (last && /^[a-zA-Z0-9_-]{6,}$/.test(last)) {
      return `https://www.youtube.com/embed/${last}?modestbranding=1&rel=0&playsinline=1`;
    }

    return '';
  }, []);

  const onLoadPress = useCallback(() => {
    const built = buildEmbedUrl(inputUrl);
    setEmbedUrl(built);
  }, [buildEmbedUrl, inputUrl]);

  const isPlayerVisible = useMemo(() => Boolean(embedUrl), [embedUrl]);

  const EmbedPlayer = useCallback(({ uri }) => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webIframeWrap}>
          <iframe
            title="LostIn Player"
            src={uri}
            allow="fullscreen; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            style={styles.webIframe}
          />
        </View>
      );
    }
    const { WebView } = require('react-native-webview');
    return (
      <WebView
        source={{ uri }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction
        javaScriptEnabled
        domStorageEnabled
      />
    );
  }, []);

  React.useEffect(() => {
    if (!isTimerRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isTimerRunning]);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning((v) => !v);
  }, []);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setSecondsLeft(25 * 60);
  }, []);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {isPlayerVisible ? (
        <View style={styles.playerContainer}>
          <EmbedPlayer uri={embedUrl} />
          <View style={styles.overlayBar}>
            <View style={styles.timerPill}>
              <Text style={styles.timerText}>{minutes}:{seconds}</Text>
              <Pressable onPress={toggleTimer} style={({ pressed }) => [styles.timerBtn, pressed && styles.buttonPressed] }>
                <Text style={styles.timerBtnText}>{isTimerRunning ? 'Pause' : 'Start'}</Text>
              </Pressable>
              <Pressable onPress={resetTimer} style={({ pressed }) => [styles.timerBtn, pressed && styles.buttonPressed] }>
                <Text style={styles.timerBtnText}>Reset</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={styles.headerWrap}>
            <Text style={styles.title}>LostIn</Text>
            <Text style={styles.subtitle}>Watch YouTube without distractions</Text>
          </View>

          <View style={styles.card}>
            <TextInput
              value={inputUrl}
              onChangeText={setInputUrl}
              placeholder="Paste YouTube video or playlist link"
              placeholderTextColor="#7a7a7a"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              onSubmitEditing={onLoadPress}
              style={styles.input}
            />
            <Pressable onPress={onLoadPress} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed] }>
              <Text style={styles.buttonText}>Load</Text>
            </Pressable>
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerText}>Paste any YouTube URL. We’ll open it distraction‑free.</Text>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b0f14',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  headerWrap: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#e6edf3',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#9fb0c0',
  },
  card: {
    width: '100%',
    backgroundColor: '#141b22',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 6,
  },
  input: {
    backgroundColor: '#0f1318',
    color: '#e6edf3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#263240',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2b6ef2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footerNote: {
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#6c8298',
    fontSize: 13,
  },
  playerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  webview: {
    flex: 1,
  },
  webIframeWrap: {
    flex: 1,
  },
  webIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  },
  overlayBar: {
    position: 'absolute',
    top: 10,
    right: 10,
    left: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(20,27,34,0.9)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#304256',
  },
  timerText: {
    color: '#e6edf3',
    fontVariant: ['tabular-nums'],
    marginRight: 2,
  },
  timerBtn: {
    backgroundColor: '#2b6ef2',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  timerBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
