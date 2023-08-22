import React, { useState, useEffect } from 'react';
import './App.css'

const fetchOddsData = async () => {
  const response = await fetch(
    'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=192d759fb39cc7b7a7c0088ca1b60a69&regions=us&markets=h2h,spreads&oddsFormat=american&bookmakers=draftkings'
  );
  const data = await response.json();
  return data;
};

// Function to get cached odds data from local storage
const getCachedOddsData = () => {
  const cachedData = localStorage.getItem('oddsData');
  return JSON.parse(cachedData);
};

// Function to cache odds data in local storage
const cacheOddsData = data => {
  localStorage.setItem('oddsData', JSON.stringify(data));
};


function App() {
  const [oddsData, setOddsData] = useState(getCachedOddsData());

  const fetchAndCacheData = async () => {
    const data = await fetchOddsData();
    setOddsData(data);
    cacheOddsData(data);
  };
  const teamAbbreviations = {
    "Arizona Cardinals": "ARI","Atlanta Falcons": "ATL","Chicago Bears":"CHI","Detroit Lions":"DET","Washington Commanders":"WAS",
    "Kansas City Chiefs":"KC","Carolina Panthers":"CAR","Baltimore Ravens":"BAL","Houston Texans":"HOU","Green Bay Packers":"GB",
    "Cleveland Browns":"CLE","Cincinnati Bengals":"CIN","Minnesota Vikings":"MIN","Tampa Bay Buccaneers":"TB","Pittsburgh Steelers":"PIT",
    "San Francisco 49ers":"SF","Indianapolis Colts":"IND","Jacksonville Jaguars":"JAX","New Orleans Saints":"NO","Tennessee Titans":"TEN",
    "Seattle Seahawks":"SEA","Los Angeles Rams":"LA","Denver Broncos":"DEN","Las Vegas Raiders":"LV","Los Angeles Chargers":"LAC",
    "Miami Dolphins":"MIA","New England Patriots":"NE","Philadelphia Eagles":"PHI","New York Giants":"NYG","Dallas Cowboys":"DAL",
    "New York Jets":"NYJ","Buffalo Bills":"Buf"
  };

  const [teamsOdds, setTeamsOdds] = useState({});
  const weekCount = 17;
  
  useEffect(() => {
    if (oddsData) {
      const newTeamsOdds = {}; // Create a new object to store the teams odds

      oddsData.forEach(game => {
        const homeTeam = game.home_team;
        const awayTeam = game.away_team;

        newTeamsOdds[homeTeam] = newTeamsOdds[homeTeam] || [];
        newTeamsOdds[awayTeam] = newTeamsOdds[awayTeam] || [];

        game.bookmakers.forEach(bookmaker => {
          const spreadMarket = bookmaker.markets.find(market => market.key === 'spreads');
          if (spreadMarket) {
            const homeOdds = spreadMarket.outcomes.find(outcome => outcome.name === homeTeam);
            const awayOdds = spreadMarket.outcomes.find(outcome => outcome.name === awayTeam);

            if (homeOdds) {
              newTeamsOdds[homeTeam].push({ opponent: awayTeam, odds: homeOdds.price, point: homeOdds.point });
            }
            if (awayOdds) {
              newTeamsOdds[awayTeam].push({ opponent: homeTeam, odds: awayOdds.price, point: awayOdds.point });
            }
          }
        });
      });

      setTeamsOdds(newTeamsOdds); // Update teamsOdds state
    }
  }, [oddsData]);

  return (
    <div className="App">
      <h1>NFL Odds</h1>
      <button onClick={fetchAndCacheData}>Fetch and Cache Odds</button>
      {oddsData && (
        <table className="team-table">
          <thead>
            <tr>
              <th>Team</th>
              {Array.from({ length: weekCount }, (_, weekIndex) => (
                <th key={weekIndex}>Week {weekIndex + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(teamsOdds).map(teamName => (
              <tr key={teamName}>
                <th>{teamAbbreviations[teamName]}</th>
                {teamsOdds[teamName].map((odds, index) => (
                  <td key={index}>
                    {odds && (
                      <div className="game-box">
                        <p>{teamAbbreviations[odds.opponent]}</p>
                        <p>{odds.odds}</p>
                        {/* Add onClick handler here */}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;