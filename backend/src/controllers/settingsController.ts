import { Request, Response, NextFunction } from 'express';
import { Settings } from '../models/Settings.js';
import { ENV } from '../config/env.js';

export async function getSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        companyName: ENV.COMPANY_NAME || 'FLEXIO',
        companyLogoUrl: ENV.COMPANY_LOGO_URL || '/flexio-logo.png',
        presentedBy: 'Alpha Team',
        motivationalMessage: 'EXCELLENCE DESERVES RECOGNITION',
        carouselIntervalSeconds: 5,
        dataRefreshIntervalSeconds: 60,
        teamLeaderSlideDurationSeconds: 5,
      });
    }
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      companyName,
      companyLogoUrl,
      presentedBy,
      motivationalMessage,
      carouselIntervalSeconds,
      dataRefreshIntervalSeconds,
      teamLeaderSlideDurationSeconds,
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (companyName !== undefined) settings.companyName = companyName.trim();
    if (companyLogoUrl !== undefined) settings.companyLogoUrl = companyLogoUrl.trim();
    if (presentedBy !== undefined) settings.presentedBy = presentedBy.trim();
    if (motivationalMessage !== undefined) settings.motivationalMessage = motivationalMessage.trim();
    if (carouselIntervalSeconds !== undefined) settings.carouselIntervalSeconds = Math.max(3, Number(carouselIntervalSeconds));
    if (dataRefreshIntervalSeconds !== undefined) settings.dataRefreshIntervalSeconds = Math.max(10, Number(dataRefreshIntervalSeconds));
    if (teamLeaderSlideDurationSeconds !== undefined) {
      settings.teamLeaderSlideDurationSeconds = Math.max(3, Math.min(60, Number(teamLeaderSlideDurationSeconds)));
    }

    await settings.save();

    res.json({
      success: true,
      message: 'System and TV display settings updated successfully.',
      settings,
    });
  } catch (err) {
    next(err);
  }
}
