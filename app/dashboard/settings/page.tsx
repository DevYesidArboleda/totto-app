"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

interface VTEXSettings {
  accountName: string
  apiKey: string
  apiToken: string
  environment: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<VTEXSettings>({
    accountName: "",
    apiKey: "",
    apiToken: "",
    environment: "vtexcommercestable",
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("vtex_settings")
    if (stored) {
      setSettings(JSON.parse(stored))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("vtex_settings", JSON.stringify(settings))
    if (typeof window !== "undefined") {
      ;(window as any).VTEX_ACCOUNT_NAME = settings.accountName
      ;(window as any).VTEX_API_KEY = settings.apiKey
      ;(window as any).VTEX_API_TOKEN = settings.apiToken
      ;(window as any).VTEX_ENVIRONMENT = settings.environment
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className="text-muted-foreground">Administra las credenciales de tu cuenta VTEX</p>
      </div>

      {saved && (
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertDescription>Configuración guardada exitosamente</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Credenciales de VTEX</CardTitle>
          <CardDescription>
            Ingresa tus credenciales de VTEX para conectar con la API. Estas credenciales se almacenan localmente en tu
            navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Nombre de la Cuenta</Label>
            <Input
              id="accountName"
              placeholder="ejemplo: mitienda"
              value={settings.accountName}
              onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">El nombre de tu cuenta VTEX (sin .myvtex.com)</p>
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
            <p className="text-xs text-muted-foreground">Tu App Key de VTEX</p>
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
            <p className="text-xs text-muted-foreground">Tu App Token de VTEX</p>
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
            <p className="text-xs text-muted-foreground">Selecciona el ambiente de VTEX a utilizar</p>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} className="w-full">
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información</CardTitle>
          <CardDescription>Cómo obtener tus credenciales de VTEX</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Inicia sesión en el Admin de VTEX</p>
          <p>
            2. Ve a Account Settings {">"} Account {">"} Security
          </p>
          <p>3. Crea una nueva App Key y App Token</p>
          <p>4. Asegúrate de que tenga los permisos necesarios para Catalog API, Pricing API y OMS</p>
        </CardContent>
      </Card>
    </div>
  )
}
