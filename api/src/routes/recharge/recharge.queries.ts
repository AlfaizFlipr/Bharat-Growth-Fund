import { Router } from "express";
import { commonsMiddleware } from "../../middleware";
import rechargeController from "../../controllers/rechargeControllers/recharge.controller";
import { handleMulterError, paymentProofUpload } from "../../middleware/upload.middleware";

export default (router: Router) => {
  
  router.get(
    "/wallet-info",
    commonsMiddleware.checkUserAuth,
    rechargeController.getWalletInfo
  );

  
  router.get(
    "/payment-methods",
    commonsMiddleware.checkUserAuth,
    rechargeController.getPaymentMethods
  );

  
  router.post(
    "/create-order",
    commonsMiddleware.checkUserAuth,
    rechargeController.createRechargeOrder
  );

   router.post(
    "/generate-qr",
    commonsMiddleware.checkUserAuth,
    rechargeController.generateUPIQRCode
  );

  
  router.post(
    "/verify-payment",
    commonsMiddleware.checkUserAuth,
    paymentProofUpload.single("paymentProof"),
    handleMulterError,
    rechargeController.verifyRechargePayment
  );

  
  router.get(
    "/history",
    commonsMiddleware.checkUserAuth,
    rechargeController.getRechargeHistory
  );

  
  
  

  router.get(
    "/admin/recharges",
    commonsMiddleware.checkAdminAuth,
    rechargeController.getAllRecharges
  );

  router.get(
    "/admin/recharges/statistics",
    commonsMiddleware.checkAdminAuth,
    rechargeController.getRechargeStatistics
  );

  router.patch(
    "/admin/recharges/approve/:orderId",
    commonsMiddleware.checkAdminAuth,
    rechargeController.approveRecharge
  );

  router.patch(
    "/admin/recharges/reject/:orderId",
    commonsMiddleware.checkAdminAuth,
    rechargeController.rejectRecharge
  );

  return router;
};
