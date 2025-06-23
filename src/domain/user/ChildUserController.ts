import { RequestHandler, Router } from "express";
import { formatResponse } from "../../lib/utils/response.js";
import { jwt } from "../../lib/middlewares.js";
import { z } from "zod";
import { CreateUserChildSchema, UpdateUserChildSchema } from "./ZodSchema.js";
import { ForbiddenError, LexoError, ValidationError } from "../../exceptions/LexoError.js";
import { User } from "./Entity.js";
import orm from "../../db/orm.js";
import { userChildRepository } from "./ChildUserRepository.js";

const userChildController = Router();

const hasAccessToChild = async (childId: string, userId: string, requiresAdmin: boolean = false) => {
  const em = orm.getEmFork();
  
  if (requiresAdmin) {
    const isAdmin = await em.findOne(User, { id: userId, isAdmin: true });
    if (isAdmin) return true;
  }
  
  const child = await em.findOne(User, { children: { id: childId } });
  return child?.id === userId;
};

const getAll: RequestHandler = async (req, res) => {
  const userId = req.auth!.id;
  
  try {
    const children = await userChildRepository.findByParentId(userId);
    return formatResponse(res, { 
      status: 200, 
      data: children 
    });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { 
      fallBackErrorMsg: 'An error occurred while fetching children' 
    });
  }
};

const getOneById: RequestHandler = async (req, res) => {
  const userId = req.auth!.id;
  const reqParams = z.object({ id: z.string() }).safeParse(req.params);
  
  if (!reqParams.success) {
    return ValidationError.sendFormatedResponse(res, reqParams.error, {
      fallBackErrorMsg: 'Invalid request parameters'
    });
  }

  try {
    const childId = reqParams.data.id;
    const hasAccess = await hasAccessToChild(childId, userId, true);
    if (!hasAccess) {
      return ForbiddenError.sendFormatedResponse(res);
    }
    
    const child = await userChildRepository.findOne(childId);
    return formatResponse(res, { 
      status: 200, 
      data: child 
    });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { 
      fallBackErrorMsg: 'An error occurred while fetching child' 
    });
  }
};

const createOne: RequestHandler = async (req, res) => {
  const userId = req.auth!.id;
  const validation = CreateUserChildSchema.safeParse(req.body);
  
  if (!validation.success) {
    return formatResponse(res, {
      status: 400,
      messages: validation.error.issues.map((issue) => ({ 
        type: "error", 
        message: issue.message 
      })),
    });
  }

  try {
    const child = await userChildRepository.create(userId, validation.data);
    return formatResponse(res, { 
      status: 201, 
      data: child,
      messages: [{ type: "success", message: "Child created successfully" }]
    });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { 
      fallBackErrorMsg: 'An error occurred while creating child' 
    });
  }
};

const updateOne: RequestHandler = async (req, res) => {
  const userId = req.auth!.id;
  const reqParams = z.object({ id: z.string() }).safeParse(req.params);
  
  if (!reqParams.success) {
    return ValidationError.sendFormatedResponse(res, reqParams.error, {
      fallBackErrorMsg: 'Invalid request parameters'
    });
  }
  
  const validation = UpdateUserChildSchema.safeParse(req.body);
  if (!validation.success) {
    return formatResponse(res, {
      status: 400,
      messages: validation.error.issues.map((issue) => ({ 
        type: "error", 
        message: issue.message 
      })),
    });
  }

  try {
    const childId = reqParams.data.id;
    const hasAccess = await hasAccessToChild(childId, userId, true);
    if (!hasAccess) {
      return ForbiddenError.sendFormatedResponse(res);
    }
    
    const updatedChild = await userChildRepository.update(childId, validation.data);
    return formatResponse(res, { 
      status: 200, 
      data: updatedChild,
      messages: [{ type: "success", message: "Child updated successfully" }]
    });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { 
      fallBackErrorMsg: 'An error occurred while updating child' 
    });
  }
};

const deleteOne: RequestHandler = async (req, res) => {
  const userId = req.auth!.id;
  const reqParams = z.object({ id: z.string() }).safeParse(req.params);
  
  if (!reqParams.success) {
    return ValidationError.sendFormatedResponse(res, reqParams.error, {
      fallBackErrorMsg: 'Invalid request parameters'
    });
  }

  try {
    const childId = reqParams.data.id;
    const hasAccess = await hasAccessToChild(childId, userId, true);
    if (!hasAccess) {
      return ForbiddenError.sendFormatedResponse(res);
    }
    
    await userChildRepository.delete(childId);
    return formatResponse(res, { 
      status: 200, 
      messages: [{ type: "success", message: "Child deleted successfully" }]
    });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { 
      fallBackErrorMsg: 'An error occurred while deleting child' 
    });
  }
};

userChildController.get("/", jwt, getAll);
userChildController.get("/:id", jwt, getOneById);
userChildController.post("/", jwt, createOne);
userChildController.patch("/:id", jwt, updateOne);
userChildController.delete("/:id", jwt, deleteOne);

export default userChildController;
