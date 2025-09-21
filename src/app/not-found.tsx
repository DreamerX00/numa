import ErrorPage from "@/components/ui/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      statusCode={404}
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showRetry={false}
      showGoBack={true}
      showGoHome={true}
    />
  );
}