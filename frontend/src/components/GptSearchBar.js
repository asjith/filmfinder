import { useRef } from "react";
import language from "../utils/languageConstants";
import { useDispatch, useSelector } from "react-redux";
import useSearchMovies from "../hooks/useSearchMovies";
import {
  addMovies,
  setNotFound,
  toggleClickedSearchButton
} from "../utils/gptSearchSlice";
import { OPENAI_MOVIE_RECOMMENDATION } from "../utils/constants";

const GptSearchBar = () => {
  const searchText = useRef();
  const languageName = useSelector((store) => store.config.language);
  const searchMovieTMDB = useSearchMovies();
  const dispatch = useDispatch();

  const handleGptSearchClick = async () => {
    try {
      dispatch(toggleClickedSearchButton(1));
      dispatch(addMovies({ movieNames: null, movieResults: null }));
      dispatch(setNotFound(false));

      const encodedSearchQuery = encodeURIComponent(searchText.current.value);

      const data = await fetch(
        OPENAI_MOVIE_RECOMMENDATION + encodedSearchQuery
      );

      const json = await data.json();

      const gptMovieNames = json.recommendation;

      if (!gptMovieNames || gptMovieNames.length <= 3) {
        console.error("Sorry, could not find the movie recommendations.");
        dispatch(setNotFound(true));
      } else {
        const moviePromiseArray = gptMovieNames.map((movie) =>
          searchMovieTMDB(movie)
        );
        const gptMoviesResults = await Promise.all(moviePromiseArray);

        const moviesResult = gptMoviesResults.map((movie) => {
          let filteredResult = movie.filter((result) => {
            if (result.poster_path && result.vote_average > 5) return true;
          });

          if (filteredResult.length === 0 && movie.length > 0)
            filteredResult = movie[0];
          else if (filteredResult.length >= 1)
            filteredResult = filteredResult[0];
          else {
            filteredResult = {};
          }

          return filteredResult;
        });

        if (moviesResult.length) {
          dispatch(
            addMovies({
              movieNames: gptMovieNames,
              movieResults: moviesResult
            })
          );
        } else {
          dispatch(setNotFound(true));
        }
      }
      dispatch(toggleClickedSearchButton(0));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-[2%] w-1/2 bg-black rounded-lg text-[0.5rem] sm:text-xs">
      <form className="grid grid-cols-12" onSubmit={(e) => e.preventDefault()}>
        <input
          className="col-span-9 m-1 p-2 rounded-sm lg:col-span-10"
          placeholder={language?.[languageName]?.gptSearchPlaceholder}
          ref={searchText}
          maxLength="300"
        />
        <button
          type="submit"
          className="col-span-3 m-1 p-2 border border-red-700 bg-red-700 font-semibold text-white rounded-sm w-24 lg:col-span-2"
          onClick={handleGptSearchClick}
        >
          {language?.[languageName]?.search}
        </button>
      </form>
    </div>
  );
};

export default GptSearchBar;
