import axios from "axios";
import { HEADERS } from "../api/header";
import store from "../../redux/store";
import { END_POINTS } from "../api/endpoints";
import { ACTION_LOG_ADMIN_IN } from "../../redux/reducer/adminSlice";
import { Alert } from "../utils/alert";
import { LOCAL_STORAGE } from "../local-storage";
import {
  ACTION_UPDATE_LATEST_NOTIFICATION_ID,
  ACTION_UPDATE_LATEST_NOTIFICATIONS,
  ACTION_UPDATE_NOTIFICATION_HAS_UNREAD,
} from "../../redux/reducer/notificationSlice";
import { ACTION_TOGGLE_APP_THEME } from "../../redux/reducer/appSlice";

export const USER_HOOKS = {
  fetch_theme_preference: async () => {
    //fetch locally saved theme
    let theme = await LOCAL_STORAGE.read(LOCAL_STORAGE.paths.app_theme);

    if (theme && theme != "") {
      //save to global storage
      store.dispatch(ACTION_TOGGLE_APP_THEME({ theme }));
    } else {
      store.dispatch(ACTION_TOGGLE_APP_THEME({ theme: "light" }));
      await LOCAL_STORAGE.save(LOCAL_STORAGE.paths.app_theme, "light");
    }
  },
  toggle_theme_preference: async () => {
    try {
      const current_theme = store.getState().app.theme;

      let theme;
      if (current_theme === "light") {
        theme = "dark";
      } else {
        theme = "light";
      }

      //save to global and local storage
      store.dispatch(ACTION_TOGGLE_APP_THEME({ theme }));

      await LOCAL_STORAGE.save(LOCAL_STORAGE.paths.app_theme, theme);

      //alert user
      Alert.success(
        "Theme update successful",
        `App theme preference set to ${theme} mode`
      );

      return true;
    } catch (error) {
      Alert.error("Theme update failed", HEADERS.error_extractor(error));
      return false;
    }
  },
  update_account: async (form = {}, setLoader = () => {}) => {
    try {
      setLoader(true);

      //check if token stored in global state
      const token = store.getState()?.admin?.token;

      const { data } = await axios.put(
        END_POINTS.auth.account,
        form,
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("request successful", message);

        const res = data?.data;
        //extract admin and token
        const { admin } = res;

        //update admin global state
        store.dispatch(ACTION_LOG_ADMIN_IN({ admin }));
        return true;
      }
    } catch (error) {
      Alert.error("request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  update_pass: async (form = {}, setLoader = () => {}) => {
    try {
      setLoader(true);

      //check if token stored in global state
      const token = store.getState()?.admin?.token;

      const { data } = await axios.put(
        END_POINTS.auth.pass,
        form,
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        Alert.success("request successful", message);

        const res = data?.data;
        //extract admin and token
        const { admin, token } = res;

        //store token in local storage
        await LOCAL_STORAGE.save(LOCAL_STORAGE.paths.token, token);

        //update admin global state
        store.dispatch(ACTION_LOG_ADMIN_IN({ admin, token }));
        return true;
      }
    } catch (error) {
      Alert.error("request failed", HEADERS.error_extractor(error));
      return false;
    } finally {
      setLoader(false);
    }
  },
  fetch_notifications: async () => {
    try {
      const token = store.getState()?.admin?.token;

      if (!token) {
        return false;
      }

      const { data } = await axios.get(
        END_POINTS.user.notifications(1),
        HEADERS.json(token)
      );

      const { success, message } = data;
      if (success) {
        const res = data?.data;
        const { notifications } = res;

        //update notifications list in global state
        store.dispatch(ACTION_UPDATE_LATEST_NOTIFICATIONS({ notifications }));

        //update latest_id
        store.dispatch(
          ACTION_UPDATE_LATEST_NOTIFICATION_ID({
            latest_id: notifications[0]?.notification_id,
          })
        );

        return true;
      }
    } catch (error) {
      return false;
    }
  },
  validate_notification_latest_id: async (latest_id) => {
    const local_id = await LOCAL_STORAGE.read(
      LOCAL_STORAGE.paths.latest_notification_id
    );

    //means it's a new id
    if (latest_id != local_id) {
      //update global has unread
      store.dispatch(
        ACTION_UPDATE_NOTIFICATION_HAS_UNREAD({ has_unread: true })
      );

      //update local storage id
      await LOCAL_STORAGE.save(
        LOCAL_STORAGE.paths.latest_notification_id,
        latest_id
      );
    }
  },
  mark_notifications_read: async () => {
    //update global has unread
    store.dispatch(
      ACTION_UPDATE_NOTIFICATION_HAS_UNREAD({ has_unread: false })
    );
  },
  fetch_total_users: async (setLoader = () => {}, sort = "all") => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.user.multiple(1, sort),
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
  fetch_multiple_users: async (
    setLoader = () => {},
    page,
    sort = "all",
    q = ""
  ) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.user.multiple(page, sort, q),
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
  fetch_single_user: async (setLoader = () => {}, user_id) => {
    try {
      setLoader(true);

      const token = store.getState()?.admin?.token;

      const { data } = await axios.get(
        END_POINTS.user.single(user_id),
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
