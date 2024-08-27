import Alpaca from "@alpacahq/alpaca-trade-api";

const alpaca = new Alpaca({
  keyId: process.env.NEXT_PUBLIC_APCA_API_KEY_ID,
  secretKey: process.env.NEXT_PUBLIC_APCA_API_SECRET_KEY,
  paper: true,
});

export default async function handler(req, res) {
  try {
    const account = await alpaca.getAccount();
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: "Error fetching account data" });
  }
}