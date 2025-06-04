import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import planRoutes from "./routers/plan.router";
import subscriptionRoutes from "./routers/subscription.router";
import devPlanRoutes from "./routers/developer/subscription-plans.router";
import devUserSubsRoutes from "./routers/developer/user-subscriptions.router";
import cvRoutes from "./routers/cv.router";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Public & USER routes
app.use("/api/plan", planRoutes);
app.use("/api/subscription", subscriptionRoutes);

// CV generator route (Profile/CV) – mounted at /api/profile
app.use("/api/profile", cvRoutes);

// DEVELOPER routes (all requireAuth + role check inside controller)
app.use("/api/developer/subscription-plans", devPlanRoutes);
app.use("/api/developer/user-subscriptions", devUserSubsRoutes);

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

export default app;