import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCompact } from '@/lib/engagement';

export function DailyCreators(){
  const {data,error,isPending}=useQuery({queryKey:['daily-creators'],staleTime:60_000,queryFn:async()=>{const {data,error}=await supabase.rpc('daily_creator_ranking');if(error)throw error;return data??[];}});
  return <section className="mt-6 border-y border-border py-5"><h2 className="flex items-center gap-2 text-base font-bold"><Trophy className="h-5 w-5 text-gold"/> আজকের সেরা নির্মাতা</h2>
    {isPending?<p className="mt-4 text-sm text-muted-foreground">লোড হচ্ছে…</p>:error?<p role="alert" className="mt-4 text-sm text-destructive">র‍্যাঙ্কিং খোলা যায়নি</p>:!data?.length?<p className="mt-4 text-sm text-muted-foreground">আজকের র‍্যাঙ্কিংয়ে এখনো কেউ নেই</p>:<ol className="mt-3 divide-y divide-border">{data.map((p,i)=><li key={p.sottok_id}><Link to="/id/$sotId" params={{sotId:p.sottok_id}} className="flex items-center gap-3 py-3"><span className="w-7 text-lg font-bold text-pink">{i+1}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">@{p.username}</strong><small className="text-muted-foreground">{p.video_count} ভিডিও · {formatCompact(p.total_views)} ভিউ</small></span><span className="text-sm">♥ {formatCompact(p.total_likes)}</span></Link></li>)}</ol>}
  </section>;
}