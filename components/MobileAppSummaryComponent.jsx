import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { memo, useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Octicons } from "@expo/vector-icons";
import { COLOR_THEME, NAIRA_CURRENCY, SCREEN_DIMENSION } from "../constants";
import { format_number } from "../helpers/utils/numbers";
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from "../constants/theme";
import { return_previous_year_list_array } from "../helpers/utils/datetime";
import { ACTION_UPDATE_TOTAL_TRANSACTION_YEAR } from "../redux/reducer/transactionSlice";
import { DEPOSIT_HOOKS } from "../helpers/hooks/deposit";
import { USER_HOOKS } from "../helpers/hooks/user";
import { PACKAGE_HOOKS } from "../helpers/hooks/package";

const MobileAppSummaryComponent = () => {
  const theme = useSelector((state) => state.app.theme);

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPackages, setTotalPackages] = useState(0);
  const [verifiedUsers, setVerifiedUsers] = useState(0);
  const [deliveredPackages, setDeliveredPackages] = useState(0);

  const [tu_loading, setTULoading] = useState(true);
  const [tp_loading, setTPLoading] = useState(true);
  const [vu_loading, setVULoading] = useState(true);
  const [dp_loading, setDPLoading] = useState(true);

  const fetch_total_users = async () => {
    const meta = await USER_HOOKS.fetch_total_users(setTULoading);

    if (meta) {
      const { total_results } = meta;

      setTotalUsers(Number(total_results));
    }
  };

  const fetch_total_packages = async () => {
    const meta = await PACKAGE_HOOKS.fetch_total_packages(setTPLoading);

    if (meta) {
      const { total_results } = meta;

      setTotalPackages(Number(total_results));
    }
  };

  const fetch_verified_users = async () => {
    const meta = await USER_HOOKS.fetch_total_users(setVULoading, "verified");

    if (meta) {
      const { total_results } = meta;

      setVerifiedUsers(Number(total_results));
    }
  };

  const fetch_delivered_packages = async () => {
    const meta = await PACKAGE_HOOKS.fetch_total_packages(
      setDPLoading,
      "delivered"
    );

    if (meta) {
      const { total_results } = meta;

      setDeliveredPackages(Number(total_results));
    }
  };

  useLayoutEffect(() => {
    fetch_total_users();
    fetch_total_packages();
    fetch_verified_users();
    fetch_delivered_packages();
  }, []);

  return (
    <View style={{ gap: 16 }}>
      {/**annual deposits */}
      <AnnualDeposits theme={theme} />

      {/**total app users and created packages */}
      <View style={styles(theme).displaySplit}>
        <DisplayTab
          theme={theme}
          title={"Registered Users"}
          value={`${format_number(totalUsers || 0)}`}
          path={"/users"}
          icon={"people"}
          isLoading={tu_loading}
        />
        <DisplayTab
          theme={theme}
          title={"Created Packages"}
          value={`${format_number(totalPackages || 0)}`}
          path={"/packages"}
          icon={"archive"}
          isLoading={tp_loading}
        />
      </View>

      {/**verified users and delivered packages */}
      <View style={styles(theme).displaySplit}>
        <DisplayTab
          theme={theme}
          title={"Verified Users"}
          value={`${format_number(verifiedUsers || 0)}`}
          path={"/users"}
          icon={"verified"}
          isLoading={vu_loading}
        />
        <DisplayTab
          theme={theme}
          title={"Delivered Packages"}
          value={`${format_number(deliveredPackages || 0)}`}
          path={"/packages"}
          icon={"code-of-conduct"}
          isLoading={dp_loading}
        />
      </View>
    </View>
  );
};

export default MobileAppSummaryComponent;

const AnnualDeposits = ({ theme }) => {
  const dispatch = useDispatch();

  const _last5Years = return_previous_year_list_array();
  const activeYear = useSelector((state) => state.transaction.year);

  //update active year
  const selectActiveYear = (year) => {
    dispatch(ACTION_UPDATE_TOTAL_TRANSACTION_YEAR({ year }));
  };

  //update global transaction values if year change
  useEffect(() => {
    const refresh_totals = async () => {
      await DEPOSIT_HOOKS.fetch_total_transactions_by_year();
    };

    refresh_totals();
  }, [activeYear]);

  //fetch total values
  const total_deposits = useSelector(
    (state) => state.transaction.total_deposits
  );
  const deposits_loading = useSelector(
    (state) => state.transaction.deposits_loading
  );
  const total_cashouts = useSelector(
    (state) => state.transaction.total_cashouts
  );
  const cashouts_loading = useSelector(
    (state) => state.transaction.cashouts_loading
  );

  return (
    <View style={styles(theme).annualComp}>
      <Text style={styles(theme).compHeader}>Annual Transaction Summary</Text>

      {/**deposits and cashouts */}
      <View style={styles(theme).annualInnerTop}>
        <View style={styles(theme).aITCont}>
          {deposits_loading && total_deposits == null ? (
            <Text style={styles(theme).compValue(true)}>------</Text>
          ) : (
            <Text style={styles(theme).compValue(true)}>
              + {NAIRA_CURRENCY} {format_number(total_deposits || 0)}
            </Text>
          )}
          <Text style={styles(theme).compValueTag}>Deposits</Text>
        </View>

        <View style={styles(theme).aITCont}>
          {cashouts_loading && total_cashouts == null ? (
            <Text style={styles(theme).compValue(false)}>------</Text>
          ) : (
            <Text style={styles(theme).compValue(false)}>
              - {NAIRA_CURRENCY} {format_number(total_cashouts || 0)}
            </Text>
          )}
          <Text style={styles(theme).compValueTag}>Cashouts</Text>
        </View>
      </View>

      {/**year roll */}
      <ScrollView
        horizontal={true}
        contentContainerStyle={styles(theme).yearList}
        showsHorizontalScrollIndicator={false}
        bounces={false}
      >
        {_last5Years?.map((year, index) => (
          <TouchableOpacity
            key={index}
            style={styles(theme).yearTab(year === activeYear)}
            onPress={() => {
              selectActiveYear(year);
            }}
          >
            <Text style={styles(theme).yearValue(year === activeYear)}>
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const DisplayTab = ({
  theme,
  icon = "question",
  title,
  value,
  path,
  isLoading,
}) => {
  return (
    <View style={styles(theme).displayTab}>
      <View style={styles(theme).displayTabTop}>
        <View style={styles(theme).displayTabTopIcon}>
          <Octicons name={icon} size={14} color={COLOR_THEME[theme].gray200} />
        </View>

        {isLoading ? (
          <ActivityIndicator
            size={FONT_SIZE.m}
            color={COLOR_THEME[theme].black}
          />
        ) : (
          <Text style={styles(theme).displayTabValue}>{value}</Text>
        )}
      </View>

      <Text style={styles(theme).displayTabTitle} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    annualComp: {
      width: "100%",
      borderRadius: BORDER_RADIUS.s,
      backgroundColor: COLOR_THEME[theme].white,
      padding: 16,
      alignItems: "center",
      gap: 24,
    },
    compHeader: {
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].black,
    },
    compValue: (isDeposite) => ({
      fontSize: FONT_SIZE.xb,
      fontWeight: FONT_WEIGHT.bold,
      color: isDeposite ? COLOR_THEME[theme].success : COLOR_THEME[theme].error,
    }),
    annualInnerTop: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    aITCont: {
      width: SCREEN_DIMENSION.halfWidth(16, 32 + 32),
      alignItems: "center",
      gap: 4,
    },
    compValueTag: {
      fontSize: FONT_SIZE.xs,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray200,
      borderRadius: BORDER_RADIUS.r,
      backgroundColor: COLOR_THEME[theme].gray50,
      paddingVertical: 4,
      paddingHorizontal: 12,
    },
    yearList: {
      minWidth: "100%",
      padding: 8,
      gap: 8,
      backgroundColor: COLOR_THEME[theme].gray50,
    },
    yearTab: (isActive) => ({
      paddingVertical: 4,
      paddingHorizontal: 16,
      borderRadius: BORDER_RADIUS.xs,
      backgroundColor: isActive
        ? COLOR_THEME[theme].black
        : COLOR_THEME[theme].white,
    }),
    yearValue: (isActive) => ({
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.regular,
      color: isActive ? COLOR_THEME[theme].white : COLOR_THEME[theme].gray100,
    }),
    displaySplit: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    displayTab: {
      width: SCREEN_DIMENSION.halfWidth(16, 32),
      height: "100%",
      padding: 16,
      borderRadius: BORDER_RADIUS.s,
      backgroundColor: COLOR_THEME[theme].white,
      gap: 8,
    },
    displayTabTop: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 4,
    },
    displayTabTopIcon: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: BORDER_RADIUS.xs,
      backgroundColor: COLOR_THEME[theme].gray50,
    },
    displayTabTitle: {
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].gray200,
    },
    displayTabValue: {
      fontSize: FONT_SIZE.b,
      fontWeight: FONT_WEIGHT.bold,
      color: COLOR_THEME[theme].black,
      textAlign: "right",
    },
  });
