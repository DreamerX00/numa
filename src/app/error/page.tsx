import { Suspense } from "react";
import ErrorPage from "@/components/ui/ErrorPage";

interface ErrorPageRouteProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function ErrorPageContent({ searchParams }: ErrorPageRouteProps) {
  const params = await searchParams;
  const code = parseInt(params.code as string) || 500;
  const reason = params.reason as string;

  // Custom messages based on the reason
  const getCustomMessage = (code: number, reason?: string): string | undefined => {
    if (reason) {
      switch (reason) {
        case 'Too many requests':
          return 'You have made too many requests. Please slow down and try again in a minute.';
        case 'Internal middleware error':
          return 'A system error occurred while processing your request. Please try again.';
        default:
          return reason;
      }
    }
    return undefined;
  };

  return (
    <ErrorPage
      statusCode={code}
      message={getCustomMessage(code, reason)}
      showRetry={true}
      showGoBack={true}
      showGoHome={true}
    />
  );
}

export default function ErrorPageRoute(props: ErrorPageRouteProps) {
  return (
    <Suspense fallback={<div>Loading error page...</div>}>
      <ErrorPageContent {...props} />
    </Suspense>
  );
}