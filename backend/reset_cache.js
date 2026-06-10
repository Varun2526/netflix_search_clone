import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const contentSchema = new mongoose.Schema({
  providersFetched: Boolean,
  providers: Array
}, { strict: false });

const Content = mongoose.model('Content', contentSchema, 'contents');

async function reset() {
  await mongoose.connect(process.env.DB_URL);
  const result = await Content.updateMany({}, { $set: { providersFetched: false, providers: [] } });
  console.log("Reset count:", result.modifiedCount);
  process.exit(0);
}
reset();
