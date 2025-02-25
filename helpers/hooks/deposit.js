import axios from "axios";
import store from "../../redux/store";
import { END_POINTS } from "../api/endpoints";
import { HEADERS } from "../api/header";
import { Alert } from "../utils/alert";
import {
  ACTION_UPDATE_TOTAL_DEPOSITS_AND_CASHOUTS,
  ACTION_UPDATE_TOTAL_TRANSACTION_LOADING_STATES,
} from "../../redux/reducer/transactionSlice";

export const DEPOSIT_HOOKS = {
  fetch_user_deposits: async (
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
        END_POINTS.deposit.user_records(user_id, page, sort, q),
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
  fetch_single_deposit: async (setLoader = () => {}, transaction_ref) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.deposit.single(transaction_ref),
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
  fetch_package_deposits: async (setLoader = () => {}, package_id, page) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.deposit.package_records(package_id, page),
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
  fetch_multiple_deposits: async (
    setLoader = () => {},
    page,
    sort = "all",
    q = ""
  ) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.deposit.multiple(page, sort, q),
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
  fetch_total_transactions_by_year: async () => {
    try {
      //set current to null to trigger loading ui
      store.dispatch(
        ACTION_UPDATE_TOTAL_DEPOSITS_AND_CASHOUTS({
          total_deposits: null,
          total_cashouts: null,
        })
      );

      //set loading
      store.dispatch(
        ACTION_UPDATE_TOTAL_TRANSACTION_LOADING_STATES({
          deposits_loading: true,
        })
      );

      const token = store.getState().admin.token;
      const year = store.getState().transaction.year;

      const { data } = await axios.get(
        END_POINTS.deposit.total_transactions(year),
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        const res = data?.data;

        //extract needed items
        const { total_deposits, total_cashouts } = res;

        //update global state
        store.dispatch(
          ACTION_UPDATE_TOTAL_DEPOSITS_AND_CASHOUTS({
            total_deposits,
            total_cashouts,
          })
        );

        return true;
      }
    } catch (error) {
      Alert.error("Request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      store.dispatch(ACTION_UPDATE_TOTAL_TRANSACTION_LOADING_STATES({}));
    }
  },
  refresh_total_transactions_by_year: async () => {
    try {
      //run function without alert UI until result fetched

      const token = store.getState().admin.token;
      const year = store.getState().transaction.year;

      const { data } = await axios.get(
        END_POINTS.deposit.total_transactions(year),
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        const res = data?.data;

        //extract needed items
        const { total_deposits, total_cashouts } = res;

        //update global state
        store.dispatch(
          ACTION_UPDATE_TOTAL_DEPOSITS_AND_CASHOUTS({
            total_deposits,
            total_cashouts,
          })
        );

        return true;
      }
    } catch (error) {
      return false;
    }
  },
};
