type ApiError = {
  message: string;
  status?: number;
  code?: string;
  details?: { field: string; message: string }[];
};

export function normalizeApiError(error: any): ApiError {
  const apiError = error?.response?.data?.error;

  if (!apiError) {
    return {
      message: error?.message || "Unexpected error occurred.",
      status: error?.status,
    };
  }

  if (apiError.code === "VALIDATION_ERROR" && apiError.details?.length) {
    const details = apiError?.details[0];
    return {
      message: `${details.field}: ${details.message}`,
      status: apiError?.status,
      code: apiError?.code,
      details: apiError?.details,
    };
  }

  return {
    message: apiError.message,
    status: apiError?.status,
    code: apiError?.code,
    details: apiError?.details,
  };
}
