// src/components/Profile.tsx
import React from "react";
import { View, Text } from "react-native";
import { useAuth } from "../auth/useAuth";

export default function Profile() {
  const { account } = useAuth();
  if (!account) return null;
  return (
    <View style={{ padding: 10 }}>
      <Text style={{ fontWeight: "600" }}>Signed in as</Text>
      <Text>{account.username}</Text>
    </View>
  );
}
