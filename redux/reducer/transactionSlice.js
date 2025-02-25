import { createSlice } from "@reduxjs/toolkit";

const dt = new Date();

const initialState = {
  year: Number(dt.getFullYear()),
  total_deposits: null,
  total_cashouts: null,
  deposits_loading: true,
  cashouts_loading: false,
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    ACTION_UPDATE_TOTAL_DEPOSITS_AND_CASHOUTS: (state, action) => {
      const { total_deposits, total_cashouts } = action.payload;

      //update total deposits
      state.total_deposits = total_deposits;

      //update total cashouts
      state.total_cashouts = total_cashouts;
    },
    ACTION_UPDATE_TOTAL_TRANSACTION_LOADING_STATES: (state, action) => {
      const { deposits_loading, cashouts_loading } = action.payload;

      state.deposits_loading = Boolean(deposits_loading);
      state.cashouts_loading = Boolean(cashouts_loading);
    },
    ACTION_UPDATE_TOTAL_TRANSACTION_YEAR: (state, action) => {
      const { year } = action.payload;

      state.year = Number(year);
    },
  },
});

export const {
  ACTION_UPDATE_TOTAL_DEPOSITS_AND_CASHOUTS,
  ACTION_UPDATE_TOTAL_TRANSACTION_LOADING_STATES,
  ACTION_UPDATE_TOTAL_TRANSACTION_YEAR,
} = transactionSlice.actions;
export default transactionSlice;
