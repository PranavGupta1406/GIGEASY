// GigEasy Production Date & Time Picker
// Premium booking-style modal with month navigation, past-date disabling,
// quick presets, AM/PM time selection, and zero manual typing.

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../theme';
import { FontFamily, FontSize, BorderRadius } from '../constants';

const { width } = Dimensions.get('window');

// ─── DATE HELPERS (Local Timezone Safe — No UTC Shift Bugs) ───────────────────
export const getLocalTodayIso = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatIsoToHuman = (isoDate: string): string => {
  if (!isoDate || !isoDate.includes('-')) return isoDate;
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const todayIso = getLocalTodayIso();
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowIso = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
  const monthName = date.toLocaleDateString('en-IN', { month: 'short' });
  const dayNum = date.getDate();
  const yearNum = date.getFullYear();

  if (isoDate === todayIso) {
    return `Today (${dayName}, ${dayNum} ${monthName})`;
  }
  if (isoDate === tomorrowIso) {
    return `Tomorrow (${dayName}, ${dayNum} ${monthName})`;
  }
  return `${dayName}, ${dayNum} ${monthName} ${yearNum}`;
};

export const parseIsoDate = (isoDate: string) => {
  if (!isoDate || !isoDate.includes('-')) {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }
  const [y, m, d] = isoDate.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
};

// ─── GIG DATE PICKER MODAL ───────────────────────────────────────────────────

interface DatePickerProps {
  visible: boolean;
  selectedDate: string; // ISO 'YYYY-MM-DD'
  onSelectDate: (isoDate: string, displayDate: string) => void;
  onClose: () => void;
  minDate?: string; // ISO 'YYYY-MM-DD' (defaults to today)
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const GigDatePickerModal: React.FC<DatePickerProps> = ({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
  minDate = getLocalTodayIso(),
}) => {
  const initial = useMemo(() => parseIsoDate(selectedDate || minDate), [selectedDate, minDate]);
  const [currentYear, setCurrentYear] = useState<number>(initial.year);
  const [currentMonth, setCurrentMonth] = useState<number>(initial.month);
  const [tempSelected, setTempSelected] = useState<string>(selectedDate || minDate);

  const todayIso = getLocalTodayIso();

  // Reset view to selected date when opening
  React.useEffect(() => {
    if (visible) {
      const p = parseIsoDate(selectedDate || minDate);
      setCurrentYear(p.year);
      setCurrentMonth(p.month);
      setTempSelected(selectedDate || minDate);
    }
  }, [visible, selectedDate, minDate]);

  // Days in current month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days: Array<{
      day: number;
      isoDate: string;
      isCurrentMonth: boolean;
      isDisabled: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Empty lead cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        day: 0,
        isoDate: '',
        isCurrentMonth: false,
        isDisabled: true,
        isToday: false,
        isSelected: false,
      });
    }

    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isDisabled = iso < minDate;
      const isToday = iso === todayIso;
      const isSelected = iso === tempSelected;

      days.push({
        day: d,
        isoDate: iso,
        isCurrentMonth: true,
        isDisabled,
        isToday,
        isSelected,
      });
    }

    return days;
  }, [currentYear, currentMonth, minDate, todayIso, tempSelected]);

  const monthLabel = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }, [currentYear, currentMonth]);

  const canGoPrev = useMemo(() => {
    const [minY, minM] = minDate.split('-').map(Number);
    if (currentYear < minY) return false;
    if (currentYear === minY && currentMonth <= minM - 1) return false;
    return true;
  }, [currentYear, currentMonth, minDate]);

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const selectDatePreset = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const iso = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    setTempSelected(iso);
    setCurrentYear(target.getFullYear());
    setCurrentMonth(target.getMonth());
  };

  const handleConfirm = () => {
    onSelectDate(tempSelected, formatIsoToHuman(tempSelected));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalBackdrop}>
          <View style={styles.dialogCard}>
            {/* Header */}
            <View style={styles.dialogHeader}>
              <View>
                <Text style={styles.dialogTitle}>Select Shift Date</Text>
                <Text style={styles.dialogSubtitle}>
                  {tempSelected ? formatIsoToHuman(tempSelected) : 'Pick an upcoming date'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Feather name="x" size={20} color={Theme.ink} />
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <View style={styles.presetsRow}>
              <TouchableOpacity
                style={[styles.presetChip, tempSelected === todayIso && styles.presetChipActive]}
                onPress={() => selectDatePreset(0)}
                activeOpacity={0.8}
              >
                <Text style={[styles.presetText, tempSelected === todayIso && styles.presetTextActive]}>
                  Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetChip,
                  tempSelected ===
                    (() => {
                      const t = new Date();
                      t.setDate(t.getDate() + 1);
                      return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
                    })() && styles.presetChipActive,
                ]}
                onPress={() => selectDatePreset(1)}
                activeOpacity={0.8}
              >
                <Text style={styles.presetText}>Tomorrow</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => selectDatePreset(2)}
                activeOpacity={0.8}
              >
                <Text style={styles.presetText}>In 2 Days</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => selectDatePreset(7)}
                activeOpacity={0.8}
              >
                <Text style={styles.presetText}>Next Week</Text>
              </TouchableOpacity>
            </View>

            {/* Month Navigator */}
            <View style={styles.monthNavRow}>
              <TouchableOpacity
                onPress={handlePrevMonth}
                disabled={!canGoPrev}
                style={[styles.navArrow, !canGoPrev && { opacity: 0.3 }]}
                activeOpacity={0.7}
              >
                <Feather name="chevron-left" size={20} color={Theme.ink} />
              </TouchableOpacity>

              <Text style={styles.monthNavTitle}>{monthLabel}</Text>

              <TouchableOpacity onPress={handleNextMonth} style={styles.navArrow} activeOpacity={0.7}>
                <Feather name="chevron-right" size={20} color={Theme.ink} />
              </TouchableOpacity>
            </View>

            {/* Weekday Labels */}
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((wd) => (
                <Text key={wd} style={styles.weekdayText}>
                  {wd}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.gridContainer}>
              {calendarDays.map((item, index) => {
                if (!item.isCurrentMonth) {
                  return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;
                }
                return (
                  <TouchableOpacity
                    key={item.isoDate}
                    style={[
                      styles.dayCell,
                      item.isSelected && styles.dayCellSelected,
                      item.isToday && !item.isSelected && styles.dayCellToday,
                    ]}
                    disabled={item.isDisabled}
                    onPress={() => setTempSelected(item.isoDate)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        item.isDisabled && styles.dayTextDisabled,
                        item.isSelected && styles.dayTextSelected,
                        item.isToday && !item.isSelected && styles.dayTextToday,
                      ]}
                    >
                      {item.day}
                    </Text>
                    {item.isToday && !item.isSelected && <View style={styles.todayDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Actions Footer */}
            <View style={styles.dialogFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !tempSelected && { opacity: 0.5 }]}
                disabled={!tempSelected}
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <Feather name="check" size={16} color={Theme.surface} style={{ marginRight: 6 }} />
                <Text style={styles.confirmBtnText}>Confirm Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

// ─── GIG TIME PICKER MODAL ───────────────────────────────────────────────────

interface TimePickerProps {
  visible: boolean;
  startTime: string; // e.g., '09:00 AM'
  endTime: string;   // e.g., '06:00 PM'
  onSelectTiming: (start: string, end: string, displayTiming: string) => void;
  onClose: () => void;
}

const COMMON_TIMING_PRESETS = [
  { label: 'General Shift', start: '09:00 AM', end: '06:00 PM', duration: '9 hrs' },
  { label: 'Morning Shift', start: '08:00 AM', end: '05:00 PM', duration: '9 hrs' },
  { label: 'Early Shift', start: '06:00 AM', end: '02:00 PM', duration: '8 hrs' },
  { label: 'Evening Shift', start: '02:00 PM', end: '10:00 PM', duration: '8 hrs' },
  { label: 'Night Shift', start: '10:00 PM', end: '06:00 AM', duration: '8 hrs (overnight)' },
  { label: 'Half Day (Morning)', start: '09:00 AM', end: '01:00 PM', duration: '4 hrs' },
  { label: 'Half Day (Afternoon)', start: '02:00 PM', end: '06:00 PM', duration: '4 hrs' },
];

const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = ['00', '15', '30', '45'];

export const GigTimePickerModal: React.FC<TimePickerProps> = ({
  visible,
  startTime,
  endTime,
  onSelectTiming,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Custom picker state
  const parseTime = (t: string) => {
    const parts = t.trim().split(' ');
    const [hh, mm] = (parts[0] || '09:00').split(':');
    const ampm = (parts[1] || 'AM').toUpperCase();
    return {
      hour: hh.padStart(2, '0'),
      minute: mm.padStart(2, '0'),
      period: ampm === 'PM' ? 'PM' : 'AM',
    };
  };

  const [startParsed, setStartParsed] = useState(parseTime(startTime || '09:00 AM'));
  const [endParsed, setEndParsed] = useState(parseTime(endTime || '06:00 PM'));
  const [timingTarget, setTimingTarget] = useState<'start' | 'end'>('start');

  React.useEffect(() => {
    if (visible) {
      setStartParsed(parseTime(startTime || '09:00 AM'));
      setEndParsed(parseTime(endTime || '06:00 PM'));
    }
  }, [visible, startTime, endTime]);

  const customStartString = `${startParsed.hour}:${startParsed.minute} ${startParsed.period}`;
  const customEndString = `${endParsed.hour}:${endParsed.minute} ${endParsed.period}`;

  const handleSelectPreset = (preset: typeof COMMON_TIMING_PRESETS[0]) => {
    onSelectTiming(preset.start, preset.end, `${preset.start} - ${preset.end}`);
    onClose();
  };

  const handleConfirmCustom = () => {
    onSelectTiming(customStartString, customEndString, `${customStartString} - ${customEndString}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalBackdrop}>
          <View style={[styles.dialogCard, { maxHeight: '85%' }]}>
            {/* Header */}
            <View style={styles.dialogHeader}>
              <View>
                <Text style={styles.dialogTitle}>Select Shift Timing</Text>
                <Text style={styles.dialogSubtitle}>
                  {activeTab === 'presets' ? 'Standard industrial shift timings' : `${customStartString} to ${customEndString}`}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Feather name="x" size={20} color={Theme.ink} />
              </TouchableOpacity>
            </View>

            {/* Segment Toggle */}
            <View style={styles.segmentWrap}>
              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'presets' && styles.segmentBtnActive]}
                onPress={() => setActiveTab('presets')}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, activeTab === 'presets' && styles.segmentTextActive]}>
                  Standard Shifts
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'custom' && styles.segmentBtnActive]}
                onPress={() => setActiveTab('custom')}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, activeTab === 'custom' && styles.segmentTextActive]}>
                  Custom Hours
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'presets' ? (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320, marginVertical: 8 }}>
                {COMMON_TIMING_PRESETS.map((p) => {
                  const isCurrent =
                    (startTime === p.start && endTime === p.end) ||
                    (startTime.startsWith(p.start.slice(0, 5)) && endTime.startsWith(p.end.slice(0, 5)));
                  return (
                    <TouchableOpacity
                      key={p.label}
                      style={[styles.timePresetRow, isCurrent && styles.timePresetRowSelected]}
                      onPress={() => handleSelectPreset(p)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.presetLabel, isCurrent && { color: Theme.accent }]}>
                          {p.label}
                        </Text>
                        <Text style={styles.presetHours}>
                          {p.start} – {p.end}
                        </Text>
                      </View>
                      <View style={styles.durationPill}>
                        <Text style={styles.durationText}>{p.duration}</Text>
                      </View>
                      {isCurrent && (
                        <Feather name="check" size={18} color={Theme.accent} style={{ marginLeft: 8 }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={{ marginVertical: 12 }}>
                {/* Target Selector (Start vs End) */}
                <View style={styles.targetRow}>
                  <TouchableOpacity
                    style={[styles.targetBtn, timingTarget === 'start' && styles.targetBtnActive]}
                    onPress={() => setTimingTarget('start')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.targetSub}>Start Time</Text>
                    <Text style={[styles.targetTime, timingTarget === 'start' && { color: Theme.accent }]}>
                      {customStartString}
                    </Text>
                  </TouchableOpacity>

                  <Feather name="arrow-right" size={16} color={Theme.textMuted} style={{ alignSelf: 'center' }} />

                  <TouchableOpacity
                    style={[styles.targetBtn, timingTarget === 'end' && styles.targetBtnActive]}
                    onPress={() => setTimingTarget('end')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.targetSub}>End Time</Text>
                    <Text style={[styles.targetTime, timingTarget === 'end' && { color: Theme.accent }]}>
                      {customEndString}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* AM / PM Toggle */}
                <View style={styles.ampmRow}>
                  <Text style={styles.pickerSectionTitle}>
                    Configuring: {timingTarget === 'start' ? 'Shift Start Time' : 'Shift End Time'}
                  </Text>
                  <View style={styles.ampmPills}>
                    <TouchableOpacity
                      style={[
                        styles.ampmBtn,
                        (timingTarget === 'start' ? startParsed.period : endParsed.period) === 'AM' &&
                          styles.ampmBtnActive,
                      ]}
                      onPress={() => {
                        if (timingTarget === 'start') {
                          setStartParsed({ ...startParsed, period: 'AM' });
                        } else {
                          setEndParsed({ ...endParsed, period: 'AM' });
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.ampmText,
                          (timingTarget === 'start' ? startParsed.period : endParsed.period) === 'AM' &&
                            styles.ampmTextActive,
                        ]}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.ampmBtn,
                        (timingTarget === 'start' ? startParsed.period : endParsed.period) === 'PM' &&
                          styles.ampmBtnActive,
                      ]}
                      onPress={() => {
                        if (timingTarget === 'start') {
                          setStartParsed({ ...startParsed, period: 'PM' });
                        } else {
                          setEndParsed({ ...endParsed, period: 'PM' });
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.ampmText,
                          (timingTarget === 'start' ? startParsed.period : endParsed.period) === 'PM' &&
                            styles.ampmTextActive,
                        ]}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Hour Selection Grid */}
                <Text style={styles.unitHeader}>HOUR</Text>
                <View style={styles.unitGrid}>
                  {HOURS.map((h) => {
                    const isSelected =
                      (timingTarget === 'start' ? startParsed.hour : endParsed.hour) === h;
                    return (
                      <TouchableOpacity
                        key={h}
                        style={[styles.unitCell, isSelected && styles.unitCellActive]}
                        onPress={() => {
                          if (timingTarget === 'start') {
                            setStartParsed({ ...startParsed, hour: h });
                          } else {
                            setEndParsed({ ...endParsed, hour: h });
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.unitText, isSelected && styles.unitTextActive]}>{h}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Minute Selection Grid */}
                <Text style={[styles.unitHeader, { marginTop: 10 }]}>MINUTE</Text>
                <View style={styles.unitGrid}>
                  {MINUTES.map((m) => {
                    const isSelected =
                      (timingTarget === 'start' ? startParsed.minute : endParsed.minute) === m;
                    return (
                      <TouchableOpacity
                        key={m}
                        style={[styles.unitCell, isSelected && styles.unitCellActive]}
                        onPress={() => {
                          if (timingTarget === 'start') {
                            setStartParsed({ ...startParsed, minute: m });
                          } else {
                            setEndParsed({ ...endParsed, minute: m });
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.unitText, isSelected && styles.unitTextActive]}>:{m}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Actions Footer */}
            <View style={styles.dialogFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              {activeTab === 'custom' && (
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirmCustom}
                  activeOpacity={0.85}
                >
                  <Feather name="check" size={16} color={Theme.surface} style={{ marginRight: 6 }} />
                  <Text style={styles.confirmBtnText}>Apply Hours</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dialogCard: {
    width: Math.min(width - 32, 400),
    backgroundColor: Theme.surface,
    borderRadius: BorderRadius.xl,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  dialogTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Theme.ink,
    letterSpacing: -0.3,
  },
  dialogSubtitle: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Theme.accent,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Theme.bg,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  presetChipActive: {
    backgroundColor: Theme.accentLight,
    borderColor: Theme.accent,
  },
  presetText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  presetTextActive: {
    color: Theme.accent,
    fontFamily: FontFamily.semiBold,
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Theme.borderSubtle,
    marginBottom: 10,
  },
  monthNavTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.ink,
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Theme.textMuted,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayCell: {
    width: 40,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    position: 'relative',
  },
  dayCellEmpty: {
    width: 40,
    height: 38,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: Theme.primaryDark,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: Theme.accent,
  },
  dayText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Theme.ink,
  },
  dayTextSelected: {
    fontFamily: FontFamily.bold,
    color: Theme.surface,
  },
  dayTextToday: {
    fontFamily: FontFamily.bold,
    color: Theme.accent,
  },
  dayTextDisabled: {
    color: '#CBD5E1',
  },
  todayDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.accent,
  },
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: Theme.borderSubtle,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  cancelBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: Theme.textSecondary,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  confirmBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Theme.surface,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: Theme.bg,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  segmentBtnActive: {
    backgroundColor: Theme.surface,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.textSecondary,
  },
  segmentTextActive: {
    fontFamily: FontFamily.bold,
    color: Theme.ink,
  },
  timePresetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Theme.bg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  timePresetRowSelected: {
    borderColor: Theme.accent,
    backgroundColor: Theme.accentLight,
  },
  presetLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: Theme.ink,
  },
  presetHours: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.textSecondary,
    marginTop: 2,
  },
  durationPill: {
    backgroundColor: Theme.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  durationText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.textMuted,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  targetBtn: {
    flex: 1,
    padding: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Theme.bg,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  targetBtnActive: {
    borderColor: Theme.accent,
    backgroundColor: Theme.accentLight,
  },
  targetSub: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Theme.textMuted,
  },
  targetTime: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Theme.ink,
    marginTop: 2,
  },
  ampmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickerSectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    color: Theme.textSecondary,
  },
  ampmPills: {
    flexDirection: 'row',
    backgroundColor: Theme.bg,
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  ampmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  ampmBtnActive: {
    backgroundColor: Theme.accent,
  },
  ampmText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Theme.textSecondary,
  },
  ampmTextActive: {
    color: Theme.surface,
  },
  unitHeader: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    color: Theme.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  unitCell: {
    width: 48,
    height: 34,
    borderRadius: BorderRadius.sm,
    backgroundColor: Theme.bg,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitCellActive: {
    backgroundColor: Theme.primaryDark,
    borderColor: Theme.primaryDark,
  },
  unitText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Theme.ink,
  },
  unitTextActive: {
    fontFamily: FontFamily.bold,
    color: Theme.surface,
  },
});
