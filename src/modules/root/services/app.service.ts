import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Returns a welcome message indicating the API is running
  getHello(): string {
    return 'Hello World!';
  }
}
