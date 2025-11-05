// src/components/LogoutButton.tsx
import React from "react";
import { Pressable, Text } from "react-native";
import { useAuth } from "../auth/useAuth";

export default function LogoutButton() {
  const { isAuthenticated, signOut } = useAuth();
  if (!isAuthenticated) return null;
  return (
    <Pressable onPress={signOut} style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}>
      <Text>Sign out</Text>
    </Pressable>
  );
}
