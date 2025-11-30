import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, globalStyles } from '../styles/global';
import { isValidYouTubeUrl, extractPlaylistId, extractVideoId } from '../utils/youtube';

const SAVED_PLAYLISTS_KEY = 'lostin_saved_playlists';

export default function HomeScreen({ navigation }) {
  const [inputUrl, setInputUrl] = useState('');
  const [savedPlaylists, setSavedPlaylists] = useState([]);

  useEffect(() => {
    loadSavedPlaylists();
  }, []);

  const loadSavedPlaylists = async () => {
    try {
      const data = await AsyncStorage.getItem(SAVED_PLAYLISTS_KEY);
      if (data) {
        setSavedPlaylists(JSON.parse(data));
      }
    } catch (e) {
      console.error('Failed to load saved playlists:', e);
    }
  };

  const handleOpen = () => {
    if (!isValidYouTubeUrl(inputUrl)) {
      return;
    }

    const playlistId = extractPlaylistId(inputUrl);
    const videoId = extractVideoId(inputUrl);

    navigation.navigate('Player', {
      url: inputUrl,
      playlistId,
      videoId,
    });
  };

  const handleOpenSaved = (item) => {
    navigation.navigate('Player', {
      url: item.url,
      playlistId: item.playlistId,
      videoId: item.videoId,
    });
  };

  const handleDeleteSaved = async (itemId) => {
    try {
      const data = await AsyncStorage.getItem(SAVED_PLAYLISTS_KEY);
      if (data) {
        const saved = JSON.parse(data);
        const filtered = saved.filter((item) => item.id !== itemId);
        await AsyncStorage.setItem(SAVED_PLAYLISTS_KEY, JSON.stringify(filtered));
        setSavedPlaylists(filtered);
      }
    } catch (e) {
      console.error('Failed to delete saved playlist:', e);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={globalStyles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={globalStyles.title}>LostIn</Text>
          <Text style={globalStyles.subtitle}>Distraction-free YouTube learning</Text>
        </View>

        <View style={globalStyles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>YouTube URL</Text>
            <TextInput
              value={inputUrl}
              onChangeText={setInputUrl}
              placeholder="Paste video or playlist link"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              onSubmitEditing={handleOpen}
              style={globalStyles.input}
              accessible={true}
              accessibilityLabel="YouTube URL input"
            />
          </View>
          <Pressable
            onPress={handleOpen}
            style={({ pressed }) => [
              globalStyles.button,
              pressed && globalStyles.buttonPressed,
              !isValidYouTubeUrl(inputUrl) && styles.buttonDisabled,
            ]}
            disabled={!isValidYouTubeUrl(inputUrl)}
            accessible={true}
            accessibilityLabel="Open video or playlist"
            accessibilityRole="button"
          >
            <Text style={globalStyles.buttonText}>
              {isValidYouTubeUrl(inputUrl) ? '▶ Open' : 'Enter URL'}
            </Text>
          </Pressable>
        </View>

        {savedPlaylists.length > 0 && (
          <View style={styles.savedSection}>
            <View style={styles.savedHeader}>
              <Text style={styles.savedTitle}>Saved Playlists</Text>
              <Text style={styles.savedCount}>{savedPlaylists.length}</Text>
            </View>
            {savedPlaylists.map((item) => (
              <View key={item.id} style={styles.savedItemContainer}>
                <Pressable
                  onPress={() => handleOpenSaved(item)}
                  style={({ pressed }) => [
                    styles.savedItem,
                    pressed && styles.savedItemPressed,
                  ]}
                  accessible={true}
                  accessibilityLabel={`Open saved playlist ${item.title || item.id}`}
                  accessibilityRole="button"
                >
                  <View style={styles.savedItemContent}>
                    <Text style={styles.savedItemIcon}>
                      {item.playlistId ? '📚' : '▶️'}
                    </Text>
                    <View style={styles.savedItemTextContainer}>
                      <Text style={styles.savedItemText} numberOfLines={1}>
                        {item.title || item.url}
                      </Text>
                      <Text style={styles.savedItemSubtext}>
                        {item.playlistId ? 'Playlist' : 'Video'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => handleDeleteSaved(item.id)}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.deleteButtonPressed,
                  ]}
                  accessible={true}
                  accessibilityLabel="Delete saved playlist"
                  accessibilityRole="button"
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={globalStyles.textMuted}>
            Paste any YouTube URL. We'll open it distraction-free.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  savedSection: {
    width: '100%',
    gap: 12,
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  savedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  savedCount: {
    fontSize: 14,
    color: colors.textMuted,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savedItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  savedItemPressed: {
    opacity: 0.7,
    backgroundColor: colors.surfaceLight,
  },
  savedItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savedItemIcon: {
    fontSize: 24,
  },
  savedItemTextContainer: {
    flex: 1,
  },
  savedItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  savedItemSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6a2a2a',
  },
  deleteButtonPressed: {
    opacity: 0.7,
    backgroundColor: '#5a2a2a',
  },
  deleteButtonText: {
    color: '#ff6b6b',
    fontSize: 20,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
});

