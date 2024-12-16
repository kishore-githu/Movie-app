import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Movie, WatchListMovie } from './types';
import './App.css'; // Ensure you import the CSS file

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchList, setWatchList] = useState<WatchListMovie[]>([]);
  const { register, handleSubmit } = useForm<{ query: string }>();
  const [query, setQuery] = useState<string>(''); // Track the search query
  const [isWatchListVisible, setIsWatchListVisible] = useState(false); // Track which section to display

  // Fetch movies when the query changes
  const fetchMovies = async (query: string) => {
    try {
      const response = await axios.get(`http://www.omdbapi.com/?s=${query}&apikey=fd25de3f`);
      if (response.data.Search) {
        setMovies(response.data.Search);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  // Effect to fetch movies whenever the query changes
  useEffect(() => {
    if (query) {
      fetchMovies(query);
    }
  }, [query]); // Dependency array includes query to trigger effect on query change

  const addToWatchList = (movie: Movie) => {
    if (!watchList.some((m) => m.imdbID === movie.imdbID)) {
      setWatchList([...watchList, { ...movie, rating: 0 }]);
      alert(`${movie.Title} has been added to your Watch List!`); // Show alert
    }
  };

  const updateRating = (imdbID: string, rating: number) => {
    setWatchList((prev) =>
      prev.map((movie) =>
        movie.imdbID === imdbID ? { ...movie, rating } : movie
      )
    );
  };

  const removeFromWatchList = (imdbID: string) => {
    setWatchList((prev) => prev.filter((movie) => movie.imdbID !== imdbID));
  };

  const onSubmit = (data: { query: string }) => {
    setQuery(data.query); // Update query state when form is submitted
  };

  const toggleSection = () => {
    setIsWatchListVisible(!isWatchListVisible); // Toggle between Search Results and Watch List
  };

  return (
    <div className="app">
      <h1>Movie App</h1>

      <div>
        <button onClick={toggleSection}>
          {isWatchListVisible ? 'Back to Search Results' : 'Go to Watch List'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="search-form">
        <input
          type="text"
          placeholder="Search for a movie"
          {...register('query', { required: true})}
        />
        <button type="submit">Search</button>
      </form>

      {/* Conditional rendering based on the section toggle */}
      {isWatchListVisible ? (
        <div className="watchlist-container">
          <h2>Watch List</h2>
          <div>
            {watchList.map((movie) => (
              <div key={movie.imdbID} className="movie-card">
                <img src={movie.Poster} alt={movie.Title} className="movie-poster" />
                <h3>{movie.Title} ({movie.Year})</h3>
                <label>
                  Rating:
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={movie.rating}
                    onChange={(e) => updateRating(movie.imdbID, +e.target.value)}
                  />
                </label>
                <button className="remove-btn" onClick={() => removeFromWatchList(movie.imdbID)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2>Search Results</h2>
          <div>
            {movies.map((movie) => (
              <div key={movie.imdbID} className="movie-card">
                <img src={movie.Poster} alt={movie.Title} className="movie-poster" />
                <h3>{movie.Title} ({movie.Year})</h3>
                <button className="add-btn" onClick={() => addToWatchList(movie)}>
                  Add to Watch List
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
