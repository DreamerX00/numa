import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { formatZodErrors } from "./schemas";

/**
 * Validation middleware for API routes
 * Validates request body against a Zod schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (
    req: NextRequest,
    handler: (req: NextRequest, data: T) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      return handler(req, validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: formatZodErrors(error),
          },
          { status: 400 }
        );
      }
      
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid JSON in request body",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const { searchParams } = new URL(req.url);
    const params: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const validatedData = schema.parse(params);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: "Invalid query parameters",
            details: formatZodErrors(error),
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Invalid request",
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate route parameters (path segments)
 */
export function validateParams<T>(
  params: Record<string, string>,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const validatedData = schema.parse(params);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: "Invalid route parameters",
            details: formatZodErrors(error),
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Invalid request",
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Safe JSON parsing with error handling
 */
export async function safeParseJSON(req: NextRequest): Promise<
  | { success: true; data: unknown }
  | { success: false; response: NextResponse }
> {
  try {
    const data = await req.json();
    return { success: true, data };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      ),
    };
  }
}
