import { useSelector } from "react-redux";

/**
 * Custom hook to get user data from Redux store
 * @returns {Object|undefined} The user data from auth state
 */
const usePeopleData = () => {
  const { authData } = useSelector((state) => state.auth);
  return authData;
};

export default usePeopleData;
