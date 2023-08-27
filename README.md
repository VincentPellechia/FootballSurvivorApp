# FootBall Survivor Analysis Tool

The FootBall Survivor Analysis Tool is a web application that provides insights and analysis of NFL game odds. It fetches and displays odds data from the Odds API for American football NFL games and offers features such as viewing odds for each team, visualizing odds trends, and an algorithm to pick the best team for each week based on odds.

## Features

- Fetches NFL game odds data from the Odds API.
- Displays odds information for each team and each week.
- Visualizes odds trends using color gradients.
- Provides an algorithm to pick the best team for each week based on odds.points.
- Allows users to select and highlight specific cells for their team selections.
- Handles bye weeks by inserting "BYE" placeholders.
- Responsive design for various screen sizes.

## Getting Started

To run this project locally, follow these steps:

1. Clone the repository: `git clone https://github.com/your-username/nfl-odds-analysis.git`
2. Navigate to the project directory: `cd nfl-odds-analysis`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`
5. Open your browser and go to: `http://localhost:3000`

## Usage

1. Click the "Fetch and Cache Odds" button to fetch and cache the latest NFL odds data from the Odds API.
2. Once the data is fetched, the table will display odds information for each team and each week.
3. Cells are color-coded based on points, with lower values appearing green and higher values appearing red.
4. Click on a cell to select it. The selected cell will be highlighted, and the rest of the row will be unclickable.
5. The algorithm automatically selects the best team for each week based on points. The picked teams are displayed in the console.

## Technologies Used

- React: JavaScript library for building user interfaces.
- Axios: Promise-based HTTP client for making API requests.
- CSS: Styling the components and layout.
- Odds API: External API providing NFL game odds data.

## Credits

- NFL Odds Analysis Tool was developed by Vincent Pellechia.
- Data is fetched from the Odds API (https://api.the-odds-api.com/).

---

Feel free to customize this README to include any additional information, such as deployment instructions, screenshots, or any other relevant details about your project.