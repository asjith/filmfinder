import express from "express";
import cors from "cors";
import "dotenv/config";
import { MOVIE_API_OPTIONS } from "./constants.js";
import openai from "./openai.js";

const app = express();

app.use(
  cors({
    origin: "*"
  })
);

app.get("/", (req, res) => {
  res.send("Server is ready");
});

app.get("/api/now_playing", async (req, res) => {
  try {
    const data = await fetch(
      "https://api.themoviedb.org/3/movie/now_playing?page=1",
      MOVIE_API_OPTIONS
    );

    if (!data.ok) {
      res.status(data.status).json({
        error: `HTTP error, ${data.status} ${data.statusText} at ${
          data.url
        } (${new Date().toISOString()})`
      });
      return;
    }

    const json = await data.json();
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: `Network error, ${error}` });
  }
});

app.get("/api/popular", async (req, res) => {
  try {
    const data = await fetch(
      "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
      MOVIE_API_OPTIONS
    );

    if (!data.ok) {
      res.status(data.status).json({
        error: `HTTP error, ${data.status} ${data.statusText} at ${
          data.url
        } (${new Date().toISOString()})`
      });
      return;
    }

    const json = await data.json();
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: `Network error, ${error}` });
  }
});

app.get("/api/top_rated", async (req, res) => {
  try {
    const data = await fetch(
      "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1",
      MOVIE_API_OPTIONS
    );

    if (!data.ok) {
      res.status(data.status).json({
        error: `HTTP error ${data.status} ${data.statusText} at ${
          data.url
        } (${new Date().toISOString()})`
      });
      return;
    }

    const json = await data.json();
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: `Network error, ${error}` });
  }
});

app.get("/api/upcoming", async (req, res) => {
  try {
    const data = await fetch(
      "https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1",
      MOVIE_API_OPTIONS
    );

    if (!data.ok) {
      res.status(data.status).json({
        error: `HTTP error, ${data.status} ${data.statusText} at ${
          data.url
        } (${new Date().toISOString()})`
      });
      return;
    }

    const json = await data.json();

    res.json(json);
  } catch (error) {
    res.status(500).json({ error: `Network error, ${error}` });
  }
});

app.get("/api/trailers", async (req, res) => {
  try {
    const data = await fetch(
      "https://api.themoviedb.org/3/movie/" +
        req.query.movieId +
        "/videos?language=en-US",
      MOVIE_API_OPTIONS
    );

    if (!data.ok) {
      res.status(data.status).json({
        error: `HTTP error, ${data.status} ${data.statusText} at ${
          data.url
        } (${new Date().toDateString()})`
      });
      return;
    }

    const json = await data.json();
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: `Network error, ${error}` });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const data = await fetch(
      "https://api.themoviedb.org/3/search/movie?query=" +
        req.query.movie +
        "&include_adult=false&language=en-US&page=1",
      MOVIE_API_OPTIONS
    );

    if (!data.ok) {
      res.status(data.status).json({
        error: `HTTP error, ${data.status} ${data.statusText} at ${
          data.url
        } (${new Date().toISOString()})`
      });
      return;
    }

    const json = await data.json();
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: `Network error, ${error}` });
  }
});

app.get("/api/movie_logo", async (req, res) => {
  try {
    const data = await fetch(
      "https://api.themoviedb.org/3/movie/" + req.query.movieId + "/images",
      MOVIE_API_OPTIONS
    );

    if (!data.ok) {
      res.status(data.status).json({
        error: `HTTP error, ${data.status} ${data.statusText} at ${
          data.url
        } (${new Date().toISOString()})`
      });
      return;
    }

    const json = await data.json();
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: `Network error, ${error}` });
  }
});

app.get("/api/movieDetails", async (req, res) => {
  try {
    const data = await fetch(
      "https://api.themoviedb.org/3/movie/" + req.query.movieId,
      MOVIE_API_OPTIONS
    );

    if (!data.ok) {
      res.status(data.status).json({
        error: `HTTP error ${data.status} ${data.statusText} at ${
          data.url
        } (${new Date().toISOString()})`
      });
      return;
    }

    const json = await data.json();
    res.json(json);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Network error: Failed to fetch. ${error.message}` });
  }
});

app.get("/api/cast", async (req, res) => {
  try {
    const data = await fetch(
      "https://api.themoviedb.org/3/movie/" + req.query.movieId + "/credits",
      MOVIE_API_OPTIONS
    );

    if (!data.ok) {
      res.status(data.status).json({
        error: `HTTP error, ${data.status} ${data.statusText} at ${
          data.url
        } (${new Date().toISOString()})`
      });
      return;
    }

    const json = await data.json();
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: `Network error, ${error}` });
  }
});

app.get("/api/movie-recommendations", async (req, res) => {
  try {
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      instructions:
        "Act like movie recommendation system. You have access to up-to-date movie knowledge across all languages, including Indian cinema (Malayalam, Tamil, Telugu, Hindi, etc.), Hollywood, and global films.",
      input:
        "Suggest movies for query " +
        req.query.searchQuery +
        ". Recommend exactly 5 movies seperated by comma. Example: Avesham, War, Dhoom, Falimy, Notebook." +
        "If a person's name spotted in the query, then give results of movies he or she has appeared on." +
        "Like 'basil joseph movies', then display movies where basil joseph has acted on." +
        "if mentioned basil joseph directed movies, then display movies directed by him." +
        "if you identify a person as a director only, then display movies that he has directed." +
        "Always fetch latest, recent movies unless mentioned old, retro." +
        "Always display movies list. Never ask any question as response. Trust your intuition." +
        "To summarise:" +
        "You are a movie recommendation system. Always output exactly 5 movie titles separated by commas — nothing else." +
        "Rules:" +
        "1. The user will enter a text query describing what kind of movies they want (e.g., 'Indian retro movies', 'Basil Joseph movies', 'romantic Malayalam films', etc.)." +
        "2. If the query includes a person's name:" +
        "- If the query mentions 'directed' or 'director', return movies that the person has directed." +
        "- Otherwise, return movies the person has acted in or appeared in (even cameo roles)." +
        "- If fewer than 5 movies are available, fill the remaining slots with movies similar in genre, language, or style." +
        "3. If the query includes both a person and a genre, prioritize that combination (e.g., 'Nivin Pauly action movies' → Nivin Pauly’s action movies)." +
        "4. If no person is mentioned, treat the query as a general movie search based on genre, language, theme, or time period." +
        "5. Always prefer recent and popular titles from the last few years unless the query explicitly mentions 'old', 'classic', or 'retro'." +
        "6. Never ask questions or seek clarification. Never include explanations or text outside the movie list." +
        "7. The final output must be **only** a list of 5 movie titles separated by commas, e.g.:Aavesham, War, Dhoom, Falimy, Notebook, ..."
    });

    const data = response?.output_text?.split(", ");

    if (!data) {
      res.status(500).json({
        error: `Failed to get recommendation for query: ${req.query.searchQuery}`
      });
      return;
    }

    res.status(200).json({
      query: req.query.searchQuery,
      recommendation: data
    });
  } catch (error) {
    res.status(500).json({ error: `Network error, ${error}` });
  }
});

// const port = process.env.PORT || 3001;
// app.listen(port, () => {
//   console.log(`Server started at port ${port}`);
// });

export default app;
