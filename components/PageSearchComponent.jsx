import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { memo, useState } from "react";
import AuthFormComponent from "./AuthFormComponent";
import PrimaryButton from "./reuseables/PrimaryButton";
import { useSelector } from "react-redux";
import {
  COLOR_THEME,
  FONT_SIZE,
  FONT_WEIGHT,
  SCREEN_DIMENSION,
} from "../constants";
import { Octicons } from "@expo/vector-icons";
import PopupModalWrapper from "./ui/PopupModalWrapper";

const PageSearchComponent = ({
  form,
  setForm,
  placeholder,
  filter_array = [],
  onSubmit = () => {},
}) => {
  const theme = useSelector((state) => state.app.theme);

  //handle filter popup
  const [modalIsVisible, setModalIsVisible] = useState(false);

  //handle filter selection
  const selectFilter = (sort) => {
    setForm((prev) => ({ ...form, sort }));
    setModalIsVisible(false);
  };

  return (
    <>
      <View style={styles(theme).searchBox}>
        <AuthFormComponent
          formType={"input"}
          inputMode={"text"}
          inputIcon={
            <Octicons
              name="search"
              size={18}
              color={COLOR_THEME[theme].gray100}
            />
          }
          label={""}
          placeholder={placeholder}
          name={"q"}
          form={form}
          setForm={setForm}
        />

        <View style={styles(theme).searchActions}>
          <View style={styles(theme).searchBtn}>
            <PrimaryButton
              type={"secondary"}
              title={"Filter Result"}
              onPress={() => setModalIsVisible(true)}
            />
          </View>

          <View style={styles(theme).searchBtn}>
            <PrimaryButton title={"Search"} onPress={() => onSubmit()} />
          </View>
        </View>
      </View>

      {/**search summary */}
      {(Boolean(form?.q != "") ||
        Boolean(form?.sort != "" && form?.sort != "all")) && (
        <View style={styles(theme).summTab}>
          {Boolean(form?.q != "") && (
            <Text style={styles(theme).summText} numberOfLines={1}>
              Showing results for:{" "}
              <Text style={styles(theme).summValue}>{form?.q}</Text>
            </Text>
          )}
          {Boolean(form?.sort != "" && form?.sort != "all") && (
            <Text style={styles(theme).summText}>
              Filter:{" "}
              <Text style={styles(theme).summValue}>
                {String(form?.sort)?.toUpperCase()}
              </Text>
            </Text>
          )}
        </View>
      )}

      {/**filter modal popup */}
      <PopupModalWrapper
        title={"Filter Result"}
        isVisible={modalIsVisible}
        setIsVisible={setModalIsVisible}
      >
        <View style={styles(theme).filterCont}>
          {filter_array?.length > 0 &&
            filter_array?.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles(theme).filterTab}
                onPress={() => selectFilter(item)}
              >
                <Text style={styles(theme).filterText(form["sort"] === item)}>
                  {String(item)?.toUpperCase()}
                </Text>

                {/**check selected */}
                {form["sort"] === item && (
                  <Octicons
                    name="check"
                    size={16}
                    color={COLOR_THEME[theme].success}
                  />
                )}
              </TouchableOpacity>
            ))}
        </View>
      </PopupModalWrapper>
    </>
  );
};

export default memo(PageSearchComponent);

const styles = (theme) =>
  StyleSheet.create({
    searchBox: {
      width: "100%",
      paddingHorizontal: 16,
      paddingBottom: 16,
      backgroundColor: COLOR_THEME[theme].white,
      borderBottomWidth: 0.8,
      borderBottomColor: COLOR_THEME[theme].gray50,
      gap: 16,
    },
    searchActions: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    searchBtn: {
      width: SCREEN_DIMENSION.halfWidth(16, 32),
    },
    filterCont: {
      width: "100%",
      gap: 16,
    },
    filterTab: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      paddingBottom: 8,
    },
    filterText: (chosen) => ({
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.regular,
      color: chosen ? COLOR_THEME[theme].black : COLOR_THEME[theme].gray100,
    }),
    summTab: {
      padding: 16,
      gap: 8,
    },
    summText: {
      maxWidth: "100%",
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray200,
    },
    summValue: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].black,
    },
  });
