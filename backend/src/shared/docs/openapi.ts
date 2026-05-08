export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "AI Mentor API",
    version: "1.0.0",
    description: "REST API for AI-assisted case report publication workflows.",
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: { type: "object" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
        },
      },
      CreateProjectRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string" },
          journalCode: { type: "string" },
          metadata: { type: "object" },
        },
      },
      UpdateSectionRequest: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string" },
          changeSummary: { type: "string" },
        },
      },
      TriggerReviewRequest: {
        type: "object",
        required: ["sectionKey"],
        properties: {
          sectionKey: {
            type: "string",
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: {
                email: "researcher@example.com",
                password: "Research123!",
                fullName: "Dr. Maya Researcher",
              },
            },
          },
        },
        responses: {
          "201": { description: "Registration succeeded" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login and receive JWT tokens",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: {
                email: "researcher@example.com",
                password: "Research123!",
              },
            },
          },
        },
        responses: {
          "200": { description: "Login succeeded" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        summary: "Refresh JWT token pair",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { refreshToken: "<refresh-token>" },
            },
          },
        },
        responses: {
          "200": { description: "Refresh succeeded" },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Get current authenticated user",
        responses: {
          "200": { description: "Current user profile" },
        },
      },
    },
    "/projects": {
      get: {
        summary: "List projects for the authenticated user",
        responses: {
          "200": { description: "Projects list" },
        },
      },
      post: {
        summary: "Create a new case report project",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProjectRequest" },
              example: {
                title: "Rare neurovascular presentation",
                journalCode: "elsevier-ijscr-scare-2025",
                metadata: {
                  specialty: "Neurology",
                  patientAge: "34 years",
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Project created" },
        },
      },
    },
    "/projects/{projectId}": {
      get: {
        summary: "Get a project with sections",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Project detail" },
        },
      },
      patch: {
        summary: "Update project metadata or status",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Project updated" },
        },
      },
      delete: {
        summary: "Archive a project",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Project archived" },
        },
      },
    },
    "/projects/{projectId}/sections/{sectionKey}": {
      get: {
        summary: "Get a project section",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
          {
            in: "path",
            name: "sectionKey",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Section detail" },
        },
      },
      put: {
        summary: "Update section content and create a version",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
          {
            in: "path",
            name: "sectionKey",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateSectionRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Section updated" },
        },
      },
    },
    "/projects/{projectId}/reviews": {
      get: {
        summary: "List reviews for a project",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Review history" },
        },
      },
      post: {
        summary: "Trigger AI review for a section",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TriggerReviewRequest" },
              example: { sectionKey: "DISCUSSION" },
            },
          },
        },
        responses: {
          "202": { description: "Review triggered" },
        },
      },
    },
    "/projects/{projectId}/issues": {
      get: {
        summary: "List issues for a project",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Project issues" },
        },
      },
    },
    "/projects/{projectId}/readiness": {
      get: {
        summary: "Get the latest readiness snapshot",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Readiness summary" },
        },
      },
    },
    "/reviews/{reviewRunId}": {
      get: {
        summary: "Get a review run in detail",
        parameters: [
          {
            in: "path",
            name: "reviewRunId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Review detail" },
        },
      },
    },
    "/issues/{issueId}": {
      patch: {
        summary: "Update issue status",
        parameters: [
          {
            in: "path",
            name: "issueId",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { status: "RESOLVED" },
            },
          },
        },
        responses: {
          "200": { description: "Issue updated" },
        },
      },
    },
    "/billing/overview": {
      get: {
        summary: "Get wallet, subscription, and recent usage",
        responses: {
          "200": { description: "Billing overview" },
        },
      },
    },
    "/admin/guideline-packs": {
      get: {
        summary: "List guideline packs",
        responses: {
          "200": { description: "Guideline packs" },
        },
      },
      put: {
        summary: "Create or update a guideline pack",
        responses: {
          "200": { description: "Guideline pack saved" },
        },
      },
    },
    "/admin/prompt-templates": {
      get: {
        summary: "List prompt templates",
        responses: {
          "200": { description: "Prompt templates" },
        },
      },
      put: {
        summary: "Create or update a prompt template",
        responses: {
          "200": { description: "Prompt template saved" },
        },
      },
    },
    "/admin/plans": {
      get: {
        summary: "List subscription plans",
        responses: {
          "200": { description: "Plan list" },
        },
      },
      put: {
        summary: "Create or update a subscription plan",
        responses: {
          "200": { description: "Plan saved" },
        },
      },
    },
    "/admin/users/usage": {
      get: {
        summary: "List users with aggregate usage",
        responses: {
          "200": { description: "Usage summary" },
        },
      },
    },
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "Healthy response",
          },
        },
      },
    },
  },
};
