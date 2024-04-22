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
export const togglebyId = async (req: Request, res: Response) => {
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
export const createToggle = async (
  req: Request<{}, {}, Pick<Toggle, "name">>,
  res: Response
) => {
  try {
    const validateToggle = await toggleSchema
      .pick({ name: true })
      .safeParseAsync(req.body);
    if (!validateToggle.success) {
      return validationError(res, parseZodError(validateToggle.error));
    }

    const newToggle = await db.toggle.create({
      data: {
        name: validateToggle.data.name,
        toggle: false,
      },
    });

    const nimUser =
      req.user?.role === "panitia" ? req.user.data.nim : undefined;
    logging(
      "LOGS",
      `User with nim ${nimUser} created a new toggle with id ${newToggle.id} and name ${newToggle.name}`
    );

    return success(res, "Toggle created successfully", newToggle);
  } catch (err) {
    logging("ERROR", "Error trying to create Toggle", err);
    return internalServerError(res);
  }
};

export const toggleToggle = async (req: Request, res: Response) => {
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
      return notFound(res, `Toggle with id ${req.params.id} did not exist`);
    }

    const updatedToggle = await db.toggle.update({
      where: {
        id: validateId.data,
      },
      data: {
        toggle: !toggle.toggle,
      },
    });

    const nimUser =
      req.user?.role === "panitia" ? req.user.data.nim : undefined;
    logging(
      "LOGS",
      `User with nim ${nimUser} switch the toggle with id ${
        updatedToggle.id
      } and name ${updatedToggle.name} to ${!toggle.toggle}`
    );

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
    const validateId = await idSchema.safeParseAsync(req.params.id);
    if (!validateId.success) {
      return validationError(res, parseZodError(validateId.error));
    }
    const toggle = await db.toggle.delete({
      where: {
        id: validateId.data,
      },
    });

    if (!toggle) {
      logging("ERROR", "Toggle not found");
      return notFound(res, `Toggle with id ${req.params.id} did not exist`);
    }

    const nimUser =
      req.user?.role === "panitia" ? req.user.data.nim : undefined;
    logging(
      "LOGS",
      `User with nim ${nimUser} deleted the toggle with id ${toggle.id} and name ${toggle.name}`
    );

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
