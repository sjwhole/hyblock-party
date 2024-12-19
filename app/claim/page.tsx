// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum: any;
  }
}
import { ethers } from "ethers";
import Confetti from "react-dom-confetti"; // Updated import
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import MultiSenderUnitedJson from "../../contracts/MultiSenderUnited.json";
import { Contract } from "ethers";

const CLAIM_ADDRESS = process.env.NEXT_PUBLIC_CLAIM_ADDRESS;
if (!CLAIM_ADDRESS) {
  throw new Error("CLAIM_ADDRESS is not defined");
}

const CLAIM_ABI = MultiSenderUnitedJson.abi;

const ClaimHYB = () => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState("");
  const [hasClaimed, setHasClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Enhanced Confetti configuration
  const [confettiConfig] = useState({
    angle: 90,
    spread: 100, // Increased spread for wider dispersion
    startVelocity: 30, // Increased velocity for faster movement
    elementCount: 500, // Increased number of confetti pieces
    dragFriction: 0.09, // Slightly reduced drag for longer flight
    duration: 7000, // Extended duration for a longer effect
    stagger: 3, // Reduced stagger for simultaneous release
    width: "16px", // Increased size for more visibility
    height: "16px",
    colors: [
      "#a864fd",
      "#29cdff",
      "#78ff44",
      "#ff718d",
      "#fdff6a",
      "#ff5733",
      "#33ff57",
      "#3357ff",
      "#ff33a8",
      "#33fff5",
    ], // Added more vibrant colors
    origin: { x: 0.5, y: 0.5 },
  });
  const [confettiActive, setConfettiActive] = useState(false);

  // Initialize Ethereum connection
  useEffect(() => {
    if (window.ethereum) {
      const init = async () => {
        try {
          const _provider = new ethers.providers.Web3Provider(window.ethereum);

          const _signer = _provider.getSigner();

          const userAddress = await _signer.getAddress();
          setAccount(userAddress);

          const _contract = new ethers.Contract(
            CLAIM_ADDRESS,
            CLAIM_ABI,
            _signer
          );
          setContract(_contract);

          // Check if the user has already claimed
          const claimed = await _contract.claimStatus(userAddress);
          setHasClaimed(claimed);

          // Listen for account or network changes
          window.ethereum.on("accountsChanged", () => {
            window.location.reload();
          });

          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });
        } catch (err) {
          console.error("Error initializing Ethereum:", err);
          setError("Failed to connect to MetaMask.");
        }
      };

      init();
    } else {
      setError(
        "MetaMask is not installed. Please install it to use this feature."
      );
    }
  }, []);

  // Function to connect wallet manually (if needed)
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError(
          "MetaMask is not installed. Please install it to use this feature."
        );
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length === 0) {
        setError("No accounts found. Please connect your wallet.");
        return;
      }

      setAccount(accounts[0]);
      window.location.reload();
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet.");
    }
  };

  // Function to handle claim
  const handleClaim = async () => {
    if (!contract) {
      setError("Smart contract is not loaded.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const tx = await contract.claimHYB();
      await tx.wait();

      setSuccess(true);
      setHasClaimed(true);
      setConfettiActive(true);

      // Hide confetti after duration
      setTimeout(() => {
        setConfettiActive(false);
      }, confettiConfig.duration);
    } catch (err: any) {
      console.error("Claim error:", err);
      if (err.data && err.data.message) {
        setError(err.data.message);
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 relative">
      {/* Enhanced Confetti Effect */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <Confetti active={confettiActive} config={confettiConfig} />
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Claim HYB Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          {!account ? (
            <div className="flex flex-col items-center">
              <p className="text-sm mb-4">
                Connect your wallet to claim HYB tokens.
              </p>
              <Button onClick={connectWallet}>Connect Wallet</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="text-sm">Connected: {account}</div>
                <div className="text-sm font-semibold">
                  Status:{" "}
                  {hasClaimed ? (
                    <span className="text-green-600 font-semibold">
                      Already Claimed ✓
                    </span>
                  ) : (
                    <span className="text-blue-600 font-semibold">
                      Eligible to Claim
                    </span>
                  )}
                </div>
              </div>

              {!hasClaimed ? (
                <Button
                  onClick={handleClaim}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {loading ? "Processing..." : "Claim 100 HYB"}
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full bg-gray-400 cursor-not-allowed"
                >
                  Already Claimed
                </Button>
              )}

              {/* Success Message */}
              {success && (
                <Alert variant="success" className="mt-4">
                  <AlertDescription>
                    Congratulations! You have successfully claimed 100 HYB
                    tokens.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
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

export default ClaimHYB;
