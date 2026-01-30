enum CustomEnvKeys {
    USER = 'USER',
    PW = 'PW',
    OTP_SEED_B32 = 'OTP_SEED_B32',
}

/**
 * Utility class to access custom environment variables
 */
export class Env {
  static getUsername(workerParallelIndex?: string | number): string | undefined {
    return Env.getByPrefix(CustomEnvKeys.USER, workerParallelIndex);
  }

  static setUsername(value: string, workerParallelIndex?: string | number): void {
    Env.setByPrefix(CustomEnvKeys.USER, value, workerParallelIndex);
  }

  static getPassword(workerParallelIndex?: string | number): string | undefined {
    return Env.getByPrefix(CustomEnvKeys.PW, workerParallelIndex);
  }

  static setPassword(value: string, workerParallelIndex?: string | number): void {
    Env.setByPrefix(CustomEnvKeys.PW, value, workerParallelIndex);
  }

  static getOtpSeed(workerParallelIndex?: string | number): string | undefined {
    return Env.getByPrefix(CustomEnvKeys.OTP_SEED_B32, workerParallelIndex);
  }

  static setOtpSeed(value: string, workerParallelIndex?: string | number): void {
    Env.setByPrefix(CustomEnvKeys.OTP_SEED_B32, value, workerParallelIndex);
  }

  private static getByPrefix(prefix: string, workerParallelIndex?: string | number): string | undefined {
    if (workerParallelIndex !== undefined) {
      return process.env[`${prefix}_${workerParallelIndex}`];
    }
    return process.env[prefix];
  }

  private static setByPrefix(prefix: string, value: string, workerParallelIndex?: string | number): void {
    if (workerParallelIndex !== undefined) {
      process.env[`${prefix}_${workerParallelIndex}`] = value;
    } else {
      process.env[prefix] = value;
    }
  }
}
