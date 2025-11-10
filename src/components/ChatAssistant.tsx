import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatAssistant = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const offlineResponses: Record<string, Record<string, string>> = {
    it: {
      "come registro": "Per registrare un medicinale, vai alla sezione 'Registro Medicinali' dal menu principale. Seleziona la data, inserisci il nome del medicinale e l'orario di assunzione.",
      "come funziona": "L'app permette di registrare i medicinali quotidiani, monitorare l'andamento settimanale dei parametri vitali e ricevere notifiche per gli orari di assunzione.",
      "parametri vitali": "Puoi inserire pressione e glicemia nella sezione 'Registro Medicinali'. I dati verranno mostrati nel grafico dell'andamento settimanale.",
      "notifiche": "Le notifiche vengono attivate automaticamente quando è l'ora di prendere un medicinale. Puoi disattivarle usando il pulsante ON/OFF nella sezione 'Gestione Quotidiana'.",
      "default": "Quando sei online, posso rispondere a domande più specifiche. Per ora: usa il menu per navigare tra Registro Medicinali, Gestione Quotidiana e Andamento."
    },
    en: {
      "how to register": "To register a medication, go to the 'Medicine Registry' section from the main menu. Select the date, enter the medication name and intake time.",
      "how it works": "The app allows you to register daily medications, monitor weekly trends of vital parameters and receive notifications for intake times.",
      "vital parameters": "You can enter blood pressure and glucose in the 'Medicine Registry' section. The data will be shown in the weekly progress chart.",
      "notifications": "Notifications are automatically activated when it's time to take a medication. You can disable them using the ON/OFF button in the 'Daily Management' section.",
      "default": "When you're online, I can answer more specific questions. For now: use the menu to navigate between Medicine Registry, Daily Management and Progress."
    },
    ro: {
      "cum înregistrez": "Pentru a înregistra un medicament, accesați secțiunea 'Registrul Medicamentelor' din meniul principal. Selectați data, introduceți numele medicamentului și ora administrării.",
      "cum funcționează": "Aplicația vă permite să înregistrați medicamentele zilnice, să monitorizați tendințele săptămânale ale parametrilor vitali și să primiți notificări pentru orele de administrare.",
      "parametri vitali": "Puteți introduce tensiunea arterială și glicemia în secțiunea 'Registrul Medicamentelor'. Datele vor fi afișate în graficul progresului săptămânal.",
      "notificări": "Notificările sunt activate automat când este timpul să luați un medicament. Le puteți dezactiva folosind butonul ON/OFF din secțiunea 'Gestionare Zilnică'.",
      "default": "Când sunteți online, pot răspunde la întrebări mai specifice. Deocamdată: folosiți meniul pentru a naviga între Registrul Medicamentelor, Gestionare Zilnică și Progres."
    }
  };

  const getOfflineResponse = (message: string): string => {
    const lang = i18n.language as keyof typeof offlineResponses;
    const responses = offlineResponses[lang] || offlineResponses.it;
    const lowerMessage = message.toLowerCase();

    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }

    return responses.default;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (!isOnline) {
        // Risposta offline
        const offlineReply = getOfflineResponse(input);
        setMessages(prev => [...prev, { role: "assistant", content: offlineReply }]);
      } else {
        // Risposta AI online
        const { data, error } = await supabase.functions.invoke('chat-assistant', {
          body: { message: input, language: i18n.language }
        });

        if (error) {
          console.error('Edge function error:', error);
          throw error;
        }

        if (data?.error) {
          if (data.error.includes('Rate limit')) {
            toast({
              title: t('chat.rateLimitTitle'),
              description: t('chat.rateLimitDesc'),
              variant: "destructive"
            });
          } else if (data.error.includes('credits')) {
            toast({
              title: t('chat.creditsTitle'),
              description: t('chat.creditsDesc'),
              variant: "destructive"
            });
          }
          throw new Error(data.error);
        }

        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('chat.errorTitle'),
        description: t('chat.errorDesc'),
        variant: "destructive"
      });
      
      // Fallback a risposta offline in caso di errore
      const offlineReply = getOfflineResponse(input);
      setMessages(prev => [...prev, { role: "assistant", content: offlineReply }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50",
          "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90",
          "transition-all duration-300 hover:scale-110"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-card border-2 border-border rounded-2xl shadow-2xl z-40 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-t-2xl text-primary-foreground">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{t('chat.title')}</h3>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  {isOnline ? (
                    <>
                      <Wifi className="h-4 w-4" />
                      <span>{t('chat.online')}</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4" />
                      <span>{t('chat.offline')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">{t('chat.welcome')}</p>
                <p className="text-sm">{t('chat.welcomeDesc')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2 shadow-md",
                        msg.role === "user"
                          ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-2 shadow-md">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={t('chat.placeholder')}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
