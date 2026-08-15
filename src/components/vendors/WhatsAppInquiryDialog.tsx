import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { MessageCircle } from "lucide-react";
import { generateFormInquiryMessage, openWhatsAppChat } from "@/utils/whatsapp";

const inquirySchema = z.object({
  buyer_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message must be less than 1000 characters"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1").optional(),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

interface WhatsAppInquiryDialogProps {
  vendorName: string;
  vendorWhatsApp: string;
  productName: string;
  productCategory: string;
  trigger?: React.ReactNode;
}

export function WhatsAppInquiryDialog({
  vendorName,
  vendorWhatsApp,
  productName,
  productCategory,
  trigger,
}: WhatsAppInquiryDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      buyer_name: "",
      message: "",
      quantity: undefined,
    },
  });

  const onSubmit = (values: InquiryFormValues) => {
    const message = generateFormInquiryMessage(
      values.buyer_name,
      values.message,
      values.quantity,
      productName,
      productCategory,
      vendorName
    );

    openWhatsAppChat(vendorWhatsApp, message);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90">
            <MessageCircle className="mr-2 h-4 w-4" />
            Send Inquiry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact {vendorName}</DialogTitle>
          <DialogDescription>
            Fill out this form and you'll be redirected to WhatsApp to send your message directly to the vendor.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="buyer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 10" 
                      min={1}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="I'm interested in this product and would like to know more about..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                You'll be redirected to WhatsApp to complete your inquiry
              </p>
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              <MessageCircle className="mr-2 h-4 w-4" />
              Continue to WhatsApp
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
