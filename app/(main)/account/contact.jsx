import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { memo, useEffect, useState } from "react";
import { COLOR_THEME, FONT_SIZE, FONT_WEIGHT } from "../../../constants";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import AuthFormComponent from "../../../components/AuthFormComponent";
import AuthScreenWrapper from "../../../components/ui/AuthScreenWrapper";
import { DEBOUNCE } from "../../../helpers/utils/debounce";
import { FAQS_HOOKS } from "../../../helpers/hooks/faqs";
import { router } from "expo-router";
import NotFoundComponent from "../../../components/reuseables/NotFoundComponent";

export default function ContactUs() {
  const theme = useSelector((state) => state.app.theme);

  const [formData, setFormData] = useState({
    email: "",
    instagram: "",
    whatsapp: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  //handle fetching existing contact info
  const fetch_contact_info = async () => {
    const res = await FAQS_HOOKS.fetch_contact_info(setIsLoading);

    if (res) {
      const { email, instagram, whatsapp } = res;

      setFormData((prev) => ({ ...prev, email, instagram, whatsapp }));
    }
  };

  useEffect(() => {
    fetch_contact_info();
  }, []);

  //handle form submission
  const [btnLoading, setBtnLoading] = useState(false);
  const submitForm = DEBOUNCE(async () => {
    const success = await FAQS_HOOKS.update_contact_info(
      formData,
      setBtnLoading
    );

    if (success) {
      //redirect to back to account page
      router.back();
    }
  });

  return (
    <View style={styles(theme).safeArea}>
      {isLoading ? (
        <NotFoundComponent isLoading={isLoading} />
      ) : (
        <AuthScreenWrapper
          buttonText={"Update"}
          buttonIsLoading={btnLoading}
          buttonIsDisabled={isLoading}
          formSubmitFunction={submitForm}
        >
          {/**email */}
          <AuthFormComponent
            formType={"input"}
            inputMode={"email"}
            inputIcon={
              <Ionicons
                name="mail-outline"
                size={16}
                color={COLOR_THEME[theme].gray200}
              />
            }
            label={"Email address"}
            placeholder={"Enter company's email address"}
            name={"email"}
            form={formData}
            setForm={setFormData}
          />

          {/**instagram */}
          <AuthFormComponent
            formType={"input"}
            inputMode={"text"}
            inputIcon={
              <Ionicons
                name="logo-instagram"
                size={16}
                color={COLOR_THEME[theme].gray200}
              />
            }
            label={"Instagram handle"}
            placeholder={"Enter instagram profile link"}
            name={"instagram"}
            form={formData}
            setForm={setFormData}
          />

          {/**whatsapp */}
          <AuthFormComponent
            formType={"input"}
            inputMode={"numeric"}
            inputIcon={
              <Ionicons
                name="logo-whatsapp"
                size={16}
                color={COLOR_THEME[theme].gray200}
              />
            }
            label={"Whatsapp number"}
            placeholder={"Enter available whatsapp number"}
            name={"whatsapp"}
            form={formData}
            setForm={setFormData}
          />
        </AuthScreenWrapper>
      )}
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    safeArea: {
      width: "100%",
      padding: 16,
    },
  });
