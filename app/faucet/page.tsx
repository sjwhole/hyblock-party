"use client";

// Faucet.jsx

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Alert, AlertDescription } from "../../components/ui/alert";

const Faucet = () => {
  const [clickable, setClickable] = useState<boolean | null>(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider
        .getSigner()
        .getAddress()
        .then((address) => {
          setAccount(address);
          (async () => {
            const data = await fetch(`/api/faucet?address=${address}`);
            const { ok } = await data.json();
            setClickable(ok);
            console.log(ok);
          })();
        })
        .catch((err) => {
          console.error("Error fetching account:", err);
          setError("Please connect your wallet.");
        });
      setSigner(provider.getSigner());
    } else {
      setError(
        "MetaMask is not installed. Please install it to use this feature."
      );
    }
  }, []);

  const postFaucet = async () => {
    if (!account) {
      setError("No connected account found.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOk(false);
      setClickable(false);

      const response = await fetch("/api/faucet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: account }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setOk(true);
      } else {
        throw new Error(data.message || "Failed to process faucet request.");
      }
    } catch (err) {
      console.error("Faucet error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Faucet</CardTitle>
        </CardHeader>
        <CardContent>
          {!account ? (
            <div className="flex flex-col items-center">
              <p className="text-sm mb-4">
                Connect your wallet to receive test ETH.
              </p>
              <Button
                onClick={() =>
                  window.ethereum.request({ method: "eth_requestAccounts" })
                }
              >
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-4 ">
              <div className="flex flex-col gap-2">
                <div className="text-sm">Connected: {account}</div>
              </div>
              {clickable ? (
                <Button
                  onClick={postFaucet}
                  disabled={loading}
                  className={`w-full bg-blue-500 hover:bg-blue-600`}
                >
                  {loading ? "Processing..." : "Receive 0.1 ETH"}
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full bg-gray-400 cursor-not-allowed"
                >
                  Already Added
                </Button>
              )}
              {ok && (
                <Alert variant="success" className="mt-4">
                  <AlertDescription>
                    Transaction added to the queue. You will receive 0.1 ETH
                    shortly.
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Faucet;
