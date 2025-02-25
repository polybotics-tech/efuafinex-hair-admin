import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  admin: {},
  token: "",
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    ACTION_LOG_ADMIN_IN: (state, action) => {
      const { admin, token } = action.payload;

      //update admin and token state
      state.admin = admin;
      if (token) {
        state.token = token;
      }
    },
    ACTION_LOG_ADMIN_OUT: (state) => {
      //update admin and token to initial state
      state.admin = {};
      state.token = "";
    },
  },
});

export const {
  ACTION_LOG_ADMIN_IN,
  ACTION_LOG_ADMIN_OUT,
  ACTION_UPDATE_ADMIN_THUMBNAIL,
} = adminSlice.actions;
export default adminSlice;
