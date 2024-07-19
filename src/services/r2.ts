import { R2 } from "node-cloudflare-r2";
import ENV from "@/utils/env";

const bucketSingleton = () => {
  const r2 = new R2({
    accessKeyId: ENV.R2_ACCESS_KEY_ID,
    secretAccessKey: ENV.R2_SECRET_ACCESS_KEY,
    accountId: ENV.R2_ACCOUNT_ID,
  });

  const bucket = r2.bucket(ENV.R2_BUCKET_NAME);
  bucket.provideBucketPublicUrl(ENV.R2_PUBLIC_URL);

  return bucket;
};

declare global {
  var bucketGlobal: undefined | ReturnType<typeof bucketSingleton>;
}

const bucket = globalThis.bucketGlobal ?? bucketSingleton();

export default bucket;

globalThis.bucketGlobal = bucket;
