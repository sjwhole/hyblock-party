import React from 'react';

const TrophyIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const AwardIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const RankingTable = ({ users, account, loading }) => {
  const getMedalColor = (rank) => {
    switch(rank) {
      case 1: return 'text-yellow-500'; // Gold
      case 2: return 'text-gray-400';   // Silver
      case 3: return 'text-amber-700';  // Bronze
      default: return 'text-gray-500';
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) {
      return <TrophyIcon className="w-6 h-6 text-yellow-500 animate-pulse" />;
    }
    return <AwardIcon className={`w-5 h-5 ${getMedalColor(rank)}`} />;
  };

  const getRowStyle = (rank, address) => {
    const baseStyle = "transition-all duration-300 hover:bg-gray-50";
    const isCurrentUser = address.toLowerCase() === account?.toLowerCase();
    
    if (isCurrentUser) {
      return `${baseStyle} bg-blue-50 hover:bg-blue-100`;
    }
    
    switch(rank) {
      case 1:
        return `${baseStyle} bg-gradient-to-r from-yellow-50 to-transparent`;
      case 2:
        return `${baseStyle} bg-gradient-to-r from-gray-50 to-transparent`;
      case 3:
        return `${baseStyle} bg-gradient-to-r from-amber-50 to-transparent`;
      default:
        return baseStyle;
    }
  };

  return (
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
              className={getRowStyle(index + 1, user.address)}
            >
              <td className="px-4 py-3 text-sm text-gray-900">
                <div className="flex items-center">
                  <div className="w-8 flex justify-center">
                    {index < 3 && getMedalIcon(index + 1)}
                  </div>
                  <span className="ml-1">{index + 1}</span>
                </div>
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
  );
};

export default RankingTable;