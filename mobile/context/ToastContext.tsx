import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions | string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const TOAST_CONFIG = {
  success: {
    bg: '#ECFDF5',
    border: '#A7F3D0',
    color: '#065F46',
    icon: 'checkmark-circle-outline' as const,
  },
  error: {
    bg: '#FEF2F2',
    border: '#FCA5A5',
    color: '#991B1B',
    icon: 'alert-circle-outline' as const,
  },
  warning: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    color: '#92400E',
    icon: 'warning-outline' as const,
  },
  info: {
    bg: '#F0F9FF',
    border: '#BAE6FD',
    color: '#075985',
    icon: 'information-circle-outline' as const,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  };

  const showToast = (options: ToastOptions | string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const toastOpts: ToastOptions = typeof options === 'string' 
      ? { message: options, type: 'info' } 
      : { type: 'info', ...options };

    setToast(toastOpts);

    // Reset animation starting values
    translateY.setValue(-150);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      hideToast();
    }, toastOpts.duration || 3000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const config = toast?.type ? TOAST_CONFIG[toast.type] : TOAST_CONFIG.info;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              top: insets.top + Spacing.sm,
              transform: [{ translateY }],
              opacity,
              backgroundColor: config.bg,
              borderColor: config.border,
            },
          ]}
        >
          <View style={styles.toastContent}>
            <Ionicons name={config.icon} size={20} color={config.color} style={styles.icon} />
            <Text style={[styles.message, { color: config.color }]}>
              {toast.message}
            </Text>
            <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
              <Ionicons name="close" size={16} color={config.color} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 18,
  },
  closeBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
