import * as SecureStore from "expo-secure-store";

import type { Credentials } from "../models/auth";

const CREDENTIAL_USERNAME_KEY = "gsp.credential.username";
const CREDENTIAL_PASSWORD_KEY = "gsp.credential.password";

export async function saveCredentials(credentials: Credentials): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      CREDENTIAL_USERNAME_KEY,
      credentials.username,
    );

    await SecureStore.setItemAsync(
      CREDENTIAL_PASSWORD_KEY,
      credentials.password,
    );
  } catch (error) {
    
    throw new Error("Failed to save credentials securely");
  }
}

export async function getCredentials(): Promise<Credentials | null> {
  try {
    const username = await SecureStore.getItemAsync(CREDENTIAL_USERNAME_KEY);
    const password = await SecureStore.getItemAsync(CREDENTIAL_PASSWORD_KEY);

    if (!username || !password) {
      return null;
    }

    return { username, password };
  } catch (error) {
    
    return null;
  }
}

export async function clearCredentials(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CREDENTIAL_USERNAME_KEY);
    await SecureStore.deleteItemAsync(CREDENTIAL_PASSWORD_KEY);
  } catch (error) {
    
    throw new Error("Failed to clear credentials");
  }
}
