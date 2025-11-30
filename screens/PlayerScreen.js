import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Platform,
  SafeAreaView,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, globalStyles } from '../styles/global';
import { buildEmbedUrl } from '../utils/youtube';
import NotesPanel from '../components/NotesPanel';
import Pomodoro from '../components/Pomodoro';

const SAVED_PLAYLISTS_KEY = 'lostin_saved_playlists';

export default function PlayerScreen({ route, navigation }) {
  const { url, playlistId, videoId } = route.params;
  const [embedUrl, setEmbedUrl] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const built = buildEmbedUrl(url);
    setEmbedUrl(built);
    checkIfSaved();
  }, [url]);

  useEffect(() => {
    if (showControls) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showControls]);

  const checkIfSaved = async () => {
    try {
      const data = await AsyncStorage.getItem(SAVED_PLAYLISTS_KEY);
      if (data) {
        const saved = JSON.parse(data);
        const found = saved.find(
          (item) =>
            (playlistId && item.playlistId === playlistId) ||
            (videoId && item.videoId === videoId)
        );
        setIsSaved(found !== undefined);
      }
    } catch (e) {
      console.error('Failed to check saved status:', e);
    }
  };

  const handleSave = async () => {
    try {
      const data = await AsyncStorage.getItem(SAVED_PLAYLISTS_KEY);
      const saved = data ? JSON.parse(data) : [];

      if (isSaved) {
        const filtered = saved.filter(
          (item) =>
            !(
              (playlistId && item.playlistId === playlistId) ||
              (videoId && item.videoId === videoId)
            )
        );
        await AsyncStorage.setItem(SAVED_PLAYLISTS_KEY, JSON.stringify(filtered));
        setIsSaved(false);
      } else {
        const newItem = {
          id: playlistId || videoId,
          url,
          playlistId,
          videoId,
          title: playlistId ? `Playlist ${playlistId.slice(0, 8)}` : `Video ${videoId}`,
        };
        saved.push(newItem);
        await AsyncStorage.setItem(SAVED_PLAYLISTS_KEY, JSON.stringify(saved));
        setIsSaved(true);
      }
    } catch (e) {
      console.error('Failed to save/remove playlist:', e);
    }
  };

  if (!embedUrl) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid YouTube URL</Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              globalStyles.button,
              { marginTop: 20 },
              pressed && globalStyles.buttonPressed,
            ]}
          >
            <Text style={globalStyles.buttonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webviewContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={embedUrl}
            allow="fullscreen; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            style={styles.webIframe}
            title="LostIn Player"
          />
        ) : (
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
          />
        )}
      </View>

      <Animated.View
        style={[styles.headerOverlay, { opacity: fadeAnim }]}
        pointerEvents={showControls ? 'auto' : 'none'}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[styles.toolbar, { opacity: fadeAnim }]}
        pointerEvents={showControls ? 'auto' : 'none'}
      >
        <Pressable
          onPress={() => setShowNotes(!showNotes)}
          style={({ pressed }) => [
            styles.toolbarButton,
            showNotes && styles.toolbarButtonActive,
            pressed && styles.buttonPressed,
          ]}
          accessible={true}
          accessibilityLabel="Toggle notes panel"
          accessibilityRole="button"
        >
          <Text style={styles.toolbarIcon}>📝</Text>
          <Text style={[styles.toolbarButtonText, showNotes && styles.toolbarButtonTextActive]}>
            Notes
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.toolbarButton,
            isSaved && styles.toolbarButtonSaved,
            pressed && styles.buttonPressed,
          ]}
          accessible={true}
          accessibilityLabel={isSaved ? 'Remove from saved' : 'Save playlist'}
          accessibilityRole="button"
        >
          <Text style={styles.toolbarIcon}>{isSaved ? '✓' : '☆'}</Text>
          <Text style={[styles.toolbarButtonText, isSaved && styles.toolbarButtonTextSaved]}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setShowTimer(!showTimer)}
          style={({ pressed }) => [
            styles.toolbarButton,
            showTimer && styles.toolbarButtonActive,
            pressed && styles.buttonPressed,
          ]}
          accessible={true}
          accessibilityLabel="Toggle Pomodoro timer"
          accessibilityRole="button"
        >
          <Text style={styles.toolbarIcon}>⏱</Text>
          <Text style={[styles.toolbarButtonText, showTimer && styles.toolbarButtonTextActive]}>
            Timer
          </Text>
        </Pressable>
      </Animated.View>

      <Pressable
        style={styles.hideControlsButton}
        onPress={() => setShowControls(!showControls)}
        accessible={true}
        accessibilityLabel={showControls ? 'Hide controls' : 'Show controls'}
        accessibilityRole="button"
      >
        <Text style={styles.hideControlsText}>
          {showControls ? '⌄' : '⌃'}
        </Text>
      </Pressable>

      <Modal
        visible={showNotes}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotes(false)}
      >
        <SafeAreaView style={globalStyles.container}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notes</Text>
            <Pressable
              onPress={() => setShowNotes(false)}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            <NotesPanel videoId={videoId} playlistId={playlistId} />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showTimer}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTimer(false)}
      >
        <SafeAreaView style={globalStyles.container}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pomodoro Timer</Text>
            <Pressable
              onPress={() => setShowTimer(false)}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            <Pomodoro />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  webIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(11, 15, 20, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 27, 34, 0.95)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  toolbarButton: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolbarButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  toolbarButtonSaved: {
    backgroundColor: '#2d5016',
    borderColor: '#3d6a1f',
  },
  toolbarIcon: {
    fontSize: 20,
  },
  toolbarButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  toolbarButtonTextActive: {
    color: 'white',
  },
  toolbarButtonTextSaved: {
    color: '#a8ff78',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  hideControlsButton: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: 'rgba(20, 27, 34, 0.8)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  hideControlsText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
});

