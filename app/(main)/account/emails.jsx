import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DEBOUNCE } from "../../../helpers/utils/debounce";
import { FAQS_HOOKS } from "../../../helpers/hooks/faqs";
import AuthScreenWrapper from "../../../components/ui/AuthScreenWrapper";
import AuthFormComponent from "../../../components/AuthFormComponent";
import { Octicons } from "@expo/vector-icons";
import {
  COLOR_THEME,
  FONT_SIZE,
  FONT_WEIGHT,
  SCREEN_DIMENSION,
} from "../../../constants";
import PopupModalWrapper from "../../../components/ui/PopupModalWrapper";
import { BORDER_RADIUS } from "../../../constants/theme";
import { USER_HOOKS } from "../../../helpers/hooks/user";
import NotFoundComponent from "../../../components/reuseables/NotFoundComponent";
import SeeMoreBtn from "../../../components/reuseables/SeeMoreBtn";
import ImageComponent from "../../../components/reuseables/ImageComponent";
import { IMAGE_LOADER } from "../../../helpers/utils/image-loader";
import { router } from "expo-router";

export default function BulkEmails() {
  const theme = useSelector((state) => state.app.theme);

  const [formData, setFormData] = useState({
    subject: "",
    body: "",
    recipients: [],
    is_bulk: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  //handle form submission
  const submitForm = DEBOUNCE(async () => {
    const success = await FAQS_HOOKS.send_bulk_mail(formData, setIsLoading);

    if (success) {
      //redirect to back to account page
      router.back();
    }
  });

  return (
    <View style={styles(theme).safeArea}>
      <AuthScreenWrapper
        buttonText={"Send email"}
        buttonIsLoading={isLoading}
        formSubmitFunction={submitForm}
      >
        {/**subject */}
        <AuthFormComponent
          formType={"input"}
          inputMode={"text"}
          inputIcon={
            <Octicons
              name="book"
              size={16}
              color={COLOR_THEME[theme].gray200}
            />
          }
          label={"Subject"}
          placeholder={"Enter subject of the mail"}
          description={"Try to make this short and simple with no emoji"}
          name={"subject"}
          form={formData}
          setForm={setFormData}
        />

        {/**body */}
        <AuthFormComponent
          formType={"textarea"}
          inputMode={"text"}
          label={"Body of the mail"}
          placeholder={"What information would you want to share?"}
          name={"body"}
          form={formData}
          setForm={setFormData}
        />

        {/**bulk to all selection */}
        <AuthFormComponent
          formType={"toggle"}
          label={"Send To All Users"}
          placeholder={
            "Turn off this option if you wish to send email to only a selected set of users instead."
          }
          name={"is_bulk"}
          form={formData}
          setForm={setFormData}
        />

        {/**dynamic mood for recipient selection */}
        {!Boolean(formData?.is_bulk) && (
          <RecipientBlock
            theme={theme}
            name={"recipients"}
            form={formData}
            setForm={setFormData}
          />
        )}
      </AuthScreenWrapper>
    </View>
  );
}

const RecipientBlock = ({ theme, name, form, setForm }) => {
  const [isVisible, setIsVisible] = useState(false);

  //user search form
  const [formData, setFormData] = useState({
    q: "",
  });

  //handle search function
  const [users, setUsers] = useState();
  const [meta, setMeta] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const search_users = async (page) => {
    const { q } = formData;
    const res = await USER_HOOKS.fetch_multiple_users(
      setIsLoading,
      page,
      "all",
      q
    );

    if (res) {
      const { users, meta } = res;
      const { page } = meta;

      setMeta(meta);

      //check appending format
      if (page === 1) {
        setUsers(users);
      } else {
        setUsers((prev) => [...prev, ...users]);
      }
    }
  };

  useEffect(() => {
    //run search function for any slight change
    const searchFunc = DEBOUNCE(() => {
      setUsers(null);
      search_users(1);
    });

    searchFunc();
  }, [formData?.q]);

  //handle see more function
  const see_more = DEBOUNCE(async () => {
    if (Boolean(meta?.has_next_page)) {
      search_users(Number(meta?.page + 1));
    }
  });
  //////

  return (
    <>
      {/**main block */}
      <View style={styles(theme).rblock}>
        <View style={styles(theme).rblockTop}>
          <Text style={styles(theme).rblockTitle}>Choose Recipient(s)</Text>

          {/**add button */}
          <TouchableOpacity
            style={styles(theme).rblockFindBtn}
            onPress={() => setIsVisible(true)}
          >
            <Octicons
              name="search"
              size={14}
              color={COLOR_THEME[theme].gray200}
            />
            <Text style={styles(theme).rblockFindText}>Find Users</Text>
          </TouchableOpacity>
        </View>

        {/**users list */}
        <View style={styles(theme).rblockList}>
          {form[name]?.length > 0 ? (
            form[name]?.map((item, index) => (
              <SelectedUserTab
                key={index}
                theme={theme}
                email={item}
                name={name}
                form={form}
                setForm={setForm}
              />
            ))
          ) : (
            <View style={styles(theme).rblockNoUser}>
              <Text style={styles(theme).rblockNoUserText}>
                No user selected
              </Text>
            </View>
          )}
        </View>
      </View>

      {/**search block */}
      <PopupModalWrapper
        title={"Find Users"}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        containerStyle={{ gap: 16 }}
      >
        {/**search box */}
        <AuthFormComponent
          formType={"input"}
          inputMode={"text"}
          inputIcon={
            <Octicons
              name="search"
              size={16}
              color={COLOR_THEME[theme].gray200}
            />
          }
          placeholder={"Search users by name, or email"}
          name={"q"}
          form={formData}
          setForm={setFormData}
        />

        {/**search result */}
        {users?.length > 0 ? (
          users?.map((item, index) => (
            <SearchedUserCard
              key={index}
              theme={theme}
              user={item}
              name={name}
              form={form}
              setForm={setForm}
            />
          ))
        ) : (
          <NotFoundComponent text={"No user found"} isLoading={isLoading} />
        )}

        {/**see more button */}
        {meta?.has_next_page && (
          <SeeMoreBtn onPress={() => see_more()} isLoading={isLoading} />
        )}
      </PopupModalWrapper>
    </>
  );
};

const SearchedUserCard = ({ theme, user, name, form, setForm }) => {
  const { email, fullname, thumbnail, thumbnail_blur } = user;

  const addEmail = (target) => {
    //check if target in recipients
    if (Boolean(form[name]?.includes(target))) {
      return;
    }

    //append target to recipient
    let recipients = [...form[name]];
    recipients.push(target);

    //update form data
    setForm((prev) => ({ ...prev, recipients }));
  };

  return (
    <View style={styles(theme).userCard}>
      <View style={styles(theme).userCardDetails}>
        <View style={styles(theme).userCardThumbnail}>
          <ImageComponent
            uri={IMAGE_LOADER.user_thumbnail(thumbnail)}
            blur={thumbnail_blur}
          />
        </View>

        <View style={styles(theme).userCardData}>
          <Text style={styles(theme).userCardName} numberOfLines={1}>
            {fullname}
          </Text>
          <Text style={styles(theme).userCardMail} numberOfLines={1}>
            {email}
          </Text>
        </View>
      </View>

      {/**add button */}
      {!Boolean(form[name]?.includes(email)) && (
        <TouchableOpacity
          style={styles(theme).userCardButton}
          onPress={() => addEmail(email)}
        >
          <Text style={styles(theme).userCardButtonText}>Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const SelectedUserTab = ({ theme, email, name, form, setForm }) => {
  function removeEmail(target) {
    let recipients = form[name]?.filter((e) => e !== target);
    //update the form data
    setForm((prev) => ({ ...prev, recipients }));
  }

  return (
    <View style={styles(theme).rbSelectedUser}>
      <Text style={styles(theme).rbSelectedUserMail}>{email}</Text>
      <TouchableOpacity
        style={styles(theme).rbSelectedUserBtn}
        onPress={() => removeEmail(email)}
      >
        <Octicons name="x" size={14} color={COLOR_THEME[theme].gray200} />
      </TouchableOpacity>
    </View>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    safeArea: {
      width: "100%",
      padding: 16,
    },
    rblock: {
      width: "100%",
      paddingVertical: 16,
      gap: 16,
      borderTopWidth: 0.8,
      borderTopColor: COLOR_THEME[theme].gray100,
    },
    rblockTop: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    rblockTitle: {
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].black,
    },
    rblockFindBtn: {
      width: 120,
      height: 36,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      borderWidth: 0.8,
      borderColor: COLOR_THEME[theme].gray200,
      borderRadius: BORDER_RADIUS.s,
    },
    rblockFindText: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].gray200,
    },
    rblockList: {
      width: "100%",
      minHeight: 48,
      height: "auto",
      padding: 16,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      borderRadius: BORDER_RADIUS.s,
      backgroundColor: COLOR_THEME[theme].gray50,
    },
    rblockNoUser: {
      width: "100%",
      height: "100%",
      maxHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    rblockNoUserText: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray100,
    },
    rbSelectedUser: {
      paddingVertical: 6,
      paddingHorizontal: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: BORDER_RADIUS.xs,
      backgroundColor: COLOR_THEME[theme].white,
    },
    rbSelectedUserMail: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray200,
    },
    rbSelectedUserBtn: {
      width: 18,
      height: 18,
      borderRadius: BORDER_RADIUS.xs,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 0.8,
      borderColor: COLOR_THEME[theme].gray200,
    },
    userCard: {
      width: "100%",
      marginBottom: 16,
      borderRadius: BORDER_RADIUS.s,
      backgroundColor: COLOR_THEME[theme].white,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    userCardDetails: {
      width: SCREEN_DIMENSION.subtractWidth(16, 32, 48),
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    userCardThumbnail: {
      width: 48,
      height: 48,
      borderRadius: BORDER_RADIUS.r,
      backgroundColor: COLOR_THEME[theme].gray50,
      overflow: "hidden",
      borderWidth: 0.8,
      borderColor: COLOR_THEME[theme].gray100,
    },
    userCardData: {
      width: SCREEN_DIMENSION.subtractWidth(8 + 16, 32, 48 + 48),
      gap: 2,
    },
    userCardName: {
      maxWidth: "100%",
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].black,
      textTransform: "capitalize",
    },
    userCardMail: {
      maxWidth: "100%",
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray100,
    },
    userCardButton: {
      width: 48,
      paddingVertical: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    userCardButtonText: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].primary,
    },
  });
