import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//=== google firebase import start ===
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuthState } from "react-firebase-hooks/auth"
// ===================================
import { toast } from 'react-toastify';

const Contextpage = createContext();

export function MovieProvider({ children }) {

  const [header, setHeader] = useState("Trending");
  const [totalPage, setTotalPage] = useState(null)
  const [movies, setMovies] = useState([]);
  const [searchedMovies, setSearchedMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommendedByFriends, setRecommendedByFriends] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [page, setPage] = useState(1);
  const [activegenre, setActiveGenre] = useState(28);
  const [genres, setGenres] = useState([])
  const [loader, setLoader] = useState(true);
  const [backgenre, setBackGenre] = useState(false);
  const [user, setUser] = useAuthState(auth)//=======> firebase custom hooks state
  const navigate = useNavigate();// =====> navigate page

  const APIKEY = import.meta.env.VITE_API_KEY;
  const recommendationSystemURI = "http://localhost:8080";

	function setCustomHeaders () {	  
    // options.headers = { ...options.headers, ...additionalHeaders };
	return {
		method: 'GET',
		headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjaHVua3kuZ3VwdGEiLCJpYXQiOjE3MTYwODM0MzIsImV4cCI6MTcxNjE3MzQzMn0.MCNTV_6y2j9c0lUywHyfh4bAdYG37imo7BitD9JTCEw'}
	}
  }

  useEffect(() => {
    if (page < 1) {
      setPage(1)  // Increment page to 1 if it is less than 1.
    }
  }, [page]);


  const filteredGenre = async () => {
    const data = await fetch(
    	`${recommendationSystemURI}/recommendation/get?with_genres=${activegenre}&api_key=${APIKEY}&with_origin_country=IN&pageNo=${page}`,
		setCustomHeaders()
    );
    const filteredGenre = await data.json();
    setMovies(movies.concat(filteredGenre.results)); // Concat new movies with previous movies, on genre change movies are reset to [] so that only movies of new genre will appear, check out useEffect on top for more information.
    setTotalPage(filteredGenre.total_pages);
    setLoader(false);
    setHeader("Genres");
  };

  const fetchSearch = async (query) => {
    const data = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&with_origin_country=IN&language=en-US&query=${query}&page=1&include_adult=false`
    );
    const searchmovies = await data.json();
    setSearchedMovies(searchmovies.results); 
    setLoader(false);
    setHeader(`Results for "${query}"`);
  }

  const fetchGenre = async () => {
    const data = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${APIKEY}&with_origin_country=IN&language=en-US`
    );
    const gen = await data.json();
    setGenres(gen.genres);
  }

  const fetchTrending = async () => {
    const data = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${APIKEY}&with_origin_country=IN&page=${page}`
    );
    const trend = await data.json();
    setTrending(trending.concat(trend.results));
    setTotalPage(trend.total_pages);
    setLoader(false);
	setHeader("Trending");

  }

  const fetchRecommendationByFriends = async () => {
    const data = await fetch(
    	`http://localhost:8080/friend/recommendationToMe`,
		setCustomHeaders()
    );
    const recommended = await data.json();
    setRecommendedByFriends(recommended);
    setLoader(false);
    setHeader("Recommendation by Friends");
  }

  const history = async () => {
    const data = await fetch(
    	`http://localhost:8080/recommendation/history`,
		setCustomHeaders()
    );
    const history = await data.json();
    setWatchHistory(history);
    setLoader(false);
    setHeader("Watch Again");
  }

  const fetchUpcoming = async () => {
    const data = await fetch(
      `https://api.themoviedb.org/3/movie/upcoming?api_key=${APIKEY}&with_origin_country=IN&language=en-US&page=${page}`
    );
    const upc = await data.json();
    setUpcoming(upcoming.concat(upc.results));
    setTotalPage(upc.total_pages);
    setLoader(false);
    setHeader("Upcoming Movies");
  }

  // creat local storage
  const GetFavorite = () => {
    setLoader(false);
    setHeader("Favorite Movies");
  }


  //<========= firebase Google Authentication ========>
  const googleProvider = new GoogleAuthProvider();// =====> google auth provide

  const GoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      navigate("/")
      toast.success("Login successfully");
    } catch (err) {
      console.log(err)
      navigate("/")
    }
  }
  // <==========================================================>

  return (
    <Contextpage.Provider
      value={{
        fetchGenre,
        genres,
        setGenres,
        filteredGenre,
        header,
        setHeader,
        movies,
        setMovies,
        page,
        setPage,
        activegenre,
        setActiveGenre,
        fetchSearch,
        loader,
        setBackGenre,
        backgenre,
        setLoader,
        fetchTrending,
        trending,
		fetchRecommendationByFriends,
		recommendedByFriends,
		history,
		watchHistory,
        fetchUpcoming,
        upcoming,
        GetFavorite,
        totalPage,
        searchedMovies,
        GoogleLogin,
        user
      }}
    >
      {children}
    </Contextpage.Provider>
  );

}

export default Contextpage
