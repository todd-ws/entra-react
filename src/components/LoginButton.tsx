// src/components/LoginButton.tsx
import React from "react";
import { Pressable, Text } from "react-native";
import { useAuth } from "../auth/useAuth";

export default function LoginButton() {
  const { isAuthenticated, signIn } = useAuth();
  if (isAuthenticated) return null;
  return (
    <Pressable onPress={signIn} style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}>
      <Text>Sign in</Text>
    </Pressable>
  );
}
