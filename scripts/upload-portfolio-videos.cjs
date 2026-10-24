/* eslint @typescript-eslint/no-require-imports: "off" */
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const { Resolver } = require("node:dns/promises");
require("dotenv").config({
  path: path.join(process.cwd(), ".env.local"),
  override: true,
  quiet: true,
});

const resolver = new Resolver();
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

const ROOT = process.cwd();
const BUCKET = process.env.SUPABASE_VIDEO_BUCKET || "portfolio-videos";
const CHUNK_SIZE = 6 * 1024 * 1024;
const MAX_FILE_BYTES = Number(process.env.SUPABASE_VIDEO_MAX_FILE_BYTES || 50 * 1024 * 1024);
const EXTERNAL_VIDEO_DIR = process.env.SUPABASE_VIDEO_SOURCE_DIR || "";
const PUBLIC_URLS_PATH = path.join(ROOT, "src", "lib", "portfolio-video-urls.json");
const STATE_PATH = path.join(ROOT, ".cache", "portfolio-tus-state.json");
const videos = [
  {
    id: "cmvldeh3m007nvm50612smr32",
    category: "event-videos",
    title: "Event Films",
    source: "public/uploads/portfolio/event-social-videos/Birthday Hight.mp4",
    sourceAlternates: [".cache/reduced-videos/Event Films-compressed.mp4"],
    externalSource: "Birthday Hight-compressed.mp4",
    replaceExisting: true,
    object: "event-videos/event-films.mp4",
  },
  {
    id: "cmvldeh1z0075vm50y60n0zqw",
    category: "cinematic-wedding-highlights",
    title: "Cinematic Weds",
    source: "public/uploads/portfolio/cinematic-wedding-highlights/Cinematic Weds.mp4",
    object: "cinematic-wedding-highlights/cinematic-weds.mp4",
    sourceAlternates: [".cache/reduced-videos/Cinematic Weds-compressed (2).mp4"],
    externalSource: "Cinematic Weds-compressed (3).mp4",
    replaceExisting: true,
  },
  {
    id: "cmvldeh2j007bvm50ojyr0q3f",
    category: "pre-wedding-films",
    title: "Pre-Wedding Films",
    source: "public/uploads/portfolio/pre-wedding-films/A + N - Prewedding Highlight1.mp4",
    sourceAlternates: [".cache/reduced-videos/Pre-Wedding Films-compressed.mp4"],
    externalSource: "Pre-Wedding Films-compressed-compressed.mp4",
    replaceExisting: true,
    object: "pre-wedding-films/pre-wedding-films.mp4",
  },
  {
    id: "cmvldeh2v007fvm502yf7avho",
    category: "corporate-videos",
    title: "Corporate Video",
    source: "public/uploads/portfolio/corporate-promotional-films/CA Firm.mp4",
    sourceAlternates: [".cache/reduced-videos/Corporate Video-compressed.mp4"],
    externalSource: "Corporate Video-compressed-compressed.mp4",
    replaceExisting: true,
    object: "corporate-videos/corporate-video.mp4",
  },
  {
    id: "cmvldeh3s007pvm50bf2a7wfl",
    category: "social-media-reels",
    title: "Images Production",
    source: "public/uploads/portfolio/event-social-videos/Images Production.mp4",
    externalSource: "Images Production-compressed.mp4",
    replaceExisting: true,
    object: "social-media-reels/images-production.mp4",
  },
  {
    id: "cmvldeh32007hvm509hlna4vq",
    category: "corporate-videos",
    title: "Dela",
    source: "public/uploads/portfolio/corporate-promotional-films/Dela.mp4",
    externalSource: "Dela-compressed (1).mp4",
    replaceExisting: true,
    object: "corporate-videos/dela.mp4",
  },
  {
    id: "cmvldeh3a007jvm50prj83shy",
    category: "promotional-videos",
    title: "Promotional Films",
    source: "public/uploads/portfolio/corporate-promotional-films/Puspak Patpedi documentary.mp4",
    object: "promotional-videos/promotional-films.mp4",
    sourceAlternates: [".cache/reduced-videos/Promotional Films-compressed (1).mp4"],
    externalSource: "Promotional Films-compressed (1)-compressed.mp4",
    replaceExisting: true,
  },
  {
    id: "cmvldeh2d0079vm50ij5kv6hm",
    category: "cinematic-wedding-highlights",
    title: "Wedding Films",
    source: "public/uploads/portfolio/cinematic-wedding-highlights/Wedding Films.mp4",
    sourceAlternates: [".cache/reduced-videos/Wedding Films-compressed.mp4"],
    externalSource: "Wedding Films-compressed (1).mp4",
    replaceExisting: true,
    object: "cinematic-wedding-highlights/wedding-films.mp4",
    hero: true,
  },
  {
    id: "cmvldeh3f007lvm50rw05gssy",
    category: "corporate-videos",
    title: "Tecnoformat",
    source: "public/uploads/portfolio/corporate-promotional-films/Tecnoformat.mp4",
    externalSource: "tecnoformat-compressed.mp4",
    replaceExisting: true,
    object: "corporate-videos/tecnoformat.mp4",
  },
];

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Set ${name} in your local environment before uploading.`);
  return value;
}

function encodeMetadata(value) {
  return Buffer.from(value).toString("base64");
}

function storagePublicUrl(baseUrl, objectPath) {
  return `${baseUrl}/storage/v1/object/public/${BUCKET}/${objectPath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

async function request(url, options = {}) {
  const target = new URL(url);
  if (target.protocol !== "https:") {
    throw new Error("Supabase uploads require HTTPS.");
  }

  let addresses;
  try {
    addresses = await resolver.resolve4(target.hostname);
  } catch (error) {
    throw new Error(
      `Cannot resolve ${target.hostname} via public DNS (${error.code || error.message}). Check that the project is active and the URL is correct.`
    );
  }
  if (!addresses.length) throw new Error(`No IPv4 addresses found for ${target.hostname}.`);

  return new Promise((resolve, reject) => {
    const req = https.request(target, {
      method: options.method || "GET",
      headers: options.headers,
      lookup: (_hostname, lookupOptions, callback) => {
        if (typeof lookupOptions === "function") {
          callback = lookupOptions;
          lookupOptions = {};
        }
        if (lookupOptions?.all) {
          callback(null, addresses.map((address) => ({ address, family: 4 })));
          return;
        }
        callback(null, addresses[0], 4);
      },
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        const headers = {
          get(name) {
            return res.headers[name.toLowerCase()]?.toString() ?? null;
          },
        };
        resolve({
          status: res.statusCode || 0,
          ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300,
          headers,
          async text() { return body; },
        });
      });
    });
    req.setTimeout(120000, () => req.destroy(new Error("Supabase request timed out.")));
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function ensureBucket(baseUrl, serviceKey) {
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };
  const existing = await request(`${baseUrl}/storage/v1/bucket/${BUCKET}`, { headers });
  if (existing.ok) {
    const update = await request(`${baseUrl}/storage/v1/bucket/${BUCKET}`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        public: true,
        file_size_limit: MAX_FILE_BYTES,
        allowed_mime_types: ["video/mp4", "video/webm"],
      }),
    });
    if (!update.ok) {
      throw new Error(
        `Could not configure bucket ${BUCKET} (${update.status}): ${await update.text()}. The project may need a paid Storage plan for videos over 50 MB.`
      );
    }
    console.log(`Configured public video bucket: ${BUCKET}`);
    return;
  }
  if (existing.status !== 404) {
    const detail = await existing.text();
    throw new Error(`Cannot inspect Supabase bucket (${existing.status}): ${detail}`);
  }

  const create = await request(`${baseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
      file_size_limit: MAX_FILE_BYTES,
      allowed_mime_types: ["video/mp4", "video/webm"],
    }),
  });
  if (!create.ok) {
    const detail = await create.text();
    throw new Error(
      `Could not create the public video bucket (${create.status}): ${detail}. Check the service key and ensure the Supabase project plan permits files over 50 MB.`
    );
  }
  console.log(`Created public bucket: ${BUCKET}`);
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

async function createTusUpload(endpoint, headers, video, size) {
  const metadata = {
    bucketName: BUCKET,
    objectName: video.object,
    contentType: "video/mp4",
    cacheControl: "31536000",
  };
  const uploadMetadata = Object.entries(metadata)
    .map(([key, value]) => `${key} ${encodeMetadata(value)}`)
    .join(",");
  const response = await request(endpoint, {
    method: "POST",
    headers: {
      ...headers,
      "Tus-Resumable": "1.0.0",
      "Upload-Length": String(size),
      "Upload-Metadata": uploadMetadata,
      "x-upsert": "true",
    },
  });
  if (response.status !== 201) {
    throw new Error(`Could not start upload for ${video.title} (${response.status}): ${await response.text()}`);
  }
  const location = response.headers.get("Location");
  if (!location) throw new Error(`Supabase did not return a resumable upload URL for ${video.title}.`);
  return new URL(location, endpoint).toString();
}

async function getUploadOffset(uploadUrl, headers) {
  const response = await request(uploadUrl, {
    method: "HEAD",
    headers: { ...headers, "Tus-Resumable": "1.0.0" },
  });
  if (!response.ok) throw new Error(`Cannot resume upload (${response.status}): ${await response.text()}`);
  return Number(response.headers.get("Upload-Offset") || 0);
}

async function uploadVideo(baseUrl, serviceKey, video, state) {
  const filePath = video.uploadSourcePath || path.join(ROOT, video.source);
  if (!fs.existsSync(filePath)) throw new Error(`Video source not found: ${video.source}`);
  const size = fs.statSync(filePath).size;
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };
  const endpoint = `${baseUrl.replace(".supabase.co", ".storage.supabase.co")}/storage/v1/upload/resumable`;
  let uploadUrl = state[video.object]?.uploadUrl;
  if (!uploadUrl) {
    uploadUrl = await createTusUpload(endpoint, headers, video, size);
    state[video.object] = { uploadUrl, size };
    saveState(state);
  }

  let offset = await getUploadOffset(uploadUrl, headers);
  if (offset > size) {
    delete state[video.object];
    saveState(state);
    throw new Error(`Supabase reports an invalid upload offset for ${video.title}.`);
  }

  const handle = await fs.promises.open(filePath, "r");
  try {
    while (offset < size) {
      const length = Math.min(CHUNK_SIZE, size - offset);
      const chunk = Buffer.allocUnsafe(length);
      const { bytesRead } = await handle.read(chunk, 0, length, offset);
      if (bytesRead !== length) throw new Error(`Could not read upload chunk for ${video.title}.`);

      let response;
      try {
        response = await request(uploadUrl, {
          method: "PATCH",
          headers: {
            ...headers,
            "Tus-Resumable": "1.0.0",
            "Upload-Offset": String(offset),
            "Content-Type": "application/offset+octet-stream",
          },
          body: chunk,
        });
      } catch (error) {
        offset = await getUploadOffset(uploadUrl, headers);
        if (offset >= size) break;
        if (error.message.includes("Cannot resolve")) throw error;
        continue;
      }

      if (response.status !== 204) {
        const detail = await response.text();
        if (response.status === 409) {
          offset = await getUploadOffset(uploadUrl, headers);
          continue;
        }
        throw new Error(`Upload failed for ${video.title} (${response.status}): ${detail}`);
      }

      offset = Number(response.headers.get("Upload-Offset"));
      process.stdout.write(`\r${video.title}: ${(offset / size * 100).toFixed(1)}%`);
    }
  } finally {
    await handle.close();
  }
  process.stdout.write("\n");

  delete state[video.object];
  saveState(state);
  return storagePublicUrl(baseUrl, video.object);
}

async function main() {
  const exampleEnv = fs.readFileSync(path.join(ROOT, ".env.example"), "utf8");
  const exampleUrl = exampleEnv.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m)?.[1]?.trim();
  const baseUrl = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    exampleUrl ||
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL")
  ).replace(/\/+$/, "");
  const serviceKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(baseUrl)) {
    throw new Error("SUPABASE_URL must be the project origin, such as https://your-project.supabase.co (do not include /rest/v1)." );
  }
  if (serviceKey.startsWith("sb_publishable_")) {
    throw new Error("The publishable/anon key cannot create buckets or upload files. Set the secret SUPABASE_SERVICE_ROLE_KEY locally; never publish it or commit it to Git.");
  }

  await ensureBucket(baseUrl, serviceKey);
  const state = loadState();
  const publicUrls = JSON.parse(fs.readFileSync(PUBLIC_URLS_PATH, "utf8"));
  const successful = [];
  const skipped = [];

  for (const video of videos) {
    const sourcePaths = [video.source, ...(video.sourceAlternates || [])]
      .map((relativePath) => ({ relativePath, fullPath: path.join(ROOT, relativePath) }))
      .filter(({ fullPath }) => fs.existsSync(fullPath))
      .map((source) => ({ ...source, size: fs.statSync(source.fullPath).size }))
      .sort((a, b) => a.size - b.size);
    if (video.externalSource && EXTERNAL_VIDEO_DIR) {
      const externalPath = path.join(EXTERNAL_VIDEO_DIR, video.externalSource);
      if (fs.existsSync(externalPath)) {
        sourcePaths.push({
          relativePath: externalPath,
          fullPath: externalPath,
          size: fs.statSync(externalPath).size,
        });
      }
    }
    sourcePaths.sort((a, b) => a.size - b.size);
    if (sourcePaths.length === 0) throw new Error(`Video source not found: ${video.source}`);
    const source = sourcePaths.find((candidate) => candidate.size <= MAX_FILE_BYTES);
    const selectedSource = source || sourcePaths[0];
    const fileSize = selectedSource.size;
    video.uploadSourcePath = selectedSource.fullPath;
    if (fileSize > MAX_FILE_BYTES) {
      console.log(`Skipping ${video.title}: best available file is ${(fileSize / 1024 / 1024).toFixed(1)} MB; bucket limit is ${(MAX_FILE_BYTES / 1024 / 1024).toFixed(0)} MB.`);
      skipped.push({ title: video.title, sizeMB: Number((fileSize / 1024 / 1024).toFixed(1)) });
      continue;
    }
    const existingUrl = publicUrls[video.id];
    if (existingUrl && !video.replaceExisting) {
      const head = await request(existingUrl, { method: "HEAD" });
      if (head.ok) {
        console.log(`Already hosted: ${video.title}`);
        if (video.hero) publicUrls.hero = existingUrl;
        continue;
      }
    }

    console.log(`Uploading ${video.title} (${(fileSize / 1024 / 1024).toFixed(1)} MB)${selectedSource.relativePath !== video.source ? " from compressed archive" : ""}`);
    const publicUrl = await uploadVideo(baseUrl, serviceKey, video, state);
    publicUrls[video.id] = publicUrl;
    if (video.hero) publicUrls.hero = publicUrl;
    fs.writeFileSync(PUBLIC_URLS_PATH, `${JSON.stringify(publicUrls, null, 2)}\n`);
    successful.push(video.title);
  }

  console.log(JSON.stringify({
    bucket: BUCKET,
    uploaded: successful,
    skipped,
    totalConfigured: videos.length,
    urlManifest: path.relative(ROOT, PUBLIC_URLS_PATH),
    nextStep: "Commit src/lib/portfolio-video-urls.json and push to trigger the live video update.",
  }, null, 2));
}

main().catch((error) => {
  console.error("Supabase portfolio upload stopped:", error.message);
  process.exitCode = 1;
});
