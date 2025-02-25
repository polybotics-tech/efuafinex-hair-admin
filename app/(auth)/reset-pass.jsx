import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import AuthScreenWrapper from "../../components/ui/AuthScreenWrapper";
import AuthFormComponent from "../../components/AuthFormComponent";
import { Octicons } from "@expo/vector-icons";
import { COLOR_THEME } from "../../constants/theme";
import { AUTH_HOOKS } from "../../helpers/hooks/auth";
import { router } from "expo-router";
import { DEBOUNCE } from "../../helpers/utils/debounce";
import { useSelector } from "react-redux";

export default function VerifyEmail() {
  const theme = useSelector((state) => state.app.theme);

  const [formData, setFormData] = useState({
    new_passcode: "",
    confirm_passcode: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  //handle form submission
  const submitForm = DEBOUNCE(async () => {
    const success = await AUTH_HOOKS.reset_pass(formData, setIsLoading);

    if (success) {
      //redirect to login page
      router.dismissTo("/login/");
    }
  });

  return (
    <AuthScreenWrapper
      title={"Reset Passcode"}
      subText={"Forgot your passcode? Change it to one you can remember"}
      buttonText={"Reset"}
      buttonIsLoading={isLoading}
      formSubmitFunction={submitForm}
    >
      {/**passcode */}
      <AuthFormComponent
        formType={"input"}
        inputMode={"password"}
        inputIcon={
          <Octicons name="lock" size={16} color={COLOR_THEME[theme].gray200} />
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
          <Octicons name="lock" size={16} color={COLOR_THEME[theme].gray200} />
        }
        label={"Confirm Passcode"}
        placeholder={"Retype passcode"}
        name={"confirm_passcode"}
        form={formData}
        setForm={setFormData}
      />
    </AuthScreenWrapper>
  );
}

const styles = (theme) => StyleSheet.create({});
