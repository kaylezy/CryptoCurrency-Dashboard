"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Sun, Moon, Search } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Types for cryptocurrency data
interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

interface ChartDataResponse {
  prices: [number, number][];
}

// Supported currencies for conversion
const CURRENCIES = ["USD", "EUR", "GBP", "JPY"];

// Chart.js configuration options
const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
};

export default function Home() {
  // State variables
  const [darkMode, setDarkMode] = useState(false); // Toggle between dark and light mode
  const [searchQuery, setSearchQuery] = useState(""); // Search bar input
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>(
    []
  ); // List of cryptos
  const [filteredCryptos, setFilteredCryptos] = useState<Cryptocurrency[]>([]); // Filtered cryptos
  const [selectedCrypto, setSelectedCrypto] = useState<string>("bitcoin"); // Currently selected crypto
  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  }); // Data for the chart
  const [selectedCurrency, setSelectedCurrency] = useState("USD"); // Selected currency for conversion
  const [loading, setLoading] = useState(true); // Loading state
  const [message, setMessage] = useState(""); // User messages

  // Update chart options when dark mode is toggled
  useEffect(() => {
    chartOptions.scales = {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales?.x,
        ticks: {
          color: darkMode ? "#fff" : "#666",
        },
      },
      y: {
        ...chartOptions.scales?.y,
        ticks: {
          color: darkMode ? "#fff" : "#666",
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    };
  }, [darkMode]);

  // Fetch cryptocurrency data when the selected currency changes
  useEffect(() => {
    fetchCryptoData();
    // Auto-refresh data every 1 minute
    const interval = setInterval(fetchCryptoData, 60000);
    return () => clearInterval(interval);
  }, );

  // Fetch chart data when selected cryptocurrency changes
  useEffect(() => {
    if (selectedCrypto) {
      fetchChartData();
    }
  }, );

  // Filter cryptocurrencies based on the search query
  useEffect(() => {
    const filtered = cryptocurrencies.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCryptos(filtered);
  }, [searchQuery, cryptocurrencies]);

  // Fetch cryptocurrency data from CoinGecko API
  const fetchCryptoData = async () => {
    setLoading(true); // Show loading state
    setMessage(""); // Clear any previous message
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${selectedCurrency.toLowerCase()}&order=market_cap_desc&per_page=100&sparkline=false`
      );
      setCryptocurrencies(response.data);
      setLoading(false);
      setMessage("Data fetched successfully!"); // Success message
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      setMessage(
        "Failed to fetch cryptocurrency data. Please try again later."
      ); // Error message
      setLoading(false);
    }
  };

  // Fetch price chart data for the selected cryptocurrency
  const fetchChartData = async () => {
    setMessage(""); // Clear any previous message
    try {
      const response = await axios.get<ChartDataResponse>(
        `https://api.coingecko.com/api/v3/coins/${selectedCrypto}/market_chart?vs_currency=${selectedCurrency.toLowerCase()}&days=7&interval=daily`
      );

      // Format labels and prices for the chart
      const labels = response.data.prices.map(([timestamp]) =>
        new Date(timestamp).toLocaleDateString()
      );
      const prices = response.data.prices.map(([, price]) => price);

      setChartData({
        labels,
        datasets: [
          {
            label: "Price",
            data: prices,
            borderColor: "#8884d8",
            backgroundColor: "rgba(136, 132, 216, 0.5)",
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setMessage("Failed to load chart data."); // Error message
    }
  };

  // Format numbers for display (e.g., price, market cap)
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: selectedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } md:p-10 `}
    >
      {/* Header Section */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kngkay CryptoCurrency Tracker Dashboard</h1>
          <div className="flex items-center gap-4">
            <label htmlFor="currency-select" className="sr-only">
              Select Currency
            </label>
            <select
              id="currency-select"
              className={`rounded-md px-3 py-2 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Display user messages */}
        {message && (
          <p
            className={`mb-4 p-2 rounded ${
              message.includes("Failed") ? "bg-red-500" : "bg-green-500"
            } text-white`}
          >
            {message}
          </p>
        )}

        {/* Search Section */}
        <div className="mb-6 relative">
          <div className="flex items-center">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              } border border-gray-300 dark:border-gray-700`}
            />
          </div>
        </div>

        {/* Price Chart */}
        {selectedCrypto && chartData.labels && chartData.labels.length > 0 && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">Price Chart (7 Days)</h2>
            <div className="h-[400px]">
              <Line options={chartOptions} data={chartData} />
            </div>
          </div>
        )}

        {/* Cryptocurrency List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p>Loading...</p>
          ) : (
            filteredCryptos.map((crypto) => (
              <div
                key={crypto.id}
                onClick={() => setSelectedCrypto(crypto.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-50"
                } ${
                  selectedCrypto === crypto.id ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={crypto.image}
                    alt={crypto.name}
                    className="w-8 h-8"
                  />
                  <h3 className="font-bold">{crypto.name}</h3>
                  <span className="text-gray-500 dark:text-gray-400">
                    {crypto.symbol.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold">
                    {formatNumber(crypto.current_price)}
                  </p>
                  <p
                    className={
                      crypto.price_change_percentage_24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {crypto.price_change_percentage_24h.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Market Cap: {formatNumber(crypto.market_cap)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Volume: {formatNumber(crypto.total_volume)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
