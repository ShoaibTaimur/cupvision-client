import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "./index.css"
import App from "./App"
import { ThemeProvider } from "./components/theme-provider"
import { SiteShell } from "./components/site-shell"
import { HomePage } from "./pages/home-page"
import { MatchesPage } from "./pages/matches-page"
import { ScoreboardPage } from "./pages/scoreboard-page"
import { TimelinePage } from "./pages/timeline-page"
import { AuthorsPage } from "./pages/authors-page"
import { AboutPage } from "./pages/about-page"
import { AdminLoginPage } from "./pages/admin-login-page"
import { AdminDashboardPage } from "./pages/admin-dashboard-page"
import { NotFoundPage } from "./pages/not-found-page"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <SiteShell />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "matches", element: <MatchesPage /> },
          { path: "scoreboard", element: <ScoreboardPage /> },
          { path: "timeline", element: <TimelinePage /> },
          { path: "authors", element: <AuthorsPage /> },
          { path: "about", element: <AboutPage /> },
          { path: "admin/login", element: <AdminLoginPage /> },
          { path: "admin", element: <AdminDashboardPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
])

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
