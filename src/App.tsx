import { BrowserRouter } from "react-router-dom"
import Layout from "./layouts/Layout"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <SpeedInsights />
      <Layout />
    </BrowserRouter>
  )
}
