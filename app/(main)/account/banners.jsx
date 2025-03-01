import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  COLOR_THEME,
  FONT_SIZE,
  FONT_WEIGHT,
  SCREEN_DIMENSION,
} from "../../../constants";
import { BORDER_RADIUS } from "../../../constants/theme";
import { Octicons } from "@expo/vector-icons";
import PopupModalWrapper from "../../../components/ui/PopupModalWrapper";
import AuthScreenWrapper from "../../../components/ui/AuthScreenWrapper";
import PhotoPicker from "../../../components/reuseables/PhotoPicker";
import { DEBOUNCE } from "../../../helpers/utils/debounce";
import { BANNER_HOOKS } from "../../../helpers/hooks/banner";
import NotFoundComponent from "../../../components/reuseables/NotFoundComponent";
import ImageComponent from "../../../components/reuseables/ImageComponent";
import { IMAGE_LOADER } from "../../../helpers/utils/image-loader";

export default function Banners() {
  const theme = useSelector((s) => s.app.theme);

  const [banners, setBanners] = useState();
  const [meta, setMeta] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const fetchBanners = async (page = 1) => {
    //send request
    const result = await BANNER_HOOKS.fetch_banners(setIsLoading, page);

    if (result) {
      setMeta(result?.meta);

      if (page > 1 && result?.banners) {
        setBanners((prev) => [...prev, ...result?.banners]);
      } else {
        setBanners(result?.banners);
      }
    }
  };

  useEffect(() => {
    fetchBanners(1);
  }, []);

  return (
    <View style={styles(theme).safeArea}>
      <Text style={styles(theme).blockDesc}>
        Manage what advertisement banners are displayed on the home page of your
        client's app at any given time. Here you can add or remove ads as
        needed.
      </Text>

      {/**add banner button */}
      <AddButton
        theme={theme}
        refreshFunc={() => {
          setBanners(null);
          fetchBanners(1);
        }}
      />

      {/**banners list */}
      <View style={styles(theme).bannerList}>
        {banners && banners?.length > 0 ? (
          banners?.map((item, index) => (
            <BannerTab
              key={index}
              data={item}
              theme={theme}
              refreshFunc={() => {
                setBanners(null);
                fetchBanners(1);
              }}
            />
          ))
        ) : (
          <NotFoundComponent
            text={"No in-app banners found"}
            isLoading={isLoading}
          />
        )}
      </View>
    </View>
  );
}

const AddButton = ({ theme, refreshFunc = () => {} }) => {
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    photo: {},
  });
  const [isLoading, setIsLoading] = useState(false);

  //handle form submission
  const submitForm = DEBOUNCE(async () => {
    const success = await BANNER_HOOKS.create_banners(formData, setIsLoading);

    if (success) {
      refreshFunc();
    }

    setIsVisible(false);
  });

  return (
    <>
      {/**floating button */}
      <TouchableOpacity
        style={styles(theme).addBtn}
        onPress={() => setIsVisible(true)}
      >
        <Octicons name="plus" size={18} color={COLOR_THEME[theme].white} />
        <Text style={styles(theme).addText}>Add Banner</Text>
      </TouchableOpacity>

      {/**add banners */}
      <PopupModalWrapper
        title={"Add New Banner"}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onCloseFunc={() => {
          //clear form
          setFormData({
            photo: {},
          });
        }}
      >
        <AuthScreenWrapper
          buttonText={"Add"}
          buttonIsLoading={isLoading}
          buttonIsDisabled={!formData?.photo?.uri}
          formSubmitFunction={submitForm}
        >
          {/**description */}
          <Text style={styles(theme).addDesc}>
            For best quality, upload a jpeg photo with width-height dimensions
            of (1080 x 512)
          </Text>

          {/**photo picker */}
          <PhotoPicker name={"photo"} form={formData} setForm={setFormData} />
        </AuthScreenWrapper>
      </PopupModalWrapper>
    </>
  );
};

const BannerTab = ({ theme, data, refreshFunc = () => {} }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { banner_id, thumbnail, thumbnail_blur } = data;

  const _deleteBanner = DEBOUNCE(async () => {
    const success = await BANNER_HOOKS.delete_banner(setIsDeleting, banner_id);

    if (success) {
      refreshFunc();
    }
  });

  return (
    <View style={styles(theme).bannerTab}>
      {/**banner display */}
      <ImageComponent
        uri={IMAGE_LOADER.user_thumbnail(thumbnail)}
        blur={thumbnail_blur}
      />

      {/**delete button */}
      <TouchableOpacity
        style={styles(theme).deleteBtn}
        disabled={isDeleting}
        onPress={() => _deleteBanner()}
      >
        {isDeleting ? (
          <ActivityIndicator size={18} color={COLOR_THEME[theme].error} />
        ) : (
          <Octicons name="trash" size={18} color={COLOR_THEME[theme].error} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    safeArea: {
      width: "100%",
      paddingVertical: 16,
      gap: 16,
    },
    blockDesc: {
      paddingHorizontal: 16,
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray200,
    },
    addBtn: {
      width: 164,
      height: 48,
      marginLeft: "auto",
      marginRight: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: BORDER_RADIUS.r,
      backgroundColor: COLOR_THEME[theme].primary,
    },
    addText: {
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].white,
    },
    addDesc: {
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray200,
      textAlign: "center",
    },
    bannerList: {
      width: "100%",
      height: "auto",
      minHeight: "100%",
      padding: 16,
      gap: 16,
      backgroundColor: COLOR_THEME[theme].gray50,
    },
    bannerTab: {
      width: "100%",
      height: SCREEN_DIMENSION.bannerHeight(SCREEN_DIMENSION.width - 32),
      borderRadius: BORDER_RADIUS.s,
      backgroundColor: COLOR_THEME[theme].white,
      overflow: "hidden",
      position: "relative",
    },
    deleteBtn: {
      width: 32,
      height: 32,
      position: "absolute",
      top: 8,
      right: 8,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      backgroundColor: COLOR_THEME[theme].errorFaded,
      borderWidth: 0.8,
      borderColor: COLOR_THEME[theme].error,
    },
  });
