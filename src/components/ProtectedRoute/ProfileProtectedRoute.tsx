import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../../store/useSession';
import { useUserProfile } from '../../hooks/useUserProfile';

const ProfileProtectedRoute = () => {
  // 로그인 유무 체크
  const { isLogin } = useSession();
  const { data, isLoading } = useUserProfile();

  if (isLoading) return null;
  console.log(data);
  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }
  if (data && !data.gender) {
    return <Navigate to="/signup/setting/profile" replace />;
  }
  if (data && !data.profileImages) {
    return <Navigate to="/signup/setting/profileImageUploader" replace />;
  }
  if (data && !data.location) {
    return <Navigate to="/signup/setting/address" replace />;
  }

  return <Outlet />;
};

export default ProfileProtectedRoute;
