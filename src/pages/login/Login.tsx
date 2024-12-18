import styles from './Login.module.css';
import { useNavigate } from 'react-router-dom';
import MainButton from '../../components/ui/MainButton';
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSession } from '../../store/useSession';

type Inputs = {
  email: string;
  password: string;
};

const Login = () => {
  const { login } = useSession();
  const nav = useNavigate();
  const { register, handleSubmit } = useForm<Inputs>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });
  const requestURL = import.meta.env.VITE_PROJECT_SERVER_URL;

  const loginHandler: SubmitHandler<Inputs> = async (data) => {
    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        // 프로필 정보에 따라 리디렉션
        if (!result.hasProfile) {
          toast.success('생성중이던 프로필로 이동합니다.');
          nav('/signup/setting/profile');
          return; // 리디렉션 후 종료
        }
        if (!result.hasProfileImage) {
          toast.success('생성중이던 프로필로 이동합니다.');
          nav('/signup/setting/profileImageUploader');
          return; // 리디렉션 후 종료
        }
        if (!result.hasProfileLocation) {
          toast.success('생성중이던 프로필로 이동합니다.');
          nav('/signup/setting/address');
          return; // 리디렉션 후 종료
        }

        // 모든 프로필 정보가 있는 경우
        nav('/match');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        console.error('signinError', error);
      }
    }
  };
  const errorHandler = (errors: FieldErrors<Inputs>) => {
    const errorMessages = ['email', 'password'] as const;

    // 첫 번째로 발견된 에러만 처리 (선택적)
    for (const field of errorMessages) {
      if (errors[field]) {
        toast.error(errors[field]?.message);
        return;
      }
    }
  };
  const signupHandler = () => {
    nav('/signup/credential');
  };
  const kakaoLoginHandler = () => {
    window.location.href = `${requestURL}/api/v1/auth`;
  };
  return (
    <>
      <article className={styles.container}>
        <div className={styles.titleWrapper}>
          <h2>엔돌핀</h2>
        </div>
        <div className={styles.formWrapper}>
          <form onSubmit={handleSubmit(loginHandler, errorHandler)}>
            <input
              type="email"
              autoComplete="off"
              {...register('email', {
                required: '이메일을 입력해주세요.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '이메일 형식이 올바르지 않습니다.',
                },
              })}
            />
            <input type="password" {...register('password')} />
            <MainButton text="로그인" type="submit" />
            <div className={styles.socialLoginBtnContainer}>
              <button type="button" onClick={kakaoLoginHandler}>
                <svg
                  viewBox="0 0 512 512"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#000000"
                    d="M255.5 48C299.345 48 339.897 56.5332 377.156 73.5996C414.415 90.666 443.871 113.873 465.522 143.22C487.174 172.566 498 204.577 498 239.252C498 273.926 487.174 305.982 465.522 335.42C443.871 364.857 414.46 388.109 377.291 405.175C340.122 422.241 299.525 430.775 255.5 430.775C241.607 430.775 227.262 429.781 212.467 427.795C148.233 472.402 114.042 494.977 109.892 495.518C107.907 496.241 106.012 496.15 104.208 495.248C103.486 494.706 102.945 493.983 102.584 493.08C102.223 492.177 102.043 491.365 102.043 490.642V489.559C103.126 482.515 111.335 453.169 126.672 401.518C91.8486 384.181 64.1974 361.2 43.7185 332.575C23.2395 303.951 13 272.843 13 239.252C13 204.577 23.8259 172.566 45.4777 143.22C67.1295 113.873 96.5849 90.666 133.844 73.5996C171.103 56.5332 211.655 48 255.5 48Z"
                  ></path>
                </svg>
                <span>카카오 로그인</span>
              </button>
            </div>
          </form>
        </div>
        <div></div>
        <div className={styles.signupContainer}>
          <p>또는</p>
          <MainButton text="회원가입" type="button" onClickFn={signupHandler} />
        </div>
      </article>
    </>
  );
};

export default Login;
