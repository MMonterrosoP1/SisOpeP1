import Client from "ssh2-sftp-client";
import { PassThrough, Readable } from "stream";

// Helper function to create a new SFTP client and connect
async function createSftpClient() {
  const client = new Client();
  await client.connect({
    host: process.env.Sftp_host,
    port: parseInt(process.env.Sftp_port || "22", 10),
    username: process.env.Sftp_user,
    password: process.env.Sftp_pass,
  });
  return client;
}

export async function sftpPut(relativePath: string, buffer: Buffer): Promise<string> {
  const client = await createSftpClient();
  try {
    const basePath = process.env.SFTP_BASE_PATH || "";
    // Clean up paths to prevent double slashes
    const cleanBasePath = basePath.replace(/\/$/, "");
    const cleanRelativePath = relativePath.replace(/^\//, "");
    
    const absolutePath = `${cleanBasePath}/${cleanRelativePath}`;
    const dirPath = absolutePath.substring(0, absolutePath.lastIndexOf("/"));

    // Ensure directory exists
    const dirExists = await client.exists(dirPath);
    if (!dirExists) {
      await client.mkdir(dirPath, true);
    }

    // Upload the file
    await client.put(buffer, absolutePath);
    
    return relativePath;
  } finally {
    await client.end();
  }
}

export async function sftpGet(relativePath: string): Promise<ReadableStream> {
  const client = await createSftpClient();
  try {
    const basePath = process.env.SFTP_BASE_PATH || "";
    const cleanBasePath = basePath.replace(/\/$/, "");
    const cleanRelativePath = relativePath.replace(/^\//, "");
    
    const absolutePath = `${cleanBasePath}/${cleanRelativePath}`;

    const exists = await client.exists(absolutePath);
    if (!exists) {
      throw new Error("File not found on SFTP server");
    }

    // Create a pass-through stream to pipe data before closing connection
    const passThrough = new PassThrough();
    
    // We start downloading and then immediately return a Node.js ReadableStream adapted to Web API
    // The client.get writes to the passThrough stream. Once finished or errored, we handle connection end.
    client.get(absolutePath, passThrough).then(() => {
        client.end();
    }).catch((err) => {
        console.error("SFTP get error:", err);
        passThrough.destroy(err);
        client.end();
    });

    // Adapt Node.js Readable stream to Web API ReadableStream
    return Readable.toWeb(passThrough) as ReadableStream;
  } catch (error) {
    await client.end();
    throw error;
  }
}
