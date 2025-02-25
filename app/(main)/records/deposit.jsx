import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import SafeAreaWrapper from "../../../components/ui/safeAreaWrapper";
import ScrollViewWrapper from "../../../components/ui/ScrollViewWrapper";
import DefaultHeaderComponent from "../../../components/DefaultHeaderComponent";
import PageSearchComponent from "../../../components/PageSearchComponent";
import { useSelector } from "react-redux";
import { DEPOSIT_HOOKS } from "../../../helpers/hooks/deposit";
import { DEBOUNCE } from "../../../helpers/utils/debounce";
import SectionGroupWrapper from "../../../components/ui/SectionGroupWrapper";
import SeeMoreBtn from "../../../components/reuseables/SeeMoreBtn";
import DepositRecord from "../../../components/reuseables/DepositRecord";
import NotFoundComponent from "../../../components/reuseables/NotFoundComponent";
import { COLOR_THEME } from "../../../constants";

export default function DepositRecords() {
  const theme = useSelector((state) => state.app.theme);

  const [formData, setFormData] = useState({
    q: "",
    sort: "all",
  });

  const sort_options = ["all", "success", "pending", "failed"];

  //handle search function
  const [deposits, setDeposits] = useState();
  const [meta, setMeta] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const search_deposits = async (page) => {
    const { q, sort } = formData;
    const res = await DEPOSIT_HOOKS.fetch_multiple_deposits(
      setIsLoading,
      page,
      sort,
      q
    );

    if (res) {
      const { deposits, meta } = res;
      const { page } = meta;

      setMeta(meta);

      //check appending format
      if (page === 1) {
        setDeposits(deposits);
      } else {
        setDeposits((prev) => [...prev, ...deposits]);
      }
    }
  };

  //run search function for any slight change
  const searchFunc = DEBOUNCE(() => {
    setDeposits(null);
    search_deposits(1);
  }, 5);

  useEffect(() => {
    searchFunc();
  }, [formData?.sort]);

  //handle see more function
  const see_more = DEBOUNCE(async () => {
    if (Boolean(meta?.has_next_page)) {
      search_deposits(Number(meta?.page + 1));
    }
  });

  return (
    <SafeAreaWrapper>
      <DefaultHeaderComponent directory={"records"} />

      {/**search box */}
      <PageSearchComponent
        form={formData}
        setForm={setFormData}
        placeholder={"Search for deposits"}
        filter_array={sort_options}
        onSubmit={() => searchFunc()}
      />

      <ScrollViewWrapper
        style={styles(theme).resultCont}
        refreshFunc={() => searchFunc()}
      >
        <SectionGroupWrapper>
          {deposits?.length > 0 ? (
            deposits?.map((item, index) => (
              <DepositRecord key={index} data={item} />
            ))
          ) : (
            <NotFoundComponent
              text={"No deposit found"}
              isLoading={isLoading}
            />
          )}

          {/**see more button */}
          {meta?.has_next_page && (
            <SeeMoreBtn onPress={() => see_more()} isLoading={isLoading} />
          )}
        </SectionGroupWrapper>
      </ScrollViewWrapper>
    </SafeAreaWrapper>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    resultCont: {
      width: "100%",
      padding: 16,
      backgroundColor: COLOR_THEME[theme].gray50,
    },
  });
