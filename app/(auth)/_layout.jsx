import { ScrollView, StyleSheet } from "react-native";
import React from "react";
import { Slot, usePathname } from "expo-router";

import SafeAreaWrapper from "../../components/ui/safeAreaWrapper";
import { useSelector } from "react-redux";

export default function AuthLayout() {
  const theme = useSelector((state) => state.app.theme);

  const pathname = usePathname();

  return (
    <SafeAreaWrapper>
      <ScrollView
        contentContainerStyle={[styles(theme).scrollView]}
        showsVerticalScrollIndicator={false}
      >
        <Slot />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    scrollView: {
      width: "100%",
      gap: 32,
      padding: 16,
    },
  });
