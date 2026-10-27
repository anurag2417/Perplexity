import { useDispatch } from "react-redux";
import { useCallback } from "react";
import { register, login, logout, getMe } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

function getApiError(error, fallback) {
    return error.response?.data?.message
        || error.response?.data?.errors?.[0]?.msg
        || fallback
}

export function useAuth() {


    const dispatch = useDispatch()

    const handleRegister = useCallback(async ({ email, username, password }) => {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            await register({ email, username, password })
            return true
        } catch (error) {
            dispatch(setError(getApiError(error, "Registration failed")))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const handleLogin = useCallback(async ({ email, password }) => {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await login({ email, password })
            dispatch(setUser(data.user))
            return true
        } catch (error) {
            dispatch(setError(getApiError(error, "Login failed")))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const handleGetMe = useCallback(async () => {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch {
            dispatch(setError(null))
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const handleLogout = useCallback(async () => {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            await logout()
        } catch (error) {
            dispatch(setError(getApiError(error, "Logout failed")))
            return false
        } finally {
            dispatch(setUser(null))
            dispatch(setLoading(false))
        }

        return true
    }, [dispatch])

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout,
    }

}