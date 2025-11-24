# Trip Visualizer

A comprehensive data visualization application designed to help users analyze and understand their personal Uber ride history. Upload your trip data and discover insights through interactive charts, graphs, and statistics.

![Trip Visualizer](https://img.shields.io/badge/React-19.1.1-blue) ![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.13-38B2AC)

## ✨ Features

### 📊 Comprehensive Analytics
- **Trip Summary**: Overview of all trips including successful, canceled, and unfulfilled rides with percentage breakdowns
- **Distance & Duration Analysis**: Track total distance traveled, average trip duration, and longest/shortest trips
- **Speed Metrics**: Analyze average speed, fastest and slowest trips, and speed distribution
- **Cost Efficiency**: Detailed fare analysis including cost per distance, cost per duration, and fare trends over time
- **Waiting Time Analysis**: Understand pickup wait times and identify trips where waiting exceeded ride duration

### 📈 Interactive Visualizations
- **Activity Heatmap**: GitHub-style contribution graph showing your ride patterns over time
- **Daily & Hourly Activity**: Visualize ride frequency by day of week and hour of day
- **Product Types Distribution**: Breakdown of different ride types (UberX, Pool, Premium, etc.)
- **Cumulative Statistics**: Track your riding journey with cumulative distance and fare charts
- **Trip Duration Distribution**: Histogram showing the distribution of trip lengths
- **Yearly Trends**: Analyze how your riding habits have changed year over year

### 🗺️ Map Features
- **Interactive Map View**: Visualize all your trips on an interactive map with pickup and dropoff locations
- **Heatmap Layer**: See hotspots of your most frequent ride locations
- **Route Visualization**: View individual trip routes with detailed information
- **Filterable Views**: Click on charts to view specific trips on the map (by day, hour, or other criteria)

### 🎯 Advanced Insights
- **Streaks & Pauses**: Discover your longest consecutive riding days and longest gaps between rides
- **Cancellation Analysis**: Track rider vs driver cancellations and cancellation streaks
- **Fun Facts**: Entertaining comparisons like "Power Naps equivalent" and "LOTR Marathon viewings"
- **Consecutive Trip Chains**: Find your longest chain of back-to-back trips in a single day

### 🎨 User Experience
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Export Capabilities**: Download charts and statistics for sharing
- **Sample Data**: Try the app with sample data before uploading your own
- **Privacy First**: All data processing happens locally in your browser - no server uploads

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trip-visualizer.git
   cd trip-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Building for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 How to Get Your Data

1. **Request your Uber data**:
   - Go to [Uber Privacy Center](https://privacy.uber.com/privacy/exploreyourdata)
   - Sign in to your account
   - Request "Download your data"
   - Select "Trips" data
   - Wait for the email with your data (usually takes a few days)

2. **Upload to the app**:
   - Extract the downloaded ZIP file
   - Look for the `trips.csv` file
   - Drag and drop it into the Trip Visualizer or click to browse

## 🛠️ Tech Stack

### Core
- **React 19.1.1** - UI library
- **TypeScript 5.9.2** - Type safety and better developer experience
- **Vite 7.1.7** - Fast build tool and development server

### Styling
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **class-variance-authority** - Component variant management

### Data Visualization
- **Recharts 3.2.1** - Composable charting library
- **Leaflet 1.9.4** - Interactive maps
- **Leaflet.heat** - Heatmap layer for maps

### Data Processing
- **PapaParse 5.5.3** - CSV parsing
- **currency.js 2.0.4** - Precise monetary calculations
- **@turf/turf** - Geospatial analysis
- **geolib** - Geographic calculations

### State Management
- **Redux Toolkit** - Centralized state management (via custom slices)

### Testing
- **Vitest 3.2.4** - Fast unit testing framework
- **Testing Library** - React component testing
- **jest-axe** - Accessibility testing

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Autoprefixer** - CSS vendor prefixing

## 📂 Project Structure

```
trip-visualizer/
├── src/
│   ├── components/
│   │   ├── atoms/          # Basic UI elements (Button, Input, Stat)
│   │   ├── molecules/      # Simple component groups
│   │   └── organisms/      # Complex components (charts, maps)
│   │       └── charts/     # All chart components
│   ├── hooks/              # Custom React hooks
│   │   └── useTripData.ts  # Main data processing logic
│   ├── services/           # External service integrations
│   │   └── csvParser.ts    # CSV parsing logic
│   ├── utils/              # Utility functions
│   │   └── currency.ts     # Currency calculation helpers
│   ├── constants/          # App constants and configurations
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── tests/                  # Test files
└── package.json
```

### Component Architecture

This project follows **Atomic Design** methodology:

- **Atoms**: Smallest UI elements (`Button`, `Input`, `Stat`)
- **Molecules**: Simple groups of atoms (search bars, form fields)
- **Organisms**: Complex components (`ContributionGraph`, `ProductTypesChart`, `MapModal`)
- **Templates**: Page-level layouts
- **Pages**: Final pages with real data

## 🎨 Design System

### Color Coding
All charts follow a consistent color system using Tailwind CSS palette:

| Category | Data Type | Color | Hex Code |
|----------|-----------|-------|----------|
| **Monetary** | Fare, Cost, Price | Green | `#22c55e` |
| **Cancellation** | Cancelled Trips, Fees | Red | `#dc2626` |
| **Distance** | Trip Distance | Blue | `#3b82f6` |
| **Duration** | Trip Time, Wait Time | Amber | `#f59e0b` |
| **Count** | Number of Trips | Indigo | `#6366f1` |
| **Efficiency** | Fuel, MPG | Teal | `#14b8a6` |

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run coverage
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run coverage` | Generate test coverage report |

## 🔒 Privacy & Security

- **100% Client-Side**: All data processing happens in your browser
- **No Server Uploads**: Your trip data never leaves your device
- **No Tracking**: No analytics or tracking scripts
- **Open Source**: Full transparency - review the code yourself

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).


## 📧 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/trip-visualizer/issues) on GitHub.

---

Made with ❤️ for data enthusiasts and Uber riders
