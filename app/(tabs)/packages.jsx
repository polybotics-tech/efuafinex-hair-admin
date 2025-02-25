import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import PageSearchComponent from "../../components/PageSearchComponent";
import { useSelector } from "react-redux";
import { DEBOUNCE } from "../../helpers/utils/debounce";
import { PACKAGE_HOOKS } from "../../helpers/hooks/package";
import SectionGroupWrapper from "../../components/ui/SectionGroupWrapper";
import PackageCard from "../../components/reuseables/PackageCard";
import NotFoundComponent from "../../components/reuseables/NotFoundComponent";
import SeeMoreBtn from "../../components/reuseables/SeeMoreBtn";
import { useLocalSearchParams } from "expo-router";

export default function Packages() {
  const theme = useSelector((state) => state.app.theme);

  const [formData, setFormData] = useState({
    q: "",
    sort: "all",
  });

  //check for ref
  const { ref } = useLocalSearchParams();

  useEffect(() => {
    if (ref) {
      setFormData({ q: "", sort: ref });
    }
  }, [ref]);

  const sort_options = [
    "all",
    "in-progress",
    "completed",
    "on-delivery",
    "delivered",
    "canceled",
  ];

  //handle search function
  const [packages, setPackages] = useState();
  const [meta, setMeta] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const search_packages = async (page) => {
    const { q, sort } = formData;
    const res = await PACKAGE_HOOKS.fetch_multiple_packages(
      setIsLoading,
      page,
      sort,
      q
    );

    if (res) {
      const { packages, meta } = res;
      const { page } = meta;

      setMeta(meta);

      //check appending format
      if (page === 1) {
        setPackages(packages);
      } else {
        setPackages((prev) => [...prev, ...packages]);
      }
    }
  };

  //run search function for any slight change
  const searchFunc = DEBOUNCE(() => {
    setPackages(null);
    search_packages(1);
  });

  useEffect(() => {
    searchFunc();
  }, [formData?.sort]);

  //handle see more function
  const see_more = DEBOUNCE(async () => {
    if (Boolean(meta?.has_next_page)) {
      search_packages(Number(meta?.page + 1));
    }
  });

  return (
    <>
      {/**search box */}
      <PageSearchComponent
        form={formData}
        setForm={setFormData}
        placeholder={"Search for packages"}
        filter_array={sort_options}
        onSubmit={() => searchFunc()}
      />

      {/**search result */}
      <ScrollView contentContainerStyle={styles(theme).resultCont}>
        <SectionGroupWrapper>
          {packages?.length > 0 ? (
            packages?.map((item, index) => (
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

          {/**see more button */}
          {meta?.has_next_page && (
            <SeeMoreBtn onPress={() => see_more()} isLoading={isLoading} />
          )}
        </SectionGroupWrapper>
      </ScrollView>
    </>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    resultCont: {
      width: "100%",
      padding: 16,
    },
  });
