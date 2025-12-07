import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://codbduungrdtibhrooko.supabase.co';
const supabaseKey = 'sb_publishable_hTeCm_xmZYmxu6kIg0khgg_TGcK8bIJ';

export const supabase = createClient(supabaseUrl, supabaseKey);
