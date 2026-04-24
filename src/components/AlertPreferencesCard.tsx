import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Loader2, MessageSquare, Mail, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Prefs {
  sms_enabled: boolean;
  email_enabled: boolean;
  inapp_enabled: boolean;
  phone_e164: string;
  alert_frequency: string;
}

const defaults: Prefs = {
  sms_enabled: false,
  email_enabled: true,
  inapp_enabled: true,
  phone_e164: "",
  alert_frequency: "instant",
};

const AlertPreferencesCard = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          sms_enabled: data.sms_enabled,
          email_enabled: data.email_enabled,
          inapp_enabled: data.inapp_enabled,
          phone_e164: data.phone_e164 ?? "",
          alert_frequency: data.alert_frequency,
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    if (prefs.sms_enabled && !prefs.phone_e164.match(/^\+\d{8,15}$/)) {
      toast.error("Enter a valid phone number in E.164 format (e.g. +61412345678)");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("notification_preferences").upsert({
      user_id: user.id,
      sms_enabled: prefs.sms_enabled,
      email_enabled: prefs.email_enabled,
      inapp_enabled: prefs.inapp_enabled,
      phone_e164: prefs.phone_e164 || null,
      alert_frequency: prefs.alert_frequency,
    });
    setSaving(false);
    if (error) {
      toast.error("Failed to save preferences");
    } else {
      toast.success("Notification preferences saved");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Alert Preferences</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <ChannelToggle
          icon={Bell}
          label="In-app notifications"
          description="Show alerts in the bell icon"
          checked={prefs.inapp_enabled}
          onChange={(v) => setPrefs({ ...prefs, inapp_enabled: v })}
        />
        <ChannelToggle
          icon={Mail}
          label="Email alerts"
          description="Sent to your account email"
          checked={prefs.email_enabled}
          onChange={(v) => setPrefs({ ...prefs, email_enabled: v })}
        />
        <ChannelToggle
          icon={MessageSquare}
          label="SMS alerts"
          description="Real-time text messages for new matches"
          checked={prefs.sms_enabled}
          onChange={(v) => setPrefs({ ...prefs, sms_enabled: v })}
        />
        {prefs.sms_enabled && (
          <div className="pl-7">
            <Label htmlFor="phone" className="text-xs text-muted-foreground flex items-center gap-1">
              <Smartphone className="h-3 w-3" /> Mobile number (E.164 format)
            </Label>
            <Input
              id="phone"
              value={prefs.phone_e164}
              onChange={(e) => setPrefs({ ...prefs, phone_e164: e.target.value })}
              placeholder="+61412345678"
              className="mt-1"
            />
          </div>
        )}

        <div>
          <Label className="text-xs text-muted-foreground">Frequency</Label>
          <select
            value={prefs.alert_frequency}
            onChange={(e) => setPrefs({ ...prefs, alert_frequency: e.target.value })}
            className="w-full mt-1 text-sm bg-muted rounded-md px-3 py-2 border-0 text-foreground focus:ring-2 focus:ring-primary"
          >
            <option value="instant">Instant</option>
            <option value="daily">Daily digest</option>
          </select>
        </div>

        <Button onClick={save} disabled={saving} className="w-full">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

const ChannelToggle = ({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: any;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-start gap-3 min-w-0">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default AlertPreferencesCard;
