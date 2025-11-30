import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, globalStyles } from '../styles/global';

const DEFAULT_WORK = 25 * 60;
const DEFAULT_BREAK = 5 * 60;

export default function Pomodoro() {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_WORK);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsBreak((b) => !b);
          return isBreak ? DEFAULT_WORK : DEFAULT_BREAK;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isBreak]);

  const toggle = () => setIsRunning((v) => !v);

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(DEFAULT_WORK);
  };

  const setDuration = (minutes) => {
    setIsRunning(false);
    setSecondsLeft(minutes * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{isBreak ? 'Break' : 'Focus'}</Text>
        <Text style={styles.timer}>{display}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggle} style={[styles.controlButton, styles.primaryButton]}>
          <Text style={styles.controlButtonText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={reset} style={styles.controlButton}>
          <Text style={styles.controlButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickDurations}>
        <TouchableOpacity onPress={() => setDuration(25)} style={styles.durationButton}>
          <Text style={styles.durationText}>25m</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDuration(15)} style={styles.durationButton}>
          <Text style={styles.durationText}>15m</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDuration(5)} style={styles.durationButton}>
          <Text style={styles.durationText}>5m</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.accent,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickDurations: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  durationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
  },
  durationText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

