"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, MapPin, Users, DollarSign, ExternalLink } from "lucide-react"
import type { Event } from "@/lib/events"

interface EventRegistrationDialogProps {
  event: Event
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EventRegistrationDialog({ event, isOpen, onClose, onSuccess }: EventRegistrationDialogProps) {
  const [paymentReference, setPaymentReference] = useState("")
  const [paymentProof, setPaymentProof] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("session_token")
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": token || "",
        },
        body: JSON.stringify({
          paymentReference: event.paymentRequired ? paymentReference : undefined,
          paymentProof: event.paymentRequired ? paymentProof : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onClose()
        // Reset form
        setPaymentReference("")
        setPaymentProof("")
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleExternalPayment = () => {
    // Mock external payment link
    window.open(`https://payment.example.com/event/${event.id}?amount=${event.price}`, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register for Event</DialogTitle>
          <DialogDescription>Complete your registration for "{event.title}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Details */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {event.date.toLocaleDateString()} at{" "}
              {event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {event.location}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              {event.capacity - event.registeredCount} spots remaining
            </div>
            {event.isPremium && (
              <div className="flex items-center text-sm font-medium text-primary">
                <DollarSign className="h-4 w-4 mr-2" />${event.price} - Premium Event
              </div>
            )}
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {event.paymentRequired ? (
              <>
                <div className="space-y-3 p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium text-blue-900">Payment Required</h4>
                  <p className="text-sm text-blue-700">
                    This is a premium event requiring payment. Complete payment externally, then submit your transaction
                    reference below for verification.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExternalPayment}
                    className="w-full bg-transparent"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Pay ${event.price} Externally
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentReference">Payment Reference *</Label>
                  <Input
                    id="paymentReference"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Enter transaction ID or reference number"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the transaction ID or reference number from your payment
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentProof">Payment Proof (Optional)</Label>
                  <Textarea
                    id="paymentProof"
                    value={paymentProof}
                    onChange={(e) => setPaymentProof(e.target.value)}
                    placeholder="Additional payment details or receipt information"
                    rows={3}
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Your registration will be pending until an admin verifies your payment. You will receive a
                    notification once approved.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  This is a free event. Click register to confirm your attendance.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || (event.paymentRequired && !paymentReference)}>
                {loading ? "Registering..." : event.paymentRequired ? "Submit for Verification" : "Register"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
