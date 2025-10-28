"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings } from "lucide-react"

interface VTEXSettings {
  accountName: string
  apiKey: string
  apiToken: string
  environment: string
}

export function VTEXSettingsModal() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<VTEXSettings>({
    accountName: "tottoqa",
    apiKey: "vtexappkey-tottoqa-IGFKQO",
    apiToken: "VUMMGFNKSOVZTPBYAHDLZLPDKLEZXBRMGQZUHOBWPMMUPKBMJGPIFPZECOJDEQBPLOUEOKEKBYEHNLFAHAFCWBMNSMUMFYZRBJZZTHCVBQXXMJDJASCLFKEKRPJQYMGO",
    environment: "myvtex",
  })

  useEffect(() => {
    // Check if settings exist in localStorage
    const stored = localStorage.getItem("vtex_settings")
    if (stored) {
      setSettings(JSON.parse(stored))
    } else {
      // Show modal if no settings found
      setOpen(true)
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("vtex_settings", JSON.stringify(settings))
    // Set environment variables (these will be used by the API client)
    if (typeof window !== "undefined") {
      ;(window as any).VTEX_ACCOUNT_NAME = settings.accountName
      ;(window as any).VTEX_API_KEY = settings.apiKey
      ;(window as any).VTEX_API_TOKEN = settings.apiToken
      ;(window as any).VTEX_ENVIRONMENT = settings.environment
    }
    setOpen(false)
  }

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setOpen(true)} className="fixed top-4 right-4 z-50">
        <Settings className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configuración de VTEX</DialogTitle>
            <DialogDescription>Ingresa tus credenciales de VTEX para conectar con la API</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Nombre de la Cuenta</Label>
              <Input
                id="accountName"
                placeholder="ejemplo: mitienda"
                value={settings.accountName}
                onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (X-VTEX-API-AppKey)</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="vtexappkey-..."
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token (X-VTEX-API-AppToken)</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={settings.apiToken}
                onChange={(e) => setSettings({ ...settings, apiToken: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Ambiente</Label>
              <Select
                value={settings.environment}
                onValueChange={(value) => setSettings({ ...settings, environment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="myvtex">Producción (myvtex)</SelectItem>
                <SelectItem value="vtexcommercebeta">Beta (vtexcommercebeta)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar Configuración</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
