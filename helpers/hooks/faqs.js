import axios from "axios";
import { END_POINTS } from "../api/endpoints";
import { HEADERS } from "../api/header";
import { Alert } from "../utils/alert";
import store from "../../redux/store";

export const FAQS_HOOKS = {
  create_faqs: async (form = {}, setLoader = () => {}) => {
    try {
      setLoader(true);

      //check if token stored in global state
      const token = store.getState()?.admin?.token;

      const { data } = await axios.post(
        END_POINTS.admin.faqs(),
        form,
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("request successful", message);

        const res = data?.data;
        return res;
      }
    } catch (error) {
      Alert.error("request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  update_faq: async (form = {}, setLoader = () => {}, faq_id) => {
    try {
      setLoader(true);

      //check if token stored in global state
      const token = store.getState()?.admin?.token;

      const { data } = await axios.put(
        END_POINTS.admin.update_faq(faq_id),
        form,
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("request successful", message);

        const res = data?.data;
        return res;
      }
    } catch (error) {
      Alert.error("request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  delete_faq: async (setLoader = () => {}, faq_id) => {
    try {
      setLoader(true);

      //check if token stored in global state
      const token = store.getState()?.admin?.token;

      const { data } = await axios.delete(
        END_POINTS.admin.update_faq(faq_id),
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("request successful", message);

        const res = data?.data;
        return res;
      }
    } catch (error) {
      Alert.error("request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  fetch_faqs: async (setLoader = () => {}, page) => {
    try {
      setLoader(true);

      const { data } = await axios.get(
        END_POINTS.admin.faqs(page),
        HEADERS.json()
      );

      const { success, message } = data;
      if (success) {
        const res = data?.data;

        return res;
      }
    } catch (error) {
      Alert.error("Request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  update_contact_info: async (form = {}, setLoader = () => {}) => {
    try {
      setLoader(true);

      //check if form is completely empty
      let emptyEle = 0;
      let params = ["email", "instagram", "whatsapp"];
      params?.forEach((e) => {
        if (String(form[e])?.trim() === "") {
          emptyEle++;
        }
      });
      if (emptyEle >= 3) {
        Alert.error("request failed", "Atleast one contact info is required");
        return false;
      }

      //check if token stored in global state
      const token = store.getState()?.admin?.token;

      const { data } = await axios.post(
        END_POINTS.admin.contact_info,
        form,
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("request successful", message);

        const res = data?.data;
        return res;
      }
    } catch (error) {
      Alert.error("request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  fetch_contact_info: async (setLoader = () => {}) => {
    try {
      setLoader(true);

      const { data } = await axios.get(
        END_POINTS.admin.contact_info,
        HEADERS.json()
      );

      const { success, message } = data;
      if (success) {
        const res = data?.data;

        return res;
      }
    } catch (error) {
      Alert.error("Request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  send_bulk_mail: async (form = {}, setLoader = () => {}) => {
    try {
      setLoader(true);

      //check if token stored in global state
      const token = store.getState()?.admin?.token;

      const { data } = await axios.post(
        END_POINTS.admin.send_mail,
        form,
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("request successful", message);

        const res = data?.data;
        return res;
      }
    } catch (error) {
      Alert.error("request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
};
