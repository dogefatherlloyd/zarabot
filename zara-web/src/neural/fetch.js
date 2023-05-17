import yahooFinance from "yahoo-finance2";
import { createClient } from "@supabase/supabase-js";
import { SMA, RSI, MACD } from "technicalindicators";

const symbols = ["MSFT", "AAPL", "GOOGL", "AMZN", "FB"];

const supabaseUrl = "https://gwsmfmqtmuhmglnfzqma.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c21mbXF0bXVobWdsbmZ6cW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIwMTgxNDAsImV4cCI6MTk5NzU5NDE0MH0.RidOWSEh2N8Kj4EjKe7balLKFXMErDQl3mCMs8kyY7g";
const supabase = createClient(supabaseUrl, supabaseKey);

const fetchWrapper = function (symbol) {
  return new Promise(function (resolve, reject) {
    yahooFinance.historical(symbol, {
      period1: new Date(Date.now() - 864e5 * 365), // 1 year ago
      period2: new Date(),
      interval: "1d",
    })
      .then(function (success) {
        resolve(success);
      })
      .catch(function (err) {
        console.error('Error fetching data, check your internet connection. ' + err)
        reject(err);
      });
  })
};

const processStockData = (symbol, data) => {
  const processedData = [];

  for (const dailyData of data) {
    processedData.push({
      symbol: symbol,
      date: dailyData.date.toISOString().split("T")[0],
      open: dailyData.open,
      high: dailyData.high,
      low: dailyData.low,
      close: dailyData.close,
      volume: dailyData.volume,
    });
  }

  return processedData;
};

const preprocessStockData = (data) => {
  // Calculate the additional indicators and add them to each data object
  const closePrices = data.map((entry) => entry.close);

  // SMA calculations
  const sma5 = SMA.calculate({ period: 5, values: closePrices });
  const sma10 = SMA.calculate({ period: 10, values: closePrices });
  const sma20 = SMA.calculate({ period: 20, values: closePrices });

  // RSI calculation
  const rsi = RSI.calculate({ period: 14, values: closePrices });

  // MACD calculations
  const macdResult = MACD.calculate({
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    values: closePrices,
  });

  // Add the calculated indicators to each data object
  data.forEach((entry, i) => {
    entry.sma_5 = sma5[i - 4] || null;
    entry.sma_10 = sma10[i - 9] || null;
    entry.sma_20 = sma20[i - 19] || null;
    entry.rsi = rsi[i - 13] || null;
    entry.macd = macdResult[i - 33]?.MACD || null;
    entry.macd_signal = macdResult[i - 33]?.signal || null;
  });

  return data;
};

const insertStockData = async (stockData) => {
  try {
    const { data, error } = await supabase
      .from("stock_data")
      .insert(stockData);

    if (error) {
      console.error("Error inserting stock data:", error);
    } else {
      console.log("Inserted stock data:", data);
    }
  } catch (error) {
    console.error("Error inserting stock data:", error);
  }
};

const fetchAllStocksData = async (symbols) => {
  const allStocksData = [];
  for (const symbol of symbols) {
    const stockData = await fetchWrapper(symbol);
    const processedData = processStockData(symbol, stockData);
    const preprocessedData = preprocessStockData(processedData);
    await insertStockData(preprocessedData);
    allStocksData.push(preprocessedData);
  }
  return allStocksData;
};

fetchAllStocksData(symbols);