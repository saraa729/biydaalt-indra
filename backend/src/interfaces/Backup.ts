export type BackupManifest = {
  fileName: string;
  filePath: string;
  createdAt: string;
  sizeBytes: number;
  reason: "manual" | "scheduled" | "startup" | "restore";
  triggeredById?: number | null;
};
