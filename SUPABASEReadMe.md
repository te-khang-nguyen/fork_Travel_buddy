# Supabase CLI Setup Read carefully as when dont have back up rn

# Step 1: Log in to the Supabase CLI
npx supabase login

# Step 2: Link Your Project
# Replace <project-id> with the ID from your project's dashboard URL:
# https://supabase.com/dashboard/project/<project-id>
supabase link --project-ref <project-id>

# Step 3: Pull Remote Database Changes
# Capture any changes made to your remote database.
# If no changes were made, you can skip this step.
supabase db pull

# Step 4: Create a New Migration
# Replace <migration-name> with a descriptive name for your migration.
supabase migration new <migration-name>

# Step 5: Push the Migration to the Remote Database
supabase db push
