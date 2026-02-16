import { mkdirSync, mkdtempSync, PathOrFileDescriptor, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path/posix";

import { workers } from "../../playwright.config";
import { SharedCredentialStorageStrategy } from "./SharedCredentialManager";

export class FileStorageStrategy implements SharedCredentialStorageStrategy {
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
