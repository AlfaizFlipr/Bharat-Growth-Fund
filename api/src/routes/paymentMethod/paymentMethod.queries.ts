import { Router } from "express";
import { commonsMiddleware } from "../../middleware";
import paymentMethodController from "../../controllers/paymentMethodControllers/paymentMethod.controller";
import { handleMulterError, uploadQRCode } from "../../middleware/upload.middleware";

const {
  createPaymentMethod,
  getAllPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
} = paymentMethodController;

export default (router: Router) => {

  router.get(
    "/admin/payment-methods",
    commonsMiddleware.checkAdminAuth,
    getAllPaymentMethods
  );

  router.post(
    "/admin/payment-methods",
    commonsMiddleware.checkAdminAuth,
    uploadQRCode,
    handleMulterError,
    createPaymentMethod
  );

  router.put(
    "/admin/payment-methods/:methodId",
    commonsMiddleware.checkAdminAuth,
    uploadQRCode,
    handleMulterError,
    updatePaymentMethod
  );

  router.delete(
    "/admin/payment-methods/:methodId",
    commonsMiddleware.checkAdminAuth,
    deletePaymentMethod
  );

  return router;
};