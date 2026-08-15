import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "./ChatWindow";

interface ChatWidgetProps {
  vendorId: string;
  vendorName: string;
  productId?: string;
  productName?: string;
}

export default function ChatWidget({ vendorId, vendorName, productId, productName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="gold"
        className="gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Chat with Vendor
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-background shadow-2xl border border-border"
          >
            <div className="flex items-center justify-between bg-primary p-4">
              <div>
                <h3 className="font-heading font-semibold text-primary-foreground">
                  Chat with {vendorName}
                </h3>
                {productName && (
                  <p className="text-sm text-primary-foreground/80">
                    About: {productName}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ChatWindow
              vendorId={vendorId}
              vendorName={vendorName}
              productId={productId}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
