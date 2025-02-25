import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { memo, useEffect, useMemo, useState } from "react";
import {
  COLOR_THEME,
  FONT_SIZE,
  FONT_WEIGHT,
  SCREEN_DIMENSION,
} from "../constants";
import { router, usePathname } from "expo-router";
import { useSelector } from "react-redux";
import { BORDER_RADIUS } from "../constants/theme";
import ImageComponent from "./reuseables/ImageComponent";
import { IMAGE_LOADER } from "../helpers/utils/image-loader";
import { get_current_greeting } from "../helpers/utils/datetime";
import { Octicons } from "@expo/vector-icons";

const TabsHeaderComponent = () => {
  const theme = useSelector((state) => state.app.theme);
  const admin = useSelector((state) => state.admin?.admin);

  const path = usePathname();
  const [pageName, setPageName] = useState("");

  useMemo(() => {
    if (path) {
      switch (path) {
        case "/":
          setPageName("Dashboard");
          break;
        case "/users":
          setPageName("App Users");
          break;
        case "/packages":
          setPageName("Created Packages");
          break;
        case "/options":
          setPageName("More Options");
          break;

        default:
          setPageName("");
          break;
      }
    }
  }, [path]);

  return (
    <View style={styles(theme).header(pageName?.toLowerCase())}>
      <Text style={styles(theme).pageTitle}>{pageName}</Text>

      {/**action buttons */}
      <NoticeComponent theme={theme} />
    </View>
  );
};

export default memo(TabsHeaderComponent);

const NoticeComponent = ({ theme }) => {
  //check for unread notifications
  const has_unread = useSelector((state) => state.notification.has_unread);

  const _goToNotifications = () => {
    router.navigate("/notices");
  };

  return (
    <TouchableOpacity
      style={styles(theme).noticeCont}
      onPress={() => _goToNotifications()}
    >
      <Octicons name="bell" size={18} color={COLOR_THEME[theme].gray200} />

      {has_unread && <View style={styles(theme).indicator}></View>}
    </TouchableOpacity>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    header: (page) => ({
      width: "100%",
      paddingTop: 8,
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: COLOR_THEME[theme].white,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      borderBottomWidth: 0.8,
      borderBottomColor:
        page === "home" ? COLOR_THEME[theme].gray50 : COLOR_THEME[theme].white,
    }),
    pageTitle: {
      maxWidth: "100%",
      fontSize: FONT_SIZE.xb,
      fontWeight: FONT_WEIGHT.bold,
      color: COLOR_THEME[theme].black,
    },
    noticeCont: {
      width: 44,
      height: 44,
      borderRadius: BORDER_RADIUS.r,
      backgroundColor: COLOR_THEME[theme].gray50,
      alignItems: "center",
      justifyContent: "center",
    },
    indicator: {
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
