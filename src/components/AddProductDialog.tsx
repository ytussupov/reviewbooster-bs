import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useSettings } from "@/lib/settings";

export function AddProductDialog({ onCreated }: { onCreated: () => void }) {
  const { t } = useSettings();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const submit = async () => {
    if (name.trim().length < 2) {
      toast.error(t("enter_name"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("products").insert({
      name: name.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
    });
    setLoading(false);
    if (error) {
      toast.error(t("product_add_fail"));
      return;
    }
    toast.success(t("product_added"));
    setName("");
    setDescription("");
    setImageUrl("");
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 shadow-glow">
          <Plus className="h-4 w-4" />
          {t("add_product")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t("new_product")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name_required")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("name_ph")}
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">{t("description")}</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("desc_ph")}
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="img">{t("image_link")}</Label>
            <Input
              id="img"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={loading} className="w-full">
            {loading ? t("adding") : t("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
