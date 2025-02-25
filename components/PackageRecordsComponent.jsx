import { StyleSheet, Text, View } from "react-native";
import React, { memo, useEffect, useState } from "react";
import PackageCard from "./reuseables/PackageCard";
import NotFoundComponent from "./reuseables/NotFoundComponent";
import SeeMoreBtn from "./reuseables/SeeMoreBtn";
import { PACKAGE_HOOKS } from "../helpers/hooks/package";
import { DEBOUNCE } from "../helpers/utils/debounce";
import { useSelector } from "react-redux";

const PackageRecordsComponent = ({ filter }) => {
  const theme = useSelector((state) => state.app.theme);

  const [packages, setPackages] = useState();
  const [meta, setMeta] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const fetchPackages = async (page) => {
    //send request
    const result = await PACKAGE_HOOKS.fetch_user_packages(setIsLoading, page);

    if (result) {
      setMeta(result?.meta);

      if (page > 1 && result?.packages) {
        setPackages((prev) => [...prev, ...result?.packages]);
      } else {
        setPackages(result?.packages);
      }
    }
  };

  useEffect(() => {
    fetchPackages(1);
  }, [filter]);

  const seeMore = DEBOUNCE(() => {
    fetchPackages(Number(meta?.page + 1));
  });

  return (
    <View style={styles(theme).component}>
      {packages?.length > 0 ? (
        packages?.map((item, index) => (
          <PackageCard
            key={index}
            type={item?.package_type}
            data={item}
            clickable={true}
          />
        ))
      ) : (
        <NotFoundComponent
          text={
            filter === "all"
              ? "No packages recorded"
              : `No ${filter} packages recorded`
          }
          isLoading={isLoading}
        />
      )}

      {/**see more button logic */}
      {packages?.length > 0 && meta?.has_next_page && (
        <SeeMoreBtn onPress={() => seeMore()} isLoading={isLoading} />
      )}
    </View>
  );
};

export default memo(PackageRecordsComponent);

const styles = (theme) =>
  StyleSheet.create({
    component: {
      width: "100%",
      padding: 16,
      gap: 16,
    },
  });
