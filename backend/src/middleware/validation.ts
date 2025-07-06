import { NextFunction, Request, Response } from "express";

export const validateLogEntry = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { body } = req;

  // Check if body exists
  if (!body || Object.keys(body).length === 0) {
    res.status(400).json({
      success: false,
      error: "Request body is required",
    });
    return;
  }

  const requiredFields = [
    "level",
    "message",
    "resourceId",
    "traceId",
    "spanId",
    "commit",
    "metadata",
  ];
  const validLevels = ["error", "warn", "info", "debug"];

  // Check for missing required fields
  const missingFields = requiredFields.filter((field) => !(field in body));
  if (missingFields.length > 0) {
    res.status(400).json({
      success: false,
      error: `Missing required fields: ${missingFields.join(", ")}`,
    });
    return;
  }

  // Validate level field
  if (typeof body.level !== "string") {
    res.status(400).json({
      success: false,
      error: 'Field "level" must be a string',
    });
    return;
  }

  if (!validLevels.includes(body.level)) {
    res.status(400).json({
      success: false,
      error: `Field "level" must be one of: ${validLevels.join(", ")}`,
    });
    return;
  }

  // Validate message field
  if (typeof body.message !== "string") {
    res.status(400).json({
      success: false,
      error: 'Field "message" must be a string',
    });
    return;
  }

  if (body.message.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'Field "message" cannot be empty',
    });
    return;
  }

  // Validate resourceId field
  if (typeof body.resourceId !== "string") {
    res.status(400).json({
      success: false,
      error: 'Field "resourceId" must be a string',
    });
    return;
  }

  // Validate traceId field
  if (typeof body.traceId !== "string") {
    res.status(400).json({
      success: false,
      error: 'Field "traceId" must be a string',
    });
    return;
  }

  // Validate spanId field
  if (typeof body.spanId !== "string") {
    res.status(400).json({
      success: false,
      error: 'Field "spanId" must be a string',
    });
    return;
  }

  // Validate commit field
  if (typeof body.commit !== "string") {
    res.status(400).json({
      success: false,
      error: 'Field "commit" must be a string',
    });
    return;
  }

  // Validate metadata field
  if (
    typeof body.metadata !== "object" ||
    body.metadata === null ||
    Array.isArray(body.metadata)
  ) {
    res.status(400).json({
      success: false,
      error: 'Field "metadata" must be an object',
    });
    return;
  }

  // Validate timestamp if provided (optional field)
  if (body.timestamp !== undefined) {
    if (typeof body.timestamp !== "string") {
      res.status(400).json({
        success: false,
        error: 'Field "timestamp" must be a string in ISO 8601 format',
      });
      return;
    }

    const date = new Date(body.timestamp);
    if (isNaN(date.getTime()) || date.toISOString() !== body.timestamp) {
      res.status(400).json({
        success: false,
        error: 'Field "timestamp" must be a valid ISO 8601 date string',
      });
      return;
    }
  }

  next();
};

export const validateQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { query } = req;

  // Validate level if provided
  if (query.level && typeof query.level === "string") {
    const validLevels = ["error", "warn", "info", "debug"];
    if (!validLevels.includes(query.level)) {
      res.status(400).json({
        success: false,
        error: `Query parameter "level" must be one of: ${validLevels.join(
          ", "
        )}`,
      });
      return;
    }
  }

  // Validate timestamp formats if provided
  if (query.timestamp_start && typeof query.timestamp_start === "string") {
    const date = new Date(query.timestamp_start);
    if (isNaN(date.getTime())) {
      res.status(400).json({
        success: false,
        error:
          'Query parameter "timestamp_start" must be a valid ISO 8601 date string',
      });
      return;
    }
  }

  if (query.timestamp_end && typeof query.timestamp_end === "string") {
    const date = new Date(query.timestamp_end);
    if (isNaN(date.getTime())) {
      res.status(400).json({
        success: false,
        error:
          'Query parameter "timestamp_end" must be a valid ISO 8601 date string',
      });
      return;
    }
  }

  next();
};
