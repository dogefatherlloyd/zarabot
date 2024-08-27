import Alpaca from "@alpacahq/alpaca-trade-api";

const alpaca = new Alpaca({
  keyId: process.env.APCA_API_KEY_ID,
  secretKey: process.env.APCA_API_SECRET_KEY,
  paper: true,
  usePolygon: false,
});

export async function fetchAccountData() {
  try {
    const account = await alpaca.getAccount();
    return account;
  } catch (error) {
    console.error("Error fetching Alpaca account data:", error);
    return null;
  }
}