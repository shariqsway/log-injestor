import { Router } from "express";
import { LogController } from "../controllers/logController";
import { asyncWrapper } from "../middleware/errorHandler";
import {
  validateLogEntry,
  validateQueryParams,
} from "../middleware/validation";

const router = Router();
const logController = new LogController();

// GET /logs/debug - Get debug information
router.get(
  "/debug",
  asyncWrapper(async (req, res) => {
    await logController.getDebugInfo(req, res);
  })
);

// GET /logs/stats - Get log statistics (for analytics)
router.get(
  "/stats",
  asyncWrapper(async (req, res) => {
    await logController.getLogStats(req, res);
  })
);

// POST /logs/reset - Reset storage
router.post(
  "/reset",
  asyncWrapper(async (req, res) => {
    await logController.resetStorage(req, res);
  })
);

// POST /logs - Create a new log entry
router.post(
  "/",
  validateLogEntry,
  asyncWrapper(async (req, res) => {
    await logController.createLog(req, res);
  })
);

// GET /logs - Retrieve log entries with optional filtering
router.get(
  "/",
  validateQueryParams,
  asyncWrapper(async (req, res) => {
    await logController.getLogs(req, res);
  })
);

export default router;
