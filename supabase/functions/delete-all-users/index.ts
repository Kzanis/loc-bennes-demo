import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting user deletion process...');

    // Create Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // List all users
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      throw listError;
    }

    console.log(`Found ${users.length} users to delete`);

    // Delete each user
    const deletionResults = [];
    for (const user of users) {
      console.log(`Deleting user: ${user.id} (${user.email})`);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.error(`Error deleting user ${user.id}:`, deleteError);
        deletionResults.push({
          userId: user.id,
          email: user.email,
          success: false,
          error: deleteError.message,
        });
      } else {
        console.log(`Successfully deleted user: ${user.id}`);
        deletionResults.push({
          userId: user.id,
          email: user.email,
          success: true,
        });
      }
    }

    const successCount = deletionResults.filter(r => r.success).length;
    const failCount = deletionResults.filter(r => !r.success).length;

    console.log(`Deletion complete: ${successCount} successful, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        message: 'User deletion process completed',
        totalUsers: users.length,
        successfulDeletions: successCount,
        failedDeletions: failCount,
        results: deletionResults,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in delete-all-users function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
