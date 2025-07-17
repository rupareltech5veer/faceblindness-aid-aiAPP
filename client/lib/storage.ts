export class StorageService {
  static async setOnboardingCompleted(): Promise<void> {
    await StorageService.save('onboardingCompleted', 'true');
  }
  static async save(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else {
      // Replace with AsyncStorage if using React Native
    }
  }

  static async get(key: string): Promise<string | null> {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    } else {
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    } else {
      // AsyncStorage.removeItem
    }
  }

  static async isFirstLaunch(): Promise<boolean> {
    const alreadyLaunched = await this.get('alreadyLaunched');
    if (alreadyLaunched === null) {
      await this.save('alreadyLaunched', 'true');
      return true; // First launch
    }
    return false; // Not first launch
  }

  static async setFirstLaunchComplete(): Promise<void> {
    await this.save('alreadyLaunched', 'true');
  }
}
