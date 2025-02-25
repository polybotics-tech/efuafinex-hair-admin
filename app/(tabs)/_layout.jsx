import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Tabs, usePathname } from "expo-router";
import { Octicons } from "@expo/vector-icons";
import { COLOR_THEME, FONT_SIZE, FONT_WEIGHT } from "../../constants/theme";
import SafeAreaWrapper from "../../components/ui/safeAreaWrapper";
import TabsHeaderComponent from "../../components/TabsHeaderComponent";
import { useSelector } from "react-redux";

export default function TabsLayout() {
  const theme = useSelector((state) => state.app.theme);

  //check for unread notifications
  const has_unread = useSelector((state) => state.notification.has_unread);

  //paths with white scene
  const white_scene_path = ["/account"];
  const path = usePathname();

  return (
    <SafeAreaWrapper>
      <TabsHeaderComponent />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLOR_THEME[theme].primary,
          tabBarInactiveTintColor: COLOR_THEME[theme].gray100,
          tabBarStyle: styles(theme).tabBar,
          tabBarItemStyle: {
            paddingVertical: 6,
          },
          tabBarLabelStyle: {
            fontSize: FONT_SIZE.xs,
            fontWeight: FONT_WEIGHT.semibold,
          },
          tabBarHideOnKeyboard: true,
          tabBarButton: ({ children, ...props }) => (
            <TouchableOpacity
              style={props?.style}
              onPress={props?.onPress}
              activeOpacity={0.6}
            >
              {children}
            </TouchableOpacity>
          ),
          sceneStyle: {
            backgroundColor: white_scene_path?.includes(path)
              ? COLOR_THEME[theme].white
              : COLOR_THEME[theme].gray50,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Octicons name="home" size={18} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="users"
          options={{
            title: "Users",
            tabBarIcon: ({ color }) => (
              <Octicons name="people" size={18} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="packages"
          options={{
            title: "Packages",
            tabBarIcon: ({ color }) => (
              <Octicons name="archive" size={18} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="options"
          options={{
            title: "Options",
            tabBarIcon: ({ color }) => (
              <Octicons name="apps" size={18} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaWrapper>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    tabBar: {
      height: 72,
      backgroundColor: COLOR_THEME[theme].white,
      elevation: 0,
      borderTopWidth: 0,
    },
    tabBarBadge: {
      minWidth: 10,
      width: 10,
      height: 10,
      borderRadius: 20,
      backgroundColor: COLOR_THEME[theme].primary,
      position: "absolute",
      top: 0,
      right: 5,
    },
  });
