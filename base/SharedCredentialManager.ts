import { mkdirSync, mkdtempSync, PathOrFileDescriptor, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { workers } from "../playwright.config";

enum CustomEnvKeys {
  USER = 'USER',
  PW = 'PW',
  OTP_SEED_B32 = 'OTP_SEED_B32',
}

interface StorageStrategy {
  init(): void;
  create(prefix: string, value: string, index?: string | number): void;
  read(prefix: string, index?: string | number): string | undefined;
}

class FileStorageStrategy implements StorageStrategy {
  private static readonly credentialPath: string = 'TEST_CREDENTIALS_PATH';

  init(): void {
    const tempPath: string = mkdtempSync(join(tmpdir(), 'testautomatisierung-'));
    process.env[FileStorageStrategy.credentialPath] = tempPath;
    for (let index: number = 0; index < workers; index++) {
      mkdirSync(join(tempPath, index.toString()));
    }
  }

  create(prefix: string, value: string, index?: string | number): void {
    if (index !== undefined)
      writeFileSync(this.computePath(index, prefix), value);
    else
      process.env[prefix] = value;
  }

  read(prefix: string, index?: string | number): string | undefined {
    if (index !== undefined)
      return readFileSync(this.computePath(index, prefix)).toString();
    else
      return process.env[prefix];
  }

  private computePath(index: string | number, prefix: string): PathOrFileDescriptor {
    return join(process.env[FileStorageStrategy.credentialPath]!, index.toString(), prefix);
  }
}

class EnvStorageStrategy implements StorageStrategy {
  init(): void { }

  create(prefix: string, value: string, index?: string | number): void {
    process.env[this.computeName(index, prefix)] = value;
  }

  read(prefix: string, index?: string | number): string | undefined {
    return process.env[this.computeName(index, prefix)];
  }
  
  private computeName(index: string | number | undefined, prefix: string): string {
    return index !== undefined ? prefix.concat('_', index.toString()) : prefix;
  }
}

/**
 * Utility class to access credentials that are shared across multiple test workers.
 */
export class SharedCredentialManager {
  private static store: StorageStrategy = new FileStorageStrategy();
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
