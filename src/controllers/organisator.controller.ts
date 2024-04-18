import type { Request, Response } from "express";
import { conflict, created, internalServerError, notFound, parseZodError, success, unauthorized, validationError } from "@/utils/responses";
import db from "@/services/db";

import {
    organisatorUpdatableSchema,
    type OrganisatorUpdatable,
    organisatorIdSchema,
} from "@/models/accounts/organisator.model";


export const getAllOrganisator = async (req: Request, res: Response) => {
    try {
        const organisator = await db.organisator.findMany();
        return success(res, "Berhasil mendapatkan data organisator", organisator);
    } catch (err) {
        return internalServerError(res);
    }
}

export const getOrganisator = async (req: Request, res: Response) => {
    try {
        const validate = await organisatorIdSchema.safeParseAsync(req.params);
        if(!validate.success){
            return validationError(res, parseZodError(validate.error));
        }

        const organisator = await db.organisator.findUnique({
            where: {id: validate.data.id},
        })
        if (!organisator) {
            return notFound(res, `Data organisator dengan id ${validate.data.id} tidak ditemukan`);
        }
        
        return success(res, "Berhasil mendapatkan data organisator", organisator);
    } catch (err) {
        return internalServerError(res);
    }
}


export const updateOrganisator = async (req: Request<{}, {}, OrganisatorUpdatable>, res: Response) => {
    try {
        const validateId = await organisatorIdSchema.safeParseAsync(req.params);
        if (!validateId.success) {
            return validationError(res, parseZodError(validateId.error));
        }

        const validateData = await organisatorUpdatableSchema.partial().safeParseAsync(req.body);
        if (!validateData.success) {
            return validationError(res, parseZodError(validateData.error));
        }

        const isExists = await db.organisator.findFirst({
            where: {id: validateId.data.id},
        })
        if(!isExists){
            return notFound(res, `Data organisator dengan id ${validateId.data.id} tidak ditemukan`);
        }
        const organisator = await db.organisator.update({
            where: {id: validateId.data.id},
            data: validateData.data,
        })

        return success(res, "Berhasil mengupdate data organisator", organisator);
    } catch (err) {
        return internalServerError(res);
    }
}

export const deleteOrganisator = async (req: Request, res: Response) => {
    try {
        const validate = await organisatorIdSchema.safeParseAsync(req.params);
        if(!validate.success){
            return validationError(res, parseZodError(validate.error));
        }

        const isExists = await db.organisator.findFirst({
            where: {id: validate.data.id},
        })
        if(!isExists){
            return notFound(res, `Data organisator dengan id ${validate.data.id} tidak ditemukan`);
        }

        const organisator = await db.organisator.delete({
            where: {id: validate.data.id},
        })
        
        return success(res, `Data organisator dengan id ${validate.data.id} berhasil terhapus`);
    } catch (err) {
        return internalServerError(res);
    }
    
}