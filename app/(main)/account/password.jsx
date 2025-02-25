import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import AuthScreenWrapper from "../../../components/ui/AuthScreenWrapper";
import AuthFormComponent from "../../../components/AuthFormComponent";
import { Octicons } from "@expo/vector-icons";
import { COLOR_THEME } from "../../../constants/theme";
import { router } from "expo-router";
import { USER_HOOKS } from "../../../helpers/hooks/user";
import { DEBOUNCE } from "../../../helpers/utils/debounce";
import { useSelector } from "react-redux";

export default function VerifyEmail() {
  const theme = useSelector((state) => state.app.theme);

  const [formData, setFormData] = useState({
    passcode: "",
    new_passcode: "",
    confirm_passcode: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  //handle form submission
  const submitForm = DEBOUNCE(async () => {
    const success = await USER_HOOKS.update_pass(formData, setIsLoading);

    if (success) {
      //redirect to back to account page
      router.back();
    }
  });

  return (
    <View style={styles(theme).safeArea}>
      <AuthScreenWrapper
        buttonText={"Change"}
        buttonIsLoading={isLoading}
        formSubmitFunction={submitForm}
      >
        {/**current password */}
        <AuthFormComponent
          formType={"input"}
          inputMode={"password"}
          inputIcon={
            <Octicons
              name="lock"
              size={16}
              color={COLOR_THEME[theme].gray200}
            />
          }
          label={"Current Passcode"}
          placeholder={"Enter your current passcode"}
          name={"passcode"}
          form={formData}
          setForm={setFormData}
        />

        {/**new passcode */}
        <AuthFormComponent
          formType={"input"}
          inputMode={"password"}
          inputIcon={
            <Octicons
              name="lock"
              size={16}
              color={COLOR_THEME[theme].gray200}
            />
          }
          label={"New Passcode"}
          placeholder={"Enter a new passcode"}
          name={"new_passcode"}
          form={formData}
          setForm={setFormData}
        />

        {/**confirm passcode */}
        <AuthFormComponent
          formType={"input"}
          inputMode={"password"}
          inputIcon={
            <Octicons
              name="lock"
              size={16}
              color={COLOR_THEME[theme].gray200}
            />
          }
          label={"Confirm Passcode"}
          placeholder={"Retype passcode"}
          name={"confirm_passcode"}
          form={formData}
          setForm={setFormData}
        />
      </AuthScreenWrapper>
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
