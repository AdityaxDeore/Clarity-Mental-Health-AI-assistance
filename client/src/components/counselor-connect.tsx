import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  IndianRupee,
  Landmark,
  Loader2,
  MapPin,
  Shield,
  Smartphone,
  Star,
  User,
  Wallet,
} from "lucide-react";

interface Counselor {
  therapistId: string;
  userId: string;
  name: string;
  specialization: string;
  licenseNo: string;
  consultationFee: number;
  rating: number;
  languages: string[];
  isOnline: boolean;
}

interface AppointmentRequest {
  preferredDate: string;
  preferredTime: string;
  contactMethod: "in-person" | "video" | "phone";
  reason: string;
}

interface CheckoutResponse {
  ok: boolean;
  message?: string;
  appointment?: { apptId: string };
  payment?: { paymentId: string; amount: number; method: string };
  gateway?: { gatewayId: string; name: string; transactionFee: number };
  error?: string;
}

const FALLBACK_COUNSELORS: Counselor[] = [
  {
    therapistId: "THR-001",
    userId: "USR-006",
    name: "Dr. Aarti Kulkarni",
    specialization: "Anxiety",
    licenseNo: "LIC-MH-001",
    consultationFee: 999,
    rating: 4.9,
    languages: ["English", "Hindi"],
    isOnline: true,
  },
  {
    therapistId: "THR-002",
    userId: "USR-007",
    name: "Dr. Rohan Nair",
    specialization: "Depression",
    licenseNo: "LIC-MH-002",
    consultationFee: 1199,
    rating: 4.8,
    languages: ["English", "Malayalam"],
    isOnline: false,
  },
  {
    therapistId: "THR-003",
    userId: "USR-008",
    name: "Dr. Kiran Mehta",
    specialization: "Trauma",
    licenseNo: "LIC-MH-003",
    consultationFee: 1299,
    rating: 4.7,
    languages: ["English", "Hindi", "Gujarati"],
    isOnline: true,
  },
  {
    therapistId: "THR-004",
    userId: "USR-009",
    name: "Dr. Pooja Iyer",
    specialization: "Stress",
    licenseNo: "LIC-MH-004",
    consultationFee: 1099,
    rating: 4.8,
    languages: ["English", "Tamil"],
    isOnline: true,
  },
];

export function CounselorConnect() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const [currentView, setCurrentView] = useState<"browse" | "book" | "success">("browse");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "wallet">("upi");

  const [counselors, setCounselors] = useState<Counselor[]>(FALLBACK_COUNSELORS);
  const [isLoadingCounselors, setIsLoadingCounselors] = useState(true);
  const [selectedCounselorId, setSelectedCounselorId] = useState<string | null>(null);
  const [appointmentRequest, setAppointmentRequest] = useState<AppointmentRequest>({
    preferredDate: "",
    preferredTime: "",
    contactMethod: "video",
    reason: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusError, setStatusError] = useState<string>("");
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null);

  useEffect(() => {
    const loadTherapists = async () => {
      setIsLoadingCounselors(true);
      try {
        const response = await fetch("/api/therapists");
        const data = await response.json();
        if (response.ok && Array.isArray(data.data) && data.data.length > 0) {
          setCounselors(data.data);
        }
      } catch (_error) {
        // Fallback data keeps UX functional if API is unavailable.
      } finally {
        setIsLoadingCounselors(false);
      }
    };

    loadTherapists();
  }, []);

  const selectedCounselor = useMemo(
    () => counselors.find((c) => c.therapistId === selectedCounselorId) || null,
    [counselors, selectedCounselorId]
  );

  const handleBookAppointment = (counselorId: string) => {
    if (!isAuthenticated || !user?.id) {
      setLocation("/login");
      return;
    }

    setSelectedCounselorId(counselorId);
    setStatusError("");
    setCurrentView("book");
  };

  const openPayment = () => {
    setStatusError("");
    if (!selectedCounselor) {
      setStatusError("Please select a therapist first.");
      return;
    }

    if (!isAuthenticated || !user?.id) {
      setStatusError("Please login to continue with payment.");
      setLocation("/login");
      return;
    }

    if (!appointmentRequest.preferredDate || !appointmentRequest.preferredTime) {
      setStatusError("Please choose appointment date and time before payment.");
      return;
    }

    setPaymentOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedCounselor || !user?.id) {
      return;
    }

    setIsSubmitting(true);
    setStatusError("");

    try {
      const scheduleIso = new Date(
        `${appointmentRequest.preferredDate}T${appointmentRequest.preferredTime}:00`
      ).toISOString();

      const response = await fetch("/api/appointments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          therapistId: selectedCounselor.therapistId,
          amount: selectedCounselor.consultationFee,
          method: paymentMethod,
          gatewayName: "Razorpay",
          transactionFee: 2,
          schedule: scheduleIso,
        }),
      });

      const data = (await response.json()) as CheckoutResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Payment failed. Please try again.");
      }

      setCheckoutResult(data);
      setPaymentOpen(false);
      setCurrentView("success");
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentView === "success" && selectedCounselor) {
    return (
      <div className="space-y-6" data-testid="counselor-payment-success">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-400/10 to-emerald-400/10">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-1">Booking Confirmed</h2>
              <p className="text-green-700">
                Your session with {selectedCounselor.name} has been booked and payment is complete.
              </p>
            </div>
            <div className="p-4 bg-white/90 rounded-lg border border-green-200 text-left space-y-1">
              <p className="text-sm text-gray-700">
                <strong>User ID:</strong> {user?.id}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Appointment ID:</strong> {checkoutResult?.appointment?.apptId}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Payment ID:</strong> {checkoutResult?.payment?.paymentId}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Gateway:</strong> {checkoutResult?.gateway?.name}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentView("browse");
                  setSelectedCounselorId(null);
                  setCheckoutResult(null);
                }}
              >
                Book Another Session
              </Button>
              <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === "book" && selectedCounselor) {
    return (
      <div className="space-y-6" data-testid="counselor-booking-view">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Book {selectedCounselor.name}
            </CardTitle>
            <p className="text-muted-foreground">
              Appointment is linked to your logged-in account and will be paid during checkout.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-blue-700 uppercase tracking-wide">Logged in as</p>
                  <p className="font-semibold text-blue-900">{user?.username || user?.email}</p>
                  <p className="text-sm text-blue-700">User ID: {user?.id}</p>
                </div>
                <Badge className="bg-blue-600 text-white hover:bg-blue-600">Authenticated</Badge>
              </div>
            </div>

            <div className="p-4 rounded-lg border space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{selectedCounselor.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  {selectedCounselor.rating.toFixed(1)}
                </div>
              </div>
              <p className="text-sm text-gray-600">{selectedCounselor.specialization}</p>
              <p className="text-sm text-gray-600">License: {selectedCounselor.licenseNo}</p>
              <p className="font-semibold text-lg flex items-center gap-1 text-blue-700">
                <IndianRupee className="w-4 h-4" />
                {selectedCounselor.consultationFee}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferred-date">Preferred Date</Label>
                <Input
                  id="preferred-date"
                  type="date"
                  value={appointmentRequest.preferredDate}
                  onChange={(e) =>
                    setAppointmentRequest((prev) => ({ ...prev, preferredDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred-time">Preferred Time</Label>
                <Input
                  id="preferred-time"
                  type="time"
                  value={appointmentRequest.preferredTime}
                  onChange={(e) =>
                    setAppointmentRequest((prev) => ({ ...prev, preferredTime: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Session Note (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="What do you want to discuss in this session?"
                value={appointmentRequest.reason}
                onChange={(e) =>
                  setAppointmentRequest((prev) => ({ ...prev, reason: e.target.value }))
                }
              />
            </div>

            {statusError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {statusError}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setCurrentView("browse")}>
                Back
              </Button>
              <Button className="flex-1" onClick={openPayment}>
                Continue to Payment
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
          <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
            <div className="bg-[#0f4aad] text-white px-6 py-4">
              <DialogHeader>
                <DialogTitle className="text-xl">Razorpay Secure Checkout</DialogTitle>
                <DialogDescription className="text-blue-100">
                  Pay and confirm your therapist appointment instantly.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-lg border bg-slate-50 p-4 space-y-1">
                <p className="text-sm text-slate-500">Paying as</p>
                <p className="font-semibold">{user?.username || user?.email}</p>
                <p className="text-xs text-slate-600">User ID: {user?.id}</p>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Therapist</span>
                  <span className="font-medium">{selectedCounselor.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Consultation Fee</span>
                  <span className="font-medium">Rs {selectedCounselor.consultationFee}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Gateway Fee</span>
                  <span className="font-medium">Rs 2</span>
                </div>
                <div className="border-t pt-2 flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg text-[#0f4aad]">
                    Rs {selectedCounselor.consultationFee + 2}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Choose payment method</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "upi", label: "UPI", icon: Smartphone },
                    { id: "card", label: "Card", icon: CreditCard },
                    { id: "netbanking", label: "Net Banking", icon: Landmark },
                    { id: "wallet", label: "Wallet", icon: Wallet },
                  ].map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant={paymentMethod === item.id ? "default" : "outline"}
                      onClick={() => setPaymentMethod(item.id as typeof paymentMethod)}
                      className="justify-start gap-2"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              {statusError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {statusError}
                </div>
              )}

              <Button className="w-full bg-[#0f4aad] hover:bg-[#0c3f95]" onClick={handlePayment} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </span>
                ) : (
                  `Pay Rs ${selectedCounselor.consultationFee + 2}`
                )}
              </Button>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-3 h-3" />
                Payments are recorded in Payment and Payment Gateway entities.
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="counselor-connect">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-400/10 to-indigo-400/10">
        <CardContent className="p-6 space-y-4">
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Book Therapist and Pay Securely</span>
            </div>
            <p className="text-sm text-blue-700">
              Use your logged-in account ID to book a therapist session and complete payment in one flow.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg bg-white/80">
              <div className="text-lg font-semibold text-green-600">{counselors.length}</div>
              <div className="text-xs text-muted-foreground">Available Therapists</div>
            </div>
            <div className="text-center p-3 border rounded-lg bg-white/80">
              <div className="text-lg font-semibold text-blue-600">Instant</div>
              <div className="text-xs text-muted-foreground">Payment Confirmation</div>
            </div>
            <div className="text-center p-3 border rounded-lg bg-white/80">
              <div className="text-lg font-semibold text-purple-600">Razorpay</div>
              <div className="text-xs text-muted-foreground">Checkout UI</div>
            </div>
            <div className="text-center p-3 border rounded-lg bg-white/80">
              <div className="text-lg font-semibold text-orange-600">User ID</div>
              <div className="text-xs text-muted-foreground">Linked Booking</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isAuthenticated && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-amber-900">Login is required to book and pay for therapist sessions.</p>
            <Button onClick={() => setLocation("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Therapist Booking
          </CardTitle>
          <p className="text-muted-foreground">
            Select a therapist and continue to payment checkout.
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingCounselors ? (
            <div className="py-10 text-center text-muted-foreground">Loading therapists...</div>
          ) : (
            <div className="space-y-4">
              {counselors.map((counselor) => (
                <div key={counselor.therapistId} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{counselor.name}</h3>
                        {counselor.isOnline && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            Available
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          {counselor.rating.toFixed(1)}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 flex flex-wrap gap-x-5 gap-y-1">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {counselor.specialization}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          License {counselor.licenseNo}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {counselor.consultationFee}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Languages: {counselor.languages.join(", ")}
                      </div>
                    </div>

                    <Button onClick={() => handleBookAppointment(counselor.therapistId)}>
                      Book & Pay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
