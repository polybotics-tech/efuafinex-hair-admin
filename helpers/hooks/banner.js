import axios from "axios";
import { END_POINTS } from "../api/endpoints";
import { HEADERS } from "../api/header";
import { Alert } from "../utils/alert";
import store from "../../redux/store";

export const BANNER_HOOKS = {
  fetch_banners: async (setLoader = () => {}, page) => {
    try {
      setLoader(true);

      const { data } = await axios.get(
        END_POINTS.admin.banners(page),
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
  create_banners: async (form = {}, setLoader = () => {}) => {
    try {
      setLoader(true);

      //initialize form data
      const formData = new FormData();

      //append all form value to form data
      for (let prop in form) {
        if (prop != "photo") {
          formData.append(prop, String(form[prop]));
        } else {
          formData.append("file", form[prop]);
        }
      }

      //check if token stored in global state
      const token = store.getState()?.admin?.token;

      const { data } = await axios.post(
        END_POINTS.admin.banners(),
        formData,
        HEADERS.form(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("request successful", message);

        const res = data?.data;
        return res;
      }
    } catch (error) {
      console.log("err: ", error?.response?.data);
      Alert.error("request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  delete_banner: async (setLoader = () => {}, banner_id) => {
    try {
      setLoader(true);

      //check if token stored in global state
      const token = store.getState()?.admin?.token;

      const { data } = await axios.delete(
        END_POINTS.admin.delete_banner(banner_id),
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
