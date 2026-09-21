import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Gift, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { RoleSelector, PublicRole } from "@/components/auth/RoleSelector";

const SignUp = () => {
  const navigate = useNavigate();
  const { signUpBuyer, signUpVendor } = useAuth();

  const [role, setRole] = useState<PublicRole>("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    businessName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) return toast.error("Please enter your full name");
    if (!form.email.trim()) return toast.error("Please enter your email");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (!form.phone.trim()) return toast.error("Please enter your phone number");
    if (!form.address.trim()) return toast.error("Please enter your address");
    if (role === "vendor" && !form.businessName.trim()) {
      return toast.error("Please enter your business name");
    }

    setIsSubmitting(true);
    try {
      const result =
        role === "vendor"
          ? await signUpVendor({
              email: form.email.trim(),
              password: form.password,
              fullName: form.fullName.trim(),
              phone: form.phone.trim(),
              address: form.address.trim(),
              businessName: form.businessName.trim(),
            })
          : await signUpBuyer({
              email: form.email.trim(),
              password: form.password,
              fullName: form.fullName.trim(),
              phone: form.phone.trim(),
              address: form.address.trim(),
            });

      if (result.error) throw result.error;

      setEmailSent(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Could not create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const heading = role === "vendor" ? "Open a Vendor Account" : "Create Your Account";
  const subheading =
    role === "vendor"
      ? "Start selling your gift business on Giftora."
      : "Join Giftora to discover and order premium gifts.";

  // ---- Post-signup success screen ----
  if (emailSent) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas-50">
        <Header />
        <main className="flex flex-1 items-center justify-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md px-4"
          >
            <Card className="border-canvas-200 bg-white shadow-sm">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-navy-800">
                    Confirm your email
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We've sent a confirmation link to
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gold-600">{form.email}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click the link in your inbox to activate your account, then sign in.
                </p>
                <Button variant="gold" className="mt-2 w-full" asChild>
                  <Link to="/signin">Go to Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---- Main signup form ----
  return (
    <div className="flex min-h-screen flex-col bg-canvas-50">
      <Header />
      <main className="flex flex-1 items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg px-4"
        >
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-800 ring-2 ring-gold-500/40">
              <Gift className="h-6 w-6 text-gold-500" />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-bold text-navy-800">{heading}</h1>
            <p className="mt-1 text-center text-sm text-muted-foreground">{subheading}</p>
          </div>

          <Card className="border-canvas-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-6">
              <RoleSelector value={role} onChange={setRole} />

              <Separator className="bg-canvas-200" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {role === "vendor" && (
                  <div>
                    <Label htmlFor="businessName">Business name *</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={form.businessName}
                      onChange={handleChange}
                      placeholder="e.g. Billion Boxes and Gifts"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      required
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy-800"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+234 801 234 5678"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, Lagos"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : role === "vendor" ? (
                    "Create Vendor Account"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <Separator className="bg-canvas-200" />

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="font-semibold text-gold-600 hover:text-gold-700 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;