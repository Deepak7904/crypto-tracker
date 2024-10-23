const loaderContainer = document.querySelector(".loader-container");
const next = document.getElementById("next-button");
const prev = document.getElementById("prev-button");
const searchBox = document.getElementById("search-box");
const searchIcon = document.querySelector(".search-icon");
const sortPriceAsc = document.getElementById("sort-price-asc");
const sortPriceDesc = document.getElementById("sort-price-desc");
const sortVolumeAsc = document.getElementById("sort-volume-asc");
const sortVolumeDesc = document.getElementById("sort-volume-desc");
const sortMarketAsc = document.getElementById("sort-market-asc");
const sortMarketDesc = document.getElementById("sort-market-desc");

//API req options
const options= {
    method: "GET",
    headers: {
        accept: "application/json",
        "x-cg-demo-api-key": "CG-1yG8Ze9VXCbd2zBvLBaqhqvt",
    },
};

const base_url="https://api.coingecko.com/api/v3";

//important variables
const itemsperpage = 10;
let currentPage = 1;
let coins=[]
let page = 1;

//loader page
const showLoader = ()=>{
    loaderContainer.style.display = "flex";
}

const hideLoader = ()=>{
    loaderContainer.style.display = "none";
}

//calling the api
const fetchCoins = async (page = 1)=>{
    try{
        showLoader()
        const response = await fetch(`${base_url}/coins/markets?vs_currency=usd&per_page=${itemsperpage}&page=${page}`,options);
        coins= await response.json();
        console.log(coins);
        return coins;
    }catch(err){
        console.log(err);
    }
    finally{
        hideLoader();
    }
}
// Render a single coin row
const renderCoins = (coinsToDisplay, page) => {
    const start = (page - 1) *10 + 1;
    const favorites = getFavorites();
    const tableBody = document.querySelector("#crypto-table tbody");
    tableBody.innerHTML = "";
  
    coinsToDisplay.forEach((coin, index) => {
      const row = renderCoinRow(coin, index, start, favorites);
      attachRowEvents(row, coin.id);
      tableBody.appendChild(row);
    });
  };
  
  // Create a coin row
  const renderCoinRow = (coin, index, start, favorites) => {
    const isFavorite = favorites.includes(coin.id);
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${start + index}</td>
          <td><img src="${coin.image ?? coin.thumb}" alt="${
      coin.name
    }" width="24" height="24" /></td>
          <td>${coin.name}</td>
          <td>$${coin.current_price?.toLocaleString() ?? ""}</td>
          <td>$${coin.total_volume?.toLocaleString() ?? ""}</td>
          <td>$${coin.market_cap?.toLocaleString() ?? ""}</td>
          <td>
              <i class="fas fa-star favorite-icon ${
                isFavorite ? "favorite" : ""
              }" data-id="${coin.id}"></i>
          </td>
      `;
    return row;
  };
  
  // Attach events to a coin row
  const attachRowEvents = (row, coinId) => {
    row.addEventListener("click", (event) => {
      if (!event.target.classList.contains("favorite-icon")) {
        window.location.href = `coin/coin.html?id=${coinId}`;
      }
    });
    row.querySelector(".favorite-icon").addEventListener("click", (event) => {
      event.stopPropagation();
      handleFavoriteClick(coinId);
    });
  };

// Save favorites to localStorage
const saveFavorites = (favorites) =>
    localStorage.setItem("favorites", JSON.stringify(favorites));

// Retrieve favorites from localStorage
const getFavorites = () => JSON.parse(localStorage.getItem("favorites")) || [];

// Handle favorite icon click
const handleFavoriteClick = (coinId) => {
    const favorites = toggleFavorite(coinId);
    saveFavorites(favorites);
    renderCoins(coins, currentPage);
  };

// Toggle favorite status
const toggleFavorite = (coinId) => {
    let favorites = getFavorites();
    if (favorites.includes(coinId)) {
      favorites = favorites.filter((id) => id !== coinId);
    } else {
      favorites.push(coinId);
    }
    return favorites;
  };

//Dom content Loaded
const initializePage = async () => {
    await fetchCoins(currentPage);
    renderCoins(coins,currentPage);
    updatePaginationControls();
}
document.addEventListener("DOMContentLoaded", initializePage);

// NEXT BTN
const handleNextButtonClick = async() => {
    currentPage++;
    await fetchCoins(currentPage);
    renderCoins(coins,currentPage);
    updatePaginationControls();
}
next.addEventListener('click', handleNextButtonClick);

//PREV BTN
const handlePrevButtonClick = async() => {
    if(currentPage > 1){
        currentPage--;
        await fetchCoins(currentPage);
        renderCoins(coins, currentPage);
        updatePaginationControls();
    }
}
prev.addEventListener('click',handlePrevButtonClick);


//Pagination controls
const updatePaginationControls = () => {
    if (currentPage === 1) {
      prev.disabled = true;
      prev.classList.add("disabled");
    } else {
      prev.disabled = false;
      prev.classList.remove("disabled");
    }
  
    if (coins.length < 10) {
      next.disabled = true;
      next.classList.add("disabled");
    } else {
      next.disabled = false;
      next.classList.remove("disabled");
    }
  };

//sorting functions
const sortCoinsByPrice = (order) => {
    coins.sort((a,b) =>
    order === "asc" ? a.current_price - b.current_price : b.current_price - a.current_price);
    renderCoins(coins,currentPage);
};

const sortCoinsByVolume = (order) =>{
    coins.sort((a,b)=>
    order === "asc" ? a.total_volume - b.total_volume : b.total_volume - a.total_volume);
    renderCoins(coins,currentPage);
};

const sortCoinsByMarketCap = (order) =>{
    coins.sort((a,b)=>
    order = "asc" ? a.market_cap - b.market_cap : b.market_cap - a.market_cap);
    renderCoins(coins,currentPage);
};

sortPriceAsc.addEventListener("click", () => sortCoinsByPrice("asc"));
sortPriceDesc.addEventListener("click", () => sortCoinsByPrice("desc"));
sortVolumeAsc.addEventListener("click", () => sortCoinsByVolume("asc"));
sortVolumeDesc.addEventListener("click", () => sortCoinsByVolume("desc"));
sortMarketAsc.addEventListener("click", () => sortCoinsByMarketCap("asc"));
sortMarketDesc.addEventListener("click", () => sortCoinsByMarketCap("desc"));

// Fetch and display search results
const fetchSearchResults = async (query) => {
    try {
      const response = await fetch(`${base_url}/search?query=${query}`, options);
      const data = await response.json();
      const filteredCoins = data.coins.map((coin) => coin.id);
      const resData = await fetchSearchedItems(filteredCoins);
      return resData;
    } catch (err) {
      console.error("Error fetching search results:", err);
      return [];
    }
  };
  
  const fetchSearchedItems = async (ids) => {
    try {
      showLoader(); // Show shimmer effect before fetching data
      const response = await fetch(
        `${base_url}/coins/markets?vs_currency=usd&ids=${ids.join(
          ","
        )}`,
        options
      );
  
      const fetchedCoins = await response.json();
      hideLoader(); // Hide shimmer effect after data is fetched
  
      return fetchedCoins;
    } catch (err) {
      console.error(err);
      hideLoader(); // Ensure shimmer is hidden in case of an error
    }
  };
  
// Debounce function
let debounceTimeout;
const debounce = (func, delay) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(func, delay);
};
  
// Handle search input with debounce
  const handleSearchInput = () => {
    debounce(async () => {
      const searchTerm = searchBox.value.trim();
      if (searchTerm) {
        const result = await fetchSearchResults(searchTerm);
        renderCoins(result, currentPage, result.length);
        prev.style.display = "none";
        next.style.display = "none";
      }
    }, 300);
  };
searchBox.addEventListener("input", handleSearchInput);
searchIcon.addEventListener("click", handleSearchInput);