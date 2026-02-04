import { Router } from 'express';
import levelController from '../../controllers/levelControllers/level.controller';
import { commonsMiddleware } from '../../middleware';

export default (router: Router) => {
  router.get('/get',commonsMiddleware.checkUserAuth, levelController.getAllLevels);
  router.get('/name/:levelName',commonsMiddleware.checkUserAuth, levelController.getLevelByName);
  router.get('/number/:levelNumber',commonsMiddleware.checkUserAuth, levelController.getLevelByNumber);

  router.post('/upgrade', commonsMiddleware.checkUserAuth, levelController.upgradeUserLevel);

  router.put('/update/:levelId', commonsMiddleware.checkUserAuth, levelController.updateLevel);


  router.get(
    '/admin/levels',
    commonsMiddleware.checkAdminAuth,
    levelController.getAllLevelsAdmin
  );

  
  router.post(
    '/admin/levels',
    commonsMiddleware.checkAdminAuth,
    levelController.createLevel
  );
  
  
  router.put(
    '/admin/levels/:levelId',
    commonsMiddleware.checkAdminAuth,
    levelController.updateLevel
  );

  
  router.delete(
    '/admin/levels/:levelId',
    commonsMiddleware.checkAdminAuth,
    levelController.deleteLevel
  );


  return router;
};
