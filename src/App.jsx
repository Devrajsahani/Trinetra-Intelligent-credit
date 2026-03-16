import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ApplicationProvider } from './context/ApplicationContext'
import LandingPage from './pages/LandingPage'
import DataIngestor from './pages/DataIngestor'
import ResearchAgent from './pages/ResearchAgent'
import RecommendationEngine from './pages/RecommendationEngine'
import Dashboard from './pages/Dashboard'

function App() {
    const location = useLocation()

    return (
        <ApplicationProvider>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/ingestor" element={<DataIngestor />} />
                    <Route path="/research" element={<ResearchAgent />} />
                    <Route path="/recommendation" element={<RecommendationEngine />} />
                </Routes>
            </AnimatePresence>
        </ApplicationProvider>
    )
}

export default App
