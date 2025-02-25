import { combineReducers } from "redux";
import adminSlice from "./adminSlice";
import appSlice from "./appSlice";
import notificationSlice from "./notificationSlice";
import transactionSlice from "./transactionSlice";

// Combining burgerReducer and pizzaReducer in rootReducer
export const rootReducer = combineReducers({
  admin: adminSlice.reducer,
  app: appSlice.reducer,
  notification: notificationSlice.reducer,
  transaction: transactionSlice.reducer,
});
