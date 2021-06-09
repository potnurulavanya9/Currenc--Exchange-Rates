let selectedCurrency = (CURRENCY = "Select currency");
const DOMAIN = "http://api.exchangeratesapi.io";
const TOKEN = "176570a5610963bfd0a9d21b06c5fc03";
const ONLOAD = "onLoad";
const ONCHANGE = "onChange";
let TYPE = "";

//PADDING ZEROS TO SINGLE DIGITS
const addZero = (val) => {
  return val.toString().length < 2 ? `0${val}` : val;
};

//FORM CURRENT DATE
const currentDate = () => {
  const today = new Date();
  let month = today.getMonth() + 1;
  return `${today.getFullYear()}-${addZero(month)}-${addZero(today.getDate())}`;
}

let selectedDate = currentDate();

//FORM OPTIONS AND APPEND TO THE SELECT DROPDOWN
const showAllDropDownCurrencies = (currenciesList) => {
  var currencyOptions = '<option value="Select currency">Select currency</option>';
  currencyOptions += '<option value="AllCurrencies">All currencies</option>';
  currenciesList.map((currencyName) => {
    currencyOptions += `<option value="${currencyName}">${currencyName}</option>`;
  });
  document.getElementById("currency").innerHTML = currencyOptions;
};

//CHECK WEATHER USER SELECTED ANY CURRENCY OR DATE
const validateInputChange = () => {
  if (CURRENCY !== selectedCurrency || DATE !== selectedDate) {
    getData(selectedCurrency === "AllCurrencies" ? ONLOAD : ONCHANGE);
  }
};

//GET THE SELECTED CURRENCY
const currencyHandler = (val) => {
  selectedCurrency = val;
  if (selectedCurrency !== CURRENCY) {
    validateInputChange();
  }
};

//GET THE SELECTED DATE
const dateHandler = (e) => {
  selectedDate = e.target.value;
  validateInputChange();
};

//RENDER THE GRAPH USING THE API DATA
const renderGraph = (dataPoints) => {
  let chart = new CanvasJS.Chart("chartContainer", {
    theme: "light1", // "light2", "dark1", "dark2"
    animationEnabled: true, // change to true
    title: {
      text: "Currency Comparison Graph",
    },
    data: [
      {
        type: "column",
        dataPoints,
      },
    ],
  });
  chart.render();
};

//PROMISE SUCCESS CALLBACK
const successHandler = (currencyData) => {
  let dataPoints = [];
  let conversionRate = 0;
  let allCurrencies = [];
  for (const [key, value] of Object.entries(currencyData)) {
    if (TYPE === ONLOAD) {
      dataPoints.push({ label: key, y: value });
      allCurrencies.push(key);
    } else if (TYPE === ONCHANGE) {
      if (key === selectedCurrency) {
        conversionRate = value;
        dataPoints.push({ label: key, y: value });
        break;
      }
    }
  }

  if (TYPE === ONLOAD) {
    showAllDropDownCurrencies(allCurrencies);
  }

  const currencyValue = (TYPE === ONCHANGE) ? `Convertion Rate for 1 EUR = ${conversionRate} ${selectedCurrency}` : "";
  document.getElementById("currencyValue").innerText = currencyValue;

  if (dataPoints.length > 15) {
    dataPoints = dataPoints.slice(0, 15);
  }
  renderGraph(dataPoints);
};

//PROMISE ERROR CALLBACK
const errorHandler = (error) => {
  console.log(error);
};

//HTTP REQUEST
const getData = (type) => {
  TYPE = type;
  let myPromise = new Promise((resolve, reject) => {
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", `${DOMAIN}/v1/${selectedDate}?access_key=${TOKEN}`);
    xhttp.onreadystatechange = function () {
      if (this.status == 200) {
        const response = JSON.parse(this.response).rates;
        resolve(response);
      } else {
        reject(this);
      }
    };
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send();
  });
  myPromise.then((response) => {
    successHandler(response);
  }).catch((error) => {
    errorHandler(error);
  });
};

//PAGE ONLOAD EVENT
window.addEventListener("load", () => {
  document.getElementById("date").value = currentDate();
  document.getElementById("date").max = currentDate();
  getData(ONLOAD);
});
