import { readFile, rm, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MEDIA_PREFIX = "/media/";
const LOCAL_MEDIA_ROOT = path.resolve(process.cwd(), ".data", "media");

type StorageDriver = "local" | "s3";

function storageDriver(): StorageDriver {
  const configured = process.env.MEDIA_STORAGE_DRIVER?.toLowerCase();
  if (configured === "local" || configured === "s3") return configured;
  return process.env.NODE_ENV === "production" ? "s3" : "local";
}

function s3Config() {
  const endpoint = process.env.AWS_ENDPOINT_URL ?? process.env.ENDPOINT;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? process.env.ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY ?? process.env.SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET_NAME ?? process.env.BUCKET;
  const region = process.env.AWS_DEFAULT_REGION ?? process.env.REGION ?? "auto";

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("S3 media storage is not configured");
  }

  return {
    bucket,
    client: new S3Client({
      endpoint,
      region,
      forcePathStyle: process.env.AWS_S3_URL_STYLE === "path",
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

function safeKey(value: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(value).replaceAll("\\", "/");
  } catch {
    return null;
  }

  const segments = decoded.split("/");
  if (
    !decoded ||
    decoded.startsWith("/") ||
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        !/^[a-zA-Z0-9._-]+$/.test(segment),
    )
  ) {
    return null;
  }
  return segments.join("/");
}

function localPath(key: string) {
  const candidate = path.resolve(LOCAL_MEDIA_ROOT, ...key.split("/"));
  if (!candidate.startsWith(`${LOCAL_MEDIA_ROOT}${path.sep}`)) {
    throw new Error("Invalid media key");
  }
  return candidate;
}

export function managedMediaUrl(key: string): string {
  const valid = safeKey(key);
  if (!valid) throw new Error("Invalid media key");
  return `${MEDIA_PREFIX}${valid.split("/").map(encodeURIComponent).join("/")}`;
}

export function managedStoragePath(
  value: string | null | undefined,
): string | null {
  if (!value) return null;

  let pathname: string;
  if (value.startsWith("/")) {
    pathname = value;
  } else {
    try {
      const candidate = new URL(value);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (!siteUrl || candidate.origin !== new URL(siteUrl).origin) return null;
      pathname = candidate.pathname;
    } catch {
      return null;
    }
  }

  if (!pathname.startsWith(MEDIA_PREFIX)) return null;
  return safeKey(pathname.slice(MEDIA_PREFIX.length));
}

export async function storeManagedImage(
  key: string,
  body: Buffer,
): Promise<string> {
  const valid = safeKey(key);
  if (!valid) throw new Error("Invalid media key");

  if (storageDriver() === "local") {
    const destination = localPath(valid);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, body, { flag: "wx" });
  } else {
    const { client, bucket } = s3Config();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: valid,
        Body: body,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  }

  return managedMediaUrl(valid);
}

export async function getManagedImage(
  key: string,
): Promise<
  | { kind: "local"; body: Buffer }
  | { kind: "redirect"; url: string }
  | null
> {
  const valid = safeKey(key);
  if (!valid) return null;

  if (storageDriver() === "local") {
    try {
      return { kind: "local", body: await readFile(localPath(valid)) };
    } catch {
      return null;
    }
  }

  try {
    const { client, bucket } = s3Config();
    return {
      kind: "redirect",
      url: await getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: bucket, Key: valid }),
        { expiresIn: 60 * 60 },
      ),
    };
  } catch {
    return null;
  }
}

export async function deleteManagedImages(
  values: Array<string | null | undefined>,
): Promise<void> {
  const keys = [
    ...new Set(values.map(managedStoragePath).filter(Boolean)),
  ] as string[];
  if (keys.length === 0) return;

  if (storageDriver() === "local") {
    await Promise.allSettled(
      keys.map((key) => rm(localPath(key), { force: true })),
    );
    return;
  }

  try {
    const { client, bucket } = s3Config();
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
      }),
    );
  } catch {
    // Media cleanup is best-effort and must never roll back a successful DB edit.
  }
}

export function replacedManagedImages(
  entries: Array<{
    previous: string | null | undefined;
    next: string | null | undefined;
  }>,
): string[] {
  return entries
    .filter(({ previous, next }) => Boolean(previous) && previous !== next)
    .map(({ previous }) => previous as string);
}
