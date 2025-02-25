import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { memo } from "react";
import { COLOR_THEME, FONT_SIZE, FONT_WEIGHT } from "../../constants";
import { BORDER_RADIUS } from "../../constants/theme";
import { useSelector } from "react-redux";

const PrimaryButton = ({ ...props }) => {
  const theme = useSelector((state) => state.app.theme);

  return (
    <TouchableOpacity
      style={[
        styles(theme).primaryBtn(props?.type),
        props?.style,
        { opacity: props?.disabled ? 0.5 : 1 },
      ]}
      disabled={props?.disabled || props?.isLoading}
      onPress={props?.onPress}
      activeOpacity={0.6}
    >
      <Text
        style={[
          styles(theme).primaryBtnText,
          {
            color:
              props?.color ||
              (props?.type === "secondary"
                ? COLOR_THEME[theme].primary
                : COLOR_THEME[theme].white),
          },
        ]}
      >
        {props?.title}
      </Text>

      {props?.isLoading ? (
        <ActivityIndicator
          size={FONT_SIZE.s}
          color={
            props?.color ||
            (props?.type === "secondary"
              ? COLOR_THEME[theme].primary
              : COLOR_THEME[theme].white)
          }
        />
      ) : (
        <>
          {props?.icon && (
            <View
              style={[
                styles(theme).primaryBtnIcon,
                props?.iconSize && { width: props?.iconSize },
              ]}
            >
              {props?.icon}
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default memo(PrimaryButton);

const styles = (theme) =>
  StyleSheet.create({
    primaryBtn: (type = "primary") => ({
      width: "100%",
      height: 48,
      borderRadius: BORDER_RADIUS.r,
      backgroundColor:
        type === "primary"
          ? COLOR_THEME[theme].primary
          : COLOR_THEME[theme].primaryFaded,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    }),
    primaryBtnText: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.semibold,
    },
    primaryBtnIcon: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
