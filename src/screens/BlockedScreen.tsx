import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../theme/ThemeContext";

function BlockedScreenContent() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🚫</Text>
        </View>

        <Text style={styles.title}>Access Restricted</Text>

        <Text style={styles.message}>
          You are restricted by GSP++ admin to use this app, contact admin for help.
        </Text>

        <Text style={styles.subMessage}>
          If you believe this is a mistake, please reach out to the administrator.
        </Text>
      </View>
    </SafeAreaProvider>
  );
}

export function BlockedScreen() {
  return (
    <ThemeProvider>
      <BlockedScreenContent />
    </ThemeProvider>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      backgroundColor: theme.colors.background,
    },

    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.dangerSoft,
      marginBottom: 24,
    },

    iconText: {
      fontSize: 36,
    },

    title: {
      fontFamily: theme.fonts.bold,
      fontSize: 22,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 12,
    },

    message: {
      fontFamily: theme.fonts.medium,
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: 8,
    },

    subMessage: {
      fontFamily: theme.fonts.regular,
      fontSize: 13,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      textAlign: "center",
      opacity: 0.8,
    },
  });