"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TokenDashboard from './TokenDashboard';

import MultiBetExpJson from "../contracts/MultiBetExp.json";
import HYBLOCKTokenJson from "../contracts/HYBLOCKToken.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;

const CONTRACT_ABI = MultiBetExpJson.abi;
const TOKEN_ABI = HYBLOCKTokenJson.abi;

const MultiBetDApp = () => {
  // Web3 states
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [account, setAccount] = useState("");
  
  // App states
  const [isOwner, setIsOwner] = useState(false);
  const [betCount, setBetCount] = useState(0);
  const [currentBetId, setCurrentBetId] = useState(0);
  const [betDetails, setBetDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [isApproved, setIsApproved] = useState(null);

  // Betting states
  const [newBetTopic, setNewBetTopic] = useState("");
  const [newBetOptions, setNewBetOptions] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [betAmount, setBetAmount] = useState("");

  const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    if (error.message.includes("user rejected transaction")) {
      setError("Transaction was rejected");
    } else {
      setError(`Operation failed: ${error.message}`);
    }
  };

  useEffect(() => {
    const initializeContracts = async () => {
      try {
        if (!window.ethereum) {
          setError("Please install MetaMask!");
          return;
        }
  
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
            
            setProvider(provider);
            setSigner(signer);
            setContract(contract);
            setTokenContract(tokenContract);
  
            await Promise.all([
              updateTokenInfo(tokenContract, accounts[0], CONTRACT_ADDRESS),
              loadBetDetails(contract),
              (async () => {
                const contractOwner = await contract.owner();
                setIsOwner(contractOwner.toLowerCase() === accounts[0].toLowerCase());
                const count = await contract.betCount();
                setBetCount(Number(count));
              })()
            ]);
  
            const holeskyChainId = "0x4268";
            if (window.ethereum.chainId !== holeskyChainId) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [holeskyNetwork],
              });
              window.location.reload();
            }
  
            provider.on("network", (newNetwork, oldNetwork) => {
              if (oldNetwork) {
                window.location.reload();
              }
            });
            window.ethereum.on("chainChanged", () => window.location.reload());
            window.ethereum.on("accountsChanged", (accounts) => {
              if (accounts.length === 0) {
                setAccount("");
                setIsOwner(false);
              } else {
                connectWallet();
              }
            });
          }
        } catch (err) {
          handleError(err, "initialization");
        }
      } catch (err) {
        handleError(err, "provider setup");
      }
    };
  
    initializeContracts();
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length === 0) {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          window.location.reload();
        }

        const holeskyChainId = "0x4268";
        const holeskyNetwork = {
          chainId: holeskyChainId,
          chainName: "Holesky",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["https://ethereum-holesky-rpc.publicnode.com"],
          blockExplorerUrls: ["https://holesky.etherscan.io"],
        };

        try {
          if (window.ethereum.chainId !== holeskyChainId) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [holeskyNetwork],
            });
            window.location.reload();
          }
        } catch (switchError) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [holeskyNetwork],
            });
          } catch (addError) {
            console.error("Error adding Holesky network:", addError);
            setError("Failed to add Holesky network. Please add it manually in MetaMask.");
            return;
          }
        }
      } else {
        setError("Please install MetaMask!");
      }
    } catch (err) {
      console.error("Connection error:", err);
      setError(err.message);
    }
  };

  const updateTokenInfo = async (tokenContract, userAddress, spenderAddress) => {
    const balance = await tokenContract.balanceOf(userAddress);
    const allowance = await tokenContract.allowance(userAddress, spenderAddress);
    setTokenBalance(ethers.utils.formatEther(balance));
    setIsApproved(allowance.gt(0));
  };

  const approveToken = async () => {
    try {
      setLoading(true);
      setError("");
  
      try {
        const currentAllowance = await tokenContract.allowance(account, CONTRACT_ADDRESS);
        
        if (currentAllowance && currentAllowance.gt(0)) {
          console.log("Already approved");
          setIsApproved(true);
          return;
        }
      } catch (allowanceErr) {
        console.warn("Error checking allowance:", allowanceErr);
      }
  
      const maxAmount = ethers.constants.MaxUint256;
      console.log("Requesting token approval...");
      
      const gasEstimate = await tokenContract.estimateGas.approve(CONTRACT_ADDRESS, maxAmount);
      const tx = await tokenContract.approve(CONTRACT_ADDRESS, maxAmount, {
        gasLimit: gasEstimate.mul(120).div(100)
      });
  
      console.log("Waiting for approval transaction...");
      const receipt = await tx.wait();
  
      if (receipt.status === 1) {
        console.log("Token approval successful");
        setIsApproved(true);
        
        try {
          await updateTokenInfo(tokenContract, account, CONTRACT_ADDRESS);
        } catch (updateErr) {
          console.warn("Error updating token info after approval:", updateErr);
        }
      } else {
        throw new Error("Token approval transaction failed");
      }
    } catch (err) {
      console.error("Token approval error:", err);
      let errorMessage = "Failed to approve token usage";
      
      if (err.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (err.message) {
        errorMessage = `Approval failed: ${err.message}`;
      }
      
      setError(errorMessage);
      setIsApproved(false);
    } finally {
      setLoading(false);
    }
  };

  const loadBetDetails = async () => {
    try {
      if (!contract) {
        console.log('Contract not initialized yet');
        return;
      }

      setLoading(true);
      setError("");
      
      console.log(`Loading bet details for betId: ${currentBetId}`);
      
      const bet = await contract.getBet(currentBetId);
      console.log('Basic bet info:', {
        topic: bet.topic,
        isResolved: bet.isResolved,
        totalAmount: ethers.utils.formatEther(bet.totalAmount),
        winningOption: bet.winningOption
      });
  
      const optionInfos = await contract.getBetOptionInfosWithNicknames(currentBetId);
      console.log('Detailed bet info:', {
        options: optionInfos.options,
        optionBets: optionInfos.optionBets.map(amount => ethers.utils.formatEther(amount)),
        bettors: optionInfos.bettors,
        nicknames: optionInfos.nicknames
      });
      
      setBetDetails({
        topic: bet.topic,
        isResolved: bet.isResolved,
        totalAmount: ethers.utils.formatEther(bet.totalAmount),
        winningOption: bet.winningOption,
        options: optionInfos.options,
        optionBets: optionInfos.optionBets.map((amount) =>
          ethers.utils.formatEther(amount)
        ),
      });
    } catch (err) {
      console.error('Error loading bet details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousBet = () => {
    if (currentBetId > 0) {
      setCurrentBetId(currentBetId - 1);
    }
  };
  
  const handleNextBet = () => {
    if (currentBetId < betCount - 1) {
      setCurrentBetId(currentBetId + 1);
    }
  };

  const createBet = async () => {
    try {
      if (!isOwner) {
        setError("Only owner can create bets");
        return;
      }

      setLoading(true);
      const options = newBetOptions.split(",").map((opt) => opt.trim());
      if (options.length < 2) {
        throw new Error("At least two options are required");
      }

      const tx = await contract.createBet(newBetTopic, options);
      await tx.wait();

      const newCount = await contract.betCount();
      setBetCount(Number(newCount));
      setNewBetTopic("");
      setNewBetOptions("");
      setCurrentBetId(Number(newCount) - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async () => {
    try {
      console.log('Starting full data refresh...');
      setLoading(true);
      setError("");
      
      console.log('Updating bet count...');
      if (contract) {
        const count = await contract.betCount();
        const newCount = Number(count);
        console.log('New bet count:', newCount);
        setBetCount(newCount);
        
        // 항상 가장 최근 베팅을 보여주도록 currentBetId 업데이트
        if (newCount > 0) {
          const latestBetId = newCount - 1;
          setCurrentBetId(latestBetId);
          console.log('Updated to latest bet:', latestBetId);
          
          // 즉시 베팅 상세 정보 로드
          await loadBetDetails();
        }
      }
  
      console.log('Updating token information...');
      if (tokenContract && account) {
        await updateTokenInfo(tokenContract, account, CONTRACT_ADDRESS);
      }
      
      console.log('Data refresh completed successfully');
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async () => {
    try {
      if (!selectedOption || !betAmount) {
        setError("Please select option and enter amount");
        return;
      }

      if (!isApproved) {
        setError("Please approve token spending first");
        return;
      }

      setLoading(true);
      const tx = await contract.placeBet(
        currentBetId,
        selectedOption,
        ethers.utils.parseEther(betAmount)
      );
      await tx.wait();

      await loadBetDetails();
      await updateTokenInfo(tokenContract, account, contract.address);
      setSelectedOption("");
      setBetAmount("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resolveBet = async (winningOption) => {
    try {
      if (!isOwner) {
        setError("Only owner can resolve bets");
        return;
      }
  
      setLoading(true);
      const tx = await contract.resolveBet(currentBetId, winningOption);
      await tx.wait();
  
      await loadBetDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (contract && currentBetId < betCount) {
      console.log('Triggering loadBetDetails from useEffect');
      console.log('Current state:', {
        hasContract: !!contract,
        currentBetId,
        betCount
      });
      loadBetDetails();
    }
  }, [contract, currentBetId, betCount]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4 bg-white rounded-lg shadow-md">
        <div className="p-4">
          {!account ? (
            <div className="text-center">
              <button
                onClick={connectWallet}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md transition-all duration-200"
              >
                Connect Wallet
              </button>
              <p className="mt-2 text-sm text-gray-600">Connect your wallet to start betting</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Wallet Address</div>
                  <div className="text-sm font-medium">
                    {`${account.slice(0, 6)}...${account.slice(-4)}`}
                  </div>
                </div>
        
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Token Balance</div>
                  <div className="text-sm font-semibold text-blue-600">
                    {tokenBalance} HYBLOCK
                  </div>
                </div>
        
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Approval Status</div>
                  <div>
                    {isApproved ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Approved
                      </span>
                    ) : isApproved === false ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Not Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <svg className="animate-spin h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking
                      </span>
                    )}
                  </div>
                </div>
              </div>
      
              {!isApproved && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
                  <div className="flex items-start mb-3">
                    <svg className="w-5 h-5 text-yellow-700 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-yellow-800">
                      To participate in betting, you need to approve HYBLOCK token usage. 
                      This is a one-time approval for the smart contract.
                    </p>
                  </div>
                  <button
                    onClick={approveToken}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg 
                             hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-200
                             shadow-md disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Approving...
                      </span>
                    ) : (
                      "Approve HYBLOCK Token Usage"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {account && (
        <>
          {isOwner && (
            <div className="mb-4 bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Create New Bet</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Bet Topic"
                    value={newBetTopic}
                    onChange={(e) => setNewBetTopic(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Options (comma-separated)"
                    value={newBetOptions}
                    onChange={(e) => setNewBetOptions(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={createBet}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Bet"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <TokenDashboard 
            contract={contract}
            tokenContract={tokenContract}
            account={account}
            provider={provider}
            refreshAllData={refreshAllData}
          />

          <div className="mb-4 bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  All Bets ({betCount > 0 ? `${currentBetId + 1} of ${betCount}` : '0'})
                </h2>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousBet}
                    disabled={currentBetId === 0 || loading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextBet}
                    disabled={currentBetId === betCount - 1 || loading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                {betDetails && (
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-xl font-semibold text-gray-900">Topic: {betDetails.topic}</p>
                      <p className="text-sm text-gray-600">Total Amount: {betDetails.totalAmount} HYB</p>
                      <p className="text-sm text-gray-600">
                        Status:{" "}
                        <span className={betDetails.isResolved ? "text-red-600" : "text-green-600"}>
                          {betDetails.isResolved ? "Resolved" : "Active"}
                        </span>
                      </p>
                      {betDetails.isResolved && (
                        <p className="text-sm font-semibold text-blue-600">
                          Winning Option: {betDetails.winningOption}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {betDetails.options.map((option, index) => {
                        const totalAmount = parseFloat(betDetails.totalAmount);
                        const optionAmount = parseFloat(betDetails.optionBets[index]);
                        const percentage = totalAmount > 0 
                          ? ((optionAmount / totalAmount) * 100).toFixed(0)
                          : "0";
                          
                        return (
                          <div 
                            key={index} 
                            onClick={() => !betDetails.isResolved && setSelectedOption(option)}
                            className={`p-4 border rounded-lg ${!betDetails.isResolved ? 'cursor-pointer hover:shadow-md' : 'cursor-default'} transition-all duration-200 ${
                              selectedOption === option && !betDetails.isResolved 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200'
                            } ${
                              betDetails.isResolved && option === betDetails.winningOption
                                ? 'border-green-500 bg-green-50'
                                : ''
                            }`}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-medium text-gray-900">{option}</h3>
                                  {selectedOption === option && !betDetails.isResolved && (
                                    <span className="text-blue-600 text-sm">Selected</span>
                                  )}
                                  {betDetails.isResolved && option === betDetails.winningOption && (
                                    <span className="text-green-600 text-sm">Winner</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{betDetails.optionBets[index]} HYB Vol.</p>
                              </div>
                              <div className="text-3xl font-bold text-gray-900">
                                {percentage}%
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  betDetails.isResolved && option === betDetails.winningOption
                                    ? 'bg-green-500'
                                    : 'bg-blue-600'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!betDetails.isResolved && selectedOption && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            placeholder="Bet Amount (HYB)"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={placeBet}
                            disabled={loading || !selectedOption || !betAmount}
                            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? "Processing..." : "Place Bet"}
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          Selected option: {selectedOption}
                        </p>
                      </div>
                    )}

                    {isOwner && !betDetails.isResolved && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => e.target.value && resolveBet(e.target.value)}
                          disabled={loading}
                        >
                          <option value="">Select Winning Option</option>
                          {betDetails.options.map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MultiBetDApp;