import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, MapPin, Phone, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const countries = [
  { value: "nigeria", label: "Nigeria" },
  { value: "uae", label: "United Arab Emirates" },
  { value: "uk", label: "United Kingdom" },
  { value: "us", label: "United States" },
];

const vendorTypes = [
  { value: "curator", label: "Gift Curator", description: "I curate and customize gift collections" },
  { value: "wholesaler", label: "Gift Producer / Wholesaler", description: "I manufacture or wholesale gift products" },
];

const onboardingSchema = z.object({
  business_name: z.string().trim().min(2, "Business name is required").max(100),
  phone: z.string().trim().min(10, "Please enter a valid phone number"),
  whatsapp: z.string().trim().optional(),
  country: z.string().min(1, "Please select a country"),
  city: z.string().trim().min(2, "City is required").max(100),
  description: z.string().trim().max(500).optional(),
  vendor_type: z.string().min(1, "Please select your vendor type"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface VendorOnboardingFormProps {
  onSuccess?: () => void;
}

export function VendorOnboardingForm({ onSuccess }: VendorOnboardingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, refreshVendorProfile } = useAuth();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      business_name: "",
      phone: "",
      whatsapp: "",
      country: "",
      city: "",
      description: "",
      vendor_type: "",
    },
  });

  const handleSubmit = async (data: OnboardingFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data: insertedProfile, error } = await supabase
        .from("vendor_profiles")
        .insert({
          user_id: user.id,
          business_name: data.business_name,
          email: user.email || "",
          phone: data.phone,
          whatsapp: data.whatsapp || null,
          country: data.country,
          city: data.city,
          description: data.description || null,
          vendor_type: data.vendor_type,
          status: "pending",
          subscription_status: "inactive",
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Notify admin via edge function (fire and forget)
      supabase.functions.invoke("notify-vendor-registration", {
        body: {
          vendorName: data.business_name,
          vendorEmail: user.email,
          vendorCountry: data.country,
          vendorCity: data.city,
          vendorId: insertedProfile.id,
        },
      }).catch((notifyError) => {
        console.error("Failed to send admin notification:", notifyError);
      });

      // Refresh vendor profile in AuthContext with retry
      let retries = 0;
      const maxRetries = 5;
      while (retries < maxRetries) {
        await refreshVendorProfile();
        // Give a short delay for state to update
        await new Promise(resolve => setTimeout(resolve, 200));
        retries++;
      }

      // Show success toast
      toast({
        title: "Registration Complete!",
        description: "Welcome to Giftora! Your application is now under review.",
      });
      
      // Callback for parent component
      onSuccess?.();
    } catch (err) {
      console.error("Onboarding error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-lg"
    >
      <div className="rounded-2xl bg-background p-8 shadow-soft border border-border">
        <h1 className="text-center font-heading text-2xl font-bold text-foreground">
          Complete Your Profile
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          Tell us about your business to get started
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-8 space-y-5"
          >
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Your Gift Shop"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="+234 800 000 0000"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+234 800 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Lagos, Ikeja"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vendor_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your vendor type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendorTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell customers about your gift business..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Complete Setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Registered vendors can also source products and packaging from other
        Giftora vendors at special trade rates. This feature is exclusive to
        vendors.
      </p>
    </motion.div>
  );
}
