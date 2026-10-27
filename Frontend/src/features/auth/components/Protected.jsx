import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import { useAuth } from '../hook/useAuth'


const Protected = ({ children }) => {
    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)
    const { handleGetMe } = useAuth()
    const hasCheckedSession = useRef(false)

    useEffect(() => {
        if (!user && !hasCheckedSession.current) {
            hasCheckedSession.current = true
            handleGetMe()
        }
    }, [handleGetMe, user])

    if (loading) {
        return <div className="route-loading">Loading your workspace…</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }


    return children
}

export default Protected