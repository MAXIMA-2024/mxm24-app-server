import type { Request, Response } from "express";
import logging from "@/utils/logging";
import db from "@/services/db";
import {
  internalServerError,
  success,
  notFound,
  validationError,
  parseZodError,
} from "@/utils/responses";
import { idSchema, type Id } from "@/models/id.model";
import { toggleSchema, type Toggle } from "@/models/toggle.model";
import { idToggleSchema, type idToggle } from "@/models/toggle.model";

// get all toggles
export const allToggles = async (req: Request, res: Response) => {
  try {
    const toggles = await db.toggle.findMany();
    return success(res, "Toggles fetched successfully", toggles);
  } catch (err) {
    logging("ERROR", "Error trying to fetch all Toggles", err);
    return internalServerError(res);
  }
};

// get toggles by id
export const togglebyId = async (req: Request<{ id: Id }>, res: Response) => {
  try {
    const validateId = await idSchema.safeParseAsync(req.params.id);
    if (!validateId.success) {
      return validationError(res, parseZodError(validateId.error));
    }
    const toggle = await db.toggle.findUnique({
      where: {
        id: validateId.data,
      },
    });

    if (!toggle) {
      logging("ERROR", "Toggle not found");
      return notFound(res, `Toggle with id ${validateId.data} did not exist`);
    }

    return success(
      res,
      `Toggle with id ${validateId.data} fetched successfully`,
      toggle
    );
  } catch (err) {
    logging(
      "ERROR",
      `Error trying to fetch Toggle with id ${req.params.id}`,
      err
    );
    return internalServerError(res);
  }
};

//create toggle
export const createToggle = async (req: Request, res: Response) => {
  try {
    const validateToggle = await toggleSchema.safeParseAsync(req.body);
    if (!validateToggle.success) {
      return validationError(res, parseZodError(validateToggle.error));
    }
    const { name } = req.body;
    const newToggle = await db.toggle.create({
      data: {
        name,
        toggle: false,
      },
    });
    return success(res, "Toggle created successfully", newToggle);
  } catch (err) {
    logging("ERROR", "Error trying to create Toggle", err);
    return internalServerError(res);
  }
};

export const toggleToggle = async (req: Request, res: Response) => {
  try {
    const validateId = await idToggleSchema.safeParseAsync(req.params);
    if (!validateId.success) {
      return validationError(res, parseZodError(validateId.error));
    }

    const toggle = await db.toggle.findUnique({
      where: {
        id: validateId.data.id,
      },
    });

    if (!toggle) {
      logging("ERROR", "Toggle not found");
      return notFound(res, `Toggle with id ${req.params.id} did not exist`);
    }

    const updatedToggle = await db.toggle.update({
      where: {
        id: validateId.data.id,
      },
      data: {
        toggle: !toggle.toggle,
      },
    });

    return success(
      res,
      `Toggle with id ${
        req.params.id
      } updated successfully, toggle is now ${!toggle.toggle}`,
      updatedToggle
    );
  } catch (err) {
    logging("ERROR", `Error trying to toggle Toggle ${req.params}`, err);
    return internalServerError(res);
  }
};

//delete toggle
export const deleteToggle = async (req: Request, res: Response) => {
  try {
    const validateId = await idToggleSchema.safeParseAsync(req.params);
    if (!validateId.success) {
      return validationError(res, parseZodError(validateId.error));
    }
    const toggle = await db.toggle.delete({
      where: {
        id: validateId.data.id,
      },
    });

    if (!toggle) {
      logging("ERROR", "Toggle not found");
      return notFound(res, `Toggle with id ${req.params.id} did not exist`);
    }

    return success(
      res,
      `Toggle with id ${req.params.id} deleted successfully`,
      toggle
    );
  } catch (err) {
    logging(
      "ERROR",
      `Error trying to fetch Toggle with id ${req.params.id}`,
      err
    );
    return internalServerError(res);
  }
};
