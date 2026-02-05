/**
 * Haptic feedback utilities for form submission
 * Uses Capacitor Haptics - silently fails in browser environment
 */
import { Haptics, NotificationType } from '@capacitor/haptics';

export const HapticFeedback = {
  /** Trigger success haptic (e.g., data uploaded successfully) */
  success: () => Haptics.notification({ type: NotificationType.Success }).catch(() => {}),

  /** Trigger warning haptic (e.g., saved offline) */
  warning: () => Haptics.notification({ type: NotificationType.Warning }).catch(() => {}),

  /** Trigger error haptic (e.g., upload failed) */
  error: () => Haptics.notification({ type: NotificationType.Error }).catch(() => {})
};
