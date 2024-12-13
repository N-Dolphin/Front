import { create } from 'zustand';
import requests, { postRequest } from '../api/request';
import axios from 'axios';
import { toast } from 'react-toastify';

type State = {
  isLogin: boolean;

  hasProfile: boolean;
  hasProfileLocation: boolean;
  hasProfileImage: boolean;
};

type Action = {
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    message?: string;
    hasProfile?: boolean;
    hasProfileLocation?: boolean;
    hasProfileImage?: boolean;
  }>;
  logout: () => void;
};

export const useSession = create<State & Action>((set) => {
  // sessionStorage에서 토큰 확인
  const token = sessionStorage.getItem('accessToken');

  return {
    isLogin: !!token,
    profile: null,
    hasProfile: false,
    hasProfileLocation: false,
    hasProfileImage: false,
    login: async (email, password) => {
      try {
        const response = await postRequest(requests.fetchSignIn, {
          email,
          password,
        });
        console.log(response);
        if (
          response.data.token.accessToken &&
          response.data.token.refreshToken
        ) {
          // 로그인 시 토큰을 sessionStorage에 저장

          sessionStorage.setItem(
            'accessToken',
            response.data.token.accessToken
          );
          sessionStorage.setItem(
            'refreshToken',
            response.data.token.refreshToken
          );
          set({
            hasProfile: response.data.hasProfile,
            hasProfileLocation: response.data.hasProfileLocation,
            hasProfileImage: response.data.hasProfileImage,
            isLogin: true,
          });
          return {
            success: true,
            hasProfile: response.data.hasProfile,
            hasProfileLocation: response.data.hasProfileLocation,
            hasProfileImage: response.data.hasProfileImage,
          };
        }
        return { success: false, messgae: response.data.message };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
          return { success: false };
        } else {
          console.error('signinError', error);
          return { success: false };
        }
      }
    },
    logout: () => {
      set({
        isLogin: false,
        hasProfile: false,
        hasProfileLocation: false,
        hasProfileImage: false,
      });
      // 로그아웃 시 sessionStorage에서 토큰 제거
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    },
  };
});