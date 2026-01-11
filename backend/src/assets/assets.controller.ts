import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/assets')
export class AssetsController {
  @Get('illustrations')
  getIllustrations() {
    // Navigate up one level from backend to root, then to frontend
    const directoryPath = path.join(process.cwd(), '..', 'frontend', 'public', 'assets', 'illustrations');
    console.log('DEBUG: AssetsController scanning directory:', directoryPath);
    
    try {
      if (!fs.existsSync(directoryPath)) {
        console.warn('DEBUG: Directory does not exist:', directoryPath);
        return [];
      }
      
      const files = fs.readdirSync(directoryPath);
      console.log('DEBUG: Found files:', files);
      
      // Filter for common image extensions
      const images = files.filter(file => /\.(png|jpg|jpeg|svg|webp|gif)$/i.test(file));
      console.log('DEBUG: Filtered images:', images);
      
      // Return public URL paths
      return images.map(file => `/assets/illustrations/${file}`);
    } catch (error) {
      console.error('Error reading illustrations directory:', error);
      return [];
    }
  }
}
