import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import AuthFormComponent from "../../components/AuthFormComponent";
import { Octicons } from "@expo/vector-icons";
import { COLOR_THEME, SCREEN_DIMENSION } from "../../constants";
import { useSelector } from "react-redux";
import { BORDER_RADIUS } from "../../constants/theme";
import PrimaryButton from "../../components/reuseables/PrimaryButton";
import PageSearchComponent from "../../components/PageSearchComponent";
import { USER_HOOKS } from "../../helpers/hooks/user";
import { DEBOUNCE } from "../../helpers/utils/debounce";
import SectionGroupWrapper from "../../components/ui/SectionGroupWrapper";
import UserCard from "../../components/reuseables/UserCard";
import NotFoundComponent from "../../components/reuseables/NotFoundComponent";
import SeeMoreBtn from "../../components/reuseables/SeeMoreBtn";

export default function Users() {
  const theme = useSelector((state) => state.app.theme);

  const [formData, setFormData] = useState({
    q: "",
    sort: "all",
  });

  const sort_options = ["all", "verified", "unverified"];

  //handle search function
  const [users, setUsers] = useState();
  const [meta, setMeta] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const search_users = async (page) => {
    const { q, sort } = formData;
    const res = await USER_HOOKS.fetch_multiple_users(
      setIsLoading,
      page,
      sort,
      q
    );

    if (res) {
      const { users, meta } = res;
      const { page } = meta;

      setMeta(meta);

      //check appending format
      if (page === 1) {
        setUsers(users);
      } else {
        setUsers((prev) => [...prev, ...users]);
      }
    }
  };

  //run search function for any slight change
  const searchFunc = DEBOUNCE(() => {
    setUsers(null);
    search_users(1);
  });

  useEffect(() => {
    searchFunc();
  }, [formData?.sort]);

  //handle see more function
  const see_more = DEBOUNCE(async () => {
    if (Boolean(meta?.has_next_page)) {
      search_users(Number(meta?.page + 1));
    }
  });

  return (
    <>
      {/**search box */}
      <PageSearchComponent
        form={formData}
        setForm={setFormData}
        placeholder={"Search for users"}
        filter_array={sort_options}
        onSubmit={() => searchFunc()}
      />

      {/**search result */}
      <ScrollView contentContainerStyle={styles(theme).resultCont}>
        <SectionGroupWrapper>
          {users?.length > 0 ? (
            users?.map((item, index) => <UserCard key={index} data={item} />)
          ) : (
            <NotFoundComponent text={"No user found"} isLoading={isLoading} />
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
