import type { Request, Response } from "express";
import { conflict, created, internalServerError, notFound, parseZodError, success, validationError } from "@/utils/responses";
import db from "@/services/db";
import { 
    panitiaIdSchema,
    panitiaUpdatableSchema,
    type PanitiaUpdatable, 
} from "@/models/accounts/panitia.model";

export const getAllPanitia = async (req: Request, res: Response) => {
    try {
        const panitia = await db.panitia.findMany();
        return success(res, "Berhasil mendapatkan data panitia", panitia);
    } catch (err) {
        return internalServerError(res);
    }
}

export const getPanitia = async (req: Request, res: Response) => {
    try {
        const validate = await panitiaIdSchema.safeParseAsync(req.params);
        if(!validate.success){
            return validationError(res, parseZodError(validate.error));
        }

        const panitia = await db.panitia.findUnique({
            where: {id: validate.data.id},
        })
        if (!panitia) {
            return notFound(res, `Data panitia dengan id ${validate.data.id} tidak ditemukan`);
        }
        return success(res, "Berhasil mendapatkan data panitia", panitia);
    } catch (err) {
        return internalServerError(res);
    }
}


export const updatePanitia = async (req: Request<{}, {}, PanitiaUpdatable>, res: Response) => {
    try {
        const validateId = await panitiaIdSchema.safeParseAsync(req.params);
        if (!validateId.success) {
            return validationError(res, parseZodError(validateId.error));
        }

        const validateData = await panitiaUpdatableSchema.partial().safeParseAsync(req.body);
        if (!validateData.success) {
            return validationError(res, parseZodError(validateData.error));
        }

        const isExists = await db.panitia.findFirst({
            where: {id: validateId.data.id},
        })
        if(!isExists){
            return notFound(res, `Data panitia dengan id ${validateId.data.id} tidak ditemukan`);
        }
        const panitia = await db.panitia.update({
            where: {id: validateId.data.id},
            data: validateData.data,
        })

        return success(res, "Berhasil mengupdate data panitia", panitia);
    } catch (err) {
        return internalServerError(res);
    }
}

export const deletePanitia = async (req: Request, res: Response) => {
    try {
        const validate = await panitiaIdSchema.safeParseAsync(req.params);
        if(!validate.success){
            return validationError(res, parseZodError(validate.error));
        }

        const isExists = await db.panitia.findFirst({
            where: {id: validate.data.id},
        })
        if(!isExists){
            return notFound(res, `Data panitia dengan id ${validate.data.id} tidak ditemukan`);
        }

        const panitia = await db.panitia.delete({
            where: {id: validate.data.id},
        })
        
        return success(res, `Data panitia dengan id ${validate.data.id} berhasil terhapus`);
    } catch (err) {
        return internalServerError(res);
    }
    
}

export const enumDivisiPanitia = async (req: Request, res: Response) => {
    try {
        const divisi = await db.divisiPanitia.findMany();
        return success(res, "Berhasil mendapatkan data divisi panitia", divisi);
    } catch (err) {
        return internalServerError(res);
    }
}