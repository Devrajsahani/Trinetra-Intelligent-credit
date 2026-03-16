import { useApplication } from '../context/ApplicationContext'
import { Wifi, WifiOff } from 'lucide-react'
import './ConnectionStatus.css'

export default function ConnectionStatus() {
    const { wsConnected, applicationId } = useApplication()

    if (!applicationId) return null

    return (
        <div className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
            {wsConnected ? (
                <><Wifi size={12} /> <span>Live</span></>
            ) : (
                <><WifiOff size={12} /> <span>Offline</span></>
            )}
        </div>
    )
}
