import { useRef, useState } from "react";
import Header from "./Header";
import { validateForm } from "../utils/validate";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from "../utils/firebase";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { LOGIN_BACKGROUND } from "../utils/constants";
import useBreakpoints from "../hooks/useBreakpoints";
import loadingURL from "../icons/loading.png";
import backgroundURL from "../icons/background.jpg";

const Login = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const fullName = useRef(null);
  const email = useRef(null);
  const password = useRef(null);
  const dispatch = useDispatch();

  const handleIsSignInUp = () => {
    setIsSignIn(!isSignIn);
    email.current.value = "";
    password.current.value = "";
    setErrorMsg("");
  };

  const handleSignInUp = () => {
    //validate the email and password entered
    const msg = validateForm(email.current.value, password.current.value);
    setErrorMsg(msg);

    if (msg) return;

    setLoading(true);

    //if email password are valid
    if (!isSignIn) {
      //Sign Up logic
      createUserWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then((userCredential) => {
          // Signed up
          const user = userCredential.user;
          updateProfile(auth.currentUser, {
            displayName: fullName.current.value
          })
            .then(() => {
              const { uid, email, displayName } = auth.currentUser;
              dispatch(
                addUser({ uid: uid, email: email, displayName: displayName })
              );
              setLoading(false);
            })
            .catch((error) => {
              setErrorMsg(error);
              setLoading(false);
            });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setErrorMsg(errorMessage);
          setLoading(false);
        });
    } else {
      //Sign In logic
      signInWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          setLoading(false);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setErrorMsg(errorMessage);
          setLoading(false);
        });
    }
  };

  const handleGuestLogin = () => {
    setLoadingGuest(true);
    signInWithEmailAndPassword(
      auth,
      process.env.REACT_APP_GUEST_USERNAME,
      process.env.REACT_APP_GUEST_PASSWORD
    )
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        setLoadingGuest(false);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setErrorMsg(errorMessage);
        setLoadingGuest(false);
      });
  };

  const { isMobile } = useBreakpoints();

  return (
    <div className="relative h-screen">
      <Header />
      {!isMobile && (
        <img
          className="absolute z-0 brightness-50 object-cover min-h-screen w-full"
          src={backgroundURL}
          alt="background"
        />
      )}

      <form
        className="absolute z-20 bg-black h-auto w-full px-[3rem] py-[2rem] my-[9%] text-white  bg-opacity-0 right-0 left-0 md:bg-opacity-75 md:rounded-md md:w-[28rem] md:mx-auto"
        onSubmit={(e) => e.preventDefault()}
      >
        <h1 className="my-5 font-bold text-3xl">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h1>
        {!isSignIn && (
          <input
            type="text"
            placeholder="Full Name"
            className="my-3 p-3 w-full bg-black border border-gray-600 rounded-md"
            ref={fullName}
          ></input>
        )}
        <input
          type="text"
          placeholder="Email Address"
          className="my-3 p-3 w-full bg-black border border-gray-600 rounded-md"
          ref={email}
        ></input>
        <input
          type="password"
          placeholder="Password"
          className="my-3 p-3 w-full bg-black border border-gray-600 rounded-md"
          ref={password}
        ></input>
        {!isSignIn && (
          <p className="p-3 w-full text-xs">
            * Password must be at least 8 characters and include uppercase,
            lowercase, and a number
          </p>
        )}
        <p className="my-5 font-bold text-red-700">{errorMsg}</p>
        <button
          type="submit"
          className={
            "my-3 p-2 w-full bg-red-700 font-bold rounded-md hover:bg-opacity-75  " +
            (loading && "  bg-opacity-25")
          }
          onClick={handleSignInUp}
        >
          {loading ? (
            <img
              className="rotate w-5 h-5 mx-auto"
              src={loadingURL}
              alt="loading"
            />
          ) : isSignIn ? (
            "Sign In"
          ) : (
            "Sign Up"
          )}
        </button>
        <button
          type="button"
          className={
            "my-3 p-2 w-full border-2 border-red-700 text-red-700 font-bold rounded-md hover:border-opacity-75 hover:text-opacity-75"
          }
          title="View the application as a guest — no login required."
          onClick={handleGuestLogin}
        >
          {loadingGuest ? (
            <img
              className="rotate w-5 h-5 mx-auto"
              src={loadingURL}
              alt="loading"
            />
          ) : (
            "Continue as guest"
          )}
        </button>
        <button
          type="button"
          className="my-5 cursor-pointer"
          onClick={handleIsSignInUp}
        >
          {isSignIn ? (
            <p>
              New to FilmFinder? <span className="font-bold">Sign Up now</span>
            </p>
          ) : (
            <p>
              Already registered? <span className="font-bold">Sign In now</span>
            </p>
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
