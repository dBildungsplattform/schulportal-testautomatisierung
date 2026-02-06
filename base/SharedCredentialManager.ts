import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { workers } from "../playwright.config";


enum CustomEnvKeys {
    USER = 'USER',
    PW = 'PW',
    OTP_SEED_B32 = 'OTP_SEED_B32',
}

/**
 * Utility class to access credentials that are shared across multiple test workers.
 */
export class SharedCredentialManager {
  /**
   * This must be called during global setup. Otherwise credentials will not persist across workers.
   */
  static init(): void {
    const tempPath: string = mkdtempSync(join(tmpdir(), 'testautomatisierung-'));
    process.env['TEST_CREDENTIALS_PATH'] = tempPath;
    for (let index = 0; index < workers; index++) {
      mkdirSync(join(tempPath, index.toString()));
    }
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
    if (workerParallelIndex !== undefined) {
      writeFileSync(join(process.env['TEST_CREDENTIALS_PATH']!, workerParallelIndex.toString(), prefix), value);
    } else {
      process.env[prefix] = value;
    }
  }

  private static read(prefix: string, workerParallelIndex?: string | number): string | undefined {
    if (workerParallelIndex !== undefined) {
      const buffer: Buffer = readFileSync(join(process.env['TEST_CREDENTIALS_PATH']!, workerParallelIndex.toString(), prefix));
      return buffer.toString();
    }
    return process.env[prefix];
  }
}
