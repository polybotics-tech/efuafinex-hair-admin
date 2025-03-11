const HOST = "https://api.efuafinexhair.com"; //"http://192.168.152.31:5050";
const API = HOST + "/v1/admin";

export const END_POINTS = {
  home: HOST,
  media: (url) => HOST + url,
  bank_logo: (name) => HOST + "/media/photos/bank-logo/" + name + ".png",
  auth: {
    login: API + "/auth/login",
    register: API + "/auth/register",
    apple: API + "/auth/apple",
    google: API + "/auth/google",
    revalidate: API + "/auth/revalidate",
    forgot: API + "/auth/forgot",
    reset_pass: API + "/auth/reset",
    generate_otp: API + "/auth/verify",
    verify_otp: API + "/auth/otp",
    pass: API + "/auth/pass",
    account: API + "/auth/account",
  },
  user: {
    multiple: (page = 1, sort = "all", q = "") =>
      API + `/users/?page=${page}&sort=${sort}&q=${q}`,
    single: (user_id) => API + `/users/${user_id}`,
    notifications: (page = 1) => API + `/users/notifications/?page=${page}`,
  },
  package: {
    multiple: (page = 1, sort = "all", q = "") =>
      API + `/packages/?page=${page}&sort=${sort}&q=${q}`,
    single: (package_id) => API + `/packages/${package_id}`,
    user_records: (user_id, page = 1, sort = "all", q = "") =>
      API + `/packages/user/${user_id}/?page=${page}&sort=${sort}&q=${q}`,
    update_status: (package_id, status) =>
      API + `/packages/update/${package_id}/${status}`,
  },
  deposit: {
    multiple: (page = 1, sort = "all", q = "") =>
      API + `/deposits/?page=${page}&sort=${sort}&q=${q}`,
    single: (transaction_ref) => API + `/deposits/${transaction_ref}`,
    user_records: (user_id, page = 1, sort = "all", q) =>
      API + `/deposits/user/${user_id}/?page=${page}&sort=${sort}&q=${q}`,
    package_records: (package_id, page = 1) =>
      API + `/deposits/records/${package_id}/?page=${page}`,
    total_transactions: (q) => API + `/deposits/total/?q=${q}`,
  },
  admin: {
    faqs: (page = 1) => API + `/faqs/?page=${page}`,
    update_faq: (faq_id) => API + `/faqs/${faq_id}`,
    contact_info: API + `/faqs/contacts/`,
    send_mail: API + `/faqs/sendmail/`,
    banners: (page = 1) => API + `/banners/?page=${page}`,
    delete_banner: (banner_id = "") => API + `/banners/${banner_id}/`,
  },
  transfer: {
    verify_account: API + "/transfers/verify/account/",
    request_funds: (package_id) =>
      API + `/transfers/request/funds/${package_id}`,
    finalize: (transfer_code) => API + `/transfers/finalize/${transfer_code}`,
    resend_otp: (transfer_code) => API + `/transfers/otp/${transfer_code}`,
    verify_status: (package_id) => API + `/transfers/verify/${package_id}`,
    single: (package_id) => API + `/transfers/${package_id}`,
    multiple: (page = 1, sort = "all", q = "") =>
      API + `/transfers/?page=${page}&sort=${sort}&q=${q}`,
  },
};
