import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { it, enUS, ro } from "date-fns/locale";
import { CalendarIcon, FileText, Upload, X, Activity, Eye, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@awesome-cordova-plugins/file-opener';

interface AnalisiSangue {
  id: number;
  data: string;
  glicemia?: string;
  colesterolo?: string;
  trigliceridi?: string;
  emoglobina?: string;
  globuliBianchi?: string;
  globuliRossi?: string;
  piastrine?: string;
  timestamp: number;
}

interface DocumentoAnalisi {
  id: number;
  nome: string;
  data: string;
  tipo: string;
  dataCaricamento: string;
  fileData: string; // Base64 del file per la memorizzazione
  timestamp: number;
}

const AnalisiForm = () => {
  const { t, i18n } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [analisiSangue, setAnalisiSangue] = useState<AnalisiSangue[]>([]);
  const [documenti, setDocumenti] = useState<DocumentoAnalisi[]>([]);
  
  // Campi per analisi del sangue
  const [glicemia, setGlicemia] = useState("");
  const [colesterolo, setColesterolo] = useState("");
  const [trigliceridi, setTrigliceridi] = useState("");
  const [emoglobina, setEmoglobina] = useState("");
  const [globuliBianchi, setGlobuliBianchi] = useState("");
  const [globuliRossi, setGlobuliRossi] = useState("");
  const [piastrine, setPiastrine] = useState("");

  const getLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'ro': return ro;
      default: return it;
    }
  };

  // Carica dati dal localStorage
  useEffect(() => {
    const savedAnalisi = localStorage.getItem("analisiSangue");
    if (savedAnalisi) {
      try {
        setAnalisiSangue(JSON.parse(savedAnalisi));
      } catch (error) {
        console.error("Errore nel caricamento analisi:", error);
      }
    }

    const savedDocumenti = localStorage.getItem("documentiAnalisi");
    if (savedDocumenti) {
      try {
        setDocumenti(JSON.parse(savedDocumenti));
      } catch (error) {
        console.error("Errore nel caricamento documenti:", error);
      }
    }
  }, []);

  // Salva nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem("analisiSangue", JSON.stringify(analisiSangue));
  }, [analisiSangue]);

  useEffect(() => {
    localStorage.setItem("documentiAnalisi", JSON.stringify(documenti));
  }, [documenti]);

  const salvaAnalisi = () => {
    if (!date) {
      toast({
        variant: "destructive",
        title: t('errors.missingDate'),
        description: t('errors.selectDateAnalysis'),
      });
      return;
    }

    const hasData = glicemia || colesterolo || trigliceridi || emoglobina || 
                   globuliBianchi || globuliRossi || piastrine;

    if (!hasData) {
      toast({
        variant: "destructive",
        title: t('errors.noData'),
        description: t('errors.insertValue'),
      });
      return;
    }

    const dataString = format(date, "yyyy-MM-dd");
    
    // Rimuovi eventuali analisi esistenti per la stessa data
    const analisiAggiornate = analisiSangue.filter(a => a.data !== dataString);
    
    const nuoveAnalisi: AnalisiSangue = {
      id: Date.now(),
      data: dataString,
      glicemia: glicemia.trim() || undefined,
      colesterolo: colesterolo.trim() || undefined,
      trigliceridi: trigliceridi.trim() || undefined,
      emoglobina: emoglobina.trim() || undefined,
      globuliBianchi: globuliBianchi.trim() || undefined,
      globuliRossi: globuliRossi.trim() || undefined,
      piastrine: piastrine.trim() || undefined,
      timestamp: Date.now()
    };

    setAnalisiSangue([...analisiAggiornate, nuoveAnalisi]);
    
    // Pulisci i campi
    setGlicemia("");
    setColesterolo("");
    setTrigliceridi("");
    setEmoglobina("");
    setGlobuliBianchi("");
    setGlobuliRossi("");
    setPiastrine("");

    toast({
      title: t('success.analysisSaved'),
      description: t('success.analysisSavedDesc', { date: format(date, "dd/MM/yyyy", { locale: getLocale() }) }),
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        variant: "destructive",
        title: t('errors.unsupportedFormat'),
        description: t('errors.pdfOnly'),
      });
      return;
    }

    if (!date) {
      toast({
        variant: "destructive",
        title: t('errors.missingDate'),
        description: t('errors.selectDateDocument'),
      });
      return;
    }

    try {
      // Converti il file in base64 per la memorizzazione
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        
        const nuovoDocumento: DocumentoAnalisi = {
          id: Date.now(),
          nome: file.name,
          data: format(date, "yyyy-MM-dd"),
          tipo: "PDF",
          dataCaricamento: format(new Date(), "yyyy-MM-dd HH:mm", { locale: getLocale() }),
          fileData: fileData,
          timestamp: Date.now()
        };

        setDocumenti(prev => [...prev, nuovoDocumento]);

        toast({
          title: t('success.documentUploaded'),
          description: t('success.documentUploadedDesc', { name: file.name, date: format(date, "dd/MM/yyyy", { locale: getLocale() }) }),
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('errors.uploadError'),
        description: t('errors.cannotUpload'),
      });
    }

    // Reset input file
    event.target.value = "";
  };

  const apriDocumento = async (documento: DocumentoAnalisi) => {
    console.log("Tentativo di apertura documento:", documento.nome);
    
    try {
      if (Capacitor.isNativePlatform()) {
        // Siamo su mobile (Android/iOS)
        console.log("Piattaforma nativa rilevata");
        
        // Converti base64 in blob
        const response = await fetch(documento.fileData);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Converti in base64 per il filesystem di Capacitor
        let binary = '';
        uint8Array.forEach((byte) => {
          binary += String.fromCharCode(byte);
        });
        const base64Data = btoa(binary);
        
        // Salva il file temporaneamente
        const fileName = `temp_${documento.id}.pdf`;
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });
        
        console.log("File salvato temporaneamente:", result.uri);
        
        // Apri il file con l'app predefinita - corretto con due parametri
        await FileOpener.open(result.uri, 'application/pdf');
        
        toast({
          title: t('success.documentOpened'),
          description: t('success.documentOpenedApp'),
        });
        
      } else {
        // Siamo nel browser web
        console.log("Piattaforma web rilevata");
        const byteCharacters = atob(documento.fileData.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        toast({
          title: t('success.documentOpened'),
          description: t('success.documentOpenedBrowser'),
        });
      }
    } catch (error) {
      console.error("Errore nell'apertura del documento:", error);
      toast({
        variant: "destructive",
        title: t('errors.openError'),
        description: t('errors.cannotOpen'),
      });
    }
  };

  const rimuoviDocumento = (id: number) => {
    setDocumenti(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: t('success.documentRemoved'),
      description: t('success.documentRemovedDesc'),
    });
  };

  const rimuoviAnalisi = (id: number) => {
    setAnalisiSangue(prev => prev.filter(analisi => analisi.id !== id));
    toast({
      title: t('success.analysisRemoved'),
      description: t('success.analysisRemovedDesc'),
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 p-5 rounded-xl shadow-2xl space-y-6">
      <h2 className="text-xl font-bold text-center text-purple-800 mb-4">
        {t('analysis.title')}
      </h2>

      {/* Selezione Data */}
      <div>
        <label className="block mb-2 text-base font-medium text-purple-800">
          {t('registry.selectDate')}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-medium mb-4 bg-white/60 shadow-md hover:bg-purple-50/60 hover:shadow-lg text-base rounded-lg h-12 px-4",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-5 w-5 text-purple-600" />
              {date ? format(date, "PPP", { locale: getLocale() }) : <span>{t('registry.chooseDate')}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-3"
              initialFocus
              locale={getLocale()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Analisi del Sangue */}
      <Card className="bg-white/50">
        <CardHeader>
          <CardTitle className="text-lg text-red-700 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('analysis.bloodTests')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                {t('vitals.glucose')}
              </label>
              <Input
                type="number"
                placeholder="90"
                value={glicemia}
                onChange={(e) => setGlicemia(e.target.value)}
                className="bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                {t('vitals.cholesterol')}
              </label>
              <Input
                type="number"
                placeholder="200"
                value={colesterolo}
                onChange={(e) => setColesterolo(e.target.value)}
                className="bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                {t('vitals.triglycerides')}
              </label>
              <Input
                type="number"
                placeholder="150"
                value={trigliceridi}
                onChange={(e) => setTrigliceridi(e.target.value)}
                className="bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                {t('vitals.hemoglobin')}
              </label>
              <Input
                type="number"
                placeholder="14"
                value={emoglobina}
                onChange={(e) => setEmoglobina(e.target.value)}
                className="bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                {t('vitals.whiteBloodCells')}
              </label>
              <Input
                type="number"
                placeholder="7000"
                value={globuliBianchi}
                onChange={(e) => setGlobuliBianchi(e.target.value)}
                className="bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                {t('vitals.redBloodCells')}
              </label>
              <Input
                type="number"
                placeholder="4.5"
                value={globuliRossi}
                onChange={(e) => setGlobuliRossi(e.target.value)}
                className="bg-white/70"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {t('vitals.platelets')}
            </label>
            <Input
              type="number"
              placeholder="250000"
              value={piastrine}
              onChange={(e) => setPiastrine(e.target.value)}
              className="bg-white/70"
            />
          </div>
          <Button
            onClick={salvaAnalisi}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            {t('analysis.saveBloodTests')}
          </Button>
        </CardContent>
      </Card>

      {/* Caricamento Documenti PDF */}
      <Card className="bg-white/50">
        <CardHeader>
          <CardTitle className="text-lg text-orange-700 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('analysis.documents')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t('analysis.uploadPDF')}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="bg-white/70"
              />
              <Upload className="h-4 w-4 text-orange-600" />
            </div>
          </div>
          
          {/* Lista Documenti */}
          {documenti.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">{t('analysis.uploadedDocuments')}</h4>
              {documenti.map((doc) => (
                <div
                  key={doc.id}
                  className="flex justify-between items-center bg-white/80 p-3 rounded-lg shadow-sm"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">
                      {doc.nome}
                    </div>
                    <div className="text-xs text-gray-600">
                      {format(new Date(doc.data), "dd/MM/yyyy", { locale: getLocale() })}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => apriDocumento(doc)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rimuoviDocumento(doc.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visualizzazione Analisi Salvate */}
      {analisiSangue.length > 0 && (
        <Card className="bg-white/50">
          <CardHeader>
            <CardTitle className="text-lg text-green-700 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t('analysis.savedAnalysis')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analisiSangue
              .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
              .map((analisi) => (
                <div
                  key={analisi.id}
                  className="bg-white/80 p-4 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-800">
                      {format(new Date(analisi.data), "dd/MM/yyyy", { locale: getLocale() })}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rimuoviAnalisi(analisi.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {analisi.glicemia && (
                      <div>
                        <span className="text-gray-600">Glicemia:</span> {analisi.glicemia} mg/dl
                      </div>
                    )}
                    {analisi.colesterolo && (
                      <div>
                        <span className="text-gray-600">Colesterolo:</span> {analisi.colesterolo} mg/dl
                      </div>
                    )}
                    {analisi.trigliceridi && (
                      <div>
                        <span className="text-gray-600">Trigliceridi:</span> {analisi.trigliceridi} mg/dl
                      </div>
                    )}
                    {analisi.emoglobina && (
                      <div>
                        <span className="text-gray-600">Emoglobina:</span> {analisi.emoglobina} g/dl
                      </div>
                    )}
                    {analisi.globuliBianchi && (
                      <div>
                        <span className="text-gray-600">Globuli Bianchi:</span> {analisi.globuliBianchi}
                      </div>
                    )}
                    {analisi.globuliRossi && (
                      <div>
                        <span className="text-gray-600">Globuli Rossi:</span> {analisi.globuliRossi}
                      </div>
                    )}
                    {analisi.piastrine && (
                      <div>
                        <span className="text-gray-600">Piastrine:</span> {analisi.piastrine}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalisiForm;
