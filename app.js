let selectedCurrency = (CURRENCY = "Select currency");

const addZero = (val) => {
  return val.toString().length < 2 ? `0${val}` : val;
};

const currentDate = () => {
  const today = new Date();
  let month = today.getMonth() + 1;
  return `${today.getFullYear()}-${addZero(month)}-${addZero(today.getDate())}`;
}

let selectedDate = currentDate();

const showAllDropDownCurrencies = (currenciesList) => {
  var currencyOptions = '<option value="Select currency">Select currency</option>';
  currencyOptions += '<option value="AllCurrencies">All currencies</option>';
  currenciesList.map((currencyName) => {
    currencyOptions += `<option value="${currencyName}">${currencyName}</option>`;
  });
  document.getElementById("currency").innerHTML = currencyOptions;
};

const validateInputChange = () => {
  if (CURRENCY !== selectedCurrency || DATE !== selectedDate) {
    getData(selectedCurrency === "AllCurrencies" ? "onLoad" : "onChange");
  }
};

const currencyHandler = (val) => {
  selectedCurrency = val;
  if (selectedCurrency !== CURRENCY) {
    validateInputChange();
  }
};

const dateHandler = (e) => {
  selectedDate = e.target.value;
  validateInputChange();
};

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

const getData = (type) => {
  let xhttp = new XMLHttpRequest();
  xhttp.open(
    "GET",
    `http://api.exchangeratesapi.io/v1/${selectedDate}?access_key=176570a5610963bfd0a9d21b06c5fc03`,
    true
  );
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const currencyData = JSON.parse(this.response).rates;
      let dataPoints = [];
      let conversionRate = 0;
      let allCurrencies = [];
      for (const [key, value] of Object.entries(currencyData)) {
        if (type === "onLoad") {
          dataPoints.push({ label: key, y: value });
          allCurrencies.push(key);
        } else if (type === "onChange") {
          if (key === selectedCurrency) {
            conversionRate = value;
            dataPoints.push({ label: key, y: value });
            break;
          }
        }
      }

      if (type === "onLoad") {
        showAllDropDownCurrencies(allCurrencies);
      }

      document.getElementById("currencyValue").innerText =
        type === "onLoad"
          ? ""
          : `Convertion Rate for 1 EUR = ${conversionRate} ${selectedCurrency}`;
      if (dataPoints.length > 15) {
        dataPoints = dataPoints.slice(0, 15);
      }
      //CANVAS DATA RENDERING
      renderGraph(dataPoints);
    }
  };
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send();
};

window.addEventListener("load", (event) => {
  document.getElementById("date").value = currentDate();
  document.getElementById("date").max = currentDate();
  getData("onLoad");
});
