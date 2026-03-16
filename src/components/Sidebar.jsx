import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Upload, Search, Gavel, FileOutput } from 'lucide-react'
import trinetraLogo from '../assets/trinetra-logo.jpg'
import './Sidebar.css'

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/ingestor', label: 'Ingestion', icon: Upload },
    { path: '/research', label: 'Research', icon: Search },
    { path: '/recommendation', label: 'Decisions', icon: Gavel },
    { path: '/recommendation', label: 'Export CAM', icon: FileOutput },
]

export default function Sidebar() {
    const location = useLocation()

    return (
        <motion.aside
            className="sidebar"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
            <div className="sidebar-brand">
                <img src={trinetraLogo} alt="Trinetra" className="brand-logo" />
                <div className="brand-text">
                    <h2>Trinetra</h2>
                    <span className="brand-badge">AI Platform</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    return (
                        <NavLink
                            key={`${item.label}-${index}`}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <motion.div
                                className="nav-item-inner"
                            >
                                {isActive && (
                                    <motion.div
                                        className="nav-active-indicator"
                                        layoutId="activeNav"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon size={18} className="nav-icon" />
                                <span>{item.label}</span>
                            </motion.div>
                        </NavLink>
                    )
                })}
            </nav>

            <div className="sidebar-user">
                <div className="user-avatar">AM</div>
                <div className="user-info">
                    <span className="user-name">Alex Morgan</span>
                    <span className="user-role">Senior Analyst</span>
                </div>
            </div>
        </motion.aside>
    )
}
