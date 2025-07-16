import { googleLoginService } from "../services/login";

export const useGoogleLogin = () => {
  const onClickButtonLogin = async () => {
    try {
      const response = googleLoginService();
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  return { onClickButtonLogin };
};
