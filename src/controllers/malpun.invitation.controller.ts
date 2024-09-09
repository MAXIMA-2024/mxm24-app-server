import type { Request, Response } from "express";
import logging from "@/utils/logging";
import db from "@/services/db";
import {
  internalServerError,
  created,
  validationError,
  parseZodError,
  notFound,
  success,
  conflict,
} from "@/utils/responses";

// Random Id
import { nanoid } from "nanoid";

import ENV from "@/utils/env";
import { idSchema } from "@/models/id.model";
import { invitationUpdatableSchema } from "@/models/malpun/external.model";

export const getAllInvitations = async (req: Request, res: Response) => {
  try {
    const invitations = await db.malpunExternal.findMany({
      where: {
        isInvited: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        code: true,
        isInvited: true,
      },
    });

    return success(res, "Successfully get all invitations", invitations);
  } catch (err) {
    logging("ERROR", "Failed to get all invitations", err);
    return internalServerError(res);
  }
};

export const getInvitation = async (req: Request, res: Response) => {
  try {
    const validate = await idSchema.safeParseAsync(req.params.id);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const invitation = await db.malpunExternal.findUnique({
      where: { id: validate.data, isInvited: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        code: true,
        isInvited: true,
      },
    });

    if (!invitation) {
      return notFound(res, "Invitation not found");
    }

    return success(res, "Successfully get invitation", invitation);
  } catch (err) {
    logging("ERROR", "Failed to get invitation", err);
    return internalServerError(res);
  }
};

export const createInvitation = async (req: Request, res: Response) => {
  try {
    const validate = await invitationUpdatableSchema.safeParseAsync(req.body);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    // check for duplicated invitations
    const duplicate = await db.malpunExternal.findFirst({
      where: {
        email: validate.data.email,
        isInvited: true,
      },
    });

    if (duplicate) {
      return conflict(
        res,
        `Invitation for ${validate.data.email} already exists`
      );
    }

    const code = `MXM24-${nanoid(16)}`;
    const invitation = await db.malpunExternal.create({
      data: {
        ...validate.data,
        code,
        transactionId: "INVITATION",
        validatedAt: new Date(),
        isInvited: true,
      },
    });

    // send email
    const resp = await fetch(`${ENV.APP_MQ_URL}/malpun/invitation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: invitation.id,
      }),
    });

    if (resp.status !== 200) {
      logging(
        "LOGS",
        `Failed to send Malpun claim internal email for user id: ${invitation.id}`
      );
    }

    return created(
      res,
      `Successfully created invitation for ${invitation.fullName}`,
      invitation
    );
  } catch (err) {
    logging("ERROR", "Failed to create invitation", err);
    return internalServerError(res);
  }
};

export const deleteInvitation = async (req: Request, res: Response) => {
  try {
    const validate = await idSchema.safeParseAsync(req.params.id);
    if (!validate.success) {
      return validationError(res, parseZodError(validate.error));
    }

    const invitation = await db.malpunExternal.findUnique({
      where: { id: validate.data, isInvited: true },
    });

    if (!invitation) {
      return notFound(res, "Invitation not found");
    }

    await db.malpunExternal.delete({
      where: { id: validate.data },
    });

    return success(res, "Successfully delete invitation", invitation);
  } catch (err) {
    logging("ERROR", "Failed to delete invitation", err);
    return internalServerError(res);
  }
};
