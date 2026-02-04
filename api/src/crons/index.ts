import { initDailyIncome, initMonthlyReset } from './dailyIncome';

export const cronInit = () => {
  console.log('🚀 Initializing cron jobs...');

  initDailyIncome();
  initMonthlyReset();


  console.log('✅ All cron jobs initialized successfully');
};