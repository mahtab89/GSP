import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../theme/ThemeContext";
import type { AppTheme } from "../theme/theme";

interface Props {
  onLogin: (rollNo: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function LoginScreen({ onLogin, loading = false, error = null }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!rollNo.trim() || !password.trim()) {
      return;
    }

    await onLogin(rollNo, password);
  };

  const isFormValid = rollNo.trim().length > 0 && password.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons
              name="school-outline"
              size={48}
              color={theme.colors.accent}
            />
          </View>

          <Text style={styles.title}>GSP++</Text>
          <Text style={styles.subtitle}>Attendance at a glance</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Roll No</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="id-card-outline"
                size={18}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your roll number"
                placeholderTextColor={theme.colors.textSecondary}
                value={rollNo}
                onChangeText={setRollNo}
                editable={!loading}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.visibilityButton}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={theme.colors.danger}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.loginButton,
              !isFormValid || loading ? styles.loginButtonDisabled : {},
            ]}
            onPress={handleLogin}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.background}
              />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 64,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xxxl,
  },

  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent + "15",
    marginBottom: theme.spacing.lg,
  },

  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    letterSpacing: -0.5,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  subtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  formContainer: {
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  inputGroup: {
    gap: theme.spacing.sm,
  },

  label: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.text,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.medium,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },

  inputIcon: {
    marginRight: theme.spacing.sm,
  },

  input: {
    flex: 1,
    height: 48,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text,
  },

  visibilityButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.medium,
    borderWidth: 1,
    borderColor: theme.colors.danger + "30",
  },

  errorText: {
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: theme.colors.danger,
  },

  loginButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.medium,
    marginTop: theme.spacing.md,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.background,
  },

});
