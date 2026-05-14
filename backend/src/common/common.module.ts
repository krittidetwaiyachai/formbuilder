import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { FormAccessService } from './guards/form-access.service';
@Global()
@Module({
  providers: [EncryptionService, FormAccessService],
  exports: [EncryptionService, FormAccessService]
})export class
CommonModule {}