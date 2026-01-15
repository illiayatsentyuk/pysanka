import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    return request.user['sub'];
  },
);

export const GetCurrentUserIdOptional = createParamDecorator(
  (data: undefined, context: ExecutionContext): number | undefined => {
    const request = context.switchToHttp().getRequest();
    return request.user?.['sub'];
  },
);
