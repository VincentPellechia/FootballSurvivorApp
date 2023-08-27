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
  const [teamsOdds, setTeamsOdds] = useState({});
  const weekCount = 18;
  const [selectedCells, setSelectedCells] = useState([]);
  const [bestTeams, setBestTeams] = useState([]);

  const fetchAndCacheData = async () => {
    const data = await fetchOddsData();
    setOddsData(data);
    cacheOddsData(data);
  };

  const toggleSelectedCell = (index) => {
    if (selectedCells.includes(index)) {
      setSelectedCells(selectedCells.filter((cellIndex) => cellIndex !== index));
    } else {
      setSelectedCells([...selectedCells, index]);
    }
  };

  const teamAbbreviations = {
    "Arizona Cardinals": "ARI","Atlanta Falcons": "ATL","Chicago Bears":"CHI","Detroit Lions":"DET","Washington Commanders":"WAS",
    "Kansas City Chiefs":"KC","Carolina Panthers":"CAR","Baltimore Ravens":"BAL","Houston Texans":"HOU","Green Bay Packers":"GB",
    "Cleveland Browns":"CLE","Cincinnati Bengals":"CIN","Minnesota Vikings":"MIN","Tampa Bay Buccaneers":"TB","Pittsburgh Steelers":"PIT",
    "San Francisco 49ers":"SF","Indianapolis Colts":"IND","Jacksonville Jaguars":"JAX","New Orleans Saints":"NO","Tennessee Titans":"TEN",
    "Seattle Seahawks":"SEA","Los Angeles Rams":"LA","Denver Broncos":"DEN","Las Vegas Raiders":"LV","Los Angeles Chargers":"LAC",
    "Miami Dolphins":"MIA","New England Patriots":"NE","Philadelphia Eagles":"PHI","New York Giants":"NYG","Dallas Cowboys":"DAL",
    "New York Jets":"NYJ","Buffalo Bills":"BUF","BYE":"BYE"
  };

  const calculateColorValue = point => {
    // Calculate a normalized value between 0 and 1 based on point value
    const minValue = -11; // Change this to your actual minimum point value
    const maxValue = 11;
    const normalizedValue = (point - minValue) / (maxValue - minValue);
  
    // Interpolate between green (0, 255, 0) and red (255, 0, 0) based on normalized value
    const green = Math.floor(255 * (1 - normalizedValue));
    const red = Math.floor(255 * normalizedValue);
    const blue = 0;
    
    // Return the RGB color value
    return `rgb(${red}, ${green}, ${blue})`;
  };

  const calculateBestPicks = () => {
    if (Object.keys(teamsOdds).length === 0) {
      return; // Return early if teamsOdds is empty
    }
    if (teamsOdds) {
      const pickBestTeam = () => {
        const availableTeams = Object.keys(teamsOdds); // List of teams available to pick
        const pickedTeams = []; // Teams that have been picked
      
        for (let week = 1; week <= weekCount; week++) {
          // Calculate scores for available teams based on odds.points
          const scores = {};
          availableTeams.forEach(teamName => {
            const teamWeekOdds = teamsOdds[teamName].find(odds => odds.week === week);
            scores[teamName] = teamWeekOdds ? teamWeekOdds.point : Infinity;
          });
      
          // Pick the team with the lowest score for the current week
          const bestTeam = availableTeams.reduce((best, current) => {
            return scores[current] < scores[best] ? current : best;
          });
      
          // Update pickedTeams and availableTeams
          pickedTeams.push(teamAbbreviations[bestTeam]);
          availableTeams.splice(availableTeams.indexOf(bestTeam), 1);
        }
      
        return pickedTeams.join(', ');
      };
      setBestTeams(pickBestTeam());
    }
  }
  
  useEffect(() => {
    if (oddsData) {
      const newTeamsOdds = {}; // Create a new object to store the teams odds
      const firstWeekTime = new Date("2023-09-07T00:21:00Z");

      oddsData.forEach(game => {
        const homeTeam = game.home_team;
        const awayTeam = game.away_team;

        newTeamsOdds[homeTeam] = newTeamsOdds[homeTeam] || [];
        newTeamsOdds[awayTeam] = newTeamsOdds[awayTeam] || [];

        const gameCommenceTime = new Date(game.commence_time);
        
        const timeDifference = gameCommenceTime - firstWeekTime;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(daysDifference / 7) + 1;

        game.bookmakers.forEach(bookmaker => {
          const spreadMarket = bookmaker.markets.find(market => market.key === 'spreads');
          if (spreadMarket) {
            const homeOdds = spreadMarket.outcomes.find(outcome => outcome.name === homeTeam);
            const awayOdds = spreadMarket.outcomes.find(outcome => outcome.name === awayTeam);

            // Insert BYE week if needed
            for (let i = newTeamsOdds[homeTeam].length; i < weekNumber - 1; i++) {
              newTeamsOdds[homeTeam].push({ opponent: "BYE", week: i + 1 });
            }
            for (let i = newTeamsOdds[awayTeam].length; i < weekNumber - 1; i++) {
              newTeamsOdds[awayTeam].push({ opponent: "BYE", week: i + 1 });
            }

            if (homeOdds) {
              newTeamsOdds[homeTeam].push({ opponent: awayTeam, point: homeOdds.point, week: weekNumber });
            }
            if (awayOdds) {
              newTeamsOdds[awayTeam].push({ opponent: homeTeam, point: awayOdds.point, week: weekNumber });
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
            <td 
            key={index}
            onClick={()=> toggleSelectedCell(index)}
            className={selectedCells.includes(index) ? "selected-cell" : ""}
            >
              {odds && (
              <div className="game-box" style={{ backgroundColor: calculateColorValue(odds.point) }}>
                <p>{teamAbbreviations[odds.opponent]}</p>
                <p>{odds.point}</p>
                {/* Add onClick handler here */}
              </div>)}
            </td>))}
          </tr>
          ))}
          </tbody>
        </table>
      )}
      <button onClick={calculateBestPicks}>Calculate</button>
      {bestTeams && (<div>{bestTeams}</div>)}
    </div>
  );
}

export default App;