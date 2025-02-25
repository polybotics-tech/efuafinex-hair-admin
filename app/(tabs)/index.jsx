import { StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import ScrollViewWrapper from "../../components/ui/ScrollViewWrapper";
import { COLOR_THEME } from "../../constants";
import SectionGroupWrapper from "../../components/ui/SectionGroupWrapper";
import PackageCard from "../../components/reuseables/PackageCard";
import NotFoundComponent from "../../components/reuseables/NotFoundComponent";
import { PACKAGE_HOOKS } from "../../helpers/hooks/package";
import { USER_HOOKS } from "../../helpers/hooks/user";
import { useSelector } from "react-redux";
import MobileAppSummaryComponent from "../../components/MobileAppSummaryComponent";
import UserCard from "../../components/reuseables/UserCard";
import { router } from "expo-router";

export default function Home() {
  const theme = useSelector((state) => state.app.theme);

  //fetch completed packages
  const [completedPackages, setCompletedPackages] = useState();
  const [cpLoading, setCpLoading] = useState(true);
  const fetch_completed_packages = async () => {
    const res = await PACKAGE_HOOKS.fetch_multiple_packages(
      setCpLoading,
      1,
      "completed"
    );

    if (res) {
      const { packages } = res;
      setCompletedPackages(packages);
    }
  };
  ////////////////////////

  //fetch newest users
  const [newestUsers, setNewestUsers] = useState();
  const [nuLoading, setNuLoading] = useState(false);
  const fetch_newest_users = async () => {
    const res = await USER_HOOKS.fetch_multiple_users(setNuLoading, 1);

    if (res) {
      const { users } = res;
      setNewestUsers(users);
    }
  };
  ////////////////////////

  ///load all functions for this page
  const runPageFunctions = () => {
    fetch_completed_packages();
    fetch_newest_users();
  };

  useEffect(() => {
    runPageFunctions();
  }, []);

  return (
    <>
      <ScrollViewWrapper
        style={styles(theme).scrollArea}
        refreshFunc={() => runPageFunctions()}
      >
        {/**mobile app summary */}
        <MobileAppSummaryComponent />

        {/**completed package section block */}
        <SectionGroupWrapper
          title={"Recently Completed Packages"}
          seeAllPath={"/packages?ref=completed"}
        >
          {completedPackages?.length > 0 ? (
            completedPackages
              ?.slice(0, 2)
              ?.map((item, index) => (
                <PackageCard
                  key={index}
                  data={item}
                  type={item?.package_type}
                  clickable={true}
                />
              ))
          ) : (
            <NotFoundComponent
              text={"No completed packages found"}
              isLoading={cpLoading}
            />
          )}
        </SectionGroupWrapper>

        {/**new users section block */}
        <SectionGroupWrapper title={"Newest App Users"} seeAllPath={"/users"}>
          {newestUsers?.length > 0 ? (
            newestUsers
              ?.slice(0, 5)
              ?.map((item, index) => <UserCard key={index} data={item} />)
          ) : (
            <NotFoundComponent
              text={"No registered app user found"}
              isLoading={nuLoading}
            />
          )}
        </SectionGroupWrapper>
      </ScrollViewWrapper>
    </>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    scrollArea: {
      backgroundColor: COLOR_THEME[theme].gray50,
      padding: 16,
      gap: 16,
    },
    dualScrollView: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
  });
