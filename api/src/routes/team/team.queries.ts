import { Router } from 'express';
import teamController from '../../controllers/teamControllers/team.controller';
import { commonsMiddleware } from '../../middleware';

export default (router: Router) => {
    router.get('/team/stats', commonsMiddleware.checkUserAuth, teamController.getTeamStats);
    router.get('/team/referral-link', commonsMiddleware.checkUserAuth, teamController.getReferralLink);
    router.get('/team/referrals', commonsMiddleware.checkUserAuth, teamController.getUserTeamReferrals);
    router.get('/team/history', commonsMiddleware.checkUserAuth, teamController.getTeamReferralHistory);

    // Admin Routes
    router.get('/admin/team-referrals', commonsMiddleware.checkAdminAuth, teamController.getAllTeamReferrals);
    router.get('/admin/team-statistics', commonsMiddleware.checkAdminAuth, teamController.getTeamStatistics);
};
