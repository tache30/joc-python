import { useEffect, useState } from "react";
import "./App.css";

function getRarityColor(rarity) {
  return {
    COMMON: "gray",
    RARE: "blue",
    EPIC: "purple",
    LEGENDARY: "gold",
    MYTHIC: "red",
  }[rarity];
}

function getCsrfToken() {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("csrftoken="));
  return cookie ? decodeURIComponent(cookie.slice("csrftoken=".length)) : "";
}

function App() {
  const [coins, setCoins] = useState(200);
  const [result, setResult] = useState("");
  const [inventory, setInventory] = useState([]);
  const [tradeItems, setTradeItems] = useState([]);
  const [page, setPage] = useState("game");
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/game/")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Serverul a răspuns cu statusul ${response.status}.`);
        }
        return response.json();
      })
      .then((data) => {
        setCoins(data.coins);
        setInventory(data.inventory);
        setTradeItems(data.tradeItems);
      })
      .catch((error) => {
        console.error("Eroare la conectarea cu Django:", error);
        setLoadFailed(true);
        setResult("Jocul nu s-a putut încărca. Verifică dacă serverul Django rulează.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const casePrice = 100;

  async function saveGameAction(action, itemId) {
    setIsSaving(true);

    try {
      const response = await fetch("/api/game/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify({ action, ...(itemId === undefined ? {} : { itemId }) }),
      });
      const data = await response.json();
      setCoins(data.coins);
      setInventory(data.inventory);
      setTradeItems(data.tradeItems);

      if (!response.ok) {
        setResult(data.error || "Acțiunea nu a putut fi salvată.");
        return;
      }

      setResult(data.message || "");
    } catch (error) {
      console.error("Eroare la salvarea jocului în Django:", error);
      setResult("Acțiunea nu a putut fi salvată. Verifică legătura cu serverul Django.");
    } finally {
      setIsSaving(false);
    }
  }

  function openCase() {
    if (isLoading || loadFailed || isSaving) {
      return;
    }

    saveGameAction("open_case");
  }

  function handleItemDragStart(event, itemId) {
    event.dataTransfer.setData("text/plain", String(itemId));
    event.dataTransfer.effectAllowed = "move";
  }

  function handleTradeDrop(event) {
    event.preventDefault();
    if (isSaving) {
      return;
    }
    const itemId = Number(event.dataTransfer.getData("text/plain"));
    const item = inventory.find((inventoryItem) => inventoryItem.id === itemId);

    if (!item) {
      return;
    }

    saveGameAction("move_to_trade", itemId);
  }

  if (page === "trade") {
    return (
      <main className="trade-page">
        <button
          className="back-button"
          onClick={() => setPage("game")}
          type="button"
        >
          ← Înapoi la joc
        </button>

        <h1>🔄 Trade</h1>

        <section className="trade-inventory">
          <h2>🎒 Inventarul tău</h2>

          {isLoading ? (
            <p>Se încarcă inventarul...</p>
          ) : inventory.length === 0 ? (
            <p>Inventarul este gol. Deschide o cutie ca să primești obiecte.</p>
          ) : (
            <div className="inventory-list">
              {inventory.map((item) => (
                <div
                  className="item"
                  key={item.id}
                  draggable={!isSaving}
                  onDragStart={(event) => handleItemDragStart(event, item.id)}
                  style={{ color: getRarityColor(item.rarity) }}
                >
                  {item.rarity}
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          className="trade-dropzone"
          aria-label="Zona de trade"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleTradeDrop}
        >
          {isLoading ? (
            <p>Se încarcă obiectele...</p>
          ) : tradeItems.length === 0 ? (
            <p>Trage obiectele aici pentru trade</p>
          ) : (
            <div className="inventory-list trade-items">
              {tradeItems.map((item) => (
                <div
                  className="item"
                  key={item.id}
                  style={{ color: getRarityColor(item.rarity) }}
                >
                  {item.rarity}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <div className="game-page">
      <main className="game">
        <h1>🎁 Case Opening</h1>

        <div className="coins">
          💰 Coins: {coins}
        </div>

        <button
          className="case-button"
          onClick={openCase}
          disabled={isLoading || loadFailed || isSaving}
        >
          {isLoading ? "Se încarcă..." : `Deschide o cutie - ${casePrice} coins`}
        </button>

        <div className="result">
          {result}
        </div>

        <div className="inventory">
          <h2>🎒 Inventar</h2>

          {isLoading ? (
            <p>Se încarcă inventarul...</p>
          ) : inventory.length === 0 ? (
            <p>Inventarul este gol.</p>
          ) : (
            <div className="inventory-list">
              {inventory.map((item) => (
                <div
                  className="item"
                  key={item.id}
                  style={{ color: getRarityColor(item.rarity) }}
                >
                  {item.rarity}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <aside className="game-sidebar" aria-label="Trade și Invest">
        <button
          className="side-panel side-panel-action"
          onClick={() => setPage("trade")}
          type="button"
        >
          <span>🔄 Trade</span>
          <span className="side-panel-hint">Intră în pagina de trade</span>
        </button>
        <section className="side-panel">
          <h2>📈 Invest</h2>
        </section>
      </aside>
    </div>
  );
}

export default App;