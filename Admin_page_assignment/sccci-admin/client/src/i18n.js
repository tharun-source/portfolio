import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "Profile Settings": "Profile Settings",
      "Username": "Username",
      "Email": "Email",
      "Save Profile": "Save Profile",
      "Update Password": "Update Password",
      "Account Preferences": "Account Preferences",
      "Language": "Language",
      "Privacy & Security": "Privacy & Security",
      "Delete Account": "Delete Account",
      // ...add all your English texts here
    }
  },
  zh: {
    translation: {
      "Profile Settings": "个人设置",
      "Username": "用户名",
      "Email": "电子邮件",
      "Save Profile": "保存资料",
      "Update Password": "更新密码",
      "Account Preferences": "账户偏好",
      "Language": "语言",
      "Privacy & Security": "隐私与安全",
      "Delete Account": "删除账户",
      // ...add all your Chinese texts here
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("language") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;