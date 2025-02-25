import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import AuthScreenWrapper from "../../components/ui/AuthScreenWrapper";
import AuthFormComponent from "../../components/AuthFormComponent";
import { Octicons } from "@expo/vector-icons";
import { COLOR_THEME } from "../../constants/theme";
import { AUTH_HOOKS } from "../../helpers/hooks/auth";
import { router, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import NotFoundComponent from "../../components/reuseables/NotFoundComponent";
import { DEBOUNCE } from "../../helpers/utils/debounce";

export default function VerifyEmail() {
  const theme = useSelector((state) => state.app.theme);

  const { ref } = useLocalSearchParams();
  const admin = useSelector((state) => state.admin.admin);

  const [data, setData] = useState();

  //generate otp
  const generateOtp = async () => {
    const res = await AUTH_HOOKS.generate_otp(
      { admin_id: admin?.admin_id },
      setIsLoading
    );

    if (res) {
      setData(res);
    }
  };

  useEffect(() => {
    generateOtp();
  }, []);

  const [formData, setFormData] = useState({
    otp: "",
    admin_id: admin?.admin_id,
  });
  const [isLoading, setIsLoading] = useState(false);

  //handle form submission
  const submitForm = DEBOUNCE(async () => {
    const verified = await AUTH_HOOKS.verify_otp(formData, setIsLoading);

    if (verified) {
      if (ref && ref === "forgot") {
        //redirect to reset password page
        router.dismissTo("/reset-pass/");
      } else {
        //redirect to home page
        router.dismissTo("/(tabs)/");
      }
    }
  });

  return (
    <AuthScreenWrapper
      title={"Verify Email"}
      subText={`An OTP has been sent to ${admin?.email}`}
      switchText={"Resend"}
      bottomText={"Didn't get code?"}
      switchPath={`/verify/?ref=${ref}`}
      buttonText={"Verify"}
      buttonIsLoading={isLoading}
      formSubmitFunction={submitForm}
    >
      {!data ? (
        <NotFoundComponent
          text={"Something went wrong. Click below to resend code"}
          isLoading={isLoading}
        />
      ) : (
        <AuthFormComponent
          formType={"input"}
          inputMode={"numeric"}
          inputIcon={
            <Octicons
              name="number"
              size={16}
              color={COLOR_THEME[theme].gray200}
            />
          }
          label={"6-digit OTP"}
          placeholder={"Ex. 123456"}
          name={"otp"}
          form={formData}
          setForm={setFormData}
        />
      )}
    </AuthScreenWrapper>
  );
}

const styles = (theme) => StyleSheet.create({});
