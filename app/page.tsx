import { AnimatedBackground } from "@/components/animated-background"
import { Footer } from "@/components/footer"
import { VTEXSettingsModal } from "@/components/vtex-settings-modal"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      <VTEXSettingsModal />

      <div className="relative z-10 flex items-center justify-center flex-1">
        <div className="text-center space-y-8 p-8">
          <div className="flex justify-center">
            <Image
              src="/totto-logo.svg"
              alt="Totto Logo"
              width={300}
              height={120}
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Sistema de Gestión VTEX</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Administra productos, inventario, precios y órdenes de tu tienda VTEX
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">Ir al Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
