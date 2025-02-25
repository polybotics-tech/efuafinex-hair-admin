import axios from "axios";
import store from "../../redux/store";
import { END_POINTS } from "../api/endpoints";
import { HEADERS } from "../api/header";
import { Alert } from "../utils/alert";

export const PACKAGE_HOOKS = {
  fetch_user_packages: async (
    setLoader = () => {},
    user_id,
    page,
    sort = "all",
    q = ""
  ) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.package.user_records(user_id, page, sort, q),
        HEADERS.json(token)
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
  fetch_single_package: async (setLoader = () => {}, package_id) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.package.single(package_id),
        HEADERS.json(token)
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
  update_package_status: async (setLoader = () => {}, package_id, status) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.put(
        END_POINTS.package.update_status(package_id, status),
        {},
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("Request successful", message);
        return true;
      }
    } catch (error) {
      Alert.error("Request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  fetch_total_packages: async (setLoader = () => {}, sort = "all") => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.package.multiple(1, sort),
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        const res = data?.data;

        //extract meta
        const { meta } = res;

        return meta;
      }
    } catch (error) {
      Alert.error("Request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  fetch_multiple_packages: async (
    setLoader = () => {},
    page,
    sort = "all",
    q = ""
  ) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.package.multiple(page, sort, q),
        HEADERS.json(token)
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
};
