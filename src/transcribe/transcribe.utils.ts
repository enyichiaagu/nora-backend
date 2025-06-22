import { Readable } from 'stream'
import { AssemblyAI } from 'assemblyai'
import recorder from 'node-record-lpcm16'

export async function start() {
  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_AI,
  });
}