"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { ApologyIcon } from "@/components/icons/apology-icon"
import { Heart, MessageCircle, User, UserPlus, Edit3, LogOut, X, Lock, Check, Share, Copy, Plus } from "lucide-react"
import { authFetch } from "@/lib/api"
import { CountrySelector } from "@/components/ui/country-selector"
import { getCookie } from "@/app/actions/auth" 
import mixpanel, { initMixpanel } from "@/lib/mixpanel";
// Interface for the component props
interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  userName: string
  onUserNameChange: (name: string) => void
}

// Interface for reflection data
interface Reflection {
  reflection_id: string;
  summary: string;
  created_at: string;
  // Inbox-only
  from?: string;
  // Outbox-only
  to?: string;
  status?: string;
  // Optional because not all endpoints provide them
  category?: string;
}


// Helper function to get the correct icon for a reflection category
const getReflectionIcon = (type: string) => {
  switch (type) {
    case "gratitude":
      return <Heart className="h-4 w-4" />
    case "apology":
      return <ApologyIcon className="h-4 w-4" strokeWidth={1.5} />
    case "boundary":
      return <MessageCircle className="h-4 w-4" />
    default:
      return <MessageCircle className="h-4 w-4" />
  }
}

// Helper function to get the display label for a reflection type
const getReflectionTypeLabel = (type: string) => {
  switch (type) {
    case "gratitude":
      return "Gratitude"
    case "apology":
      return "Apology"
    case "boundary":
      return "Boundary"
    default:
      return "Reflection"
  }
}

// Main Sidebar component
export function Sidebar({ isOpen, onToggle, userName, onUserNameChange }: SidebarProps) {
  const router = useRouter()
  // State for user name editing
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(userName)

  // State for reflections
  const [outbox, setOutbox] = useState<Reflection[]>([])
  const [inbox, setInbox] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for user contact information
  const [phone, setPhone] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  // State for OTP verification modal
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [otpStep, setOtpStep] = useState<"contact" | "verify">("contact")
  const [contactInput, setContactInput] = useState("") // Used for email input and OTP verification step
  const [phoneNumber, setPhoneNumber] = useState("") // New state for phone number input
  // Fixed the type error by adding `name` and `flag` to the initial state
  const [selectedCountry, setSelectedCountry] = useState({ name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" }); // New state for country code
  const [otp, setOtp] = useState("")
  const [contactType, setContactType] = useState<"phone" | "email" | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // State for invite modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isFetchingInviteLink, setIsFetchingInviteLink] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy");

  // State for expanding/collapsing reflection lists
  const [outboxExpanded, setOutboxExpanded] = useState(false)
  const [inboxExpanded, setInboxExpanded] = useState(false)

  // Function to fetch the invite link
  const fetchInviteLink = async () => {
    setIsFetchingInviteLink(true);
    setInviteLink("");
    setInviteMessage("");
    setCopyStatus("Copy");

    try {
      const res = await authFetch("/invite/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const json = await res.json();
    //  console.log("Invite Link Response:", json);

      if (json.success && json.invite_code) {
        const inviteUrl = `${window.location.origin}/auth?invite=${json.invite_code}`;
        setInviteLink(inviteUrl);

        const defaultMessage = `Hey! I've been using Sarthi for my reflections and wanted to share the link with you. It's a great tool for personal growth.`;
        setInviteMessage(`${defaultMessage}\n\n${inviteUrl}`);

          mixpanel.track("share_link_generated", {
    invite_code: json.invite_code,
    invite_url: inviteUrl,
  })
      } else {
        setInviteMessage(json.message || "Error fetching link. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching invite link:", err);
      setInviteMessage("Error fetching link. Please try again.");
    } finally {
      setIsFetchingInviteLink(false);
    }
  };



  // Open the invite modal and fetch the link
  const handleOpenInviteModal = () => {
    setIsInviteModalOpen(true);
    fetchInviteLink();
  };

  // Close the invite modal and reset states
  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
    setInviteLink("");
    setInviteMessage("");
    setCopyStatus("Copy");
  };

  // Handle copying the invite message to clipboard
const handleCopyLink = async () => {
  if (inviteMessage) {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      setCopyStatus("Copied!");

      // 🔹 Track copy to clipboard
      mixpanel.track("invite_copied", {
        invite_message: inviteMessage,
        invite_link: inviteLink,
      })

      setTimeout(() => setCopyStatus("Copy"), 2000);
    } catch (err) {
      setCopyStatus("Failed to copy");
      console.error("Failed to copy invite link: ", err);
    }
  }
};


  // Handle sharing on WhatsApp
  const handleShareOnWhatsapp = () => {
    const text = encodeURIComponent(inviteMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

const fetchReflections = async () => {
  try {
    const outboxRes = await authFetch("/reflection/outbox");
    const outboxJson = await outboxRes.json();
    console.log("Outbox Response:", outboxJson);

    if (outboxJson.success) {
      setOutbox(outboxJson.data || []);  // ✅ fix
    } else {
      setError(outboxJson.message || "Failed to fetch outbox reflections.");
    }

    const inboxRes = await authFetch("/reflection/inbox");
    const inboxJson = await inboxRes.json();
    console.log("Inbox Response:", inboxJson);

    if (inboxJson.success) {
      setInbox(inboxJson.data || []);   // ✅ fix
    } else {
      setError(inboxJson.message || "Failed to fetch inbox reflections.");
    }
  } catch {
    setError("Something went wrong while fetching reflections");
  }
};



  // Fetch reflections and user data on component mount
useEffect(() => {
  if (!isOpen) return; // 🔹 only run when sidebar is open

  const fetchReflectionsAndUserData = async () => {
    try {
      const res = await authFetch("/api/user/me", { credentials: "include" });
      if (!res.ok) return;

      const user = await res.json();
      if (user?.name) {
        setEditedName(user.name);
        onUserNameChange(user.name);
        localStorage.setItem("sarthi-user-name", user.name);
        window.dispatchEvent(new CustomEvent("sarthi-name-updated", { detail: user.name }));
      }
      if (user?.email) setEmail(user.email);
      if (user?.phone_number) setPhone(user.phone_number);

      setLoading(true);
      await fetchReflections();
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  fetchReflectionsAndUserData();

}, [isOpen]); // 🔹 re-run every time sidebar opens


useEffect(() => {
  initMixpanel();
}, []);



  useEffect(() => {
    const handleNameUpdate = (event: any) => {
      setEditedName(event.detail);
    };

    window.addEventListener("sarthi-name-updated", handleNameUpdate);

    return () => {
      window.removeEventListener("sarthi-name-updated", handleNameUpdate);
    };
  }, []);


  // API call to send OTP for a new contact (email or phone)
  const sendContactOtp = async () => {
    setIsSendingCode(true)
    setOtpError(null)
    const contact = contactType === "phone"
      ? selectedCountry.dialCode + phoneNumber
      : contactInput;

    try {
      const res = await authFetch("/api/user/request-contact-otp", {
        method: "POST",
        body: JSON.stringify({ contact }),
        headers: { "Content-Type": "application/json" }
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || "Failed to send OTP")
      setContactInput(contact); // Update contactInput for the verify step
      setOtpStep("verify") // Move to OTP verification step
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000); // Hide toast after 3 seconds
    } catch (err: any) {
      setOtpError(err.message)
    } finally {
      setIsSendingCode(false)
    }
  }

  // API call to verify the OTP and add the contact
  const verifyContactOtp = async () => {
    try {
      setOtpError(null)
      const res = await authFetch("/api/user/verify-contact-otp", {
        method: "POST",
        body: JSON.stringify({ contact: contactInput, otp }),
        headers: { "Content-Type": "application/json" }
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || "OTP verification failed")
      if (contactType === "phone") setPhone(contactInput)
      if (contactType === "email") setEmail(contactInput)
      setOtpModalOpen(false) // Close the modal on success
    } catch (err: any) {
      setOtpError(err.message)
    }
  }

  // API call to save the new user name
  const handleSaveName = async () => {
    try {
      // Changed from POST to PUT to address the 405 Method Not Allowed error, as per user's old code.
      const res = await authFetch("/api/user/update-name", {
        method: "PUT",
        body: JSON.stringify({ name: editedName.trim() }),
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || "Failed to update name")
      onUserNameChange(editedName.trim())
      setIsEditingName(false) // Exit editing mode on success
    } catch (err) {
      console.error(err)
    }
  }

  // Cancel editing the user name
  const handleCancelEdit = () => {
    setEditedName(userName)
    setIsEditingName(false)
  }

  // Handle the sign-out process
  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Sign out failed")
      }

      console.log("Successfully signed out.")
    } catch (error) {
      console.warn("Error signing out:", error)
    } finally {
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = "/auth" // Redirect to the auth page
    }
  };

  // Renders a single reflection item
const renderReflection = (reflection: any, type: "inbox" | "outbox") => {
  const category = reflection.category || "reflection";
  const name =
    type === "inbox"
      ? reflection.from || "Anonymous"
      : reflection.to || "Unknown";

  const summary = reflection.summary || "No summary";
  const createdAt = reflection.created_at
    ? new Date(reflection.created_at).toLocaleDateString("en-IN")
    : "";

  return (
    <button
      key={reflection.reflection_id}
      onClick={() => {
        router.push(`/reflection/${reflection.reflection_id}`);
        if (window.innerWidth < 768) {
          onToggle();
        }
      }}
      className="w-full text-left p-4 rounded-lg hover:bg-white/5 transition-colors group min-h-[44px]"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
          {getReflectionIcon(category.toLowerCase())}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-white text-sm font-medium">{name}</span>
          </div>
          <p className="text-white/60 text-sm truncate">{summary}</p>
          {createdAt && (
            <p className="text-white/40 text-xs mt-1">{createdAt}</p>
          )}
        </div>
      </div>
    </button>
  );
};



 
// Renders a section of reflections (e.g., Outbox or Inbox)
const ReflectionSection = ({ title, reflections, expanded, setExpanded, type }: any) => (
  <div className="mb-6">
    <p className="text-white text-sm font-semibold mb-2">{title}</p>
    {loading ? (
      <p className="text-white/50 text-sm">Loading...</p>
    ) : error ? (
      <p className="text-red-400 text-sm">{error}</p>
    ) : reflections.length === 0 ? (
      <p className="text-white/40 text-sm">No reflections yet.</p>
    ) : (
      <>
        {reflections
          .slice(0, expanded ? reflections.length : 3)
          .map((r: any) => renderReflection(r, type))} {/* ✅ pass type here */}
        {reflections.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-400 hover:underline mt-2"
          >
            {expanded ? "See less" : "See more"}
          </button>
        )}
      </>
    )}
  </div>
)


  // Renders the modal content based on the current step (contact or verify)
  const renderOtpModalContent = () => {
    const isPhone = contactType === 'phone';
    const title = `Verify your ${isPhone ? 'phone number' : 'email'}`;
    const description = `Enter your ${isPhone ? 'phone number' : 'email'} to receive a one-time verification code.`;

    if (otpStep === "contact") {
      return (
        <div className="w-full max-w-md space-y-8 px-4 sm:px-0">
          <div className="text-center">
            {/* Removed the main heading and description as per your request */}
            <h1 className="text-3xl font-medium mb-4 sm:mb-6">{title}</h1>
            <p className="text-[#cbd5e1] mb-4 sm:mb-6">{description}</p>
          </div>
          <div className="sarthi-card bg-[#1a1a1a] p-4 sm:p-6 space-y-4 rounded-[16px] border border-white/10">
            <div className="space-y-2">
              <label htmlFor="contact" className="block text-sm text-[#cbd5e1] text-left">
                {isPhone ? 'Phone number' : 'Email'}
              </label>
              {isPhone ? (
                <CountrySelector
                  selectedCountry={selectedCountry}
                  onCountrySelect={setSelectedCountry}
                  phoneNumber={phoneNumber}
                  onPhoneNumberChange={(phone) => setPhoneNumber(phone)}
                  onKeyDown={(e: any) => {
                    if (e.key === "Enter") {
                      sendContactOtp();
                    }
                  }}
                />
              ) : (
                <SarthiInput
                  id="contact"
                  type="email"
                  className="w-full bg-white/5 border-white/20 text-white"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendContactOtp();
                    }
                  }}
                />
              )}
              <p className="text-xs text-[#9ca3af]">
                You'll receive a one-time code at this {isPhone ? 'number' : 'email'}.
              </p>
            </div>
            {otpError && (
              <div className="text-red-400 text-sm" role="alert" aria-live="polite" tabIndex={-1}>
                {otpError}
              </div>
            )}
            <div className="pt-2">
              <SarthiButton
                className="w-full auth-button rounded-[16px]"
                onClick={sendContactOtp}
                disabled={isSendingCode}
              >
                {isSendingCode ? "Sending code…" : "Send verification code"}
              </SarthiButton>
            </div>
          </div>
          {showSuccessToast && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-[16px] backdrop-blur-sm shadow-lg animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">Verification code sent successfully!</p>
                <button
                  onClick={() => setShowSuccessToast(false)}
                  className="ml-2 text-green-400/60 hover:text-green-400 transition-colors min-h-[24px] min-w-[24px]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="w-full max-w-md space-y-8 px-4 sm:px-0">
          <div className="text-center">
            <h1 className="text-3xl font-medium mb-4 sm:mb-6">Verify code</h1>
            <p className="text-[#cbd5e1] mb-4 sm:mb-6">
              A code has been sent to {contactInput}. Please enter it below.
            </p>
          </div>
          <div className="sarthi-card bg-[#1a1a1a] p-4 sm:p-6 space-y-4 rounded-[16px] border border-white/10">
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm text-[#cbd5e1] text-left">
                One-time code
              </label>
              <SarthiInput
                id="otp"
                className="w-full bg-white/5 border-white/20 text-white"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    verifyContactOtp();
                  }
                }}
              />
            </div>
            {otpError && (
              <div className="text-red-400 text-sm" role="alert" aria-live="polite" tabIndex={-1}>
                {otpError}
              </div>
            )}
            <div className="pt-2">
              <SarthiButton
                onClick={verifyContactOtp}
                className="w-full auth-button rounded-[16px]"
              >
                Verify
              </SarthiButton>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
     {isOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-40 md:hidden"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        onToggle();
      }
    }}
  />
)}


      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-[#1a1a1a] border-r border-white/10 transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 ${isOpen ? "md:block" : "md:hidden"}`}
        onClick={(e) => e.stopPropagation()} ><div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3 cursor-pointer"
              onClick={() => {
                router.push("/onboarding");
                if (window.innerWidth < 768) {
                  onToggle();
                }
              }}>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <SarthiIcon size="sm" />
              </div>
              <div>
                <h2 className="text-white font-medium">Sarthi</h2>
                <p className="text-white/60 text-sm">Your reflection space</p>
              </div>
            </div>
            <button onClick={onToggle} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="h-5 w-5 text-white/60" />
            </button>
          </div>

          {/* Profile Section with conditional display for name and contacts */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-white/60 mt-1" />
              <div className="flex-1 space-y-1">
                {isEditingName ? (
                  <div className="space-y-2">
                    <SarthiInput value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder="Your name" />
                    <div className="flex space-x-2">
                      <button onClick={handleSaveName} className="text-xs text-green-400">Save</button>
                      <button onClick={handleCancelEdit} className="text-xs text-white/60">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm font-medium">{editedName || "Your name"}</span>
                    <Edit3 onClick={() => setIsEditingName(true)} className="h-3 w-3 text-white/60 cursor-pointer" />
                  </div>
                )}
                <div className="space-y-1 mt-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-white/40 text-xs flex items-center">
                      {phone && <Lock className="h-3 w-3 inline-block mr-1 text-white/60" />}
                      Phone: {phone || "Not added"}
                    </span>
                    {!phone && (
                      <button onClick={() => { setContactType("phone"); setOtpModalOpen(true); }} className="text-blue-400 text-xs">
                        Add
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white/40 text-xs flex items-center">
                      {email && <Lock className="h-3 w-3 inline-block mr-1 text-white/60" />}
                      Email: {email || "Not added"}
                    </span>
                    {!email && (
                      <button onClick={() => { setContactType("email"); setOtpModalOpen(true); }} className="text-blue-400 text-xs">
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start New Reflection Button */}
          <div className="p-6">
      <SarthiButton
  onClick={() => {
    window.location.href = "/chat"; // full page reload
    if (window.innerWidth < 768) {
      onToggle();
    }
  }}
  className="w-full justify-start auth-button rounded-[16px]"
>
  <span className="text-lg mr-2">+</span>
  Start new reflection
</SarthiButton>

          </div>

          {/* Reflections */}
       <div className="flex-1 overflow-y-auto px-8 pb-6">
  <ReflectionSection
    title="Outbox"
    reflections={outbox}
    expanded={outboxExpanded}
    setExpanded={setOutboxExpanded}
    type="outbox"   // ✅
  />
  <ReflectionSection
    title="Inbox"
    reflections={inbox}
    expanded={inboxExpanded}
    setExpanded={setInboxExpanded}
    type="inbox"    // ✅
  />
</div>



          {/* Invite friends button with new design and icon */}
          <div className="p-4">
            <button
              onClick={handleOpenInviteModal}
              className="flex items-center space-x-3 text-white/60 hover:text-white/80 focus:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors w-full min-h-[44px] p-2 rounded-lg"
            >
              <UserPlus className="h-4 w-4" />
              <span className="text-sm">Invite friends to Sarthi</span>
            </button>
          </div>

          {/* Sign Out Section with the correct function */}
          <div className="p-4 border-t border-white/10 mt-auto">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 text-white/60 hover:text-white/80 focus:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors w-full min-h-[44px] p-2 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          {renderOtpModalContent()}
          <button
            onClick={() => setOtpModalOpen(false)}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-2 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-[#1a1a1a] rounded-[16px] border border-white/10 max-w-md w-full p-6 shadow-lg relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-white">Invite friends</h2>
              <button onClick={handleCloseInviteModal} className="p-2 -mr-2 text-white/40 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Single textarea for message and link */}
              <div>
                <label htmlFor="invite-message" className="block text-sm text-white/60 mb-2">Message</label>
                <div className="relative">
                  <textarea
                    id="invite-message"
                    value={isFetchingInviteLink ? "Loading..." : inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[150px] resize-none"
                    disabled={isFetchingInviteLink}
                  />
                  <button
                    onClick={handleCopyLink}
                    disabled={isFetchingInviteLink || !inviteMessage}
                    className="absolute bottom-2 right-2 flex items-center px-4 py-2 text-white/60 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 rounded-lg bg-black/50 backdrop-blur-sm"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="ml-2 text-xs text-white/80">{copyStatus}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col space-y-4">
              <SarthiButton
                onClick={handleShareOnWhatsapp}
                disabled={!inviteMessage}
                className="w-full auth-button flex items-center justify-center space-x-2"
              >
                <Share className="h-4 w-4" />
                <span>Send via WhatsApp</span>
              </SarthiButton>
              <button
                onClick={fetchInviteLink}
                disabled={isFetchingInviteLink}
                className="flex items-center justify-center space-x-3 text-white/60 hover:text-white/80 focus:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors w-full p-2 rounded-lg"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">{isFetchingInviteLink ? "Loading..." : "Invite others"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
