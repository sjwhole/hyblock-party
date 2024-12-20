import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const TokenDashboard = ({ contract, tokenContract, account, provider }) => {
  const [users, setUsers] = useState([]);
  const [newNickname, setNewNickname] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNickname = async () => {
    try {
      if (!contract || !account) {
        console.log('Contract or account not initialized');
        return;
      }
      
      const hasNickname = await contract.hasRegisteredNickname(account);
      if (hasNickname) {
        const nick = await contract.getNicknameByAddress(account);
        setUserNickname(nick);
      }
    } catch (err) {
      console.error('Error in fetchNickname:', err.message || err);
    }
  };

  const setNickname = async () => {
    try {
      if (!newNickname) {
        setError('Please enter a nickname');
        return;
      }
      if (!contract) {
        setError('Contract not initialized');
        return;
      }
      
      setLoading(true);
      setError('');
      
      console.log('Registering nickname:', newNickname);
      const tx = await contract.registerNickname(newNickname);
      console.log('Transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('Transaction confirmed');
      
      setUserNickname(newNickname);
      setNewNickname('');
      await updateUsersList();
    } catch (err) {
      console.error('Error in setNickname:', err);
      setError(err.message || 'Failed to set nickname');
    } finally {
      setLoading(false);
    }
  };

  const updateUsersList = async () => {
    try {
      if (!contract || !tokenContract || !provider) {
        console.log('Required props not initialized:', {
          hasContract: !!contract,
          hasTokenContract: !!tokenContract,
          hasProvider: !!provider
        });
        setError('Waiting for connection...');
        return;
      }

      setLoading(true);
      setError('');
      console.log('Starting to update users list...');

      try {
        // Get current block
        const currentBlock = await provider.getBlockNumber();
        console.log('Current block:', currentBlock);

        // Define block range
        const BLOCK_RANGE = 10000; // Smaller range for safety
        const endBlock = currentBlock;
        const startBlock = Math.max(0, endBlock - BLOCK_RANGE);

        console.log(`Querying events from block ${startBlock} to ${endBlock}`);

        // Get users who have registered nicknames
        const registeredFilter = contract.filters.NicknameRegistered();
        console.log('Fetching NicknameRegistered events...');
        const events = await contract.queryFilter(registeredFilter, startBlock, endBlock);
        console.log('Found events:', events.length);

        // Get unique addresses of users with nicknames
        const uniqueAddresses = [...new Set(events.map(event => event.args.user))];
        console.log('Unique addresses:', uniqueAddresses.length);

        // Fetch data for each user
        const usersData = await Promise.all(
          uniqueAddresses.map(async (address) => {
            try {
              // Check if nickname is still registered
              const hasNickname = await contract.hasRegisteredNickname(address);
              if (!hasNickname) {
                console.log('Address no longer has nickname:', address);
                return null;
              }

              // Get current nickname and balance
              const nickname = await contract.getNicknameByAddress(address);
              const balance = await tokenContract.balanceOf(address);
              
              return {
                address,
                nickname,
                balance: ethers.utils.formatEther(balance)
              };
            } catch (err) {
              console.warn('Failed to fetch data for', address, ':', err.message);
              return null;
            }
          })
        );

        // Filter out failed fetches and sort by balance
        const validUsersData = usersData
          .filter(data => data !== null)
          .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));

        setUsers(validUsersData);
      } catch (err) {
        console.error('Error querying events:', err);
        setError('Failed to load rankings. Please try again.');
        throw err; // Re-throw to be caught by outer try-catch
      }
    } catch (err) {
      console.error('Error in updateUsersList:', err);
      setError('Failed to update rankings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (contract && tokenContract && account) {
        console.log('Initializing TokenDashboard...');
        await fetchNickname();
        await updateUsersList();
      }
    };
    
    init();
  }, [contract, tokenContract, account]);

  // Listen for NicknameRegistered events
  useEffect(() => {
    if (contract) {
      console.log('Setting up NicknameRegistered event listener');
      const nicknameFilter = contract.filters.NicknameRegistered();
      
      const handleNicknameRegistered = (user, nickname) => {
        console.log('NicknameRegistered event:', { user, nickname });
        updateUsersList();
      };

      contract.on(nicknameFilter, handleNicknameRegistered);

      return () => {
        console.log('Removing NicknameRegistered event listener');
        contract.off(nicknameFilter, handleNicknameRegistered);
      };
    }
  }, [contract]);

  return (
    <div className="w-full mb-4 bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Token Rankings & Nickname</h2>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            {userNickname ? 
              `Current nickname: ${userNickname}` : 
              "You haven't set a nickname yet"
            }
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new nickname"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              disabled={loading}
            />
            <button 
              onClick={setNickname}
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Setting..." : "Set Nickname"}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nickname
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr 
                  key={user.address}
                  className={user.address.toLowerCase() === account?.toLowerCase() ? "bg-blue-50" : ""}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {user.nickname}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {`${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {parseFloat(user.balance).toFixed(2)} HYBLOCK
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-sm text-center text-gray-500">
                    No users found with registered nicknames
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={updateUsersList}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Rankings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenDashboard;