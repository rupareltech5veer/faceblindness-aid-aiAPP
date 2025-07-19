import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  private static readonly FIRST_LAUNCH_KEY = 'hasLaunchedBefore';
  private static readonly ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';

  static async isFirstLaunch(): Promise<boolean> {
    try {
      const hasLaunched = await AsyncStorage.getItem(this.FIRST_LAUNCH_KEY);
      return hasLaunched === null;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return true;
    }
  }

  static async setFirstLaunchComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.FIRST_LAUNCH_KEY, 'true');
    } catch (error) {
      console.error('Error setting first launch complete:', error);
    }
  }

  static async isOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(this.ONBOARDING_COMPLETED_KEY);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  static async setOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ONBOARDING_COMPLETED_KEY, 'true');
    } catch (error) {
      console.error('Error setting onboarding completed:', error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.FIRST_LAUNCH_KEY,
        this.ONBOARDING_COMPLETED_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}