import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { addUser, removeUser } from "../utils/userSlice";
import { SUPPORTED_LANGUAGE, USER_ICON } from "../utils/constants";
import useBreakpoints from "../hooks/useBreakpoints";
import search from "../icons/search.png";
import { changeLanguage } from "../utils/configSlice";
import home from "../icons/home.png";
import logoURL from "../icons/logo.png";
import userURL from "../icons/user.png";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const enableGptSearch = useSelector(
    (store) => store.gptSearch.enableGptSearch
  );
  const languageName = useSelector((store) => store.config.language);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const { uid, email, displayName } = user;
        dispatch(addUser({ uid: uid, email: email, displayName: displayName }));
        navigate("/browse");
      } else {
        // User is signed out
        dispatch(removeUser());
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };

  const handleDiscover = () => {
    navigate("/browse/discover");
  };

  const handleHome = () => {
    navigate("/browse");
  };

  const handleChangeLanguage = (e) => {
    dispatch(changeLanguage(e.target.value));
  };

  const { isTablet, isDesktop } = useBreakpoints();

  return (
    <div
      className={
        "fixed z-10 px-[2rem] py-4 w-full flex justify-between sm:px-[3rem]  " +
        (user ? "bg-black" : "bg-gradient-to-b from-black/100")
      }
    >
      <div className="flex items-center">
        <a href="/">
          <img className="w-4 md:w-8" src={logoURL} alt="logo" />
        </a>
      </div>

      {user && (
        <div className="flex gap-2 items-center shrink-0 sm:gap-4">
          {(isTablet || isDesktop) && (
            <p className="px-2 font-bold text-white">
              Hello {user.displayName}!
            </p>
          )}
          <button onClick={handleHome}>
            <img className="mx-2 w-4 md:w-8" src={home} title="Home" />
          </button>

          {enableGptSearch && (
            <button onClick={handleDiscover}>
              <img
                className="mx-2 w-4 md:w-8"
                src={search}
                title="Discover"
              />
            </button>
          )}

          {enableGptSearch && (
            <select
              className="border border-black bg-black text-white font-medium rounded-sm self-stretch text-[0.65rem] md:text-sm md:self-center md:px-2 md:py-1.5"
              onChange={handleChangeLanguage}
            >
              {SUPPORTED_LANGUAGE.map((lang) => (
                <option
                  key={lang.id}
                  value={lang.id}
                  selected={languageName == lang.id}
                >
                  {lang.name}
                </option>
              ))}
            </select>
          )}
          <img
            className="mx-2 rounded-sm w-4 md:w-8"
            src={USER_ICON}
            alt="user-icon"
            onError={(e) => (e.target.src = userURL)}
          />
          <button
            className="h-4 flex justify-center items-center md:h-8 border border-red-700 bg-red-700 text-white font-medium rounded-sm px-2 py-1.5 self-stretch text-xs md:self-center"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
