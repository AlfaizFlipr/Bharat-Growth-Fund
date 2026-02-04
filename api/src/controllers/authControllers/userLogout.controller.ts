import { NextFunction, Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';

import models from '../../models';
export default async (req: Request, res: Response, _: NextFunction) => {

  try {

    let token = req.cookies?.userAuth;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    
    if (token) {
      try {
        await models.token.deleteOne({ token });
      } catch (err) {
        console.error('⚠️ Token deletion error:', err);
      }
    }

    
    const isProduction = process.env.NODE_ENV === "production";
    
    const clearOptions: any = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    };

    
    const cookieDomain = process.env.COOKIE_DOMAIN;
    if (isProduction && cookieDomain && cookieDomain.trim() !== '') {
      const cleanDomain = cookieDomain.replace(/^https?:\/\//, '');
      if (cleanDomain && cleanDomain !== '') {
        clearOptions.domain = cleanDomain;
      }
    }

    res.clearCookie('userAuth', clearOptions);

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Logout Success',
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('💥 Logout error:', err);
    
    res.clearCookie('userAuth');
    
    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Logout Success',
      message: 'Logged out successfully',
    });
  }
};

