import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  suburbResultId: string;
  suburbName: string;
}

const SuburbReportButton = ({ suburbResultId, suburbName }: Props) => {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to download reports");
        return;
      }
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-suburb-report`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
        },
        body: JSON.stringify({ suburb_result_id: suburbResultId }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to generate report");
      }
      const html = await res.text();

      // Open the printable report in a new tab; user can save as PDF from print dialog.
      const win = window.open("", "_blank");
      if (!win) {
        toast.error("Please allow pop-ups to view the report");
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
      // Auto-trigger print dialog after render
      setTimeout(() => {
        try { win.focus(); win.print(); } catch (_) { /* noop */ }
      }, 800);

      toast.success(`Report generated for ${suburbName}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handle} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <FileDown className="h-4 w-4 mr-1.5" />}
      Download Suburb Report
    </Button>
  );
};

export default SuburbReportButton;
