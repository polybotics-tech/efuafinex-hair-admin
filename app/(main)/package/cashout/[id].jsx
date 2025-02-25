import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import SafeAreaWrapper from "../../../../components/ui/safeAreaWrapper";
import DefaultHeaderComponent from "../../../../components/DefaultHeaderComponent";
import ScrollViewWrapper from "../../../../components/ui/ScrollViewWrapper";
import AuthScreenWrapper from "../../../../components/ui/AuthScreenWrapper";
import { router, useLocalSearchParams } from "expo-router";
import AuthFormComponent from "../../../../components/AuthFormComponent";
import { PACKAGE_HOOKS } from "../../../../helpers/hooks/package";
import {
  COLOR_THEME,
  FONT_SIZE,
  FONT_WEIGHT,
  MINIMUM_DEPOSIT,
  NAIRA_CURRENCY,
  SCREEN_DIMENSION,
} from "../../../../constants";
import { FontAwesome6, Octicons } from "@expo/vector-icons";
import { format_number } from "../../../../helpers/utils/numbers";

import { WebView } from "react-native-webview";
import PopupModalWrapper from "../../../../components/ui/PopupModalWrapper";
import { Alert } from "../../../../helpers/utils/alert";
import { DEPOSIT_HOOKS } from "../../../../helpers/hooks/deposit";
import { DEBOUNCE } from "../../../../helpers/utils/debounce";
import { useSelector } from "react-redux";
import NotFoundComponent from "../../../../components/reuseables/NotFoundComponent";
import { BORDER_RADIUS } from "../../../../constants/theme";
import { BANK_LIST } from "../../../../helpers/json";
import ImageComponent from "../../../../components/reuseables/ImageComponent";
import { IMAGE_LOADER } from "../../../../helpers/utils/image-loader";
import { extract_name_from_bank_code } from "../../../../helpers/utils";
import PrimaryButton from "../../../../components/reuseables/PrimaryButton";
import { TRANSFER_HOOKS } from "../../../../helpers/hooks/transfer";

export default function CashOut() {
  const theme = useSelector((state) => state.app.theme);

  const { id } = useLocalSearchParams();

  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState();

  //fetch package details
  const fetchPackage = DEBOUNCE(async (id) => {
    const result = await PACKAGE_HOOKS.fetch_single_package(setIsLoading, id);

    if (result) {
      setData(result);
    }
  }, 5);

  useEffect(() => {
    if (id) {
      fetchPackage(id);
    }
  }, [id]);

  return (
    <SafeAreaWrapper>
      <DefaultHeaderComponent directory={"cashout"} />

      <ScrollViewWrapper
        style={styles(theme).page}
        refreshFunc={() => fetchPackage(id)}
      >
        {!data ? (
          <NotFoundComponent
            text={"Unable to fetch package data"}
            isLoading={isLoading}
          />
        ) : (
          <>
            {/**preview */}
            <PreviewData theme={theme} data={data} />

            {/**transfer component */}
            {Boolean(data?.transfer_record) &&
            Boolean(data?.transfer_record?.transfer_code) &&
            Boolean(
              data?.transfer_record?.status != "success" ||
                data?.transfer_record?.status != "failed"
            ) ? (
              <PendingTransferComponent
                theme={theme}
                refreshFunc={() => fetchPackage(id)}
                transfer_code={data?.transfer_record?.transfer_code}
              />
            ) : (
              <TransferComponent
                theme={theme}
                refreshFunc={() => fetchPackage(id)}
              />
            )}
          </>
        )}
      </ScrollViewWrapper>
    </SafeAreaWrapper>
  );
}

const PreviewData = ({ theme, data }) => {
  return (
    <View style={styles(theme).previewComp}>
      <Text style={styles(theme).sectionHeader}>Request Summary</Text>
      <PDTab
        theme={theme}
        title={"Amount"}
        value={`${NAIRA_CURRENCY} ${format_number(
          data?.available_amount || 0
        )}`}
      />
      <PDTab theme={theme} title={"Package Id"} value={data?.package_id} />
      <PDTab theme={theme} title={"Title"} value={data?.title} />
    </View>
  );
};

const PDTab = ({ theme, title, value }) => {
  return (
    <View style={styles(theme).pdTab}>
      <Text style={styles(theme).pdTitle}>{title}</Text>
      <Text style={styles(theme).pdValue}>{value}</Text>
    </View>
  );
};

const TransferComponent = ({ theme, refreshFunc = () => {} }) => {
  const { id } = useLocalSearchParams();

  const [formData, setFormData] = useState({
    account_number: "",
    bank_code: null,
    account_name: "",
    recipient_code: "",
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  //refresh form if bank change
  useEffect(() => {
    setFormData((prev) => ({ ...prev, account_name: "", recipient_code: "" }));
  }, [formData?.bank_code, formData?.account_number]);

  //handle account verification from server
  const [verificationLoading, setVerificationLoading] = useState(false);
  const _verifyAccount = DEBOUNCE(async () => {
    const { account_number, bank_code } = formData;
    const res = await TRANSFER_HOOKS.verify_transfer_account(
      setVerificationLoading,
      account_number,
      bank_code
    );

    if (res) {
      const { account_name, recipient_code } = res;

      setFormData((prev) => ({ ...prev, account_name, recipient_code }));
      console.log("recipient_code: ", recipient_code);
    }
  });

  //handle request for transfer
  const [validateOtp, setValidateOtp] = useState(false);
  const [transfer_code, setTransferCode] = useState("");
  const _requestForTransfer = DEBOUNCE(async () => {
    const res = await TRANSFER_HOOKS.request_funds_transfer(
      formData,
      setIsLoading,
      id
    );

    if (res) {
      const { status, transfer_code } = res;

      if (String(status)?.toLowerCase() === "otp") {
        setTransferCode(transfer_code);
        setValidateOtp(true);
        return;
      }
    }
  });

  return (
    <>
      {/**request transfer component */}
      <View style={styles(theme).transferComp}>
        <Text style={styles(theme).sectionHeader}>
          Provide Account Information
        </Text>

        {/** form */}
        <View style={styles(theme).form}>
          {/**account number */}
          <AuthFormComponent
            formType={"input"}
            inputMode={"numeric"}
            inputIcon={
              <Octicons
                name="number"
                size={18}
                color={COLOR_THEME[theme].gray100}
              />
            }
            label={"Account Number"}
            placeholder={"Enter 10-digit account number"}
            name={"account_number"}
            form={formData}
            setForm={setFormData}
          />

          {/**selected bank */}
          {Boolean(formData?.bank_code) && (
            <AuthFormComponent
              formType={"input"}
              inputMode={"text"}
              inputIcon={
                <Octicons
                  name="book"
                  size={18}
                  color={COLOR_THEME[theme].gray100}
                />
              }
              label={"Bank Name"}
              placeholder={"Select a bank"}
              disabled={true}
              value={String(
                extract_name_from_bank_code(formData?.bank_code)
              )?.toUpperCase()}
            />
          )}

          {/**bank selector */}
          {Boolean(formData?.account_number) &&
            String(formData?.account_number)?.length >= 9 && (
              <BankSelector
                theme={theme}
                name={"bank_code"}
                form={formData}
                setForm={setFormData}
              />
            )}

          {/**account name */}
          {Boolean(formData?.account_name != "") && (
            <AuthFormComponent
              formType={"input"}
              inputMode={"text"}
              inputIcon={
                <Octicons
                  name="book"
                  size={18}
                  color={COLOR_THEME[theme].gray100}
                />
              }
              label={"Verified Account Name"}
              placeholder={"Verify account"}
              disabled={true}
              value={String(formData?.account_name)?.toUpperCase()}
            />
          )}

          {/**reason */}
          {Boolean(
            formData?.account_number &&
              formData?.bank_code &&
              formData?.account_name &&
              formData?.recipient_code
          ) && (
            <AuthFormComponent
              formType={"textarea"}
              inputMode={"text"}
              label={"Reason"}
              placeholder={"Why do you need this fund?"}
              description={
                "Make reason clear for easy understanding during later reviews"
              }
              name={"reason"}
              form={formData}
              setForm={setFormData}
            />
          )}

          {/**submit button */}
          <View style={{ marginTop: 32 }}>
            {Boolean(formData?.account_number && formData?.bank_code) &&
              Boolean(!formData?.account_name && !formData?.recipient_code) && (
                <PrimaryButton
                  title={"Verify Bank Account"}
                  isLoading={verificationLoading}
                  type={"secondary"}
                  onPress={() => _verifyAccount()}
                />
              )}

            {Boolean(
              formData?.account_number &&
                formData?.bank_code &&
                formData?.account_name &&
                formData?.recipient_code &&
                formData?.reason
            ) && (
              <PrimaryButton
                title={"Request Funds"}
                isLoading={isLoading}
                onPress={() => _requestForTransfer()}
              />
            )}
          </View>
        </View>
      </View>

      {/**validate transfer otp */}
      <OTPValidationComponent
        theme={theme}
        isVisible={validateOtp}
        setIsVisible={setValidateOtp}
        transfer_code={transfer_code}
        refreshFunc={() => refreshFunc()}
      />
    </>
  );
};

const PendingTransferComponent = ({
  theme,
  refreshFunc = () => {},
  transfer_code,
}) => {
  const [validateOtp, setValidateOtp] = useState(false);

  //handle resend otp
  const [isLoading, setIsLoading] = useState(false);
  const _resendOTP = DEBOUNCE(async () => {
    let res = await TRANSFER_HOOKS.resend_transfer_otp(
      setIsLoading,
      transfer_code
    );

    if (res) {
      setValidateOtp(true);
    }
  });

  return (
    <>
      <View style={styles(theme).pendingTab}>
        <Text style={styles(theme).pendingTabTitle}>
          Resolve Pending Request
        </Text>

        <Text style={styles(theme).pendingTabValue}>
          You have an unsettled cashout request for this package. Please click
          the button below to validate the existing request.
        </Text>

        <PrimaryButton
          title={"Resolve Request"}
          onPress={() => _resendOTP()}
          isLoading={isLoading}
        />
      </View>

      {/**validate transfer otp */}
      <OTPValidationComponent
        theme={theme}
        isVisible={validateOtp}
        setIsVisible={setValidateOtp}
        transfer_code={transfer_code}
        refreshFunc={() => refreshFunc()}
      />
    </>
  );
};

const BankSelector = ({ theme, name, form, setForm }) => {
  const [isVisible, setIsVisible] = useState(false);

  const select_bank = (bank_code) => {
    setForm((prev) => ({ ...prev, [name]: bank_code }));
    setIsVisible(false);
  };

  return (
    <>
      {/**selector */}
      <TouchableOpacity
        style={styles(theme).selectTab}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles(theme).selectButton}>
          {Boolean(form[name]) ? "Change" : "Select"} Bank
        </Text>
      </TouchableOpacity>

      {/**select bank */}
      <PopupModalWrapper
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        title={"Select Bank"}
        containerStyle={{ gap: 16 }}
      >
        {BANK_LIST?.map((bank, index) => (
          <TouchableOpacity
            key={index}
            style={styles(theme).bankTab}
            onPress={() => select_bank(bank?.code)}
          >
            <View style={styles(theme).bankTabThumbnail}>
              <ImageComponent
                uri={IMAGE_LOADER.bank_thumbnail(bank?.logo)}
                blur={"1"}
                scale={true}
              />
            </View>

            <Text style={styles(theme).bankTabName}>
              {String(bank?.name)?.toUpperCase()}
            </Text>

            {Boolean(bank?.code === form[name]) && (
              <Octicons
                name="check"
                size={16}
                color={COLOR_THEME[theme].success}
              />
            )}
          </TouchableOpacity>
        ))}
      </PopupModalWrapper>
    </>
  );
};

const OTPValidationComponent = ({
  theme,
  isVisible,
  setIsVisible,
  transfer_code,
  refreshFunc = () => {},
}) => {
  const { id } = useLocalSearchParams();

  const [formData, setFormData] = useState({
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  //handle otp validation
  const _validateOTP = DEBOUNCE(async () => {
    let res = await TRANSFER_HOOKS.finalize_transfer_with_otp(
      formData,
      setIsLoading,
      transfer_code
    );

    if (res) {
      if (router.canDismiss()) {
        router.dismiss(2);
      }
      router.push(`/reciept/transfer/${id}`);
    }
  });

  //handle resend otp
  const [otpLoading, setOtpLoading] = useState(false);
  const _resendOTP = DEBOUNCE(async () => {
    await TRANSFER_HOOKS.resend_transfer_otp(setOtpLoading, transfer_code);

    //try to close nd reopen the modal
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }, 50);
  });

  return (
    <>
      <PopupModalWrapper
        title={"OTP Validation"}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        containerStyle={{ gap: 32 }}
      >
        <Text style={styles(theme).otpMsg}>
          To avoid unapproved request of funds, a One-Time-Password has been
          sent to the phone number and email address of the platform's admin.
          Enter this OTP to validate this transfer request.
        </Text>

        <AuthScreenWrapper
          buttonText={"Validate Transfer Request"}
          buttonIsLoading={isLoading}
          buttonIsDisabled={Boolean(!formData?.otp)}
          formSubmitFunction={() => _validateOTP()}
        >
          <AuthFormComponent
            formType={"input"}
            inputMode={"numeric"}
            inputIcon={
              <Octicons
                name="number"
                size={18}
                color={COLOR_THEME[theme].gray100}
              />
            }
            label={"One-Time-Password (OTP)"}
            placeholder={"Enter the OTP sent for validation"}
            name={"otp"}
            form={formData}
            setForm={setFormData}
          />

          {/**resend */}
          <TouchableOpacity
            style={styles(theme).otpResendBtn}
            disabled={otpLoading}
            onPress={() => _resendOTP()}
          >
            {otpLoading ? (
              <ActivityIndicator
                size={FONT_SIZE.s}
                color={COLOR_THEME[theme].primary}
              />
            ) : (
              <Text style={styles(theme).otpResend}>Resend OTP</Text>
            )}
          </TouchableOpacity>
        </AuthScreenWrapper>
      </PopupModalWrapper>
    </>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    page: {
      width: "100%",
      minHeight: "100%",
      paddingVertical: 16,
      backgroundColor: COLOR_THEME[theme].white,
      gap: 16,
    },
    previewComp: {
      width: "100%",
      paddingHorizontal: 16,
    },
    pdTab: {
      width: "100%",
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      borderBottomWidth: 0.8,
      borderBottomColor: COLOR_THEME[theme].gray50,
    },
    pdTitle: {
      maxWidth: 90,
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray200,
    },
    pdValue: {
      maxWidth: SCREEN_DIMENSION.subtractWidth(16, 32 + 32, 90),
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].black,
      textAlign: "right",
    },
    sectionHeader: {
      fontSize: FONT_SIZE.b,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].black,
      paddingBottom: 16,
      textAlign: "center",
    },
    transferComp: {
      width: "100%",
      padding: 16,
      marginBottom: 92,
    },
    selectTab: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      marginHorizontal: "auto",
    },
    selectButton: {
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].primary,
    },
    bankTab: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    bankTabThumbnail: {
      width: 48,
      height: 48,
      borderRadius: BORDER_RADIUS.xs,
      backgroundColor: COLOR_THEME[theme].gray50,
      overflow: "hidden",
    },
    bankTabName: {
      width: SCREEN_DIMENSION.subtractWidth(8 + 8, 32, 48 + 16),
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].gray200,
    },
    form: {
      paddingVertical: 16,
      gap: 16,
    },
    otpMsg: {
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray200,
      textAlign: "center",
    },
    otpResendBtn: {
      width: "100%",
      paddingVertical: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    otpResend: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].primary,
      textAlign: "center",
    },
    pendingTab: {
      width: "100%",
      padding: 16,
      alignItems: "center",
      gap: 16,
    },
    pendingTabTitle: {
      fontSize: FONT_SIZE.b,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].black,
      textAlign: "center",
    },
    pendingTabValue: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray100,
      textAlign: "center",
      marginBottom: 48,
    },
  });
