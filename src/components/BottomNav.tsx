import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../theme/ThemeContext";
import type { AppTheme } from "../theme/theme";

type Tab = "home" | "attendance" | "profile" | "settings";

interface Props {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onChange }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.container}>
      <NavItem
        icon="home-outline"
        activeIcon="home"
        label="Home"
        active={activeTab === "home"}
        onPress={() => onChange("home")}
        theme={theme}
      />

      <NavItem
        icon="stats-chart-outline"
        activeIcon="stats-chart"
        label="Attendance"
        active={activeTab === "attendance"}
        onPress={() => onChange("attendance")}
        theme={theme}
      />

      <NavItem
        icon="person-outline"
        activeIcon="person"
        label="Profile"
        active={activeTab === "profile"}
        onPress={() => onChange("profile")}
        theme={theme}
      />

      <NavItem
        icon="settings-outline"
        activeIcon="settings"
        label="Settings"
        active={activeTab === "settings"}
        onPress={() => onChange("settings")}
        theme={theme}
      />
    </View>
  );
}

function NavItem({
  icon,
  activeIcon,
  label,
  active,
  onPress,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
  theme: AppTheme;
}) {
  const styles = createStyles(theme);
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.item}>
      <Ionicons
        name={active ? activeIcon : icon}
        size={21}
        color={active ? theme.colors.accent : theme.colors.textMuted}
      />

      <Text
        numberOfLines={1}
        style={[styles.label, active && styles.activeLabel]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: 70,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingBottom: 4,
    },

    item: {
      width: "25%",
      flexShrink: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    label: {
      fontFamily: theme.fonts.medium,
      fontSize: 10,
      color: theme.colors.textMuted,
    },

    activeLabel: {
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.accent,
    },
  });
