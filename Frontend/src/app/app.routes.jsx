import { createBrowserRouter } from "react-router";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Dashboard from "../features/chat/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import { Navigate } from "react-router";
import Landing from "../features/landing/Landing";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Landing />
    },
    {
        path: "/dashboard",
        element: <Protected>
            <Dashboard />
        </Protected>
    },
    {
        path: "/app",
        element: <Navigate to="/dashboard" replace />
    }
])