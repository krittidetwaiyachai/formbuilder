import { Injectable } from '@nestjs/common';
import { PublicSubmissionSession } from '@prisma/client';
import { EncryptionService } from '../common/encryption.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  generateOpaqueSessionToken,
  hashOpaqueSessionToken,
  hashUserAgent } from
'./public-submission-session.util';
const PUBLIC_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
@Injectable()export class
PublicSubmissionSessionService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly encryptionService: EncryptionService)
  {}
  async ensureSession(
  formId: string,
  cookieToken: string | null,
  ipAddress?: string,
  userAgent?: string)
  : Promise<{
    session: PublicSubmissionSession;
    cookieToken: string;
    isNew: boolean;
  }> {
    const existingSession = cookieToken ?
    await this.resolveSession(formId, cookieToken) :
    null;
    if (existingSession) {
      const session = await this.prisma.publicSubmissionSession.update({
        where: { id: existingSession.id },
        data: {
          lastSeenAt: new Date()
        }
      });
      return {
        session,
        cookieToken,
        isNew: false
      };
    }
    const newToken = generateOpaqueSessionToken();
    const tokenHash = hashOpaqueSessionToken(newToken);
    const session = await this.prisma.publicSubmissionSession.create({
      data: {
        formId,
        tokenHash,
        ipHash: ipAddress ? this.encryptionService.hashIpAddress(ipAddress) : null,
        userAgentHash: hashUserAgent(userAgent),
        expiresAt: new Date(Date.now() + PUBLIC_SESSION_TTL_MS)
      }
    });
    return {
      session,
      cookieToken: newToken,
      isNew: true
    };
  }
  async resolveSession(formId: string, cookieToken: string): Promise<PublicSubmissionSession | null> {
    return this.prisma.publicSubmissionSession.findFirst({
      where: {
        formId,
        tokenHash: hashOpaqueSessionToken(cookieToken),
        expiresAt: {
          gt: new Date()
        }
      }
    });
  }
}