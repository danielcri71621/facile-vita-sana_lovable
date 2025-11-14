import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const bloodTestSchema = z.object({
  test_date: z.date(),
  globuli_rossi: z.string().optional(),
  emoglobina: z.string().optional(),
  ematocrito: z.string().optional(),
  globuli_bianchi: z.string().optional(),
  piastrine: z.string().optional(),
  glicemia: z.string().optional(),
  emoglobina_glicata: z.string().optional(),
  creatinina: z.string().optional(),
  azotemia: z.string().optional(),
  got_ast: z.string().optional(),
  gpt_alt: z.string().optional(),
  gamma_gt: z.string().optional(),
  colesterolo_totale: z.string().optional(),
  colesterolo_hdl: z.string().optional(),
  colesterolo_ldl: z.string().optional(),
  trigliceridi: z.string().optional(),
  sodio: z.string().optional(),
  potassio: z.string().optional(),
  vitamina_d: z.string().optional(),
  vitamina_b12: z.string().optional(),
  tsh: z.string().optional(),
  ft3: z.string().optional(),
  ft4: z.string().optional(),
  ferritina: z.string().optional(),
  pcr: z.string().optional(),
  notes: z.string().optional(),
});

type BloodTestForm = z.infer<typeof bloodTestSchema>;

const AnalisiSangueForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const form = useForm<BloodTestForm>({
    resolver: zodResolver(bloodTestSchema),
    defaultValues: {
      test_date: new Date(),
    },
  });

  const onSubmit = async (data: BloodTestForm) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const testData: any = {
        user_id: user.id,
        test_date: format(data.test_date, "yyyy-MM-dd"),
        notes: data.notes,
      };

      // Convert string values to decimals, only include non-empty values
      Object.keys(data).forEach((key) => {
        if (key !== 'test_date' && key !== 'notes' && data[key as keyof BloodTestForm]) {
          const value = data[key as keyof BloodTestForm];
          if (typeof value === 'string' && value.trim() !== '') {
            testData[key] = parseFloat(value);
          }
        }
      });

      const { error } = await supabase.from("blood_tests").insert([testData]);

      if (error) throw error;

      toast.success(t('success.bloodTestAdded'));
      navigate("/analisi-sangue");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/analisi-sangue")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t('bloodTests.newTest')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="test_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('bloodTests.testDate')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>{t('bloodTests.selectDate')}</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="emocromo">
                    <AccordionTrigger>{t('bloodTests.sections.completeBloodCount')}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField control={form.control} name="globuli_rossi" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.redBloodCells')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="emoglobina" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.hemoglobin')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="ematocrito" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.hematocrit')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="globuli_bianchi" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.whiteBloodCells')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="piastrine" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.platelets')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="glicemia">
                    <AccordionTrigger>{t('bloodTests.sections.glucose')}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField control={form.control} name="glicemia" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.glucose')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="emoglobina_glicata" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.hba1c')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="funzione-renale">
                    <AccordionTrigger>{t('bloodTests.sections.kidney')}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField control={form.control} name="creatinina" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.creatinine')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="azotemia" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.bun')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="funzione-epatica">
                    <AccordionTrigger>{t('bloodTests.sections.liver')}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField control={form.control} name="got_ast" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.ast')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="gpt_alt" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.alt')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="gamma_gt" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.ggt')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="lipidi">
                    <AccordionTrigger>{t('bloodTests.sections.lipids')}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField control={form.control} name="colesterolo_totale" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.totalCholesterol')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="colesterolo_hdl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.hdl')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="colesterolo_ldl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.ldl')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="trigliceridi" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.triglycerides')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="elettroliti">
                    <AccordionTrigger>{t('bloodTests.sections.electrolytes')}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField control={form.control} name="sodio" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.sodium')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="potassio" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.potassium')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="vitamine">
                    <AccordionTrigger>{t('bloodTests.sections.vitamins')}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField control={form.control} name="vitamina_d" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.vitaminD')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="vitamina_b12" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.vitaminB12')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="tiroide">
                    <AccordionTrigger>{t('bloodTests.sections.thyroid')}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField control={form.control} name="tsh" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.tsh')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="ft3" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.ft3')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="ft4" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.ft4')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="altri">
                    <AccordionTrigger>{t('bloodTests.sections.other')}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField control={form.control} name="ferritina" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.ferritin')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="pcr" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('bloodTests.fields.crp')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('bloodTests.fields.notes')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? t('common.saving') : t('common.save')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/analisi-sangue")}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalisiSangueForm;
