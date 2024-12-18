import axios from 'axios';
import { getRefreshToken, setToken } from '../util/token';

const instance = axios.create({
  baseURL: import.meta.env.VITE_PROJECT_SERVER_URL as string,
  headers: {},
});

export default instance;

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      error.response.data.message ===
        '토큰이 유효하지 않습니다. 다시 로그인하세요.' &&
      !originalRequest._retry
      // error.response.status === 401 &&
      // error.response.message === '만료된 토큰입니다.'
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        const response = await instance.post('/api/v1/auth/refresh', {
          refreshToken,
        });

        const newAccessToken = response.data.accessToken;

        // sessionStorage.setItem('accessToken', newAccessToken);
        setToken('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        // 실패했던 요청 재시도
        return instance(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우 로그아웃 처리
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        // 로그인 페이지로 리다이렉트 등의 처리
        return Promise.reject(refreshError);
      }
    }

    if (
      error.response.status === 401 &&
      error.response.data.message ===
        '리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.'
    ) {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      location.reload();
    }

    return Promise.reject(error);
  }
);
