const loaderContainer = document.querySelector(".loader-container");
const coinImg = document.getElementById("coin-image");
const coinName = document.getElementById("coin-name");
const coinDesc = document.getElementById("coin-description");
const coinRank = document.getElementById("coin-rank");
const coinPrice = document.getElementById("coin-price");
const coinMarketCap = document.getElementById("coin-market-cap");
const twentyFourHrBtn = document.getElementById("24h");
const thirtyDayBtn = document.getElementById("30d");
const threeMonthBtn = document.getElementById("3m");
const ctx = document.getElementById("coinChart");

//API req options
const options= {
    method: "GET",
    headers: {
        accept: "application/json",
        "x-cg-demo-api-key": "CG-1yG8Ze9VXCbd2zBvLBaqhqvt",
    },
};

const base_url="https://api.coingecko.com/api/v3";

//extracting id from the url
const urlParams = new URLSearchParams(window.location.search);
const coinId = urlParams.get("id");

//loader page
const showLoader = ()=>{
    loaderContainer.style.display = "flex";
}

const hideLoader = ()=>{
    loaderContainer.style.display = "none";
}

//fetching coin data(api)
const fetchCoinDataById = async () => {
    try{
        showLoader()
        const response = await fetch(`${base_url}/coins/${coinId}`, options);
        const coin = await response.json();
        hideLoader();
        return coin;
    }catch(err){
        console.log(err);
        hideLoader();
    }
}

//rendering the fetched data
const displayCoinData =  (coinData) =>{
    coinImg.src = coinData.image.large;
    coinImg.alt = coinData.name;
    coinName.textContent = coinData.name;
    coinDesc.innerHTML = coinData.description.en.split(". ")[0];
    coinRank.textContent = coinData.market_cap_rank;
    coinPrice.textContent = `$${coinData.market_data.current_price.usd.toLocaleString()}`;
    coinMarketCap.textContent = `$${coinData.market_data.market_cap.usd.toLocaleString()}`;
}

//fetching data for chart acc to days
const fetchChartData = async(days) =>{
    try{
        const response = await fetch(`${base_url}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,options);
        const pricesData = await response.json();
        console.log(pricesData.prices);
        updateChart(pricesData.prices);
        
    }catch(err){
        console.log(err);
    }
}

let coinChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
          label: 'Price(USD)',
          data: [],
          fill: false,
          borderColor: 'gold',
        //   tension: 0.1
        }]
      }
  });

const updateChart = (pricesData) => {
    const labels = pricesData.map((price)=>{
        let date = new Date(price[0]);
        return date.toLocaleDateString();
    });
    const data = pricesData.map((price)=>price[1]);

    coinChart.data.labels = labels;
    coinChart.data.datasets[0].data = data;
    coinChart.update();
}

twentyFourHrBtn.addEventListener("click",()=>{
    fetchChartData("1");
})
thirtyDayBtn.addEventListener("click",()=>{
    fetchChartData("30");
})
threeMonthBtn.addEventListener("click",()=>{
    fetchChartData("90");

})

//initializing
window.onload = async () => {
    //fetch
    const coinData = await fetchCoinDataById();
    console.log(coinData);
    //render
    displayCoinData(coinData);
    document.getElementById('24h').click();
    
}