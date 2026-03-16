import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, TrendingUp, FileText, ExternalLink, ChevronDown, RefreshCw, Send, Clock, Shield, Globe, Loader2, Sliders, Play } from 'lucide-react'
import { useApplication } from '../context/ApplicationContext'
import DashboardLayout from '../components/DashboardLayout'
import AgentFeedWidget from '../components/AgentFeedWidget'
import './ResearchAgent.css'

export default function ResearchAgent() {
    const { applicationId, ucsoData, agentFeed, addNote, submitPD, triggerStress, refreshApplication, loading } = useApplication()

    // Officer notes
    const [officerNote, setOfficerNote] = useState('')
    const [authorName, setAuthorName] = useState('')
    const [isSubmittingNote, setIsSubmittingNote] = useState(false)
    const [noteSuccess, setNoteSuccess] = useState(false)

    // PD Transcript
    const [pdData, setPdData] = useState({ interviewer: '', transcript: '', pd_date: '' })
    const [isSubmittingPD, setIsSubmittingPD] = useState(false)
    const [pdSuccess, setPdSuccess] = useState(false)

    // Stress Simulation
    const [stressData, setStressData] = useState({
        revenue_shock_pct: -20,
        interest_rate_hike_bps: 200,
        working_capital_squeeze_pct: -15,
        raw_material_inflation_pct: 10,
    })
    const [isStressing, setIsStressing] = useState(false)
    const [stressSuccess, setStressSuccess] = useState(false)

    // Feed expansion
    const [expandedItem, setExpandedItem] = useState(null)

    // Refresh
    const [isRecalibrating, setIsRecalibrating] = useState(false)

    const handleRecalibrate = useCallback(async () => {
        setIsRecalibrating(true)
        try {
            await refreshApplication()
        } catch (_) { /* noop */ }
        setTimeout(() => setIsRecalibrating(false), 1000)
    }, [refreshApplication])

    const handleSubmitNote = useCallback(async () => {
        if (!officerNote.trim() || !applicationId) return
        setIsSubmittingNote(true)
        setNoteSuccess(false)
        try {
            await addNote({ author: authorName || 'Credit Officer', note: officerNote })
            setOfficerNote('')
            setNoteSuccess(true)
            setTimeout(() => setNoteSuccess(false), 3000)
        } catch (err) {
            console.error('Note submission failed', err)
        } finally {
            setIsSubmittingNote(false)
        }
    }, [officerNote, authorName, applicationId, addNote])

    const handleSubmitPD = useCallback(async () => {
        if (!pdData.transcript.trim() || !applicationId) return
        setIsSubmittingPD(true)
        setPdSuccess(false)
        try {
            await submitPD({
                interviewer: pdData.interviewer || 'Officer',
                transcript: pdData.transcript,
                pd_date: pdData.pd_date || new Date().toISOString().slice(0, 10),
            })
            setPdData({ interviewer: '', transcript: '', pd_date: '' })
            setPdSuccess(true)
            setTimeout(() => setPdSuccess(false), 3000)
        } catch (err) {
            console.error('PD submission failed', err)
        } finally {
            setIsSubmittingPD(false)
        }
    }, [pdData, applicationId, submitPD])

    const handleTriggerStress = useCallback(async () => {
        if (!applicationId) return
        setIsStressing(true)
        setStressSuccess(false)
        try {
            await triggerStress(stressData)
            setStressSuccess(true)
            setTimeout(() => setStressSuccess(false), 3000)
        } catch (err) {
            console.error('Stress trigger failed', err)
        } finally {
            setIsStressing(false)
        }
    }, [applicationId, stressData, triggerStress])

    // Extract risk data from ucsoData — mapped to actual Trinetra Agent UCSO keys
    const riskData = ucsoData?.risk || {}
    // Agent outputs risk.score (0.0 to 1.0, higher = riskier).
    // Invert for the UI ring so higher = safer ("confidence").
    const riskScore = riskData.score != null
        ? Math.round((1.0 - riskData.score) * 100)
        : null
    const riskBand = riskData.band || null // LOW, MEDIUM, HIGH, REJECT
    const riskDecision = riskData.decision || null // APPROVE, REVIEW, REJECT

    // Compliance data from agent
    const complianceData = ucsoData?.compliance || {}
    const complianceStatus = complianceData.status || null // PASS or FAIL
    const missingDocs = complianceData.missing_documents || []
    const compliancePct = Math.round(((4 - missingDocs.length) / 4) * 100)

    const getRiskLevel = (score) => {
        if (score === null) return { label: 'Pending', color: 'info' }
        if (score >= 75) return { label: 'Low Risk', color: 'success' }
        if (score >= 50) return { label: 'Medium Risk', color: 'warning' }
        return { label: 'High Risk', color: 'danger' }
    }

    const risk = getRiskLevel(riskScore)
    const displayScore = riskScore !== null ? riskScore : '--'

    // Extract notes from ucsoData
    const existingNotes = ucsoData?.human_notes || ucsoData?.notes || []

    // Build crawler items from agent feed for display
    const crawlerItems = agentFeed.slice(0, 10).map((update, i) => ({
        id: `feed-${i}`,
        type: update.status?.toLowerCase() === 'completed' ? 'news' : update.status?.toLowerCase() === 'failed' ? 'lawsuit' : 'filing',
        icon: update.status?.toLowerCase() === 'completed' ? TrendingUp : update.status?.toLowerCase() === 'failed' ? AlertTriangle : FileText,
        color: update.status?.toLowerCase() === 'completed' ? 'success' : update.status?.toLowerCase() === 'failed' ? 'danger' : 'warning',
        title: update.agent || 'Agent Update',
        source: update.status || 'Processing',
        body: update.message || 'No details available',
        time: update.timestamp ? new Date(update.timestamp).toLocaleTimeString() : 'now',
    }))

    // Fallback static items when no live feed
    const STATIC_ITEMS = [
        {
            id: 'static-1', type: 'filing', icon: FileText, color: 'warning',
            title: 'Awaiting Agent Results',
            source: 'System',
            body: 'AI agents will appear here once they start processing. Create an application and upload documents to see live updates.',
            time: 'now',
        },
    ]

    const displayItems = crawlerItems.length > 0 ? crawlerItems : STATIC_ITEMS

    if (!applicationId) {
        return (
            <DashboardLayout title="Research Agent Intelligence Hub" subtitle="Automated web intelligence & risk assessment">
                <div className="research-page">
                    <div className="no-app-msg">
                        <AlertTriangle size={24} />
                        <h3>No Application Found</h3>
                        <p>Go to the <strong>Data Ingestor</strong> page first and create a loan application to start the analysis.</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Research Agent Intelligence Hub" subtitle="Automated web intelligence & risk assessment">
            <div className="research-page">
                {/* Alert Banner */}
                {riskBand && (
                    <motion.div
                        className="alert-banner"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <AlertTriangle size={18} className="alert-icon" />
                        <div className="alert-content">
                            <strong>Risk Band: {riskBand}</strong>
                            <p>Default probability classified as <b>{riskBand}</b> by AI Risk Agent. {riskDecision ? `Decision: ${riskDecision}` : ''} {riskScore !== null ? `| Confidence: ${riskScore}%` : ''}</p>
                        </div>
                        <button className="btn-secondary alert-btn" onClick={handleRecalibrate}>Refresh</button>
                    </motion.div>
                )}

                <div className="research-grid">
                    {/* Crawler Feed / Live Agent Feed */}
                    <div className="crawler-feed">
                        <div className="feed-header">
                            <div className="feed-title">
                                <Globe size={18} />
                                <h3>Live Agent Intelligence Feed</h3>
                            </div>
                            <button className="refresh-btn" onClick={handleRecalibrate}>
                                <RefreshCw size={14} className={isRecalibrating ? 'spin' : ''} />
                                Refresh
                            </button>
                        </div>

                        <div className="feed-items">
                            {displayItems.map((item, index) => {
                                const Icon = item.icon
                                const isExpanded = expandedItem === item.id
                                return (
                                    <motion.div
                                        key={item.id}
                                        className={`feed-item ${item.color}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="fi-header" onClick={() => setExpandedItem(isExpanded ? null : item.id)}>
                                            <div className={`fi-icon ${item.color}`}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="fi-title-area">
                                                <h4>{item.title}</h4>
                                                <span className="fi-source">{item.source}</span>
                                            </div>
                                            <div className="fi-right">
                                                <span className="fi-time"><Clock size={12} /> {item.time}</span>
                                                <ChevronDown size={16} className={`fi-chevron ${isExpanded ? 'expanded' : ''}`} />
                                            </div>
                                        </div>
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    className="fi-body"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <p>{item.body}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Agent Feed Widget (WebSocket) */}
                        <div className="feed-ws-section">
                            <AgentFeedWidget />
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="research-right">
                        {/* Risk Score */}
                        <div className="risk-card">
                            <div className="rc-header">
                                <h3 className="font-serif">Current Risk Score</h3>
                                <span className="rc-updated"><Clock size={12} /> {loading ? 'Refreshing...' : 'Live from AI agents'}</span>
                            </div>
                            <div className="rc-score-wrapper">
                                <motion.div
                                    className={`rc-score-ring ${risk.color}`}
                                    animate={{ rotate: isRecalibrating ? 360 : 0 }}
                                    transition={{ duration: 2, ease: 'linear', repeat: isRecalibrating ? Infinity : 0 }}
                                >
                                    <svg viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                                        <motion.circle
                                            cx="60" cy="60" r="52" fill="none"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 52}`}
                                            animate={{ strokeDashoffset: riskScore !== null ? 2 * Math.PI * 52 * (1 - riskScore / 100) : 2 * Math.PI * 52 }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="score-circle"
                                            transform="rotate(-90 60 60)"
                                        />
                                    </svg>
                                    <div className="rc-score-value">
                                        <motion.span
                                            key={displayScore}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="score-num"
                                        >
                                            {displayScore}
                                        </motion.span>
                                        <span className="score-max">/100</span>
                                    </div>
                                </motion.div>
                                <span className={`risk-badge ${risk.color}`}>{risk.label}</span>
                            </div>
                            {isRecalibrating && (
                                <motion.div
                                    className="recalibrating"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <RefreshCw size={14} className="spin" />
                                    Recalibrating Risk Score...
                                </motion.div>
                            )}
                        </div>

                        {/* Officer Note Input (Endpoint 4) */}
                        <div className="officer-card">
                            <div className="oc-header">
                                <Shield size={16} />
                                <h3 className="font-serif">Credit Officer Notes</h3>
                            </div>
                            <p className="oc-desc">Submit observations to integrate into the risk model.</p>
                            <input
                                className="oc-author-input"
                                placeholder="Your name (e.g. Rajesh Kumar)"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                            />
                            <textarea
                                className="oc-input"
                                placeholder="Enter credit officer observations..."
                                value={officerNote}
                                onChange={(e) => setOfficerNote(e.target.value)}
                                rows={4}
                            />
                            <button
                                className="btn-primary oc-submit"
                                onClick={handleSubmitNote}
                                disabled={!officerNote.trim() || isSubmittingNote}
                            >
                                {isSubmittingNote ? <><Loader2 size={14} className="spin" /> Submitting...</> : <><Send size={14} /> Submit Note</>}
                            </button>
                            {noteSuccess && <div className="oc-success">✅ Note submitted successfully!</div>}

                            {/* Existing notes */}
                            {existingNotes.length > 0 && (
                                <div className="oc-notes">
                                    <h4 className="oc-notes-title">Previous Notes</h4>
                                    {existingNotes.map((note, i) => (
                                        <motion.div
                                            key={i}
                                            className="oc-note"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <span className="note-author">{note.author || 'Officer'}</span>
                                            <span className="note-time">{note.timestamp ? new Date(note.timestamp).toLocaleString() : ''}</span>
                                            <p>{note.note || note.text}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PD Transcript (Endpoint 5) */}
                        <div className="officer-card">
                            <div className="oc-header">
                                <FileText size={16} />
                                <h3 className="font-serif">Personal Discussion (PD)</h3>
                            </div>
                            <p className="oc-desc">Submit PD interview transcript for analysis.</p>
                            <div className="pd-form">
                                <input
                                    className="oc-author-input"
                                    placeholder="Interviewer name"
                                    value={pdData.interviewer}
                                    onChange={(e) => setPdData(prev => ({ ...prev, interviewer: e.target.value }))}
                                />
                                <input
                                    className="oc-author-input"
                                    type="date"
                                    value={pdData.pd_date}
                                    onChange={(e) => setPdData(prev => ({ ...prev, pd_date: e.target.value }))}
                                />
                                <textarea
                                    className="oc-input"
                                    placeholder="Enter PD transcript..."
                                    value={pdData.transcript}
                                    onChange={(e) => setPdData(prev => ({ ...prev, transcript: e.target.value }))}
                                    rows={4}
                                />
                            </div>
                            <button
                                className="btn-primary oc-submit"
                                onClick={handleSubmitPD}
                                disabled={!pdData.transcript.trim() || isSubmittingPD}
                            >
                                {isSubmittingPD ? <><Loader2 size={14} className="spin" /> Submitting...</> : <><Send size={14} /> Submit PD Transcript</>}
                            </button>
                            {pdSuccess && <div className="oc-success">✅ PD transcript submitted!</div>}
                        </div>

                        {/* Stress Simulation (Endpoint 6) */}
                        <div className="officer-card stress-card">
                            <div className="oc-header">
                                <Sliders size={16} />
                                <h3 className="font-serif">Stress Simulation</h3>
                            </div>
                            <p className="oc-desc">Test financial resilience under different scenarios.</p>
                            <div className="stress-form">
                                <div className="stress-field">
                                    <label>Revenue Shock (%)</label>
                                    <input
                                        className="oc-author-input"
                                        type="number"
                                        value={stressData.revenue_shock_pct}
                                        onChange={(e) => setStressData(prev => ({ ...prev, revenue_shock_pct: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="stress-field">
                                    <label>Interest Rate Hike (bps)</label>
                                    <input
                                        className="oc-author-input"
                                        type="number"
                                        value={stressData.interest_rate_hike_bps}
                                        onChange={(e) => setStressData(prev => ({ ...prev, interest_rate_hike_bps: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="stress-field">
                                    <label>Working Capital Squeeze (%)</label>
                                    <input
                                        className="oc-author-input"
                                        type="number"
                                        value={stressData.working_capital_squeeze_pct}
                                        onChange={(e) => setStressData(prev => ({ ...prev, working_capital_squeeze_pct: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="stress-field">
                                    <label>Raw Material Inflation (%)</label>
                                    <input
                                        className="oc-author-input"
                                        type="number"
                                        value={stressData.raw_material_inflation_pct}
                                        onChange={(e) => setStressData(prev => ({ ...prev, raw_material_inflation_pct: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <button
                                className="btn-primary oc-submit"
                                onClick={handleTriggerStress}
                                disabled={isStressing}
                            >
                                {isStressing ? <><Loader2 size={14} className="spin" /> Running...</> : <><Play size={14} /> Run Stress Simulation</>}
                            </button>
                            {stressSuccess && <div className="oc-success">✅ Stress simulation triggered!</div>}
                        </div>

                        {/* Compliance Status */}
                        <div className="officer-card compliance-card">
                            <div className="oc-header">
                                <Shield size={16} />
                                <h3 className="font-serif">Compliance Status</h3>
                            </div>
                            {complianceStatus ? (
                                <>
                                    <div className={`compliance-badge ${complianceStatus === 'PASS' ? 'pass' : 'fail'}`}>
                                        {complianceStatus === 'PASS' ? '✅ PASS' : '❌ FAIL'}
                                    </div>
                                    <div className="compliance-progress">
                                        <div className="compliance-bar">
                                            <div className="compliance-fill" style={{ width: `${compliancePct}%` }} />
                                        </div>
                                        <span className="compliance-pct">{compliancePct}% documents present</span>
                                    </div>
                                    {missingDocs.length > 0 && (
                                        <div className="missing-docs">
                                            <h4>Missing Documents:</h4>
                                            <ul>
                                                {missingDocs.map((doc, i) => (
                                                    <li key={`miss-${i}`}>{doc}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="oc-desc">Awaiting compliance check from agent...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
