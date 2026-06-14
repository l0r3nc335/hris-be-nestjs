import { Global, Module } from '@nestjs/common';
import { EntityNotFoundHelper } from './helpers/entity-not-found.helper';

@Global()
@Module({
  providers: [EntityNotFoundHelper],
  exports: [EntityNotFoundHelper],
})
export class CommonModule {}
