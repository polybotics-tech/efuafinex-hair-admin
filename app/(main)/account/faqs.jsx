import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BORDER_RADIUS,
  COLOR_THEME,
  FONT_SIZE,
  FONT_WEIGHT,
} from "../../../constants/theme";
import { Ionicons, Octicons } from "@expo/vector-icons";
import SeeMoreBtn from "../../../components/reuseables/SeeMoreBtn";
import NotFoundComponent from "../../../components/reuseables/NotFoundComponent";
import { FAQS_HOOKS } from "../../../helpers/hooks/faqs";
import PopupModalWrapper from "../../../components/ui/PopupModalWrapper";
import AuthScreenWrapper from "../../../components/ui/AuthScreenWrapper";
import { DEBOUNCE } from "../../../helpers/utils/debounce";
import AuthFormComponent from "../../../components/AuthFormComponent";
import PrimaryButton from "../../../components/reuseables/PrimaryButton";

export default function ManageFaqs() {
  const theme = useSelector((state) => state.app.theme);

  const [faqs, setFaqs] = useState();
  const [meta, setMeta] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const fetchFaqs = async (page = 1) => {
    //send request
    const result = await FAQS_HOOKS.fetch_faqs(setIsLoading, page);

    if (result) {
      setMeta(result?.meta);

      if (page > 1 && result?.faqs) {
        setFaqs((prev) => [...prev, ...result?.faqs]);
      } else {
        setFaqs(result?.faqs);
      }
    }
  };

  useEffect(() => {
    fetchFaqs(1);
  }, []);

  const seeMore = () => {
    fetchFaqs(Number(meta?.page + 1));
  };

  return (
    <View style={styles(theme).safeArea}>
      <Text style={styles(theme).blockDesc}>
        Here are existing answers to common questions about your services,
        policies, and features. Feel free to add more questions and answers, or
        to update existing ones.
      </Text>

      {/**add faqs button */}
      <AddFaqsButton
        theme={theme}
        refreshFunc={() => {
          setFaqs(null);
          fetchFaqs(1);
        }}
      />

      {/**faqs list */}
      <View style={styles(theme).faqsList}>
        {faqs && faqs?.length > 0 ? (
          faqs?.map((item, index) => (
            <FaqsTab
              key={index}
              faq={item}
              theme={theme}
              refreshFunc={() => {
                setFaqs(null);
                fetchFaqs(1);
              }}
            />
          ))
        ) : (
          <NotFoundComponent
            text={"Unable to load FAQs"}
            isLoading={isLoading}
          />
        )}
      </View>

      {/**see more button logic */}
      {faqs?.length > 0 && meta?.has_next_page && (
        <SeeMoreBtn onPress={() => seeMore()} isLoading={isLoading} />
      )}
    </View>
  );
}

const FaqsTab = memo(({ faq, theme, refreshFunc = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <TouchableOpacity style={styles(theme).faqTab} onPress={toggle}>
      {/**top bar */}
      <View style={styles(theme).faqTop}>
        <Text style={styles(theme).faqQuestion}>
          {String(faq?.question)?.toUpperCase()}
        </Text>
        <Octicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={FONT_SIZE.s}
          color={COLOR_THEME[theme].gray200}
        />
      </View>

      {/**bottom bar */}
      {isOpen && (
        <View style={styles(theme).faqBottom}>
          <Text style={styles(theme).faqAnswer}>{String(faq?.answer)}</Text>

          {/**update buttons */}
          <View style={styles(theme).updateActionsTab}>
            {/**edit */}
            <FaqsEditButton
              theme={theme}
              refreshFunc={() => refreshFunc()}
              faq_id={faq?.faq_id}
              data={faq}
            />

            {/**delete */}
            <FaqsDeleteButton
              theme={theme}
              refreshFunc={() => refreshFunc()}
              faq_id={faq?.faq_id}
              data={faq}
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

const AddFaqsButton = ({ theme, refreshFunc = () => {} }) => {
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    tags: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  //handle form submission
  const submitForm = DEBOUNCE(async () => {
    const success = await FAQS_HOOKS.create_faqs(formData, setIsLoading);

    if (success) {
      refreshFunc();
    }

    setIsVisible(false);
  });

  return (
    <>
      {/**floating button */}
      <TouchableOpacity
        style={styles(theme).addFaqsBtn}
        onPress={() => setIsVisible(true)}
      >
        <Octicons name="plus" size={18} color={COLOR_THEME[theme].white} />
        <Text style={styles(theme).addFaqsText}>Add FAQs</Text>
      </TouchableOpacity>

      {/**add faqs */}
      <PopupModalWrapper
        title={"Add New FAQs"}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onCloseFunc={() => {
          //clear form
          setFormData({
            question: "",
            answer: "",
            tags: "",
          });
        }}
      >
        <AuthScreenWrapper
          buttonText={"Add"}
          buttonIsLoading={isLoading}
          formSubmitFunction={submitForm}
        >
          {/**question */}
          <AuthFormComponent
            formType={"input"}
            inputMode={"text"}
            inputIcon={
              <Octicons
                name="question"
                size={16}
                color={COLOR_THEME[theme].gray200}
              />
            }
            label={"Frequent Question"}
            placeholder={"Enter your question"}
            description={"Try to make each question short and precise"}
            name={"question"}
            form={formData}
            setForm={setFormData}
          />

          {/**answer */}
          <AuthFormComponent
            formType={"textarea"}
            inputMode={"text"}
            label={"Answer"}
            placeholder={"What is your say on the question?"}
            name={"answer"}
            form={formData}
            setForm={setFormData}
          />

          {/**tags */}
          <AuthFormComponent
            formType={"input"}
            inputMode={"text"}
            inputIcon={
              <Octicons
                name="tag"
                size={16}
                color={COLOR_THEME[theme].gray200}
              />
            }
            label={"Tags"}
            placeholder={"Enter related keywords as tags"}
            description={
              "Seperate tags by a comma. For instance: app, ios, android"
            }
            name={"tags"}
            form={formData}
            setForm={setFormData}
          />
        </AuthScreenWrapper>
      </PopupModalWrapper>
    </>
  );
};

const FaqsEditButton = ({ theme, refreshFunc = () => {}, faq_id, data }) => {
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    tags: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data) {
      const { question, answer, tags } = data;

      //update form
      setFormData((prev) => ({ ...prev, question, answer, tags }));
    }
  }, [data]);

  //handle form submission
  const submitForm = DEBOUNCE(async () => {
    const success = await FAQS_HOOKS.update_faq(formData, setIsLoading, faq_id);

    if (success) {
      refreshFunc();
    }

    setIsVisible(false);
  });

  return (
    <>
      {/**button */}
      <TouchableOpacity
        style={styles(theme).updateActionBtn(false)}
        onPress={() => setIsVisible(true)}
      >
        <Octicons name="pencil" size={14} color={COLOR_THEME[theme].gray200} />
        <Text style={styles(theme).updateActionText(false)}>Edit</Text>
      </TouchableOpacity>

      {/**add faqs */}
      <PopupModalWrapper
        title={"Edit FAQ"}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onCloseFunc={() => {
          //clear form
          setFormData({
            question: "",
            answer: "",
            tags: "",
          });
        }}
      >
        <AuthScreenWrapper
          buttonText={"Update"}
          buttonIsLoading={isLoading}
          formSubmitFunction={submitForm}
        >
          {/**question */}
          <AuthFormComponent
            formType={"input"}
            inputMode={"text"}
            inputIcon={
              <Octicons
                name="question"
                size={16}
                color={COLOR_THEME[theme].gray200}
              />
            }
            label={"Frequent Question"}
            placeholder={"Enter your question"}
            description={"Try to make each question short and precise"}
            name={"question"}
            form={formData}
            setForm={setFormData}
          />

          {/**answer */}
          <AuthFormComponent
            formType={"textarea"}
            inputMode={"text"}
            label={"Answer"}
            placeholder={"What is your say on the question?"}
            name={"answer"}
            form={formData}
            setForm={setFormData}
          />

          {/**tags */}
          <AuthFormComponent
            formType={"input"}
            inputMode={"text"}
            inputIcon={
              <Octicons
                name="tag"
                size={16}
                color={COLOR_THEME[theme].gray200}
              />
            }
            label={"Tags"}
            placeholder={"Enter related keywords as tags"}
            description={
              "Seperate tags by a comma. For instance: app, ios, android"
            }
            name={"tags"}
            form={formData}
            setForm={setFormData}
          />
        </AuthScreenWrapper>
      </PopupModalWrapper>
    </>
  );
};

const FaqsDeleteButton = ({ theme, refreshFunc = () => {}, faq_id, data }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //handle form submission
  const submitForm = DEBOUNCE(async () => {
    const success = await FAQS_HOOKS.delete_faq(setIsLoading, faq_id);

    if (success) {
      refreshFunc();
    }

    setIsVisible(false);
  });

  return (
    <>
      {/**button */}
      <TouchableOpacity
        style={styles(theme).updateActionBtn(true)}
        onPress={() => setIsVisible(true)}
      >
        <Octicons name="trash" size={14} color={COLOR_THEME[theme].error} />
        <Text style={styles(theme).updateActionText(true)}>Delete</Text>
      </TouchableOpacity>

      {/**add faqs */}
      <PopupModalWrapper
        title={"Delete FAQ"}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
      >
        <View style={styles(theme).deletePopupTab}>
          <Text style={styles(theme).deletePopupText}>
            {`Doing this will permanently delete this frequently asked question ('${data?.question}'). \n\nIf you wish to update it, click the [Edit] button instead. Do you wish to continue?`}
          </Text>

          <PrimaryButton
            title={"Yes, delete"}
            isLoading={isLoading}
            onPress={() => submitForm()}
            style={{ backgroundColor: COLOR_THEME[theme].error }}
          />
        </View>
      </PopupModalWrapper>
    </>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    safeArea: {
      width: "100%",
      padding: 16,
      gap: 16,
    },
    blockTitle: {
      fontSize: FONT_SIZE.b,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].black,
    },
    blockDesc: {
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray200,
    },
    faqsList: {
      paddingVertical: 16,
      width: "100%",
      gap: 4,
    },
    faqTab: {
      width: "100%",
      borderRadius: 4,
      borderWidth: 1,
      borderColor: COLOR_THEME[theme].gray50,
    },
    faqTop: {
      width: "100%",
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    faqQuestion: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].gray200,
    },
    faqBottom: {
      width: "100%",
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: COLOR_THEME[theme].gray50,
      gap: 16,
    },
    faqAnswer: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray100,
    },
    updateActionsTab: {
      width: "100%",
      paddingTop: 16,
      borderTopWidth: 0.8,
      borderTopColor: COLOR_THEME[theme].gray50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
    },
    updateActionBtn: (isDelete) => ({
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderWidth: 0.8,
      borderColor: isDelete
        ? COLOR_THEME[theme].error
        : COLOR_THEME[theme].gray200,
    }),
    updateActionText: (isDelete) => ({
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.semibold,
      color: isDelete ? COLOR_THEME[theme].error : COLOR_THEME[theme].gray200,
    }),
    addFaqsBtn: {
      width: 164,
      height: 48,
      marginLeft: "auto",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: BORDER_RADIUS.r,
      backgroundColor: COLOR_THEME[theme].primary,
    },
    addFaqsText: {
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].white,
    },
    deletePopupTab: {
      width: "100%",
      gap: 64,
      paddingBottom: 32,
    },
    deletePopupText: {
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray200,
      textAlign: "center",
    },
  });
