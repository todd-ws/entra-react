// src/screens/Home.screen.tsx
import React from "react";
import { View, Text } from "react-native";
import LoginButton from "../components/LoginButton";
import LogoutButton from "../components/LogoutButton";
import Profile from "../components/Profile";

export default function HomeScreen() {
  return (
    <View style={{ gap: 16, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>RN Web + Entra External ID</Text>
      <LoginButton />
      <LogoutButton />
      <Profile />
      <Text>Public content…</Text>
    </View>
  );
}
