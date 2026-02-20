import { FileStorageStrategy } from "./FileStorageStrategy";

enum CustomEnvKeys {
  USER = 'USER',
  PW = 'PW',
  OTP_SEED_B32 = 'OTP_SEED_B32',
}

export interface SharedCredentialStorageStrategy {
  init(): void;
  create(prefix: string, value: string, index?: string | number): void;
  read(prefix: string, index?: string | number): string | undefined;
}

/**
 * Utility class to access credentials that are shared across multiple test workers.
 */
export class SharedCredentialManager {
  private static store: SharedCredentialStorageStrategy = new FileStorageStrategy();
  /**
   * This must be called during global setup. Otherwise credentials will not persist across workers.
   */
  static init(): void {
    SharedCredentialManager.store.init();
  }

  static getUsername(workerParallelIndex?: string | number): string | undefined {
    return SharedCredentialManager.read(CustomEnvKeys.USER, workerParallelIndex);
  }

  static setUsername(value: string, workerParallelIndex?: string | number): void {
    SharedCredentialManager.create(CustomEnvKeys.USER, value, workerParallelIndex);
  }

  static getPassword(workerParallelIndex?: string | number): string | undefined {
    return SharedCredentialManager.read(CustomEnvKeys.PW, workerParallelIndex);
  }

  static setPassword(value: string, workerParallelIndex?: string | number): void {
    SharedCredentialManager.create(CustomEnvKeys.PW, value, workerParallelIndex);
  }

  static getOtpSeed(workerParallelIndex?: string | number): string | undefined {
    return SharedCredentialManager.read(CustomEnvKeys.OTP_SEED_B32, workerParallelIndex);
  }

  static setOtpSeed(value: string, workerParallelIndex?: string | number): void {
    SharedCredentialManager.create(CustomEnvKeys.OTP_SEED_B32, value, workerParallelIndex);
  }

  private static create(prefix: string, value: string, workerParallelIndex?: string | number): void {
    SharedCredentialManager.store.create(prefix, value, workerParallelIndex);
  }

  private static read(prefix: string, workerParallelIndex?: string | number): string | undefined {
    return SharedCredentialManager.store.read(prefix, workerParallelIndex);
  }
}
