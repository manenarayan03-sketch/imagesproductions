"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  MessageCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { buildWhatsAppLink } from "@/lib/site-utils";

type Owner = {
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
} | null;

const formSchema = z.object({
  name: z.string().min(2, "Please share your name."),
  contact: z.string().min(5, "Add an email or phone number."),
  service: z.string().optional(),
  message: z.string().min(8, "Tell us a little more."),
});

type FormValues = z.infer<typeof formSchema>;

const SERVICE_OPTIONS = [
  "Wedding Photography & Films",
  "Pre-Wedding & Engagement Shoots",
  "Cinematography & Filmmaking",
  "Professional Video Editing",
  "Event Coverage",
  "Portrait & Candid Photography",
  "Corporate & Brand Films",
  "Product & Social Media Content",
  "Other / Not sure yet",
];

export function Contact({
  owner,
  whatsapp,
}: {
  owner: Owner;
  whatsapp: string;
}) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", contact: "", service: "", message: "" },
  });

  const fullAddress = owner
    ? `${owner.address}, ${owner.city}, ${owner.state} ${owner.pincode}, ${owner.country}.`
    : "Jalaram Niwas, Ganesh Gawade Road, Near Canara Bank, Mulund West, Mumbai, Maharashtra 400080, India.";

  const phoneDigits = (owner?.phone || whatsapp || "").replace(/[^\d]/g, "");
  const phoneTel = phoneDigits ? `+${phoneDigits}` : "+91 8433975695";
  const onSubmit = (values: FormValues) => {
    const text = [
      `Hello Images Production!`,
      ``,
      `Name: ${values.name}`,
      `Contact: ${values.contact}`,
      values.service ? `Service interest: ${values.service}` : null,
      ``,
      `Message:`,
      values.message,
    ]
      .filter(Boolean)
      .join("\n");

    const url = buildWhatsAppLink(whatsapp, text);
    window.open(url, "_blank", "noopener,noreferrer");
    toast({
      title: "Opening WhatsApp…",
      description: "Your enquiry is ready to send via WhatsApp.",
    });
    form.reset();
  };

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    fullAddress
  )}&output=embed`;

  return (
    <section
      id="contact"
      className="section-scroll-target relative py-24 sm:py-32 bg-[#0a0a10] overflow-hidden"
    >
      <div className="absolute top-0 left-1/4 h-72 w-[60%] rounded-full bg-electric/8 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 text-gold text-[10px] sm:text-xs tracking-[0.34em] uppercase">
            <span className="h-px w-8 bg-gold/60" />
            Get in Touch
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h2 className="mt-5 font-heading text-cream text-4xl sm:text-5xl md:text-6xl text-balance">
            Let&apos;s Create Together
          </h2>
          <p className="mt-4 text-cream/65 text-base sm:text-lg">
            Tell us about your story. We will reply with how we can bring it
            to life.
          </p>
        </motion.div>

        <div className="mt-14 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left — details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-6 border border-gold/15">
              <h3 className="font-heading text-cream text-2xl">
                {owner?.name || "Narayan Maane"}
              </h3>
              <p className="text-gold text-[10px] sm:text-xs tracking-[0.3em] uppercase mt-1">
                {owner?.role || "Founder & Creative Director"}
              </p>
              <div className="mt-6 space-y-4 text-sm">
                <ContactRow icon={<MapPin className="h-4 w-4" />} text={fullAddress} />
                <ContactRow
                  icon={<Phone className="h-4 w-4" />}
                  text={phoneTel}
                  href={`tel:${phoneTel.replace(/\s/g, "")}`}
                />
                <ContactRow
                  icon={<MessageCircle className="h-4 w-4" />}
                  text={`WhatsApp ${owner?.whatsapp || whatsapp}`}
                  href={buildWhatsAppLink(whatsapp, "Hi Images Production, I'd like to connect.")}
                  external
                />
              </div>
              <a
                href={buildWhatsAppLink(whatsapp, "Hi Images Production, I'd like to book a shoot.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="mt-6 w-full bg-gold text-ink hover:bg-gold/90 rounded-full font-heading tracking-[0.16em] text-xs uppercase">
                  <MessageCircle className="h-4 w-4 mr-2" /> Chat on WhatsApp
                </Button>
              </a>
            </div>

            {/* Map */}
            <div className="glass-card rounded-2xl overflow-hidden border border-gold/15">
              <iframe
                title="Images Production location on Google Maps"
                src={mapSrc}
                loading="lazy"
                className="w-full h-64 sm:h-72"
                style={{ border: 0, filter: "invert(0.92) hue-rotate(180deg)" }}
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass-card rounded-2xl p-6 sm:p-8 border border-gold/15"
          >
            <h3 className="font-heading text-cream text-2xl">
              Send an Enquiry
            </h3>
            <p className="text-cream/55 text-sm mt-1">
              Your message will open in WhatsApp, ready to send.
            </p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-6 space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cream/75 text-xs tracking-[0.18em] uppercase">
                        Your name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-ink/40 border-gold/20 text-cream placeholder:text-cream/40 rounded-md"
                          placeholder="e.g. Ananya Iyer"
                        />
                      </FormControl>
                      <FormMessage className="text-magenta" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cream/75 text-xs tracking-[0.18em] uppercase">
                        Email or phone
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-ink/40 border-gold/20 text-cream placeholder:text-cream/40 rounded-md"
                          placeholder="ananya@email.com / +91…"
                        />
                      </FormControl>
                      <FormMessage className="text-magenta" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cream/75 text-xs tracking-[0.18em] uppercase">
                        Service interest
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-ink/40 border-gold/20 text-cream rounded-md">
                            <SelectValue placeholder="Choose a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-ink border-gold/20 text-cream max-h-80 overflow-y-auto scrollbar-cinematic">
                          {SERVICE_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s} className="focus:bg-gold/10">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-magenta" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cream/75 text-xs tracking-[0.18em] uppercase">
                        Your message
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={5}
                          className="bg-ink/40 border-gold/20 text-cream placeholder:text-cream/40 rounded-md resize-none"
                          placeholder="Tell us about your event, date, location, and what you're hoping for…"
                        />
                      </FormControl>
                      <FormMessage className="text-magenta" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full bg-gold text-ink hover:bg-gold/90 rounded-full font-heading tracking-[0.16em] text-xs uppercase"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Enquiry
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  text,
  href,
  external,
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <div className="flex items-start gap-3 text-cream/75 hover:text-gold transition-colors">
      <span className="mt-0.5 h-8 w-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
        {icon}
      </span>
      <span className="text-sm leading-relaxed">{text}</span>
    </div>
  );
  if (!href) return content;
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="block"
    >
      {content}
    </a>
  );
}
