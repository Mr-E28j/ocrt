"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { ArrowRight, Copy, FileText, Image, Upload, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createWorker } from "tesseract.js"
import { useTheme } from "next-themes"
// Remove this line: import { pdfjs } from 'react-pdf';

// Add this instead:
// Update the imports and PDF.js initialization
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  const workerUrl = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  );
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.href;
}

export default function Home() {
  // Add new state for progress
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [text, setText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fileType, setFileType] = useState<string | null>(null)
  const [isHandwritten, setIsHandwritten] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Asegurarse de que el componente esté montado antes de renderizar elementos dependientes del tema
  useEffect(() => {
    // Prevenir problemas de hidratación esperando a que el componente se monte
    setMounted(true)
  }, [])

  // Asegurar que el componente no renderice nada relacionado con el tema hasta que esté montado
  const currentTheme = mounted ? theme : undefined

  const convertPDFToImages = async (file: File, worker: any) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    const totalPages = pdf.numPages;
    let allText = '';
    
    setProgress({ current: 0, total: totalPages });

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      setProgress(prev => ({ ...prev, current: pageNum }));
      const canvas = document.createElement('canvas');
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext: canvas.getContext('2d')!,
        viewport,
      }).promise;
      
      const imageData = canvas.toDataURL('image/png');
      const { data: { text } } = await worker.recognize(imageData);
      allText += text + '\n\n--- Page ' + pageNum + ' ---\n\n';
    }
    
    return allText;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setFileType(file.type);
      setIsProcessing(true);
      setText("");

      let worker: any = null;
      try {
        worker = await createWorker("spa");
        
        if (isHandwritten) {
          await worker.setParameters({
            tessedit_ocr_engine_mode: 2, // Modo optimizado para manuscritos
            tessedit_pageseg_mode: 6, // Modo de segmentación para texto manuscrito
            preserve_interword_spaces: "1",
            textord_heavy_nr: "1", // Mejora la detección de líneas en manuscritos
            textord_min_linesize: "2.5", // Ajuste para líneas de texto manuscrito
          })
        }

        if (file.type === 'application/pdf') {
          const allText = await convertPDFToImages(file, worker);
          setText(allText);
        } else {
          const { data: { text } } = await worker.recognize(file);
          setText(text);
        }
      } catch (error) {
        console.error("Error processing image:", error)
        setText("Error al procesar la imagen. Por favor, inténtalo de nuevo.")
      } finally {
        setIsProcessing(false)
        if (worker) {
          await worker.terminate()
        }
      }
    },
    [isHandwritten],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp"],
      "application/pdf": [".pdf"],
    },
  })

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-24 bg-background dark-transition">
      {!mounted ? (
        <div className="flex items-center justify-center h-screen w-full">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-muted border-r-primary"></div>
        </div>
      ) : (
        <div className="max-w-3xl w-full space-y-8">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                OCR Inteligente
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Extrae texto de imágenes y documentos PDF con precisión y facilidad.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (theme === "light") {
                    setTheme("dark")
                  } else if (theme === "dark") {
                    setTheme("system")
                  } else {
                    setTheme("light")
                  }
                }}
                className="rounded-full h-10 w-10 border-primary/20"
              >
                {theme === "light" && <Sun className="h-5 w-5" />}
                {theme === "dark" && <Moon className="h-5 w-5" />}
                {theme === "system" && (
                  <div className="h-5 w-5 flex">
                    <Sun className="h-5 w-5 scale-100 dark:scale-0 transition-all" />
                    <Moon className="h-5 w-5 absolute scale-0 dark:scale-100 transition-all" />
                  </div>
                )}
                <span className="sr-only">
                  {theme === "light"
                    ? "Cambiar a modo oscuro"
                    : theme === "dark"
                      ? "Cambiar a modo sistema"
                      : "Cambiar a modo claro"}
                </span>
              </Button>
            </div>
          </div>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
                  <TabsTrigger value="result">Resultado</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-6">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-primary/70 bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center space-y-4">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-foreground">
                          {isDragActive ? "Suelta el archivo aquí" : "Arrastra y suelta un archivo aquí"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          o <span className="text-foreground font-medium">haz clic para seleccionar</span>
                        </p>
                        <p className="text-xs text-muted-foreground">Soporta imágenes (PNG, JPG) y documentos PDF</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    {fileType && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        {fileType.includes("image") ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        <span>{fileType.includes("image") ? "Imagen" : "PDF"} cargado</span>
                      </div>
                    )}
                  </div>

                  {isProcessing && (
                    <div className="text-center py-4">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-muted border-r-primary"></div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {progress.total > 0 
                          ? `Procesando página ${progress.current} de ${progress.total}...`
                          : "Procesando..."}
                      </p>
                      {progress.total > 0 && (
                        <div className="mt-2 w-full max-w-xs mx-auto bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="result" className="space-y-4">
                  {text ? (
                    <>
                      <div className="relative">
                        <div className="absolute top-2 right-2">
                          <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copiar al portapapeles</span>
                          </Button>
                        </div>
                        <div
                          className={`bg-card border rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto text-card-foreground ${isHandwritten ? "handwritten-preview" : ""}`}
                        >
                          {text}
                        </div>
                      </div>
                      {copied && (
                        <p className="text-sm text-vibrant-teal text-center">¡Texto copiado al portapapeles!</p>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p>Sube un archivo para ver el texto extraído aquí</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Cómo funciona</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border bg-card">
                <CardContent className="p-6 space-y-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">1. Sube tu archivo</h3>
                  <p className="text-sm text-muted-foreground">
                    Arrastra y suelta o selecciona una imagen o PDF para procesar.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-6 space-y-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">2. Procesamiento</h3>
                  <p className="text-sm text-muted-foreground">
                    Nuestro sistema analiza el contenido y extrae el texto automáticamente.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-6 space-y-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Copy className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">3. Obtén el resultado</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualiza el texto extraído y cópialo con un solo clic.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <footer className="mt-12 py-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} OCR Inteligente. Hecho por Mr. E</p>
          </footer>
        </div>
      )}
    </main>
  )
}

