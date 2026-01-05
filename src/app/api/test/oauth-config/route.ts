import { authOptions } from '@/lib/nextauth';

// Test OAuth configuration
export async function GET() {
  try {
    // Check if required environment variables are present
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return Response.json({
        success: false,
        message: 'Missing required environment variables',
        missing: missingVars,
        hint: 'Please check your .env.local file and add the missing OAuth credentials'
      }, { status: 400 });
    }

    // Check if providers are configured
    const hasGoogleProvider = !!process.env.GOOGLE_CLIENT_ID;
    const hasGitHubProvider = !!process.env.GITHUB_CLIENT_ID;

    return Response.json({
      success: true,
      message: 'OAuth configuration is complete',
      data: {
        providers: {
          google: hasGoogleProvider,
          github: hasGitHubProvider
        },
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        envVarsPresent: requiredEnvVars.reduce((acc, varName) => {
          acc[varName] = !!process.env[varName];
          return acc;
        }, {} as Record<string, boolean>)
      }
    });

  } catch (error) {
    console.error('OAuth test error:', error);
    return Response.json({
      success: false,
      message: 'OAuth configuration test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
