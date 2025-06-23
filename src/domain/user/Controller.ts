import { Request, RequestHandler, Response, Router } from "express";
import { userRepository } from "./Repository.js";
import { formatResponse, ServerCode } from "../../lib/utils/response.js";
import { jwt } from "../../lib/middlewares.js";
import { z } from "zod";
import { omit } from "../../lib/utils/index.js";
import { CreateAdminUserSchema, CreateUserGoogleSchema, CreateUserSchema, UpdateUserSchema, UserLoginSchema } from "./ZodSchema.js";
import { ForbiddenError, LexoError, ValidationError } from "../../exceptions/LexoError.js";
import { User } from "./Entity.js";
import orm from "../../db/orm.js";

const userController = Router();

const getOneById: RequestHandler = async (req, res) => {
  const reqUserId = req.auth!.id;

  try {
    const user = await userRepository.findById(reqUserId);
    if (!user) {
      return formatResponse(res, { status: 404, messages: [{ type: "error", message: "User not found" }] });
    }

    return formatResponse(res, { status: 200, data: user });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { fallBackErrorMsg: 'An error occured while fetching user' });
  }
};

const getAll: RequestHandler = async (req, res) => {
  const reqUserId = req.auth!.id;
  try {
    const admin = await orm.getEmFork().findOne(User, { id: reqUserId, isAdmin: true });
    if (!admin) {
      return ForbiddenError.sendFormatedResponse(res);
    }

    const users = await userRepository.findAll();
    return formatResponse(res, { status: 200, data: users });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { fallBackErrorMsg: 'An error occured while fetching users' });
  }
};

const createOne: RequestHandler = async (req, res) => {
  const isGoogleSignup = req.path.includes("/google");
  const isAdminCreation = req.path.includes("/admin");
  const validation = isGoogleSignup
    ? CreateUserGoogleSchema.safeParse(req.body)
    : isAdminCreation
      ? CreateAdminUserSchema.safeParse(req.body)
      : CreateUserSchema.safeParse(req.body);

  if (!validation.success) {
    return formatResponse(res, {
      status: 400,
      messages: validation.error.issues.map((issue) => ({ type: "error", message: issue.message })),
    });
  }

  try {
    if (isGoogleSignup && "googleId" in validation.data && validation.data.googleId) {
      const user = await userRepository.findByGoogleId(validation.data.googleId).catch(() => null);
      if (user) return formatResponse(res, { status: 200, data: user, jwt: user.generateToken() });
    } else {
      const user = await userRepository.findByEmailForLogin(validation.data.email).catch(() => null);
      if (user?.googleId) {
        return formatResponse(res, { status: 400, code: ServerCode.GOOGLE_USER_WITH_EMAIL_ALREADY_EXISTS });
      }
    }

    const { data, jwt } = await userRepository.create(validation.data);
    return formatResponse(res, { status: 200, data, jwt });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { fallBackErrorMsg: 'An error occured while creating user' });
  }
};

const updateOne: RequestHandler = async (req, res) => {
  const reqUserId = req.auth!.id;
  const { id } = req.params;
  const reqParams = z.object({ id: z.string().optional() }).safeParse(req.params);
  if (!reqParams.success) {
    return ValidationError.sendFormatedResponse(res, reqParams.error, { fallBackErrorMsg: 'Invalid request parameters' });
  }

  const validation = UpdateUserSchema.safeParse(req.body);
  if (!validation.success) {
    return formatResponse(res, {
      status: 400,
      messages: validation.error.issues.map((issue) => ({ type: "error", message: issue.message })),
    });
  };

  try {
    const admin = await orm.getEmFork().findOne(User, { id: reqUserId, isAdmin: true });
    if (!admin && reqParams.data.id && reqParams.data.id !== reqUserId) {
      return ForbiddenError.sendFormatedResponse(res);
    }
    const { data, messages, jwt } = await userRepository.update(id, validation.data);
    return formatResponse(res, { status: 200, data, messages, jwt });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { fallBackErrorMsg: 'An error occured while updating user' });
  }
};

const login: RequestHandler = async (req, res) => {
  const validation = UserLoginSchema.safeParse(req.body);
  if (!validation.success) {
    return formatResponse(res, {
      status: 400,
      messages: validation.error.issues.map((issue) => ({ type: "error", message: issue.message })),
    });
  }

  try {
    const user = await userRepository.findByEmailForLogin(validation.data.email);
    if (!user) {
      return formatResponse(res, {
        status: 404,
        messages: [{ type: "error", message: "Utilisateur non trouvé" }],
      });
    }

    console.debug("user", user);
    if (!user.verifyPassword(validation.data.password)) {
      return formatResponse(res, {
        status: 401,
        messages: [{ type: "error", message: "Mot de passe incorrect" }],
      });
    }

    return formatResponse(res, {
      status: 200,
      data: omit(user, ["password", "salt"]),
      jwt: user.generateToken(),
    });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { fallBackErrorMsg: 'An error occured while logging in' });
  }
};

const deleteOne: RequestHandler = async (req, res) => {
  const reqUserId = req.auth!.id;
  const reqParams = z.object({ id: z.string().optional() }).safeParse(req.params);
  if (!reqParams.success) {
    return ValidationError.sendFormatedResponse(res, reqParams.error, { fallBackErrorMsg: 'Invalid request parameters' });
  }

  try {
    const admin = await orm.getEmFork().findOne(User, { id: reqUserId, isAdmin: true });
    if (!admin && reqParams.data.id && reqParams.data.id !== reqUserId) {
      return formatResponse(res, {
        status: 403,
        messages: [{ type: "error", message: "You are not authorized to delete this user" }],
      });
    }

    await userRepository.delete(reqParams.data.id || reqUserId);
    return formatResponse(res, { status: 200, messages: [{ type: "success", message: "User deleted successfully" }] });
  } catch (error) {
    LexoError.sendFormatedResponse(res, error, { fallBackErrorMsg: 'An error occured while deleting user' });
  }
};



userController.post("/", createOne);
userController.post("/google", createOne);
userController.post("/admin", createOne);
userController.patch("/:id", jwt, updateOne);
userController.get("/:id", jwt, getOneById);
userController.post("/login", login);
userController.get("/", jwt, getAll);
userController.delete("/", jwt, deleteOne);
userController.delete("/:id", jwt, deleteOne);

export default userController;