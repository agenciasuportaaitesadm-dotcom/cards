import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { ZoomIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getCroppedBlob } from "@/lib/imageCrop";

/**
 * Diálogo de ajuste de imagem: permite dar zoom e reposicionar (arrastar)
 * antes de salvar, sem deformar. Retorna um Blob JPEG já enquadrado.
 * shape: "round" (foto de perfil, quadrado 1:1) | "rect" (capa).
 */
const ImageCropDialog = ({ open, src, aspect = 1, shape = "rect", title, onCancel, onConfirm }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_area, areaPx) => setAreaPixels(areaPx), []);

  // Detecta imagem inválida/ilegível e avisa o usuário em vez de travar o botão.
  useEffect(() => {
    if (!open || !src) return;
    const img = new Image();
    img.onerror = () => {
      toast.error("Não foi possível carregar esta imagem. Tente outro arquivo.");
      onCancel();
    };
    img.src = src;
  }, [open, src, onCancel]);

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAreaPixels(null);
    setSaving(false);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = async () => {
    if (!areaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(src, areaPixels, shape === "round" ? 1024 : 1600);
      reset();
      onConfirm(blob);
    } catch {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent className="sm:max-w-lg" data-testid="image-crop-dialog">
        <DialogHeader>
          <DialogTitle className="font-heading">{title || "Ajustar imagem"}</DialogTitle>
          <DialogDescription>
            Arraste para reposicionar e use o controle de zoom para enquadrar. A proporção é mantida sem deformar.
          </DialogDescription>
        </DialogHeader>

        <div
          className="relative h-72 w-full overflow-hidden rounded-xl bg-slate-900"
          data-testid="image-crop-area"
        >
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={shape === "round" ? "round" : "rect"}
              showGrid={shape !== "round"}
              restrictPosition
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="flex items-center gap-3 px-1 pt-2">
          <ZoomIn className="h-4 w-4 flex-shrink-0 text-slate-500" />
          <Slider
            data-testid="image-crop-zoom"
            value={[zoom]}
            min={1}
            max={3}
            step={0.01}
            onValueChange={(v) => setZoom(v[0])}
            className="flex-1"
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="rounded-full" onClick={handleCancel} data-testid="image-crop-cancel">
            Cancelar
          </Button>
          <Button type="button" className="rounded-full bg-indigo-600 hover:bg-indigo-700" onClick={handleConfirm} disabled={saving || !areaPixels} data-testid="image-crop-confirm">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Aplicar e enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropDialog;
