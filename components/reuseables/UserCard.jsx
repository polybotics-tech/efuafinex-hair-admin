import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { memo, useState } from "react";
import { useSelector } from "react-redux";
import * as Linking from "expo-linking";
import ImageComponent from "./ImageComponent";
import { IMAGE_LOADER } from "../../helpers/utils/image-loader";
import {
  BORDER_RADIUS,
  COLOR_THEME,
  FONT_SIZE,
  FONT_WEIGHT,
} from "../../constants/theme";
import CopyIcon from "./CopyIcon";
import { SCREEN_DIMENSION } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import PopupModalWrapper from "../ui/PopupModalWrapper";

const UserCard = ({ data, full, clickable = true }) => {
  const theme = useSelector((state) => state.app.theme);

  const { user_id, phone, email, is_verified } = data;

  const _goToDetails = () => {
    router.navigate(`/user/${user_id}`);
  };

  const _callUserPhone = async () => {
    if (String(phone) != "") {
      await Linking.openURL(`tel:${phone}`);
    }
  };

  const _sendUserMail = async () => {
    if (String(email) != "" && Boolean(is_verified)) {
      await Linking.openURL(`mailto:${email}`);
    }
  };

  return (
    <View style={styles(theme).component}>
      <View style={styles(theme).verifiedCont}>
        {Boolean(is_verified) ? (
          <View>
            <Text style={styles(theme).verifiedTag(true)}>Verified</Text>
          </View>
        ) : (
          <View>
            <Text style={styles(theme).verifiedTag(false)}>Unverified</Text>
          </View>
        )}

        {/**email and phone buttons */}
        <View style={styles(theme).verifiedActions}>
          {Boolean(is_verified) && Boolean(email != "") && (
            <TouchableOpacity
              style={styles(theme).verifiedActionButton}
              onPress={() => _sendUserMail()}
            >
              <Ionicons
                name="mail-outline"
                size={16}
                color={COLOR_THEME[theme].primary}
              />
            </TouchableOpacity>
          )}

          {Boolean(phone != "") && (
            <TouchableOpacity
              style={styles(theme).verifiedActionButton}
              onPress={() => _callUserPhone()}
            >
              <Ionicons
                name="call-outline"
                size={16}
                color={COLOR_THEME[theme].primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/**user preview */}
      <TouchableOpacity
        style={styles(theme).preview}
        onPress={() => _goToDetails()}
        activeOpacity={0.6}
        disabled={!clickable}
      >
        {/**thumbnail */}
        <UserThumbnailComp theme={theme} data={data} />

        {/**user name and email */}
        <View style={styles(theme).previewInner}>
          <Text style={styles(theme).userName}>{data?.user_name}</Text>
          <Text style={styles(theme).fullName} numberOfLines={full ? 2 : 1}>
            {data?.fullname}
          </Text>
          <Text style={styles(theme).userMail} numberOfLines={1}>
            {data?.email}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default memo(UserCard);

const UserThumbnailComp = ({ theme, data }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles(theme).thumbnail}
        activeOpacity={0.8}
        onPress={() => {
          setModalVisible(true);
        }}
      >
        <ImageComponent
          uri={IMAGE_LOADER.user_thumbnail(data?.thumbnail)}
          blur={data?.thumbnail_blur}
          scale={false}
        />
      </TouchableOpacity>

      {/**show full image */}
      <PopupModalWrapper
        title={"View Photo"}
        isVisible={modalVisible}
        setIsVisible={setModalVisible}
        containerStyle={{
          padding: 0,
          backgroundColor: COLOR_THEME[theme].black,
        }}
      >
        <View style={styles(theme).photoViewer}>
          <ImageComponent
            uri={IMAGE_LOADER.user_thumbnail(data?.thumbnail)}
            blur={data?.thumbnail_blur}
            scale={true}
          />
        </View>
      </PopupModalWrapper>
    </>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    component: {
      width: "100%",
      padding: 16,
      borderRadius: BORDER_RADIUS.s,
      backgroundColor: COLOR_THEME[theme].white,
      gap: 16,
    },
    verifiedCont: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    verifiedTag: (verified) => ({
      alignSelf: "flex-start",
      maxWidth: 150,
      paddingVertical: 4,
      paddingHorizontal: 16,
      borderRadius: BORDER_RADIUS.xs,
      backgroundColor: verified
        ? COLOR_THEME[theme].successFaded
        : COLOR_THEME[theme].errorFaded,
      fontSize: FONT_SIZE.xs,
      fontWeight: FONT_WEIGHT.regular,
      color: verified ? COLOR_THEME[theme].success : COLOR_THEME[theme].error,
    }),
    verifiedActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    verifiedActionButton: {
      width: 32,
      height: 32,
      borderRadius: BORDER_RADIUS.r,
      borderWidth: 0.8,
      borderColor: COLOR_THEME[theme].primary,
      backgroundColor: COLOR_THEME[theme].primaryFaded,
      alignItems: "center",
      justifyContent: "center",
    },
    preview: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    thumbnail: {
      width: 64,
      height: 64,
      borderRadius: BORDER_RADIUS.r,
      backgroundColor: COLOR_THEME[theme].gray50,
      overflow: "hidden",
      borderWidth: 0.8,
      borderColor: COLOR_THEME[theme].gray200,
    },
    photoViewer: {
      width: "100%",
      height: "auto",
      maxHeight: SCREEN_DIMENSION.heightRatio(1 / 1.4),
    },
    previewInner: {
      width: SCREEN_DIMENSION.subtractWidth(8, 32 + 32, 64),
      gap: 4,
    },
    userName: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray100,
    },
    fullName: {
      width: "100%",
      fontSize: FONT_SIZE.b,
      fontWeight: FONT_WEIGHT.bold,
      color: COLOR_THEME[theme].black,
      textTransform: "capitalize",
    },
    userMail: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].gray200,
    },
  });
