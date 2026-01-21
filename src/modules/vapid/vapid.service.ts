import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import webpush from 'web-push';

@Injectable()
export class VapidService {
  constructor(private readonly configService: ConfigService) {}

  getPublicKey(): string {
    return this.configService.get<string>('VAPID_PUBLIC_KEY') || '';
  }

  getPrivateKey(): string {
    return this.configService.get<string>('VAPID_PRIVATE_KEY') || '';
  }

  getSubject(): string {
    return this.configService.get<string>('VAPID_SUBJECT') || 'mailto:test@example.com';
  }

  configureWebPush() {
    const publicKey = this.getPublicKey();
    const privateKey = this.getPrivateKey();
    if (publicKey && privateKey) {
      webpush.setVapidDetails(this.getSubject(), publicKey, privateKey);
    }
  }
}
