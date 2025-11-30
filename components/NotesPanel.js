import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/global';

const STORAGE_KEY_PREFIX = 'lostin_notes_';

export default function NotesPanel({ videoId, playlistId }) {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  const storageKey = playlistId 
    ? `${STORAGE_KEY_PREFIX}playlist_${playlistId}`
    : `${STORAGE_KEY_PREFIX}video_${videoId}`;

  useEffect(() => {
    loadNotes();
  }, [storageKey]);

  const loadNotes = async () => {
    try {
      const saved = await AsyncStorage.getItem(storageKey);
      if (saved !== null) {
        setNotes(saved);
      }
    } catch (e) {
      console.error('Failed to load notes:', e);
    }
  };

  const saveNotes = async (text) => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem(storageKey, text);
    } catch (e) {
      console.error('Failed to save notes:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (text) => {
    setNotes(text);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveNotes(text);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        {isSaving && <Text style={styles.saving}>Saving...</Text>}
      </View>
      <ScrollView style={styles.scrollView}>
        <TextInput
          style={styles.input}
          value={notes}
          onChangeText={handleChange}
          placeholder="Add your notes here..."
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  saving: {
    fontSize: 12,
    color: colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
  },
});

