// GigEasy Worker Availability Bar & Quick Preferences Controller
// Minimal text bloat. Single scan: Status dot + mode chip + radius + trade pills.
// Tap opens lightweight bottom sheet to adjust radius, hours, or trades in seconds.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../theme';
import { FontFamily } from '../constants';
import { WorkerAvailabilityModel, WorkerAvailabilityMode } from '../types';

interface WorkerAvailabilityBarProps {
  availability: WorkerAvailabilityModel;
  onUpdateMode: (mode: WorkerAvailabilityMode) => void;
  onUpdateRadius: (radiusKm: number) => void;
  onToggleTrade: (trade: string) => void;
}

const ALL_TRADES = ['Electrical', 'Warehouse', 'Plumbing', 'Construction', 'Delivery', 'Cleaning'];
const RADIUS_OPTIONS = [5, 8, 12, 15, 25];

export const WorkerAvailabilityBar: React.FC<WorkerAvailabilityBarProps> = ({
  availability,
  onUpdateMode,
  onUpdateRadius,
  onToggleTrade,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAvailableNow = availability.mode === 'NOW';
  const isScheduled = availability.mode === 'SCHEDULED';
  const isOff = availability.mode === 'OFF';

  const dotColor = isAvailableNow
    ? Theme.forestGreen
    : isScheduled
    ? Theme.accent
    : Theme.textDisabled;

  const statusLabel = isAvailableNow
    ? 'AVAILABLE NOW'
    : isScheduled
    ? 'AVAILABLE: TODAY 9 AM–6 PM'
    : 'OFFLINE';

  return (
    <View style={styles.barContainer}>
      <TouchableOpacity
        style={styles.mainBar}
        onPress={() => setIsModalOpen(true)}
        activeOpacity={0.85}
      >
        <View style={styles.leftInfo}>
          <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
          <Text style={styles.statusText}>{statusLabel}</Text>
          <Text style={styles.metaDivider}>·</Text>
          <Text style={styles.radiusText}>{availability.preferredRadiusKm} km</Text>
        </View>

        <View style={styles.rightActions}>
          <View style={styles.tradesRow}>
            {availability.preferredTrades.slice(0, 2).map((trade) => (
              <View key={trade} style={styles.tradeChip}>
                <Text style={styles.tradeChipText}>{trade}</Text>
              </View>
            ))}
            {availability.preferredTrades.length > 2 && (
              <View style={styles.tradeChipMore}>
                <Text style={styles.tradeChipMoreText}>+{availability.preferredTrades.length - 2}</Text>
              </View>
            )}
          </View>
          <Feather name="chevron-down" size={14} color={Theme.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* Quick Availability Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setIsModalOpen(false)}
          />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Availability & Travel Range</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Feather name="x" size={18} color={Theme.ink} />
              </TouchableOpacity>
            </View>

            {/* Mode Selection Chips */}
            <Text style={styles.sectionLabel}>Status</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeBtn, isAvailableNow && styles.modeBtnActiveGreen]}
                onPress={() => onUpdateMode('NOW')}
              >
                <View style={[styles.dot, { backgroundColor: Theme.forestGreen }]} />
                <Text style={[styles.modeBtnText, isAvailableNow && styles.modeBtnTextActive]}>
                  Available Now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeBtn, isScheduled && styles.modeBtnActiveOrange]}
                onPress={() => onUpdateMode('SCHEDULED')}
              >
                <View style={[styles.dot, { backgroundColor: Theme.accent }]} />
                <Text style={[styles.modeBtnText, isScheduled && styles.modeBtnTextActive]}>
                  Today 9 AM–6 PM
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeBtn, isOff && styles.modeBtnActiveGray]}
                onPress={() => onUpdateMode('OFF')}
              >
                <View style={[styles.dot, { backgroundColor: Theme.textMuted }]} />
                <Text style={[styles.modeBtnText, isOff && styles.modeBtnTextActive]}>
                  Off
                </Text>
              </TouchableOpacity>
            </View>

            {/* Preferred Radius Selection */}
            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Preferred Radius</Text>
            <View style={styles.radiusRow}>
              {RADIUS_OPTIONS.map((r) => {
                const isSelected = availability.preferredRadiusKm === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.radiusBtn, isSelected && styles.radiusBtnSelected]}
                    onPress={() => onUpdateRadius(r)}
                  >
                    <Text style={[styles.radiusBtnText, isSelected && styles.radiusBtnTextSelected]}>
                      {r} km
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Preferred Trades */}
            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Active Trades</Text>
            <View style={styles.tradesGrid}>
              {ALL_TRADES.map((trade) => {
                const isSelected = availability.preferredTrades.includes(trade);
                return (
                  <TouchableOpacity
                    key={trade}
                    style={[styles.tradePill, isSelected && styles.tradePillSelected]}
                    onPress={() => onToggleTrade(trade)}
                  >
                    {isSelected && <Feather name="check" size={11} color={Theme.surface} />}
                    <Text style={[styles.tradePillText, isSelected && styles.tradePillTextSelected]}>
                      {trade}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Done Button */}
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setIsModalOpen(false)}
            >
              <Text style={styles.doneBtnText}>Confirm Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  mainBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Theme.ink,
    letterSpacing: 0.3,
  },
  metaDivider: {
    color: Theme.textMuted,
  },
  radiusText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tradesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tradeChip: {
    backgroundColor: Theme.surfaceSubtle,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  tradeChipText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Theme.textSecondary,
  },
  tradeChipMore: {
    backgroundColor: Theme.sand,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  tradeChipMoreText: {
    fontFamily: FontFamily.bold,
    fontSize: 9.5,
    color: Theme.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.sandDark,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Theme.ink,
  },
  sectionLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    color: Theme.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
  },
  modeBtnActiveGreen: {
    backgroundColor: Theme.forestGreenLight,
    borderColor: Theme.forestGreen,
  },
  modeBtnActiveOrange: {
    backgroundColor: Theme.accentLight,
    borderColor: Theme.accent,
  },
  modeBtnActiveGray: {
    backgroundColor: Theme.sand,
    borderColor: Theme.textMuted,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modeBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11.5,
    color: Theme.textSecondary,
  },
  modeBtnTextActive: {
    color: Theme.ink,
    fontFamily: FontFamily.bold,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
  },
  radiusBtnSelected: {
    backgroundColor: Theme.ink,
    borderColor: Theme.ink,
  },
  radiusBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    color: Theme.ink,
  },
  radiusBtnTextSelected: {
    color: Theme.surface,
  },
  tradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Theme.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
  },
  tradePillSelected: {
    backgroundColor: Theme.forestGreen,
    borderColor: Theme.forestGreen,
  },
  tradePillText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Theme.ink,
  },
  tradePillTextSelected: {
    color: Theme.surface,
    fontFamily: FontFamily.bold,
  },
  doneBtn: {
    marginTop: 22,
    backgroundColor: Theme.ink,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 13.5,
    color: Theme.surface,
  },
});
