import { RequestHandler, Router } from "express";
import { exerciseRepository } from "./Repository.js";
import { formatResponse } from "../../lib/utils/response.js";
import { jwt } from "../../lib/middlewares.js";
import { z } from "zod";
import { ForbiddenError, LexoError, ValidationError } from "../../exceptions/LexoError.js";
import { User } from "../user/Entity.js";
import orm from "../../db/orm.js";
import { ExerciseDifficulty } from "./Entity.js";

const exerciseController = Router();

// Import Zod schemas from ZodSchema.ts
import { 
  ExerciseAnswerSchema, 
  FilterQuerySchema, 
  CreateExerciseSchema,
  UpdateExerciseSchema 
} from './ZodSchema.js';

// Define parameter schema
const ExerciseParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid exercise ID format" })
});

// Get all exercises with optional filtering
const getAllExercises: RequestHandler = async (req, res) => {
  try {
    // Validate and parse query parameters
    const validation = FilterQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return formatResponse(res, {
        status: 400,
        messages: validation.error.issues.map((issue) => ({ 
          type: "error", 
          message: issue.message 
        })),
      });
    }

    const filters = validation.data;
    const { exercises, total } = await exerciseRepository.findAll(filters);
    
    return formatResponse(res, { 
      status: 200, 
      data: { exercises, total, filters } 
    });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { 
      fallBackErrorMsg: 'An error occurred while fetching exercises' 
    });
  }
};

// Get a specific exercise by ID
const getExerciseById: RequestHandler = async (req, res) => {
  try {
    const validation = ExerciseParamsSchema.safeParse(req.params);
    if (!validation.success) {
      return formatResponse(res, {
        status: 400,
        messages: validation.error.issues.map((issue) => ({ 
          type: "error", 
          message: issue.message 
        })),
      });
    }

    const { id } = validation.data;
    const exercise = await exerciseRepository.findById(id);
    
    return formatResponse(res, { status: 200, data: exercise });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { 
      fallBackErrorMsg: 'An error occurred while fetching the exercise' 
    });
  }
};

// Get all exercises created by the authenticated user
const getMyExercises: RequestHandler = async (req, res) => {
  const userId = req.auth!.id;
  
  try {
    const exercises = await exerciseRepository.findByUserId(userId);
    return formatResponse(res, { status: 200, data: exercises });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { 
      fallBackErrorMsg: 'An error occurred while fetching your exercises' 
    });
  }
};

// Create a new exercise
const createExercise: RequestHandler = async (req, res) => {
  const userId = req.auth!.id;
  
  try {
    // Validate the request body against our schema
    const validation = CreateExerciseSchema.safeParse(req.body);
    if (!validation.success) {
      return formatResponse(res, {
        status: 400,
        messages: validation.error.issues.map((issue) => ({ 
          type: "error", 
          message: issue.message 
        })),
      });
    }
    
    // Body is now validated and typed correctly
    const exercise = await exerciseRepository.create(validation.data, userId);
    
    return formatResponse(res, {
      status: 201,
      data: exercise,
      messages: [{ type: "success", message: "Exercise created successfully" }]
    });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { 
      fallBackErrorMsg: 'An error occurred while creating the exercise' 
    });
  }
};

// Update an existing exercise
const updateExercise: RequestHandler = async (req, res) => {
  const userId = req.auth!.id;
  
  try {
    // Validate the route parameters
    const paramsValidation = ExerciseParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return formatResponse(res, {
        status: 400,
        messages: paramsValidation.error.issues.map((issue) => ({ 
          type: "error", 
          message: issue.message 
        })),
      });
    }

    const { id } = paramsValidation.data;
    
    // Check if user is allowed to update this exercise
    const exercise = await exerciseRepository.findById(id);
    if (exercise.user?.id !== userId) {
      // Check if user is admin
      const admin = await orm.getEmFork().findOne(User, { id: userId, isAdmin: true });
      if (!admin) {
        return ForbiddenError.sendFormatedResponse(res);
      }
    }
    
    // Validate the request body
    const bodyValidation = UpdateExerciseSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return formatResponse(res, {
        status: 400,
        messages: bodyValidation.error.issues.map((issue) => ({ 
          type: "error", 
          message: issue.message 
        })),
      });
    }
    
    const updatedExercise = await exerciseRepository.update(id, bodyValidation.data);
    return formatResponse(res, {
      status: 200, 
      data: updatedExercise,
      messages: [{ type: "success", message: "Exercise updated successfully" }]
    });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { 
      fallBackErrorMsg: 'An error occurred while updating the exercise' 
    });
  }
};

// Delete an exercise
const deleteExercise: RequestHandler = async (req, res) => {
  const userId = req.auth!.id;
  
  try {
    const validation = ExerciseParamsSchema.safeParse(req.params);
    if (!validation.success) {
      return formatResponse(res, {
        status: 400,
        messages: validation.error.issues.map((issue) => ({ 
          type: "error", 
          message: issue.message 
        })),
      });
    }

    const { id } = validation.data;
    
    // Check if user is allowed to delete this exercise
    const exercise = await exerciseRepository.findById(id);
    if (exercise.user?.id !== userId) {
      // Check if user is admin
      const admin = await orm.getEmFork().findOne(User, { id: userId, isAdmin: true });
      if (!admin) {
        return ForbiddenError.sendFormatedResponse(res);
      }
    }
    
    await exerciseRepository.delete(id);
    return formatResponse(res, {
      status: 200, 
      messages: [{ type: "success", message: "Exercise deleted successfully" }]
    });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { 
      fallBackErrorMsg: 'An error occurred while deleting the exercise' 
    });
  }
};

// Validate an exercise answer
const validateAnswer: RequestHandler = async (req, res) => {
  try {
    const validation = ExerciseAnswerSchema.safeParse(req.body);
    if (!validation.success) {
      return formatResponse(res, {
        status: 400,
        messages: validation.error.issues.map((issue) => ({ 
          type: "error", 
          message: issue.message 
        })),
      });
    }
    
    const result = await exerciseRepository.validateAnswer(validation.data);
    return formatResponse(res, { status: 200, data: result });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { 
      fallBackErrorMsg: 'An error occurred while validating the answer' 
    });
  }
};

// Public routes
exerciseController.get("/", getAllExercises);
exerciseController.get("/:id", getExerciseById);
exerciseController.post("/validate", validateAnswer);

// Protected routes
exerciseController.get("/my/all", jwt, getMyExercises);
exerciseController.post("/", jwt, createExercise);
exerciseController.patch("/:id", jwt, updateExercise);
exerciseController.delete("/:id", jwt, deleteExercise);

export default exerciseController;
