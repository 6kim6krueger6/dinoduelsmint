import logo from "./logo.png";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { addressMon, abiMon } from "./ConstantsMon";

function Main() {
  const [errorMessage, setErrorMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const endTimestamp = 1740160728 + 30 * 24 * 60 * 60;

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = endTimestamp - now;

      if (remaining <= 0) {
        setTimeLeft("⏳ Minting has ended!");
        return;
      }

      const days = Math.floor(remaining / (24 * 60 * 60));
      const hours = Math.floor((remaining % (24 * 60 * 60)) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s left`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(addressMon, abiMon, provider);

      contract.on("CreatedNFT", (tokenId, minter, tokenUri) => {
        alert(`🎉 NFT successfully minted! Token ID: ${tokenId}`);
      });

      return () => {
        contract.removeAllListeners("CreatedNFT");
      };
    }
  }, []);

  const mintNFT = async () => {
    console.log("Minting...");
    setErrorMessage("");
    setIsLoading(true); // Запуск анимации загрузки

    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(addressMon, abiMon, signer);

      try {
        console.log("Processing...");
        const transaction = await contract.safeMint(); // Убрано значение value
        await transaction.wait(1);
      } catch (error) {
        console.error("Transaction failed:", error);

        let errorMsg = "⚠️ Unknown error occurred.";
        if (error.reason) {
          errorMsg = `⚠️ ${error.reason}`;
        } else if (error.message) {
          errorMsg = `⚠️ ${error.message}`;
        }

        if (error.error && error.error.data) {
          const errorData = error.error.data;
          const iface = new ethers.utils.Interface(abiMon);

          try {
            const decodedError = iface.parseError(errorData);
            if (decodedError?.name) {
              errorMsg = `⚠️ Contract error: ${decodedError.name}`;
            }
          } catch (decodeError) {
            console.warn("Failed to decode error:", decodeError);
          }
        }

        setErrorMessage(errorMsg.length > 200 ? `${errorMsg.slice(0, 200)}...` : errorMsg);
      } finally {
        setIsLoading(false); // Остановка анимации
      }
    } else {
      alert("Please install MetaMask!");
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div
        className="p-3 border rounded-5 shadow-lg text-center bg-white bg-opacity-80"
        style={{
          width: "400px",
          maxWidth: "90%",
          marginBottom: "20px",
          position: "relative",
          minHeight: "500px",
        }}
      >
        <img
          src={logo}
          className="img-fluid rounded-circle"
          style={{ width: "180px", height: "180px" }}
          alt="DinadImg"
        />
        <h1 className="mt-2">Gm, DinadsBro!</h1>
        <p className="lead mt-2" style={{ wordWrap: "break-word" }}>
          Connect the wallet and press the mint button to collect your NFT!
          Make sure you are on Monad testnet.
        </p>

        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            margin: "10px 0",
            color: "#6c63ff",
          }}
        >
          🕰️ {timeLeft}
        </div>

        <div style={{ width: "100px", margin: "0 auto" }}>
          <button className="btn btn-primary w-100" onClick={mintNFT} disabled={isLoading}>
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              "Mint"
            )}
          </button>
        </div>

        <a
          href="https://x.com/DinoDuels"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            fontSize: "1.5rem",
            color: "#000",
            textDecoration: "none",
          }}
        >
          <FontAwesomeIcon icon={faXTwitter} />
        </a>

        <a href="https://testnet.monadexplorer.com/address/0x1e25FA098261C2C317E8Da868C8659daF1f3E1D6?tab=Contract" target="_blank" rel="noopener noreferrer">View monad explorer</a>
        {errorMessage && (
          <div
            style={{
              marginTop: "20px",
              color: "red",
              fontSize: "0.9rem",
              textAlign: "center",
              width: "100%",
            }}
          >
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;