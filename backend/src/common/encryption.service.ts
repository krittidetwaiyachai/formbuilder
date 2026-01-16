import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;
  private readonly ipHashSalt: string;

  constructor(private configService: ConfigService) {
    const secret = this.configService.get<string>('ENCRYPTION_KEY');
    if (!secret) {
      throw new Error('ENCRYPTION_KEY environment variable is required. Server cannot start without it.');
    }
    this.key = crypto.scryptSync(secret, 'salt', 32);

    const salt = this.configService.get<string>('IP_HASH_SALT');
    if (!salt) {
      throw new Error('IP_HASH_SALT environment variable is required. Server cannot start without it.');
    }
    this.ipHashSalt = salt;
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    
    if (!ivHex || !authTagHex || !encrypted) {
      return encryptedText;
    }

    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch {
      return encryptedText;
    }
  }

  hashIpAddress(ip: string): string {
    return crypto.createHmac('sha256', this.ipHashSalt).update(ip).digest('hex').substring(0, 16);
  }
}
