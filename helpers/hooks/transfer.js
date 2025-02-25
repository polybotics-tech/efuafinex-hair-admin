import axios from "axios";
import { END_POINTS } from "../api/endpoints";
import store from "../../redux/store";
import { Alert } from "../utils/alert";
import { HEADERS } from "../api/header";

export const TRANSFER_HOOKS = {
  verify_transfer_account: async (
    setLoader = () => {},
    account_number,
    bank_code
  ) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.post(
        END_POINTS.transfer.verify_account,
        { account_number, bank_code },
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("Request successful", message);
        let res = data?.data;

        return res;
      }
    } catch (error) {
      Alert.error("Request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  request_funds_transfer: async (form, setLoader = () => {}, package_id) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.post(
        END_POINTS.transfer.request_funds(package_id),
        form,
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("Request successful", message);
        let res = data?.data;

        return res;
      }
    } catch (error) {
      Alert.error("Request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  finalize_transfer_with_otp: async (
    form,
    setLoader = () => {},
    transfer_code
  ) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.post(
        END_POINTS.transfer.finalize(transfer_code),
        form,
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("Request successful", message);
        let res = data?.data;

        return true;
      }
    } catch (error) {
      Alert.error("Request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  resend_transfer_otp: async (setLoader = () => {}, transfer_code) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.transfer.resend_otp(transfer_code),
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("Request successful", message);
        let res = data?.data;

        return true;
      }
    } catch (error) {
      Alert.error("Request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  fetch_single_transfer: async (setLoader = () => {}, package_id) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.transfer.single(package_id),
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
  fetch_multiple_transfers: async (
    setLoader = () => {},
    page,
    sort = "all",
    q = ""
  ) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.transfer.multiple(page, sort, q),
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
