import { useState } from "react";
import "./App.css";

function App() {
  const [coins, setCoins] = useState(800);
  const [result, setResult] = useState("");
  const [inventory, setInventory] = useState([]);

  const casePrice = 100;

  function openCase() {
    if (coins < casePrice) {
      setResult("Nu ai destui bani!");
      return;
    }

    setCoins(coins - casePrice);

    const numar = Math.floor(Math.random() * 100) + 1;
    let rarity;

    if (numar <= 60) {
      rarity = "COMMON";
    } else if (numar <= 85) {
      rarity = "RARE";
    } else if (numar <= 95) {
      rarity = "EPIC";
    } else if (numar <= 99) {
      rarity = "LEGENDARY";
    } else {
      rarity = "MYTHIC";
    }

    setResult(`Ai primit: ${rarity}`);
    setInventory([...inventory, rarity]);
  }

  return (
    <div className="game">
      <h1>🎁 Case Opening</h1>

      <div className="coins">
        💰 Coins: {coins}
      </div>

      <button className="case-button" onClick={openCase}>
        Deschide o cutie - {casePrice} coins
      </button>

      <div className="result">
        {result}
      </div>

      <div className="inventory">
        <h2>🎒 Inventar</h2>

        {inventory.length === 0 ? (
          <p>Inventarul este gol.</p>
        ) : (
          <div className="inventory-list">
            {inventory.map((item, index) => (
              <div
                className="item"
                key={index}
                style={{
                  color:
                    item === "COMMON"
                      ? "gray"
                      : item === "RARE"
                      ? "blue"
                      : item === "EPIC"
                      ? "purple"
                      : item === "LEGENDARY"
                      ? "gold"
                      : "red",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;