import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocalSearchParams } from "expo-router";
import { USER_HOOKS } from "../../../helpers/hooks/user";
import SafeAreaWrapper from "../../../components/ui/safeAreaWrapper";
import DefaultHeaderComponent from "../../../components/DefaultHeaderComponent";
import ScrollViewWrapper from "../../../components/ui/ScrollViewWrapper";
import NotFoundComponent from "../../../components/reuseables/NotFoundComponent";
import { COLOR_THEME, SCREEN_DIMENSION } from "../../../constants";
import UserCard from "../../../components/reuseables/UserCard";
import { format_date_time_readable } from "../../../helpers/utils/datetime";
import {
  BORDER_RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
} from "../../../constants/theme";
import PageSearchComponent from "../../../components/PageSearchComponent";
import { PACKAGE_HOOKS } from "../../../helpers/hooks/package";
import { DEPOSIT_HOOKS } from "../../../helpers/hooks/deposit";
import { DEBOUNCE } from "../../../helpers/utils/debounce";
import PackageCard from "../../../components/reuseables/PackageCard";
import DepositRecord from "../../../components/reuseables/DepositRecord";
import SeeMoreBtn from "../../../components/reuseables/SeeMoreBtn";
import { extract_name_from_bank_code } from "../../../helpers/utils";
import CopyIcon from "../../../components/reuseables/CopyIcon";

export default function UserDetails() {
  const theme = useSelector((state) => state.app.theme);

  const { id } = useLocalSearchParams();

  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState();

  //fetch user details
  const fetchUser = async (id) => {
    const result = await USER_HOOKS.fetch_single_user(setIsLoading, id);

    if (result) {
      setData(result);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id]);

  return (
    <SafeAreaWrapper>
      <DefaultHeaderComponent directory={"user"} />

      <ScrollViewWrapper
        style={styles(theme).page}
        refreshFunc={() => {
          setData();
          fetchUser(id);
        }}
      >
        {/**user details */}
        {!data ? (
          <NotFoundComponent text={"User not found"} isLoading={isLoading} />
        ) : (
          <>
            {/**primary details */}
            <View style={styles(theme).remotePadder}>
              <UserCard data={data} full={true} clickable={false} />
            </View>

            {/**further details */}
            <View style={styles(theme).remotePadder}>
              <FurtherDetailsComp theme={theme} data={data} />
            </View>

            {/**refund accouont details */}
            {data?.refund_account_record && (
              <View style={styles(theme).remotePadder}>
                <AccountRecordComp
                  theme={theme}
                  data={data?.refund_account_record}
                />
              </View>
            )}

            {/**user activities */}
            <ActivityComponent theme={theme} user_id={data?.user_id} />
          </>
        )}
      </ScrollViewWrapper>
    </SafeAreaWrapper>
  );
}

const FurtherDetailsComp = ({ theme, data }) => {
  return (
    <View style={styles(theme).furtherComp}>
      {/**creation time */}
      <FurtherTablet
        theme={theme}
        title={"Joined Since"}
        value={format_date_time_readable(data?.created_time)}
      />

      {/**last seen */}
      <FurtherTablet
        theme={theme}
        title={"Last Seen"}
        value={format_date_time_readable(data?.last_seen)}
      />

      {/**phone number */}
      <FurtherTablet
        theme={theme}
        title={"Phone Number"}
        value={data?.phone || "--unknown--"}
        canCopy={true}
      />
    </View>
  );
};

const FurtherTablet = ({ theme, title, value, canCopy }) => {
  return (
    <View style={styles(theme).furtherTab}>
      <Text style={styles(theme).furtherTabTitle}>{title}</Text>

      <View style={styles(theme).furtherTabValueTab}>
        <Text style={styles(theme).furtherTabValue}>{value}</Text>

        {canCopy && <CopyIcon text_to_copy={`${value}`} />}
      </View>
    </View>
  );
};

const AccountRecordComp = ({ theme, data }) => {
  return (
    <View style={styles(theme).furtherComp}>
      <FurtherTablet
        theme={theme}
        title={"Bank Name"}
        value={String(
          extract_name_from_bank_code(data?.bank_code)
        )?.toUpperCase()}
      />

      <FurtherTablet
        theme={theme}
        title={"Account Number"}
        value={data?.account_number || "--unknown--"}
        canCopy={true}
      />

      <FurtherTablet
        theme={theme}
        title={"Account Name"}
        value={String(data?.account_name)?.toUpperCase()}
      />

      <FurtherTablet
        theme={theme}
        title={"Last Updated"}
        value={format_date_time_readable(data?.last_updated)}
      />
    </View>
  );
};

const ActivityComponent = ({ theme, user_id }) => {
  const options = ["packages", "deposits"];
  const [active, setActive] = useState(options[0]); //packages, deposits

  const [formData, setFormData] = useState({
    q: "",
    sort: "all",
  });

  const sort_options = {
    packages: [
      "all",
      "in-progress",
      "completed",
      "on-delivery",
      "delivered",
      "canceled",
    ],
    deposits: ["all", "success", "pending", "failed"],
  };

  //handle search function
  const [results, setResults] = useState();
  const [meta, setMeta] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const search_results = async (page, form = { q: "", sort: "all" }) => {
    const { q, sort } = form;
    let res;

    if (active === "packages") {
      res = await PACKAGE_HOOKS.fetch_user_packages(
        setIsLoading,
        user_id,
        page,
        sort,
        q
      );
    } else {
      res = await DEPOSIT_HOOKS.fetch_user_deposits(
        setIsLoading,
        user_id,
        page,
        sort,
        q
      );
    }

    if (res) {
      const { meta } = res;
      const { page } = meta;

      setMeta(meta);

      let results;

      if (active === "packages") {
        results = res?.packages;
      } else {
        results = res?.deposits;
      }

      //check appending format
      if (page === 1) {
        setResults(results);
      } else {
        setResults((prev) => [...prev, ...results]);
      }
    }
  };

  //run search function for any slight change
  const searchFunc = DEBOUNCE((activeChange = false) => {
    setResults(null);

    if (activeChange) {
      setFormData({ q: "", sort: "all" });
      search_results(1);
    } else {
      search_results(1, formData);
    }
  }, 100);

  useEffect(() => {
    searchFunc();
  }, [formData?.sort]);

  useEffect(() => {
    searchFunc(true);
  }, [active]);

  //handle see more function
  const see_more = DEBOUNCE(async () => {
    if (Boolean(meta?.has_next_page)) {
      search_results(Number(meta?.page + 1), formData);
    }
  });

  return (
    <>
      <View>
        {/**top component */}
        <View style={styles(theme).activityComp}>
          <Text style={styles(theme).activityCompTitle}>User Activities</Text>

          {/**active category selector */}
          <View style={styles(theme).activityCompCategory}>
            {options?.length > 0 &&
              options?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles(theme).activityCompCategoryButton(
                    Boolean(item === active)
                  )}
                  onPress={() => setActive(item)}
                >
                  <Text
                    style={styles(theme).activityCompCategoryButtonText(
                      Boolean(item === active)
                    )}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/**search box component */}
        <PageSearchComponent
          form={formData}
          setForm={setFormData}
          placeholder={`Search for ${active}`}
          filter_array={sort_options[active]}
          onSubmit={() => searchFunc()}
        />
      </View>

      {/**results */}
      {active === "packages" ? (
        <View style={[styles(theme).remotePadder, { gap: 16 }]}>
          {results?.length > 0 ? (
            results?.map((item, index) => (
              <PackageCard
                key={index}
                data={item}
                type={item?.package_type}
                clickable={true}
              />
            ))
          ) : (
            <NotFoundComponent
              text={"No package found"}
              isLoading={isLoading}
            />
          )}
        </View>
      ) : (
        <View style={[styles(theme).remotePadder, { gap: 16 }]}>
          {results?.length > 0 ? (
            results?.map((item, index) => (
              <DepositRecord key={index} data={item} />
            ))
          ) : (
            <NotFoundComponent
              text={"No deposit found"}
              isLoading={isLoading}
            />
          )}
        </View>
      )}

      {/**see more button */}
      {meta?.has_next_page && (
        <SeeMoreBtn onPress={() => see_more()} isLoading={isLoading} />
      )}
    </>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    page: {
      width: "100%",
      minHeight: "100%",
      paddingTop: 16,
      paddingBottom: 64,
      backgroundColor: COLOR_THEME[theme].gray50,
      gap: 16,
    },
    remotePadder: {
      paddingHorizontal: 16,
    },
    furtherComp: {
      width: "100%",
      paddingHorizontal: 16,
      borderRadius: BORDER_RADIUS.s,
      backgroundColor: COLOR_THEME[theme].white,
    },
    furtherTab: {
      width: "100%",
      paddingVertical: 12,
      borderBottomWidth: 0.8,
      borderBottomColor: COLOR_THEME[theme].gray50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    furtherTabTitle: {
      maxWidth: 120,
      fontSize: FONT_SIZE.m,
      fontWeight: FONT_WEIGHT.semibold,
      color: COLOR_THEME[theme].gray100,
    },
    furtherTabValueTab: {
      width: SCREEN_DIMENSION.subtractWidth(16, 32 + 32, 120),
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      justifyContent: "flex-end",
    },
    furtherTabValue: {
      maxWidth: "100%",
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.regular,
      color: COLOR_THEME[theme].black,
      textAlign: "right",
    },
    activityComp: {
      width: "100%",
      padding: 16,
      borderRadius: BORDER_RADIUS.s,
      backgroundColor: COLOR_THEME[theme].white,
      gap: 16,
    },
    activityCompTitle: {
      fontSize: FONT_SIZE.b,
      fontWeight: FONT_WEIGHT.bold,
      color: COLOR_THEME[theme].black,
    },
    activityCompCategory: {
      width: "100%",
      padding: 8,
      borderRadius: BORDER_RADIUS.s,
      backgroundColor: COLOR_THEME[theme].gray50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    activityCompCategoryButton: (is_active) => ({
      width: 100,
      height: 36,
      borderRadius: BORDER_RADIUS.xs,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: is_active ? COLOR_THEME[theme].white : "transparent",
    }),
    activityCompCategoryButtonText: (is_active) => ({
      fontSize: FONT_SIZE.s,
      fontWeight: FONT_WEIGHT.semibold,
      color: is_active ? COLOR_THEME[theme].black : COLOR_THEME[theme].gray200,
      textTransform: "capitalize",
    }),
  });
