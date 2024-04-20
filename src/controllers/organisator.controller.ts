import type { Request, Response } from "express";
import { conflict, created, internalServerError, notFound, parseZodError, success, unauthorized, validationError } from "@/utils/responses";
import db from "@/services/db";

import {
    organisatorUpdatableSchema,
    type OrganisatorUpdatable,
} from "@/models/accounts/organisator.model";
import logging from "@/utils/logging";
import { idSchema, type Id } from "@/models/id.model";

export const getAllOrganisator = async (req: Request, res: Response) => {
    try {
        const organisator = await db.organisator.findMany({
            include: {state: {
                select: {id: true, name: true}
            }}
        });
        return success(res, "Berhasil mendapatkan data organisator", organisator);
    } catch (err) {
        logging("ERROR", "Error when trying to get all organisator data", err);
        return internalServerError(res);
    }
}

export const getOrganisator = async (req: Request, res: Response) => {
    try {
        const validate = await idSchema.safeParseAsync(req.params.id);
        if(!validate.success){
            return validationError(res, parseZodError(validate.error));
        }

        const organisator = await db.organisator.findUnique({
            where: {id: validate.data},
            include: {state: {
                select: {id: true, name: true}
            }}
        })
        if (!organisator) {
            return notFound(res, `Data organisator dengan id ${validate.data} tidak ditemukan`);
        }
        
        return success(res, "Berhasil mendapatkan data organisator", organisator);
    } catch (err) {
        logging("ERROR", "Error when trying to get organisator data", err);
        return internalServerError(res);
    }
}


export const updateOrganisator = async (req: Request<{id:Id}, {}, OrganisatorUpdatable>, res: Response) => {
    try {
        const validateId = await idSchema.safeParseAsync(req.params.id);
        if (!validateId.success) {
            return validationError(res, parseZodError(validateId.error));
        }

        const validateData = await organisatorUpdatableSchema.partial().safeParseAsync(req.body);
        if (!validateData.success) {
            return validationError(res, parseZodError(validateData.error));
        }

        const isExists = await db.organisator.findFirst({
            where: {id: validateId.data},
        })
        if(!isExists){
            return notFound(res, `Data organisator dengan id ${validateId.data} tidak ditemukan`);
        }
        const organisator = await db.organisator.update({
            where: {id: validateId.data},
            data: validateData.data,
        })
        if (req.user?.role === "panitia") {
            logging("LOGS", `Panitia dengan NIM ${req.user.data.nim} mengupdate data organisator dengan NIM ${organisator.nim}`, organisator)
        }
        return success(res, "Berhasil mengupdate data organisator", organisator);
    } catch (err) {
        logging("ERROR", "Error when trying to update organisator data", err);
        return internalServerError(res);
    }
}

export const deleteOrganisator = async (req: Request, res: Response) => {
    try {
        const validate = await idSchema.safeParseAsync(req.params);
        if(!validate.success){
            return validationError(res, parseZodError(validate.error));
        }

        const isExists = await db.organisator.findFirst({
            where: {id: validate.data},
        })
        if(!isExists){
            return notFound(res, `Data organisator dengan id ${validate.data} tidak ditemukan`);
        }

        const organisator = await db.organisator.delete({
            where: {id: validate.data},
        })
        if (req.user?.role === "panitia") {
            logging("LOGS", `Panitia dengan NIM ${req.user.data.nim} menghapus data organisator dengan NIM ${organisator.nim}`, organisator)
        }
        return success(res, `Data organisator dengan id ${validate.data} berhasil terhapus`);
    } catch (err) {
        logging("ERROR", "Error when trying to delete organisator data", err);
        return internalServerError(res);
    }
    
}